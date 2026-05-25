import "server-only";
import { withSignatureVerification } from "@/lib/upstash/qstash-receiver";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { notifyAdminsAboutOrder } from "@/lib/whatsapp";
import type { OrderRow } from "@/lib/orders/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
    const { orderId } = (await request.json()) as { orderId?: string };

    if (!orderId) {
        return Response.json({ error: "missing orderId" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (error || !data) {
        // No row → don't retry forever.
        return new Response(null, { status: 200 });
    }

    const order = data as OrderRow;

    if (order.whatsapp_notified) {
        return Response.json({ ok: true, skipped: "already-notified" });
    }

    const result = await notifyAdminsAboutOrder(order);

    await supabase
        .from("orders")
        .update({
            whatsapp_notified: result.success,
            whatsapp_error: result.error,
            whatsapp_debug: result.debug ?? null,
        })
        .eq("id", order.id);

    // Throwing makes QStash retry with exponential back-off.
    if (!result.success) {
        throw new Error(result.error ?? "WhatsApp send failed");
    }

    return Response.json({ ok: true });
}

export const POST = withSignatureVerification(handler);
