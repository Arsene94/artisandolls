"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import {
    isValidOrderStatusForMode,
    type OrderStatus,
} from "@/lib/orders/shared";

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

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
    const supabase = await requireAdminSupabase();

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, mode")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        throw new Error(orderError?.message ?? "Comanda nu a fost găsită.");
    }

    if (!isValidOrderStatusForMode(status, order.mode)) {
        throw new Error("Statusul selectat nu este valid pentru tipul acestei comenzi.");
    }

    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
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
