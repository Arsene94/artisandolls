import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
    PaymentProviderId,
    PaymentStatus,
    WebhookEvent,
} from "@/lib/payments/types";

/**
 * Insert an event row keyed on (provider, external_id). Returns false when
 * the row already exists — the caller should skip processing to keep
 * webhook handling idempotent (both Stripe and Netopia retry aggressively).
 */
export async function recordEvent(
    provider: PaymentProviderId,
    event: WebhookEvent,
    orderId: string | null,
): Promise<{ inserted: boolean }> {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.from("shop_payment_events").insert({
        provider,
        external_id: event.id,
        order_id: orderId,
        event_type: event.type,
        status: event.status,
        raw: event.raw,
    });
    if (error) {
        // Unique-violation = duplicate event, expected on retries.
        if (error.code === "23505") return { inserted: false };
        console.warn("[payments] recordEvent failed", provider, event.id, error);
        return { inserted: false };
    }
    return { inserted: true };
}

export type ApplyResult = {
    updated: boolean;
    orderId: string | null;
    previousStatus: PaymentStatus | null;
};

/**
 * Move a `shop_orders` row through its payment lifecycle in response to a
 * provider webhook. Looks up the order either by the metadata-echoed
 * `orderId` or by the persisted `payment_external_id`.
 */
export async function applyWebhookToOrder(
    provider: PaymentProviderId,
    event: WebhookEvent,
): Promise<ApplyResult> {
    const supabase = createSupabaseServiceClient();
    const lookup = supabase
        .from("shop_orders")
        .select("id, status, payment_status, payment_external_id, total_amount, order_number")
        .eq("payment_provider", provider);

    const { data: candidates, error: lookupError } = event.orderId
        ? await lookup.eq("id", event.orderId).limit(1)
        : await lookup.eq("payment_external_id", event.externalId).limit(1);

    if (lookupError) {
        console.warn("[payments] order lookup failed", provider, event.externalId, lookupError);
        return { updated: false, orderId: null, previousStatus: null };
    }

    const row = candidates?.[0];
    if (!row) {
        return { updated: false, orderId: event.orderId ?? null, previousStatus: null };
    }

    const patch: Record<string, unknown> = {
        payment_status: event.status,
        payment_external_id: event.externalId,
    };

    if (event.status === "paid") {
        patch.paid_at = new Date().toISOString();
        if (row.status === "new") patch.status = "confirmed";
    }
    if (event.status === "failed" || event.status === "voided") {
        patch.payment_failure_reason = event.failureReason ?? null;
    }
    if (event.status === "refunded") {
        patch.status = "refunded";
    }

    const { error: updateError } = await supabase
        .from("shop_orders")
        .update(patch)
        .eq("id", row.id);

    if (updateError) {
        console.warn("[payments] order update failed", row.id, updateError);
        return {
            updated: false,
            orderId: row.id as string,
            previousStatus: row.payment_status as PaymentStatus,
        };
    }

    return {
        updated: true,
        orderId: row.id as string,
        previousStatus: row.payment_status as PaymentStatus,
    };
}
