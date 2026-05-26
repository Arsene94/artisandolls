import "server-only";
import { applyWebhookToOrder, recordEvent } from "@/lib/payments/events";
import { stripeProvider } from "@/lib/payments/stripe";
import { enqueueWhatsAppNotification } from "@/lib/upstash/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    if (!stripeProvider.isConfigured()) {
        return new Response("Stripe not configured", { status: 503 });
    }

    const rawBody = await request.text();
    let event;
    try {
        event = await stripeProvider.verifyWebhook(rawBody, request.headers);
    } catch (err) {
        const message = err instanceof Error ? err.message : "bad signature";
        console.warn("[stripe/webhook] signature rejected", message);
        return new Response(`Invalid signature: ${message}`, { status: 400 });
    }

    // Aplicăm întâi tranziția pe `shop_orders` (idempotentă prin STATUS_RANK)
    // și abia apoi încercăm insert-ul în events. Dacă ar fi inversa și apply
    // ar eșua după ce record a reușit, retry-ul Stripe ar vedea event-ul ca
    // duplicat și comanda ar rămâne blocată.
    const { updated, orderId } = await applyWebhookToOrder("stripe", event);
    const { inserted } = await recordEvent("stripe", event, orderId);

    if (updated && event.status === "paid" && orderId && inserted) {
        // Fire the operator WhatsApp notify now that the cash has cleared.
        // `inserted` protejează contra duplicate-notify pe retry-urile Stripe.
        await enqueueWhatsAppNotification(orderId);
    }

    return Response.json({ received: true, processed: inserted });
}
