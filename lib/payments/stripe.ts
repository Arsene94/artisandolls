import "server-only";
import Stripe from "stripe";
import type {
    PaymentProvider,
    StartPaymentInput,
    StartPaymentResult,
    WebhookEvent,
} from "@/lib/payments/types";

let cached: Stripe | null = null;

function getStripeClient(): Stripe | null {
    if (cached) return cached;
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return null;
    cached = new Stripe(secret, {
        apiVersion: "2026-04-22.dahlia",
        appInfo: { name: "artisandolls" },
        timeout: 25_000,
    });
    return cached;
}

function getWebhookSecret(): string | null {
    return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

function mapEvent(event: Stripe.Event): WebhookEvent {
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const paid = session.payment_status === "paid";
        return {
            id: event.id,
            type: event.type,
            externalId: session.id,
            status: paid ? "paid" : "pending",
            amountMinor: session.amount_total ?? undefined,
            orderId:
                session.metadata?.orderId ??
                (typeof session.client_reference_id === "string"
                    ? session.client_reference_id
                    : null),
            raw: session,
        };
    }
    if (event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
            id: event.id,
            type: event.type,
            externalId: session.id,
            status: "voided",
            orderId:
                session.metadata?.orderId ??
                (typeof session.client_reference_id === "string"
                    ? session.client_reference_id
                    : null),
            raw: session,
        };
    }
    if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object as Stripe.PaymentIntent;
        return {
            id: event.id,
            type: event.type,
            externalId: intent.id,
            status: "failed",
            failureReason:
                intent.last_payment_error?.message ?? "payment_failed",
            orderId: (intent.metadata?.orderId as string) ?? null,
            raw: intent,
        };
    }
    if (event.type === "charge.refunded") {
        const charge = event.data.object as Stripe.Charge;
        return {
            id: event.id,
            type: event.type,
            externalId: typeof charge.payment_intent === "string"
                ? charge.payment_intent
                : charge.id,
            status: "refunded",
            orderId: (charge.metadata?.orderId as string) ?? null,
            raw: charge,
        };
    }
    // Unknown events are still recorded for audit but do not move the order.
    return {
        id: event.id,
        type: event.type,
        externalId: event.id,
        status: "pending",
        raw: event,
    };
}

export const stripeProvider: PaymentProvider = {
    id: "stripe",

    isConfigured() {
        return Boolean(
            process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
        );
    },

    async start(input: StartPaymentInput): Promise<StartPaymentResult> {
        const stripe = getStripeClient();
        if (!stripe) throw new Error("Stripe is not configured");

        const connectAccountId = process.env.STRIPE_CONNECT_ACCOUNT_ID || null;
        const applicationFeeMinor = Number(
            process.env.STRIPE_APPLICATION_FEE_MINOR ?? "0",
        );

        const session = await stripe.checkout.sessions.create(
            {
                mode: "payment",
                locale: input.locale === "nl" ? "nl" : input.locale === "en" ? "en" : "ro",
                customer_email: input.billing.email ?? undefined,
                client_reference_id: input.orderId,
                line_items: input.items.map((line) => ({
                    quantity: line.quantity,
                    price_data: {
                        currency: input.currency.toLowerCase(),
                        unit_amount: line.amountMinor,
                        product_data: {
                            name: line.name,
                            description: line.description ?? undefined,
                        },
                    },
                })),
                success_url: `${input.successUrl}${input.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: input.cancelUrl,
                metadata: {
                    orderId: input.orderId,
                    orderNumber: input.orderNumber,
                    source: "artisandolls-shop",
                },
                payment_intent_data: {
                    description: input.description,
                    metadata: {
                        orderId: input.orderId,
                        orderNumber: input.orderNumber,
                    },
                    ...(connectAccountId
                        ? {
                              application_fee_amount: applicationFeeMinor > 0
                                  ? applicationFeeMinor
                                  : undefined,
                              transfer_data: { destination: connectAccountId },
                          }
                        : {}),
                },
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
            },
            {
                idempotencyKey: `shop-checkout:${input.orderId}`,
            },
        );

        if (!session.url) {
            throw new Error("Stripe did not return a checkout URL");
        }

        return {
            redirectUrl: session.url,
            externalId: session.id,
        };
    },

    async verifyWebhook(rawBody, headers): Promise<WebhookEvent> {
        const stripe = getStripeClient();
        const secret = getWebhookSecret();
        if (!stripe || !secret) throw new Error("Stripe webhook not configured");
        const signature = headers.get("stripe-signature");
        if (!signature) throw new Error("Missing stripe-signature header");

        const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
        return mapEvent(event);
    },
};
