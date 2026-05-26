"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import {
    getRentalDays,
    isValidOrderStatusForMode,
    type OrderMode,
    type OrderStatus,
} from "@/lib/orders/shared";
import { createOrFetchInvitation } from "@/lib/reviews/invitations";

async function requireAdminSupabase() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
        redirect("/admin/login");
    }

    return supabase;
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
    const value = getString(formData, key);
    return value || null;
}

function getNumber(formData: FormData, key: string) {
    const value = getString(formData, key);

    if (!value) {
        return 0;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
}

function getNullableNumber(formData: FormData, key: string) {
    const value = getString(formData, key);

    if (!value) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

function getDiscountType(formData: FormData) {
    const value = getString(formData, "discount_type");

    if (value === "fixed" || value === "percent") {
        return value;
    }

    return "none";
}

function calculateDiscount(baseAmount: number, discountType: string, discountValue: number) {
    if (discountType === "fixed") {
        return Math.min(baseAmount, Math.max(0, Math.round(discountValue)));
    }

    if (discountType === "percent") {
        const percent = Math.min(100, Math.max(0, discountValue));
        return Math.round((baseAmount * percent) / 100);
    }

    return 0;
}

function formatTotalLabel(total: number) {
    return total > 0
        ? `${total.toLocaleString("ro-RO")} lei`
        : "Se confirmă după verificare";
}

// Statusuri terminale pe care le tratăm ca semnal că livrarea s-a încheiat
// — declanșează generarea invitației de review pentru produsul comandat.
const DOLL_DELIVERED_STATUSES: OrderStatus[] = [
    "rent_delivered",
    "rent_completed",
    "buy_delivered",
    "buy_completed",
];

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
    const supabase = await requireAdminSupabase();

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, mode, doll_id, customer_name")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        throw new Error(orderError?.message ?? "Comanda nu a fost găsită.");
    }

    if (!isValidOrderStatusForMode(status, order.mode as OrderMode)) {
        throw new Error("Statusul selectat nu este valid pentru tipul acestei comenzi.");
    }

    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

    if (error) {
        throw new Error(error.message);
    }

    // Creează invitație de review când comanda atinge un status livrat.
    // Idempotent — re-trigger nu duplică tokenul. Eșecul nu rupe actualizarea
    // statusului (review e secundar fluxului de comenzi).
    if (
        DOLL_DELIVERED_STATUSES.includes(status) &&
        typeof order.doll_id === "string"
    ) {
        try {
            await createOrFetchInvitation({
                targetType: "doll",
                targetId: order.doll_id,
                orderType: order.mode === "buy" ? "doll_purchase" : "doll_rental",
                orderId,
                customerName:
                    typeof order.customer_name === "string"
                        ? order.customer_name
                        : null,
                locale: null,
            });
        } catch (err) {
            console.warn("[reviews] doll invitation auto-create failed", orderId, err);
        }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderStatusFromFormAction(orderId: string, formData: FormData) {
    const status = getString(formData, "status") as OrderStatus;

    await updateOrderStatusAction(orderId, status);
}

export async function updateOrderAction(orderId: string, formData: FormData) {
    const supabase = await requireAdminSupabase();

    const dollId = getString(formData, "doll_id");

    const { data: doll, error: dollError } = await supabase
        .from("dolls")
        .select("id, slug, name")
        .eq("id", dollId)
        .single();

    if (dollError || !doll) {
        throw new Error(dollError?.message ?? "Păpușa selectată nu a fost găsită.");
    }

    const mode = getString(formData, "mode") as OrderMode;
    const startDate = getNullableString(formData, "start_date");
    const endDate = getNullableString(formData, "end_date");

    const rentalDays =
        mode === "rent" && startDate && endDate
            ? getRentalDays(startDate, endDate)
            : null;

    const subtotalAmount = Math.max(0, Math.round(getNumber(formData, "subtotal_amount")));
    const customPriceAmount = getNullableNumber(formData, "custom_price_amount");
    const discountType = getDiscountType(formData);
    const discountValue = Math.max(0, getNumber(formData, "discount_value"));

    const baseAmount = customPriceAmount ?? subtotalAmount;
    const discountAmount = calculateDiscount(baseAmount, discountType, discountValue);
    const totalAmount = Math.max(0, baseAmount - discountAmount);

    const payload = {
        doll_id: doll.id,
        doll_slug: doll.slug,
        doll_name: doll.name,

        start_date: startDate,
        end_date: endDate,
        rental_days: rentalDays,

        customer_name: getString(formData, "customer_name"),
        customer_email: getNullableString(formData, "customer_email"),
        customer_phone: getString(formData, "customer_phone"),
        delivery_address: getString(formData, "delivery_address"),
        delivery_time: getString(formData, "delivery_time"),
        return_time: getNullableString(formData, "return_time"),
        notes: getNullableString(formData, "notes"),

        subtotal_amount: subtotalAmount,
        custom_price_amount: customPriceAmount,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        total_label: formatTotalLabel(totalAmount),
    };

    const { error } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", orderId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}/edit`);

    redirect(`/admin/orders/${orderId}`);
}

export async function deleteOrderAction(orderId: string) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    redirect("/admin/orders");
}

export async function bulkDeleteOrdersAction(orderIds: string[]) {
    const supabase = await requireAdminSupabase();

    if (orderIds.length === 0) {
        return;
    }

    const { error } = await supabase
        .from("orders")
        .delete()
        .in("id", orderIds);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
}   
