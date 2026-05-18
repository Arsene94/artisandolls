"use server";

import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getRentalDays, type OrderRow } from "@/lib/orders";
import { notifyAdminsAboutOrder } from "@/lib/whatsapp";
import type { CatalogMode } from "@/lib/dolls";

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
    const value = getString(formData, key);
    return value || null;
}

function getMode(value: string): CatalogMode {
    return value === "buy" ? "buy" : "rent";
}

function getSelectedOptions(value: string) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function getTotalAmount(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

export async function createOrderAction(formData: FormData) {
    const supabase = createSupabaseServiceClient();

    const mode = getMode(getString(formData, "mode"));
    const dollSlug = getString(formData, "doll_slug");

    const { data: doll, error: dollError } = await supabase
        .from("dolls")
        .select("id, slug, name, available_for_rent, available_for_buy")
        .eq("slug", dollSlug)
        .single();

    if (dollError || !doll) {
        throw new Error("Păpușa nu a fost găsită.");
    }

    if (mode === "rent" && !doll.available_for_rent) {
        throw new Error("Această păpușă nu este disponibilă pentru închiriere.");
    }

    if (mode === "buy" && !doll.available_for_buy) {
        throw new Error("Această păpușă nu este disponibilă pentru cumpărare.");
    }

    const startDate = getNullableString(formData, "start_date");
    const endDate = getNullableString(formData, "end_date");

    if (!startDate || !endDate) {
        throw new Error("Alege perioada înainte de confirmare.");
    }

    const rentalDays = mode === "rent" ? getRentalDays(startDate, endDate) : null;

    const totalAmount = getTotalAmount(getString(formData, "total"));

    const payload = {
        mode,
        status: "new",
        doll_id: doll.id,
        doll_slug: doll.slug,
        doll_name: doll.name,

        start_date: startDate,
        end_date: endDate,
        rental_days: rentalDays,

        outfit_id: getNullableString(formData, "outfit_id"),
        selected_options: getSelectedOptions(getString(formData, "options")),

        customer_name: getString(formData, "full_name"),
        customer_email: getString(formData, "email"),
        customer_phone: getString(formData, "phone"),
        delivery_address: getString(formData, "delivery_address"),
        delivery_time: getString(formData, "delivery_time"),
        return_time: getNullableString(formData, "return_time"),
        notes: getNullableString(formData, "notes"),

        total_amount: totalAmount,
        total_label:
            totalAmount > 0
                ? `${totalAmount.toLocaleString("ro-RO")} lei`
                : "Se confirmă după verificare",
    };

    const { data: insertedOrder, error: insertError } = await supabase
        .from("orders")
        .insert(payload)
        .select("*")
        .single();

    if (insertError || !insertedOrder) {
        throw new Error(insertError?.message ?? "Comanda nu a putut fi salvată.");
    }

    const order = insertedOrder as OrderRow;
    const whatsappResult = await notifyAdminsAboutOrder(order);

    await supabase
        .from("orders")
        .update({
            whatsapp_notified: whatsappResult.success,
            whatsapp_error: whatsappResult.error,
        })
        .eq("id", order.id);

    redirect(`/catalog/${dollSlug}/success?orderId=${order.id}`);
}
