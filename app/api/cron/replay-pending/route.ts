import "server-only";
import { withSignatureVerification } from "@/lib/upstash/qstash-receiver";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { enqueueWhatsAppNotification } from "@/lib/upstash/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SWEEP_LIMIT = 50;

async function handler() {
    const supabase = createSupabaseServiceClient();
    const cutoff = new Date(Date.now() - 60_000).toISOString();

    const { data, error } = await supabase
        .from("orders")
        .select("id, created_at")
        .is("whatsapp_notified", false)
        .lte("created_at", cutoff)
        .order("created_at", { ascending: true })
        .limit(SWEEP_LIMIT);

    if (error) {
        console.error("[cron/replay-pending] query failed", error);
        throw error;
    }

    const requeued: string[] = [];
    const skipped: string[] = [];

    for (const row of data ?? []) {
        const queued = await enqueueWhatsAppNotification(row.id);
        if (queued) {
            requeued.push(row.id);
        } else {
            skipped.push(row.id);
        }
    }

    return Response.json({
        ok: true,
        scanned: data?.length ?? 0,
        requeued,
        skipped,
    });
}

export const POST = withSignatureVerification(handler);
