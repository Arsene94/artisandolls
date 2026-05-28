"use server";

import { getTranslations } from "next-intl/server";
import { redirect as externalRedirect } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { formatPrice, isSupportedLocale } from "@/i18n/format";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { rememberRecentOrder } from "@/lib/orders/recent-cookie";
import { getPublicPlatformSettings } from "@/lib/settings";
import { clientIp, normalisePhone } from "@/lib/upstash/identify";
import { orderLimiter, safeLimit } from "@/lib/upstash/ratelimit";
import { emitNewOrder } from "@/lib/upstash/realtime";
import { enqueueWhatsAppNotification } from "@/lib/upstash/jobs";
import {
    clearCart,
    getCartId,
    getCartSummary,
    type CartSummary,
} from "@/lib/shop/cart";
import {
    reservationForCart,
    reservedTotals,
} from "@/lib/shop/reservations";
import { redeemCoupon, validateCoupon } from "@/lib/shop/coupons";
import { getProductsByIds } from "@/lib/shop/products";
import { offerBadgeLabel } from "@/lib/offers/shared";
import { getActivePaymentProvider } from "@/lib/payments";
import type {
    PaymentMethod,
    StartPaymentInput,
} from "@/lib/payments/types";
import { getSiteUrl } from "@/lib/site";

const PHONE_PATTERN = /^\+?[0-9 \-().]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDRESS_MAX = 500;
const NOTES_MAX = 2000;
const NAME_MAX = 200;
const CITY_MAX = 120;
const COUNTY_MAX = 120;

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
    const value = getString(formData, key);
    return value || null;
}

class ShopCheckoutValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ShopCheckoutValidationError";
    }
}

async function decrementStockForCart(
    supabase: ReturnType<typeof createSupabaseServiceClient>,
    summary: CartSummary,
): Promise<{ ok: boolean; failedSlugs: string[] }> {
    const failedSlugs: string[] = [];
    for (const line of summary.lines) {
        if (!line.product.trackStock) continue;
        const { data, error } = await supabase.rpc("shop_decrement_stock", {
            p_product_id: line.product.id,
            p_quantity: line.qty,
        });
        if (error || !data) {
            failedSlugs.push(line.slug);
        }
    }
    return { ok: failedSlugs.length === 0, failedSlugs };
}

async function rollbackStock(
    supabase: ReturnType<typeof createSupabaseServiceClient>,
    summary: CartSummary,
    upTo: number,
): Promise<void> {
    for (let i = 0; i < upTo; i++) {
        const line = summary.lines[i];
        if (!line || !line.product.trackStock) continue;
        await supabase.rpc("shop_decrement_stock", {
            p_product_id: line.product.id,
            p_quantity: -line.qty,
        });
    }
}

export async function createShopOrderAction(formData: FormData) {
    const rawLocale = getString(formData, "_locale");
    const locale = isSupportedLocale(rawLocale) ? rawLocale : "ro";
    const tShop = await getTranslations({ locale, namespace: "shop" });
    const tCheckout = await getTranslations({ locale, namespace: "checkout" });
    const tNotice = await getTranslations({ locale, namespace: "notice" });

    const ip = await clientIp();
    const phoneRaw = getString(formData, "phone");
    const normalisedKey = normalisePhone(phoneRaw);
    const rateKey = normalisedKey ? `${normalisedKey}:${ip}` : `anon:${ip}`;
    const limit = await safeLimit(orderLimiter, rateKey);
    if (!limit.success) {
        throw new ShopCheckoutValidationError(tShop("rateLimitedDescription"));
    }

    const settings = await getPublicPlatformSettings();
    if (settings.maintenance_mode) {
        throw new ShopCheckoutValidationError(tNotice("maintenanceTitle"));
    }

    const summary = await getCartSummary();
    if (summary.lines.length === 0) {
        throw new ShopCheckoutValidationError(tShop("checkoutEmptyDescription"));
    }

    // Pre-flight: validate against `stock − reservations from other carts`
    // so a buyer is never blocked by their own reservation, but oversell
    // attempts from concurrent carts are caught before we hit the DB.
    const cartId = await getCartId();
    const trackedSlugs = summary.lines
        .filter((line) => line.product.trackStock)
        .map((line) => line.slug);
    if (trackedSlugs.length > 0) {
        const [allReserved, ownReservation] = await Promise.all([
            reservedTotals(trackedSlugs),
            cartId
                ? reservationForCart(cartId)
                : Promise.resolve(new Map<string, number>()),
        ]);
        for (const line of summary.lines) {
            if (!line.product.trackStock) continue;
            const reservedByOthers = Math.max(
                0,
                (allReserved.get(line.slug) ?? 0) -
                    (ownReservation.get(line.slug) ?? 0),
            );
            const available = Math.max(
                0,
                line.product.stockQuantity - reservedByOthers,
            );
            if (line.qty > available) {
                throw new ShopCheckoutValidationError(
                    tShop("stockChangedDescription"),
                );
            }
        }
    }

    // Payment method selection. Default to cash; "card_online" only honored
    // when the active provider is configured — otherwise silently degrade.
    const rawPaymentMethod = getString(formData, "payment_method");
    const provider =
        rawPaymentMethod === "card_online"
            ? await getActivePaymentProvider()
            : null;
    const paymentMethod: PaymentMethod = provider ? "card_online" : "cash";

    const customerName = getString(formData, "full_name").slice(0, NAME_MAX);
    const customerPhone = phoneRaw;
    const customerEmailRaw = getString(formData, "email").toLowerCase();
    const customerEmail = customerEmailRaw || null;
    const deliveryAddress = getString(formData, "delivery_address").slice(
        0,
        ADDRESS_MAX,
    );
    const deliveryCity = getNullableString(formData, "delivery_city")?.slice(
        0,
        CITY_MAX,
    ) ?? null;
    const deliveryCounty = getNullableString(formData, "delivery_county")?.slice(
        0,
        COUNTY_MAX,
    ) ?? null;
    const contactMethod = getNullableString(formData, "contact_method");
    const contactWindowStart = getNullableString(formData, "contact_window_start");
    const contactWindowEnd = getNullableString(formData, "contact_window_end");
    const notes = getNullableString(formData, "notes")?.slice(0, NOTES_MAX) ?? null;
    const ageConfirmed = ["on", "true", "1"].includes(
        getString(formData, "age_confirmed"),
    );
    const privacyAccepted = ["on", "true", "1"].includes(
        getString(formData, "privacy_accepted"),
    );

    if (!customerName) {
        throw new ShopCheckoutValidationError(tCheckout("fieldRequired"));
    }
    if (
        !customerPhone ||
        !PHONE_PATTERN.test(customerPhone.replace(/[\s-]/g, ""))
    ) {
        throw new ShopCheckoutValidationError(tCheckout("fieldInvalidPhone"));
    }
    if (customerEmail && !EMAIL_PATTERN.test(customerEmail)) {
        throw new ShopCheckoutValidationError(tCheckout("fieldInvalidEmail"));
    }
    if (!deliveryAddress) {
        throw new ShopCheckoutValidationError(tCheckout("fieldRequired"));
    }
    if (!ageConfirmed) {
        throw new ShopCheckoutValidationError(tCheckout("ageRequired"));
    }
    if (!privacyAccepted) {
        throw new ShopCheckoutValidationError(tCheckout("privacyRequired"));
    }

    const supabase = createSupabaseServiceClient();

    // Atomically decrement stock for each tracked line. If any fails, roll
    // back the ones we already touched so we never sell phantom stock.
    let decremented = 0;
    for (const line of summary.lines) {
        if (!line.product.trackStock) {
            decremented += 1;
            continue;
        }
        const { data, error } = await supabase.rpc("shop_decrement_stock", {
            p_product_id: line.product.id,
            p_quantity: line.qty,
        });
        if (error || !data) {
            await rollbackStock(supabase, summary, decremented);
            throw new ShopCheckoutValidationError(tShop("stockChangedDescription"));
        }
        decremented += 1;
    }

    const currency = summary.currency || settings.currency || "RON";

    const customerPayload = {
        full_name: customerName,
        email: customerEmail,
        phone: customerPhone,
        normalized_phone: normalisedKey,
        last_delivery_address: deliveryAddress,
        last_delivery_city: deliveryCity,
        last_delivery_county: deliveryCounty,
        preferred_contact_method: contactMethod,
        contact_window_start: contactWindowStart,
        contact_window_end: contactWindowEnd,
    };

    let customerId: string | null = null;
    if (customerEmail) {
        const { data: customer } = await supabase
            .from("customers")
            .upsert(customerPayload, { onConflict: "email" })
            .select("id")
            .single();
        customerId = customer?.id ?? null;
    } else if (normalisedKey) {
        const { data: existing } = await supabase
            .from("customers")
            .select("id")
            .eq("normalized_phone", normalisedKey)
            .maybeSingle();
        if (existing?.id) {
            await supabase
                .from("customers")
                .update(customerPayload)
                .eq("id", existing.id);
            customerId = existing.id;
        } else {
            const { data: inserted } = await supabase
                .from("customers")
                .insert(customerPayload)
                .select("id")
                .single();
            customerId = inserted?.id ?? null;
        }
    }

    // Recompute the coupon on the trusted server side. Whatever the cart
    // claimed earlier might have expired, been disabled, or had its
    // category restriction tightened between the cart view and submit.
    const categoryIds = Array.from(
        new Set(
            summary.lines
                .map((line) => line.product.categoryId)
                .filter((id): id is string => Boolean(id)),
        ),
    );
    let couponDiscount = 0;
    let couponId: string | null = null;
    let couponCode: string | null = null;
    if (summary.coupon?.code) {
        const validation = await validateCoupon(
            summary.coupon.code,
            summary.subtotal,
            categoryIds,
        );
        if (validation.ok) {
            couponDiscount = Math.min(summary.subtotal, validation.discountAmount);
            couponId = validation.couponId;
            couponCode = validation.code;
        }
    }

    // Offers were evaluated server-side inside getCartSummary(); trust those.
    // No stacking with the coupon — the larger discount wins.
    const offerDiscount = summary.offerDiscountAmount;
    const discountOffer = summary.discountOffer;
    const giftOffer = summary.giftOffer;

    let discountAmount = couponDiscount;
    let offerId: string | null = null;
    let offerLabel: string | null = null;
    if (offerDiscount > couponDiscount && discountOffer) {
        discountAmount = offerDiscount;
        couponId = null;
        couponCode = null;
        offerId = discountOffer.id;
        offerLabel = offerBadgeLabel(discountOffer, locale) ?? discountOffer.name;
    }
    // A gift offer applies independently of which discount won.
    if (!offerId && giftOffer) {
        offerId = giftOffer.id;
        offerLabel = offerBadgeLabel(giftOffer, locale) ?? giftOffer.name;
    }

    const totalAmount = Math.max(0, summary.subtotal - discountAmount);

    const { data: insertedOrder, error: insertError } = await supabase
        .from("shop_orders")
        .insert({
            customer_id: customerId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            normalized_phone: normalisedKey,
            delivery_address: deliveryAddress,
            delivery_city: deliveryCity,
            delivery_county: deliveryCounty,
            contact_method: contactMethod,
            contact_window_start: contactWindowStart,
            contact_window_end: contactWindowEnd,
            shipping_method: "courier",
            shipping_fee: 0,
            subtotal: summary.subtotal,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            total_label: formatPrice(totalAmount, locale, currency),
            currency,
            notes,
            age_confirmed: ageConfirmed,
            privacy_accepted: privacyAccepted,
            coupon_id: couponId,
            coupon_code: couponCode,
            offer_id: offerId,
            offer_label: offerLabel,
            payment_method: paymentMethod,
            payment_status: paymentMethod === "card_online" ? "pending" : "not_required",
            payment_provider: provider?.id ?? null,
        })
        .select("*")
        .single();

    if (insertError || !insertedOrder) {
        await rollbackStock(supabase, summary, decremented);
        throw new ShopCheckoutValidationError(
            insertError?.message ?? tShop("checkoutErrorDescription"),
        );
    }

    const orderId = insertedOrder.id as string;

    // Cookie de confirmare — pagina /shop/order/<id>/success refuză să afișeze
    // PII dacă browserul curent nu este în lista de comenzi recente.
    await rememberRecentOrder(orderId);

    const lineRows = summary.lines.map((line) => ({
        order_id: orderId,
        product_id: line.product.id,
        product_slug: line.product.slug,
        product_sku: line.product.sku,
        product_name: line.product.name,
        product_image_path: line.product.image,
        unit_price: line.product.price,
        quantity: line.qty,
        line_total: line.lineTotal,
        currency: line.product.currency,
    }));

    const { error: itemsError } = await supabase
        .from("shop_order_items")
        .insert(lineRows);

    if (itemsError) {
        console.error("[shop/checkout] line items insert failed", itemsError);
    }

    // Free-gift offer: append the gift as a zero-priced line so it shows on the
    // order and the operator knows to pack it.
    if (giftOffer?.gift_product_id) {
        const [gift] = await getProductsByIds([giftOffer.gift_product_id]).catch(
            () => [],
        );
        if (gift) {
            const { error: giftError } = await supabase
                .from("shop_order_items")
                .insert({
                    order_id: orderId,
                    product_id: gift.id,
                    product_slug: gift.slug,
                    product_sku: gift.sku,
                    product_name: gift.name,
                    product_image_path: gift.image,
                    unit_price: 0,
                    quantity: 1,
                    line_total: 0,
                    currency: gift.currency,
                });
            if (giftError) {
                console.error("[shop/checkout] gift line insert failed", giftError);
            }
        }
    }

    // Final coupon commit. If the race-conditioned redemption RPC refuses
    // (e.g. another order just exhausted the cap), we zero the discount on
    // the order so the customer is charged the un-discounted price.
    if (couponId) {
        const redeemed = await redeemCoupon(
            couponId,
            orderId,
            discountAmount,
            customerPhone || null,
        );
        if (!redeemed) {
            await supabase
                .from("shop_orders")
                .update({
                    coupon_id: null,
                    coupon_code: null,
                    discount_amount: 0,
                    total_amount: summary.subtotal,
                    total_label: formatPrice(summary.subtotal, locale, currency),
                })
                .eq("id", orderId);
        }
    }

    // When the buyer picked card-online, hand off to the provider before we
    // notify operators / clear cart. Failure to start the payment is recoverable
    // — we roll back stock and ask the buyer to retry.
    if (provider && paymentMethod === "card_online") {
        const siteUrl = getSiteUrl(settings.public_site_url ?? null);
        const localePrefix = locale === "ro" ? "" : `/${locale}`;
        const successUrl = `${siteUrl}${localePrefix}/shop/order/${orderId}/success`;
        const cancelUrl = `${siteUrl}${localePrefix}/shop/checkout?cancelled=1`;
        const notifyUrl = `${siteUrl}/api/payments/${provider.id}/webhook`;

        const description = `${(insertedOrder.order_number as string) || "Velvet Shop"}`;

        const startInput: StartPaymentInput = {
            orderId,
            orderNumber: insertedOrder.order_number as string,
            amountMinor: totalAmount,
            currency,
            description,
            items: summary.lines.map((line) => ({
                name: line.product.name,
                description: line.product.shortDescription ?? null,
                amountMinor: line.product.price,
                quantity: line.qty,
            })),
            billing: {
                fullName: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: deliveryAddress,
                city: deliveryCity,
                county: deliveryCounty,
                countryCode: 642,
            },
            locale:
                locale === "nl"
                    ? "nl"
                    : locale === "en"
                      ? "en"
                      : locale === "de"
                        ? "de"
                        : "ro",
            successUrl,
            cancelUrl,
            notifyUrl,
        };

        let started: Awaited<ReturnType<typeof provider.start>> | null = null;
        try {
            started = await provider.start(startInput);
        } catch (err) {
            console.error("[shop/checkout] payment start failed", err);
            await supabase
                .from("shop_orders")
                .update({
                    payment_status: "failed",
                    payment_failure_reason:
                        err instanceof Error ? err.message.slice(0, 250) : "start_failed",
                })
                .eq("id", orderId);
            await rollbackStock(supabase, summary, decremented);
            throw new ShopCheckoutValidationError(
                tShop("paymentStartFailed"),
            );
        }

        await supabase
            .from("shop_orders")
            .update({
                payment_external_id: started.externalId,
                payment_redirect_url: started.redirectUrl,
                payment_initiated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        await emitNewOrder({
            orderId,
            orderNumber: insertedOrder.order_number as string,
            dollName: `${summary.itemCount} × shop`,
            customerName,
            total: totalAmount,
            mode: "buy",
            createdAt: insertedOrder.created_at as string,
        });

        await clearCart();

        // We deliberately do NOT enqueue the WhatsApp notify here — the
        // operator should only be notified once the webhook flips the order
        // to paid. The post-payment success page (and the webhook) trigger it.

        console.info("[shop] order awaiting payment", {
            orderId,
            orderNumber: insertedOrder.order_number,
            provider: provider.id,
        });

        // Redirect the browser straight to the provider's hosted page.
        externalRedirect(started.redirectUrl);
    }

    await emitNewOrder({
        orderId: orderId,
        orderNumber: insertedOrder.order_number as string,
        dollName: `${summary.itemCount} × shop`,
        customerName,
        total: totalAmount,
        mode: "buy",
        createdAt: insertedOrder.created_at as string,
    });

    await enqueueWhatsAppNotification(orderId);

    await clearCart();

    console.info("[shop] order created", {
        orderId,
        orderNumber: insertedOrder.order_number,
        lines: summary.lines.length,
        total: totalAmount,
    });

    redirect({
        href: {
            pathname: `/shop/order/${orderId}/success`,
        },
        locale,
    });
}
