import "server-only";
import { getSiteUrl } from "@/lib/site";
import { formatMoney } from "@/lib/shop/format";
import { validateCoupon } from "@/lib/shop/coupons";
import { getProductsBySlugs } from "@/lib/shop/products";
import {
    UCP_VERSION,
    type UcpCheckoutSession,
    type UcpLineItem,
    type UcpMessage,
    type UcpMeta,
    type UcpSessionStatus,
    type UcpTotal,
} from "@/lib/ucp/types";

const HANDLER_NAMESPACE = "com.velvetcompanions.checkout";

export function defaultMeta(): UcpMeta {
    return {
        version: UCP_VERSION,
        capabilities: {
            "dev.ucp.shopping.checkout": [{ version: UCP_VERSION }],
        },
        payment_handlers: {
            [HANDLER_NAMESPACE]: [
                {
                    id: "velvet_cash",
                    version: UCP_VERSION,
                    config: {
                        method: "cash_on_delivery",
                        description: "Plata se face cu consilierul la livrare (numerar / card).",
                    },
                },
                {
                    id: "velvet_card_online",
                    version: UCP_VERSION,
                    config: {
                        method: "card_online",
                        description: "Card online 3D-Secure prin procesatorul activ.",
                    },
                },
            ],
        },
        status: "ok",
    };
}

export type SerializeInput = {
    sessionId: string;
    status: UcpSessionStatus;
    currency: string;
    expiresAt: Date;
    items: Array<{ slug: string; qty: number }>;
    buyer?: UcpCheckoutSession["buyer"];
    context?: UcpCheckoutSession["context"];
    fulfillment?: UcpCheckoutSession["fulfillment"];
    couponCode?: string | null;
    appendMessages?: UcpMessage[];
    siteUrl?: string;
};

const VAT_RATE = 0.19;

function sumLineTotals(items: UcpLineItem[]): number {
    return items.reduce((sum, item) => {
        const total = item.totals?.find((t) => t.type === "total");
        return sum + (total?.amount ?? 0);
    }, 0);
}

function localePath(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
}

export async function buildSession(input: SerializeInput): Promise<UcpCheckoutSession> {
    const siteUrl = input.siteUrl ?? getSiteUrl();
    const slugs = input.items.map((i) => i.slug);
    const products = await getProductsBySlugs(slugs);
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const messages: UcpMessage[] = [...(input.appendMessages ?? [])];

    const lineItems: UcpLineItem[] = [];
    for (const wanted of input.items) {
        const product = bySlug.get(wanted.slug);
        if (!product) {
            messages.push({
                type: "error",
                code: "item_unavailable",
                content: `Item ${wanted.slug} could not be resolved`,
                path: "$.line_items",
                severity: "unrecoverable",
            });
            continue;
        }
        if (product.trackStock && product.availableQuantity < wanted.qty) {
            messages.push({
                type: "error",
                code: "out_of_stock",
                content: `Insufficient stock for ${product.name}`,
                path: "$.line_items",
                severity: "recoverable",
            });
        }
        const qty = Math.max(1, Math.floor(wanted.qty));
        const subtotal = product.price * qty;
        lineItems.push({
            id: `li_${product.slug}`,
            item: {
                id: product.slug,
                title: product.name,
                description: product.shortDescription ?? product.description ?? undefined,
                price: product.price,
                sku: product.sku ?? undefined,
            },
            quantity: qty,
            totals: [
                { type: "subtotal", amount: subtotal },
                { type: "total", amount: subtotal },
            ],
        });
    }

    const subtotal = sumLineTotals(lineItems);

    let discount = 0;
    if (input.couponCode) {
        const categoryIds = Array.from(
            new Set(
                products
                    .map((p) => p.categoryId)
                    .filter((id): id is string => Boolean(id)),
            ),
        );
        const validation = await validateCoupon(
            input.couponCode,
            subtotal,
            categoryIds,
        );
        if (validation.ok) {
            discount = Math.min(subtotal, validation.discountAmount);
        } else if (validation.error) {
            messages.push({
                type: "warning",
                code: `coupon_${validation.error}`,
                content: `Coupon ${input.couponCode} could not be applied: ${validation.error}`,
                path: "$.totals",
                presentation: "notice",
            });
        }
    }

    const taxBase = Math.max(0, subtotal - discount);
    const tax = Math.round((taxBase * VAT_RATE) / (1 + VAT_RATE));
    const total = taxBase;

    const totals: UcpTotal[] = [
        { type: "subtotal", amount: subtotal },
    ];
    if (discount > 0) {
        totals.push({
            type: "discount",
            amount: -discount,
            display_text:
                input.couponCode != null
                    ? `Coupon ${input.couponCode}`
                    : undefined,
        });
    }
    totals.push({
        type: "tax",
        amount: tax,
        display_text: "TVA 19% (inclus)",
    });
    totals.push({ type: "total", amount: total });

    // Mark the session ready if there are no errors and we collected the
    // minimum surface: buyer email + delivery destination + at least one line.
    const hasBlockingError = messages.some(
        (m) => m.type === "error" && m.severity !== "recoverable",
    );
    const hasBuyer = Boolean(input.buyer?.email);
    const hasDestination = Boolean(
        input.fulfillment?.methods?.[0]?.destinations?.[0]?.street_address,
    );
    let status = input.status;
    if (status !== "completed" && status !== "canceled") {
        if (hasBlockingError) {
            status = "incomplete";
        } else if (hasBuyer && hasDestination && lineItems.length > 0) {
            status = "ready_for_complete";
        } else {
            status = "incomplete";
        }
    }

    if (!hasBuyer) {
        messages.push({
            type: "info",
            code: "missing_buyer_email",
            content: "Buyer email is required",
            path: "$.buyer.email",
        });
    }
    if (!hasDestination) {
        messages.push({
            type: "info",
            code: "missing_destination",
            content: "Delivery address is required",
            path: "$.fulfillment.methods[0].destinations",
        });
    }

    return {
        ucp: defaultMeta(),
        id: input.sessionId,
        status,
        currency: input.currency,
        line_items: lineItems,
        totals,
        buyer: input.buyer,
        context: input.context,
        fulfillment: input.fulfillment,
        messages: messages.length > 0 ? messages : undefined,
        expires_at: input.expiresAt.toISOString(),
        links: [
            { type: "terms_of_service", url: `${siteUrl}${localePath("/terms")}` },
            { type: "privacy_policy", url: `${siteUrl}${localePath("/privacy")}` },
            { type: "refund_policy", url: `${siteUrl}${localePath("/terms#refunds")}` },
            { type: "shipping_policy", url: `${siteUrl}${localePath("/terms#shipping")}` },
            { type: "faq", url: `${siteUrl}${localePath("/#faq")}` },
        ],
    };
}

export function summaryForLog(session: UcpCheckoutSession): {
    id: string;
    status: UcpSessionStatus;
    lines: number;
    total: number;
    currencyDisplay: string;
} {
    const total = session.totals.find((t) => t.type === "total")?.amount ?? 0;
    return {
        id: session.id,
        status: session.status,
        lines: session.line_items.length,
        total,
        currencyDisplay: formatMoney(total, "ro", session.currency),
    };
}
