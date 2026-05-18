"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/orders";

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
