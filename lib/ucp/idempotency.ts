import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type StoredIdempotency = {
    key: string;
    response: unknown;
    status_code: number;
    created_at: string;
};

const TTL_HOURS = 24;

export async function lookupIdempotency(
    key: string,
): Promise<StoredIdempotency | null> {
    const supabase = createSupabaseServiceClient();
    const cutoff = new Date(
        Date.now() - TTL_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
        .from("ucp_idempotency")
        .select("*")
        .eq("key", key)
        .gte("created_at", cutoff)
        .maybeSingle();

    if (error || !data) return null;
    return data as StoredIdempotency;
}

export async function storeIdempotency(
    key: string,
    response: unknown,
    statusCode: number,
): Promise<void> {
    const supabase = createSupabaseServiceClient();
    await supabase
        .from("ucp_idempotency")
        .upsert(
            {
                key,
                response,
                status_code: statusCode,
                created_at: new Date().toISOString(),
            },
            { onConflict: "key" },
        );
}
