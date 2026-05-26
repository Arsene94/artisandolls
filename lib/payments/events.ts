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

// Statusurile sunt monotonice — odată ce o comandă a ajuns `paid`/`refunded`
// nu o mai degradăm înapoi la `pending`/`failed`/`authorised`. Stripe poate
// trimite `payment_intent.payment_failed` *după* `checkout.session.completed`
// dacă un PI ulterior eșuează; fără gate-ul ăsta, o comandă plătită ar
// alterna înapoi spre failed la fiecare retry de webhook.
const STATUS_RANK: Record<PaymentStatus, number> = {
    // `not_required` ține locul comenzilor cash (provider niciodată setat).
    // Webhook-urile nu vin niciodată cu status `not_required`, dar îl rank-ăm
    // foarte jos ca să nu confunde gate-ul monotonic dacă ajunge cumva în
    // `previousStatus`.
    not_required: 0,
    pending: 0,
    failed: 1,
    voided: 1,
    authorised: 2,
    paid: 3,
    refunded: 4,
};

function shouldApply(
    current: PaymentStatus | null,
    next: PaymentStatus,
): boolean {
    if (!current) return true;
    return STATUS_RANK[next] >= STATUS_RANK[current];
}

/**
 * Move a `shop_orders` row through its payment lifecycle in response to a
 * provider webhook. Looks up the order either by the metadata-echoed
 * `orderId` or by the persisted `payment_external_id`.
 *
 * Pentru Netopia `event.orderId` este `order_number` (e.g. „ORD-2026-001"),
 * nu UUID-ul de DB; pentru Stripe e UUID-ul direct din `session.metadata`.
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

    // Coloana de match depinde de provider: Netopia trimite order_number,
    // Stripe trimite UUID-ul din metadata.
    const orderIdColumn: "id" | "order_number" =
        provider === "netopia" ? "order_number" : "id";

    const { data: candidates, error: lookupError } = event.orderId
        ? await lookup.eq(orderIdColumn, event.orderId).limit(1)
        : await lookup.eq("payment_external_id", event.externalId).limit(1);

    if (lookupError) {
        console.warn("[payments] order lookup failed", provider, event.externalId, lookupError);
        return { updated: false, orderId: null, previousStatus: null };
    }

    const row = candidates?.[0];
    if (!row) {
        return { updated: false, orderId: event.orderId ?? null, previousStatus: null };
    }

    const previousStatus = row.payment_status as PaymentStatus | null;

    // Gate monotonic — vezi STATUS_RANK. Returnăm `updated: false` ca să nu
    // retrigerăm side-effect-uri (notify operator) pe evenimente târzii.
    if (!shouldApply(previousStatus, event.status)) {
        return {
            updated: false,
            orderId: row.id as string,
            previousStatus,
        };
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
            previousStatus,
        };
    }

    return {
        updated: true,
        orderId: row.id as string,
        previousStatus,
    };
}
