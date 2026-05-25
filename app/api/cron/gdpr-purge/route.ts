import "server-only";
import { withSignatureVerification } from "@/lib/upstash/qstash-receiver";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { olderThanDays?: number };

async function handler(request: Request) {
    const body = (await request.json().catch(() => ({}))) as Body;
    const days = Math.max(7, Math.min(365, body.olderThanDays ?? 30));
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();

    const supabase = createSupabaseServiceClient();

    // Strip identifying fields off completed orders past the retention window.
    // We keep the row (financial / aggregate reporting) but null the PII.
    const { data: purgedRows, error: orderError } = await supabase
        .from("orders")
        .update({
            customer_name: "(deleted)",
            customer_email: null,
            customer_phone: "(deleted)",
            delivery_address: "(deleted)",
            notes: null,
            contact_window_start: null,
            contact_window_end: null,
            whatsapp_debug: null,
        })
        .lte("created_at", cutoff)
        .in("status", [
            "rent_completed",
            "rent_cancelled",
            "buy_completed",
            "buy_cancelled",
            "buy_refunded",
        ])
        .select("id");

    if (orderError) {
        console.error("[cron/gdpr-purge] orders update failed", orderError);
        throw orderError;
    }
    const orderCount = purgedRows?.length ?? 0;

    // Delete fully-orphaned customer rows (no order reference left).
    const { data: candidateCustomers } = await supabase
        .from("customers")
        .select("id")
        .lte("updated_at", cutoff);

    let customersDeleted = 0;
    for (const customer of candidateCustomers ?? []) {
        const { count } = await supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", customer.id);
        if ((count ?? 0) === 0) {
            await supabase.from("customers").delete().eq("id", customer.id);
            customersDeleted += 1;
        }
    }

    return Response.json({
        ok: true,
        cutoff,
        ordersPurged: orderCount,
        customersDeleted,
    });
}

export const POST = withSignatureVerification(handler);
