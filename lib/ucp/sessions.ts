import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { UcpCheckoutSession, UcpSessionStatus } from "@/lib/ucp/types";

export type UcpSessionRow = {
    id: string;
    status: UcpSessionStatus;
    currency: string;
    order_id: string | null;
    cart_id: string | null;
    state: UcpCheckoutSession;
    request_profile: string | null;
    last_idempotency_key: string | null;
    created_at: string;
    updated_at: string;
    expires_at: string;
    completed_at: string | null;
};

const SESSION_TTL_HOURS = 6;

export function newSessionId(): string {
    return `chk_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
}

export function defaultExpiry(): Date {
    return new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
}

export async function persistSession(args: {
    session: UcpCheckoutSession;
    cartId?: string | null;
    requestProfile?: string | null;
    idempotencyKey?: string | null;
}): Promise<void> {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("ucp_checkout_sessions").upsert(
        {
            id: args.session.id,
            status: args.session.status,
            currency: args.session.currency,
            state: args.session,
            cart_id: args.cartId ?? null,
            request_profile: args.requestProfile ?? null,
            last_idempotency_key: args.idempotencyKey ?? null,
            expires_at: args.session.expires_at ?? defaultExpiry().toISOString(),
            completed_at:
                args.session.status === "completed"
                    ? new Date().toISOString()
                    : null,
        },
        { onConflict: "id" },
    );
    if (error) {
        throw new Error(`UCP session persist failed: ${error.message}`);
    }
}

export async function loadSession(id: string): Promise<UcpSessionRow | null> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
        .from("ucp_checkout_sessions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error || !data) return null;
    return data as UcpSessionRow;
}

export async function linkOrder(sessionId: string, orderId: string): Promise<void> {
    const supabase = createSupabaseServiceClient();
    await supabase
        .from("ucp_checkout_sessions")
        .update({ order_id: orderId })
        .eq("id", sessionId);
}
