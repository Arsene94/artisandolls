import "server-only";
import { applyWebhookToOrder, recordEvent } from "@/lib/payments/events";
import { netopiaProvider } from "@/lib/payments/netopia";
import { enqueueWhatsAppNotification } from "@/lib/upstash/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Netopia expects `{ errorCode: 0 }` on success and `{ errorCode: 1, ... }`
 * on failure. Non-zero responses cause Netopia to retry the IPN for ~24h.
 */
function netopiaAck(code: 0 | 1, message?: string): Response {
    return Response.json(
        code === 0 ? { errorCode: 0 } : { errorCode: 1, errorMessage: message },
        { status: code === 0 ? 200 : 400 },
    );
}

export async function POST(request: Request) {
    if (!netopiaProvider.isConfigured()) {
        return netopiaAck(1, "provider_not_configured");
    }

    const rawBody = await request.text();
    let event;
    try {
        event = await netopiaProvider.verifyWebhook(rawBody, request.headers);
    } catch (err) {
        const message = err instanceof Error ? err.message : "bad signature";
        console.warn("[netopia/webhook] signature rejected", message);
        return netopiaAck(1, message);
    }

    const { updated, orderId } = await applyWebhookToOrder("netopia", event);
    const { inserted } = await recordEvent("netopia", event, orderId);

    if (updated && event.status === "paid" && orderId && inserted) {
        await enqueueWhatsAppNotification(orderId);
    }

    return netopiaAck(0);
}
