import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerRow } from "@/lib/customers/shared";
import type { OrderRow } from "@/lib/orders/shared";

export type { CustomerRow } from "@/lib/customers/shared";
export { formatCustomerStatus, formatMoneyRo } from "@/lib/customers/shared";

export async function getCustomerRows() {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("last_order_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as CustomerRow[];
}

export async function getCustomerById(id: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as CustomerRow;
}

export async function getCustomerOrders(customerId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as OrderRow[];
}
