import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRow } from "@/lib/orders/shared";

export type {
    OrderMode,
    OrderRow,
    OrderStatus,
} from "@/lib/orders/shared";

export {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
    getRentalDays,
} from "@/lib/orders/shared";

export async function getAdminOrderRows(limit = 50) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as OrderRow[];
}

export async function getAdminOrderById(id: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as OrderRow;
}

export async function getOrderByIdForSuccess(id: string) {
    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as OrderRow;
}
