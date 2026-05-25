import "server-only";
import { authoriseUcpRequest } from "@/lib/ucp/auth";
import { linkOrder, loadSession, persistSession } from "@/lib/ucp/sessions";
import { ucpError, ucpJson } from "@/lib/ucp/responder";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { formatPrice } from "@/i18n/format";
import { getProductsBySlugs } from "@/lib/shop/products";
import { getSiteUrl } from "@/lib/site";
import { normalisePhone } from "@/lib/upstash/identify";
import { emitNewOrder } from "@/lib/upstash/realtime";
import { enqueueWhatsAppNotification } from "@/lib/upstash/jobs";
import type {
    UcpCheckoutSession,
    UcpCompleteSessionRequest,
    UcpOrderConfirmation,
} from "@/lib/ucp/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function totalAmount(session: UcpCheckoutSession): number {
    return session.totals.find((t) => t.type === "total")?.amount ?? 0;
}

function subtotalAmount(session: UcpCheckoutSession): number {
    return session.totals.find((t) => t.type === "subtotal")?.amount ?? 0;
}

function discountAmount(session: UcpCheckoutSession): number {
    return -Math.min(
        0,
        session.totals.find((t) => t.type === "discount")?.amount ?? 0,
    );
}

export async function POST(request: Request, ctx: Ctx) {
    const auth = await authoriseUcpRequest();
    if (!auth.ok) return ucpError(auth.status, auth.reason, "UCP request rejected");

    const { id } = await ctx.params;
    const row = await loadSession(id);
    if (!row) return ucpError(404, "session_not_found", "Unknown checkout session");

    if (row.status === "completed") {
        // Idempotent re-completion returns the already-completed session.
        return ucpJson(row.state, 200);
    }
    if (row.status === "canceled") {
        return ucpError(409, "session_canceled", "Session has been canceled");
    }

    let body: UcpCompleteSessionRequest = {};
    try {
        const raw = await request.text();
        body = raw.length > 0 ? (JSON.parse(raw) as UcpCompleteSessionRequest) : {};
    } catch {
        return ucpError(400, "invalid_json", "Request body must be valid JSON");
    }

    const supabase = createSupabaseServiceClient();
    const session = row.state;

    const buyer = session.buyer ?? {};
    const destination = session.fulfillment?.methods?.[0]?.destinations?.[0];
    if (!buyer.email || !destination?.street_address) {
        return ucpError(
            422,
            "session_incomplete",
            "Buyer email and a delivery destination are required to complete the session",
            "requires_buyer_input",
        );
    }

    const slugs = session.line_items.map((line) => String(line.item.id));
    const products = await getProductsBySlugs(slugs);
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    for (const line of session.line_items) {
        const product = bySlug.get(String(line.item.id));
        if (!product) {
            return ucpError(
                422,
                "item_unavailable",
                `Item ${line.item.id} is no longer available`,
            );
        }
        if (
            product.trackStock &&
            product.availableQuantity < line.quantity
        ) {
            return ucpError(
                422,
                "out_of_stock",
                `Insufficient stock for ${product.name}`,
            );
        }
    }

    // Atomic stock decrement with rollback.
    const decremented: Array<{ id: string; qty: number; tracked: boolean }> = [];
    for (const line of session.line_items) {
        const product = bySlug.get(String(line.item.id));
        if (!product) continue;
        if (!product.trackStock) {
            decremented.push({ id: product.id, qty: line.quantity, tracked: false });
            continue;
        }
        const { data, error } = await supabase.rpc("shop_decrement_stock", {
            p_product_id: product.id,
            p_quantity: line.quantity,
        });
        if (error || !data) {
            for (const prior of decremented) {
                if (!prior.tracked) continue;
                await supabase.rpc("shop_decrement_stock", {
                    p_product_id: prior.id,
                    p_quantity: -prior.qty,
                });
            }
            return ucpError(
                422,
                "out_of_stock",
                `Insufficient stock for ${product.name}`,
            );
        }
        decremented.push({ id: product.id, qty: line.quantity, tracked: true });
    }

    const currency = session.currency || "RON";
    const total = totalAmount(session);
    const subtotal = subtotalAmount(session);
    const discount = discountAmount(session);

    const customerName = [buyer.first_name, buyer.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "UCP buyer";
    const phone = buyer.phone_number ?? "+40000000000";

    const { data: insertedOrder, error: insertError } = await supabase
        .from("shop_orders")
        .insert({
            customer_name: customerName,
            customer_email: buyer.email,
            customer_phone: phone,
            normalized_phone: normalisePhone(phone),
            delivery_address: destination.street_address ?? "",
            delivery_city: destination.address_locality ?? null,
            delivery_county: destination.address_region ?? null,
            contact_method: "ucp",
            shipping_method: "courier",
            shipping_fee: 0,
            subtotal,
            discount_amount: discount,
            total_amount: total,
            total_label: formatPrice(total, "ro", currency),
            currency,
            payment_method: "card_online",
            payment_status: "pending",
            age_confirmed: true,
            privacy_accepted: true,
        })
        .select("*")
        .single();

    if (insertError || !insertedOrder) {
        for (const prior of decremented) {
            if (!prior.tracked) continue;
            await supabase.rpc("shop_decrement_stock", {
                p_product_id: prior.id,
                p_quantity: -prior.qty,
            });
        }
        return ucpError(
            500,
            "order_persist_failed",
            insertError?.message ?? "Could not create order",
        );
    }

    const orderId = insertedOrder.id as string;

    const lineRows = session.line_items.map((line) => {
        const product = bySlug.get(String(line.item.id))!;
        return {
            order_id: orderId,
            product_id: product.id,
            product_slug: product.slug,
            product_sku: product.sku,
            product_name: product.name,
            product_image_path: product.image,
            unit_price: product.price,
            quantity: line.quantity,
            line_total: product.price * line.quantity,
            currency: product.currency,
        };
    });
    await supabase.from("shop_order_items").insert(lineRows);

    await linkOrder(row.id, orderId);

    const orderNumber = insertedOrder.order_number as string;
    const siteUrl = getSiteUrl();
    const orderConfirmation: UcpOrderConfirmation = {
        id: orderId,
        label: orderNumber,
        permalink_url: `${siteUrl}/admin/shop/orders/${orderId}`,
    };

    const completed: UcpCheckoutSession = {
        ...session,
        status: "completed",
        order: orderConfirmation,
        payment: body.payment ?? session.payment,
        signals: { ...(session.signals ?? {}), ...(body.signals ?? {}) },
        messages: undefined,
    };

    await persistSession({
        session: completed,
        cartId: row.cart_id,
        requestProfile: auth.profile,
    });

    await emitNewOrder({
        orderId,
        orderNumber,
        dollName: `${session.line_items.length} × shop (UCP)`,
        customerName,
        total,
        mode: "buy",
        createdAt: insertedOrder.created_at as string,
    });

    await enqueueWhatsAppNotification(orderId);

    return ucpJson(completed, 200);
}
