"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { formatPrice, isSupportedLocale } from "@/i18n/format";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { rememberRecentOrder } from "@/lib/orders/recent-cookie";
import { getInitialOrderStatus, type OrderRow } from "@/lib/orders/shared";
import { notifyAdminsAboutOrder } from "@/lib/whatsapp";
import type { CatalogMode } from "@/lib/dolls";
import { redeemDollCoupon, validateDollCoupon } from "@/lib/dolls/coupons";
import type { DollCouponValidation } from "@/lib/shop/shared";
import { getActiveOffers } from "@/lib/offers/queries";
import {
    evaluateDollOffer,
    offerBadgeLabel,
    type OfferRow,
} from "@/lib/offers/shared";
import {
    computeRentalEnd,
    isRentalUnit,
    mapRentalTierRow,
    matchRentalTier,
    rentalDaysFromDuration,
    type RentalTier,
    type RentalTierRow,
    type RentalUnit,
} from "@/lib/dolls/tiers";
import {
    getPublicPlatformSettings,
    isCatalogModeEnabled,
} from "@/lib/settings";
import { clientIp, normalisePhone as normalisePhoneId } from "@/lib/upstash/identify";
import { orderLimiter, safeLimit } from "@/lib/upstash/ratelimit";
import {
    enqueueOrderEmail,
    enqueueWhatsAppNotification,
    startOrderLifecycleWorkflow,
} from "@/lib/upstash/jobs";
import { emitNewOrder } from "@/lib/upstash/realtime";

const PHONE_PATTERN = /^\+?[0-9 \-().]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Limite hard pentru câmpurile cu input liber. Postgres acceptă fără limită,
// dar lăsate liberi inflătează DB-ul, log-urile QStash/Vercel și pot fi folosite
// pentru flooding. Aceeași limită ca în shop checkout (vezi `ADDRESS_MAX`).
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

function getMode(value: string): CatalogMode {
    return value === "buy" ? "buy" : "rent";
}

function getSelectedOptions(value: string) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizePhone(value: string) {
    return value.replace(/[^\d+]/g, "");
}

function toUtcDateOnly(date: Date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function toUtcTimeOnly(date: Date) {
    const h = String(date.getUTCHours()).padStart(2, "0");
    const m = String(date.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

class CheckoutValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CheckoutValidationError";
    }
}

export async function createOrderAction(formData: FormData) {
    const rawLocale = getString(formData, "_locale");
    const locale = isSupportedLocale(rawLocale) ? rawLocale : "ro";
    const tCheckout = await getTranslations({ locale, namespace: "checkout" });
    const tNotice = await getTranslations({ locale, namespace: "notice" });
    const tErrors = await getTranslations({ locale, namespace: "errors" });

    const ip = await clientIp();
    const phoneId = normalisePhoneId(getString(formData, "phone"));
    const rateKey = phoneId ? `${phoneId}:${ip}` : `anon:${ip}`;
    const limited = await safeLimit(orderLimiter, rateKey);
    if (!limited.success) {
        throw new CheckoutValidationError(tCheckout("rateLimitedDescription"));
    }

    const supabase = createSupabaseServiceClient();

    const mode = getMode(getString(formData, "mode"));
    const settings = await getPublicPlatformSettings();

    if (settings.maintenance_mode) {
        throw new CheckoutValidationError(tNotice("maintenanceTitle"));
    }

    if (!settings.catalog_enabled) {
        throw new CheckoutValidationError(tNotice("catalogTitle"));
    }

    if (!isCatalogModeEnabled(mode, settings)) {
        throw new CheckoutValidationError(tNotice("ordersTitle"));
    }

    const dollSlug = getString(formData, "doll_slug");
    if (!dollSlug) {
        throw new CheckoutValidationError(tErrors("genericTitle"));
    }

    const { data: doll, error: dollError } = await supabase
        .from("dolls")
        .select(
            "id, slug, name, available_for_rent, available_for_buy, buy_price, collection_id",
        )
        .eq("slug", dollSlug)
        .single();

    if (dollError || !doll) {
        throw new CheckoutValidationError(tErrors("notFoundTitle"));
    }

    if (mode === "rent" && !doll.available_for_rent) {
        throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
    }

    if (mode === "buy" && !doll.available_for_buy) {
        throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
    }

    const outfitId = getNullableString(formData, "outfit_id");
    let selectedOutfit: {
        id: string;
        label: string;
        price: number;
        image_path: string | null;
        image_url: string | null;
    } | null = null;

    if (outfitId) {
        const { data: outfit, error: outfitError } = await supabase
            .from("doll_outfits")
            .select("id, label, price, image_path, image_url, mode, is_active")
            .eq("id", outfitId)
            .single();

        if (outfitError || !outfit || !outfit.is_active) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        if (outfit.mode !== "both" && outfit.mode !== mode) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        selectedOutfit = outfit;
    }

    // Rental duration → tier matching. Fully re-validated server-side; the
    // client-sent tier id / price are never trusted.
    let rentalUnit: RentalUnit | null = null;
    let rentalQuantity: number | null = null;
    let matchedTier: RentalTier | null = null;
    let rentalStartAt: Date | null = null;
    let rentalEndAt: Date | null = null;

    if (mode === "rent") {
        const rawUnit = getString(formData, "rental_unit");
        if (!isRentalUnit(rawUnit)) {
            throw new CheckoutValidationError(tCheckout("durationError"));
        }
        rentalUnit = rawUnit;

        const parsedQty = Math.round(Number(getString(formData, "rental_quantity")));
        if (!Number.isFinite(parsedQty) || parsedQty < 1) {
            throw new CheckoutValidationError(tCheckout("durationError"));
        }
        rentalQuantity = parsedQty;

        const { data: tierRows, error: tierError } = await supabase
            .from("doll_rental_tiers")
            .select("*")
            .eq("doll_id", doll.id)
            .order("display_order", { ascending: true });

        if (tierError) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        const tiers = (tierRows ?? []).map((row) =>
            mapRentalTierRow(row as RentalTierRow),
        );
        matchedTier = matchRentalTier(tiers, rentalUnit, rentalQuantity);
        if (!matchedTier) {
            throw new CheckoutValidationError(tCheckout("durationError"));
        }

        const startDateStr = getString(formData, "rental_start_date");
        const startTimeStr = getString(formData, "rental_start_time");
        if (!startDateStr || !startTimeStr) {
            throw new CheckoutValidationError(tCheckout("durationError"));
        }
        // Parse as UTC so the stored datetime is independent of server timezone.
        const parsedStart = new Date(`${startDateStr}T${startTimeStr}:00Z`);
        if (Number.isNaN(parsedStart.getTime())) {
            throw new CheckoutValidationError(tCheckout("durationError"));
        }
        rentalStartAt = parsedStart;
        rentalEndAt = computeRentalEnd(parsedStart, rentalUnit, rentalQuantity);
    }

    // Legacy fields, derived so existing admin/email/workflow code keeps working.
    const startDate = rentalStartAt ? toUtcDateOnly(rentalStartAt) : null;
    const endDate = rentalEndAt ? toUtcDateOnly(rentalEndAt) : null;
    const rentalDays =
        mode === "rent" && rentalUnit && rentalQuantity
            ? rentalDaysFromDuration(rentalUnit, rentalQuantity)
            : null;

    const selectedOptionIds = getSelectedOptions(getString(formData, "options"));
    let customizationsTotal = 0;

    if (selectedOptionIds.length > 0) {
        // Validăm că:
        //   – fiecare opțiune există și este `is_active`
        //   – grupul opțiunii este `is_active`
        //   – grupul are mode = order mode (sau `both`)
        // Altfel clientul ar putea trimite ID-uri de opțiuni dintr-un mod care
        // nu se aplică sau dintr-un grup ascuns intenționat.
        const { data: selectedOptions, error: selectedOptionsError } = await supabase
            .from("doll_customization_options")
            .select(
                "id, price, is_active, group:doll_customization_groups(id, mode, is_active)",
            )
            .in("id", selectedOptionIds);

        if (selectedOptionsError) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        type OptionRow = {
            id: string;
            price: number;
            is_active: boolean;
            group:
                | { id: string; mode: string; is_active: boolean }
                | { id: string; mode: string; is_active: boolean }[]
                | null;
        };
        const rows = (selectedOptions ?? []) as OptionRow[];

        const validOptions = rows.filter((option) => {
            if (!option.is_active) return false;
            const group = Array.isArray(option.group)
                ? option.group[0]
                : option.group;
            if (!group || !group.is_active) return false;
            return group.mode === mode || group.mode === "both";
        });

        if (validOptions.length !== selectedOptionIds.length) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        customizationsTotal = validOptions.reduce((sum, option) => {
            return sum + Number(option.price ?? 0);
        }, 0);
    }

    const outfitTotal = selectedOutfit?.price ?? 0;
    const baseTotal =
        mode === "rent"
            ? Number(matchedTier?.price ?? 0)
            : Number(doll.buy_price ?? 0);
    const extrasTotal = outfitTotal + customizationsTotal;
    const grossTotal = Math.max(0, baseTotal + extrasTotal);

    // Coupon: re-validated here against server-trusted prices. The preview the
    // buyer saw is never trusted — we recompute the discount from scratch.
    const couponCodeInput = getString(formData, "coupon_code");
    let discountAmount = 0;
    let couponId: string | null = null;
    let appliedCouponCode: string | null = null;
    let discountType: "none" | "fixed" | "percent" = "none";
    let discountValue = 0;

    if (couponCodeInput) {
        const couponValidation = await validateDollCoupon(
            couponCodeInput,
            mode,
            baseTotal,
            extrasTotal,
        );
        if (couponValidation.ok && couponValidation.couponId) {
            discountAmount = Math.min(grossTotal, couponValidation.discountAmount);
            couponId = couponValidation.couponId;
            appliedCouponCode = couponValidation.code;
            discountType =
                couponValidation.type === "percentage" ? "percent" : "fixed";
            discountValue = couponValidation.value ?? 0;
        }
    }

    // Automatic offers (no code). Competes with the coupon — the larger wins,
    // no stacking. Evaluated server-side from trusted prices.
    let offerId: string | null = null;
    let offerLabel: string | null = null;
    const offers = await getActiveOffers().catch(() => [] as OfferRow[]);
    const offerEval = evaluateDollOffer(offers, {
        mode,
        base: baseTotal,
        extras: extrasTotal,
        collectionId: (doll.collection_id as string | null) ?? null,
    });
    if (offerEval.offer && offerEval.discountAmount > discountAmount) {
        discountAmount = Math.min(grossTotal, offerEval.discountAmount);
        discountType = offerEval.discountType ?? "none";
        discountValue = offerEval.discountValue;
        offerId = offerEval.offer.id;
        offerLabel = offerBadgeLabel(offerEval.offer, locale) ?? offerEval.offer.name;
        couponId = null;
        appliedCouponCode = null;
    }

    const totalAmount = Math.max(0, grossTotal - discountAmount);

    const customerName = getString(formData, "full_name").slice(0, NAME_MAX);
    const customerPhone = getString(formData, "phone");
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
    const deliveryTime =
        mode === "rent" && rentalStartAt
            ? toUtcTimeOnly(rentalStartAt)
            : getString(formData, "delivery_time");
    const returnTime =
        mode === "rent" && rentalEndAt ? toUtcTimeOnly(rentalEndAt) : null;
    const notes = getNullableString(formData, "notes")?.slice(0, NOTES_MAX) ?? null;
    const ageConfirmed = ["on", "true", "1"].includes(getString(formData, "age_confirmed"));
    const privacyAccepted = ["on", "true", "1"].includes(
        getString(formData, "privacy_accepted"),
    );

    if (!customerName) {
        throw new CheckoutValidationError(tCheckout("fieldRequired"));
    }
    if (!customerPhone || !PHONE_PATTERN.test(customerPhone.replace(/[\s-]/g, ""))) {
        throw new CheckoutValidationError(tCheckout("fieldInvalidPhone"));
    }
    if (customerEmail && !EMAIL_PATTERN.test(customerEmail)) {
        throw new CheckoutValidationError(tCheckout("fieldInvalidEmail"));
    }
    if (!deliveryCounty || !deliveryCity) {
        throw new CheckoutValidationError(tCheckout("fieldRequired"));
    }
    if (!deliveryAddress) {
        throw new CheckoutValidationError(tCheckout("fieldRequired"));
    }
    if (
        contactWindowStart &&
        contactWindowEnd &&
        contactWindowEnd <= contactWindowStart
    ) {
        throw new CheckoutValidationError(tCheckout("contactWindowError"));
    }
    if (!ageConfirmed) {
        throw new CheckoutValidationError(tCheckout("ageRequired"));
    }
    if (!privacyAccepted) {
        throw new CheckoutValidationError(tCheckout("privacyRequired"));
    }

    const normalizedPhone = normalizePhone(customerPhone);

    const customerPayload = {
        full_name: customerName,
        email: customerEmail,
        phone: customerPhone,
        normalized_phone: normalizedPhone,
        last_delivery_address: deliveryAddress,
        last_delivery_city: deliveryCity,
        last_delivery_county: deliveryCounty,
        preferred_contact_method: contactMethod,
        contact_window_start: contactWindowStart,
        contact_window_end: contactWindowEnd,
    };

    let customerId: string | null = null;

    if (customerEmail) {
        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .upsert(customerPayload, { onConflict: "email" })
            .select("id")
            .single();

        if (customerError || !customer) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        customerId = customer.id;
    } else {
        const { data: existingCustomer } = await supabase
            .from("customers")
            .select("id")
            .eq("normalized_phone", normalizedPhone)
            .maybeSingle();

        if (existingCustomer?.id) {
            const { error: updateError } = await supabase
                .from("customers")
                .update(customerPayload)
                .eq("id", existingCustomer.id);

            if (updateError) {
                throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
            }

            customerId = existingCustomer.id;
        } else {
            const { data: insertedCustomer, error: insertCustomerError } = await supabase
                .from("customers")
                .insert(customerPayload)
                .select("id")
                .single();

            if (insertCustomerError || !insertedCustomer) {
                throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
            }

            customerId = insertedCustomer.id;
        }
    }

    const payload = {
        mode,
        status: getInitialOrderStatus(mode),
        doll_id: doll.id,
        doll_slug: doll.slug,
        doll_name: doll.name,

        start_date: startDate,
        end_date: endDate,
        rental_days: rentalDays,

        rental_unit: rentalUnit,
        rental_quantity: rentalQuantity,
        rental_tier_id: matchedTier?.id ?? null,
        rental_tier_label: matchedTier?.label ?? null,
        rental_start_at: rentalStartAt ? rentalStartAt.toISOString() : null,
        rental_end_at: rentalEndAt ? rentalEndAt.toISOString() : null,
        rental_price: matchedTier?.price ?? null,

        outfit_id: selectedOutfit?.id ?? null,
        outfit_label: selectedOutfit?.label ?? null,
        outfit_price: selectedOutfit?.price ?? 0,
        outfit_image: selectedOutfit?.image_path ?? selectedOutfit?.image_url ?? null,
        selected_options: selectedOptionIds,

        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_county: deliveryCounty,
        delivery_time: deliveryTime,
        return_time: returnTime,
        notes,

        contact_method: contactMethod,
        contact_window_start: contactWindowStart,
        contact_window_end: contactWindowEnd,

        age_confirmed: ageConfirmed,
        privacy_accepted: privacyAccepted,

        subtotal_amount: grossTotal,
        custom_price_amount: null,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: discountAmount,
        coupon_id: couponId,
        coupon_code: appliedCouponCode,
        offer_id: offerId,
        offer_label: offerLabel,
        total_amount: totalAmount,
        total_label:
            grossTotal > 0
                ? formatPrice(totalAmount, locale, settings.currency || "RON")
                : tCheckout("pendingTotal"),
    };

    const { data: insertedOrder, error: insertError } = await supabase
        .from("orders")
        .insert(payload)
        .select("*")
        .single();

    if (insertError || !insertedOrder) {
        throw new CheckoutValidationError(
            insertError?.message ?? tCheckout("submitErrorDescription"),
        );
    }

    const order = insertedOrder as OrderRow;

    // Marchează comanda ca aparținând browserului curent — gate-ul de pe
    // pagina /success refuză vizualizarea PII fără cookie-ul ăsta.
    await rememberRecentOrder(order.id);

    // Commit the coupon. If the redemption RPC loses the race (cap just hit,
    // code disabled), re-price the order to the un-discounted total so the
    // downstream notify/realtime reflect what the customer actually owes.
    if (couponId) {
        const redeemed = await redeemDollCoupon(
            couponId,
            order.id,
            discountAmount,
            customerPhone || null,
        );
        if (!redeemed) {
            const reverted = {
                coupon_id: null,
                coupon_code: null,
                discount_type: "none" as const,
                discount_value: 0,
                discount_amount: 0,
                total_amount: grossTotal,
                total_label:
                    grossTotal > 0
                        ? formatPrice(grossTotal, locale, settings.currency || "RON")
                        : tCheckout("pendingTotal"),
            };
            await supabase.from("orders").update(reverted).eq("id", order.id);
            Object.assign(order, reverted);
        }
    }

    // Broadcast to live admin dashboards (best-effort).
    await emitNewOrder({
        orderId: order.id,
        orderNumber: order.order_number,
        dollName: order.doll_name,
        customerName: order.customer_name,
        total: order.total_amount,
        mode: order.mode,
        createdAt: order.created_at,
    });

    // Hand off the slow WhatsApp call to QStash. Fall back to a synchronous
    // send if the queue is unavailable so we never silently drop an order.
    const queued = await enqueueWhatsAppNotification(order.id);
    let notificationFailed = false;

    if (queued) {
        await supabase
            .from("orders")
            .update({
                whatsapp_notified: false,
                whatsapp_error: null,
                whatsapp_debug: { queued: true, queuedAt: new Date().toISOString() },
            })
            .eq("id", order.id);
    } else {
        let whatsappResult: {
            success: boolean;
            error: string | null;
            debug?: unknown;
        };
        try {
            whatsappResult = await notifyAdminsAboutOrder(order);
        } catch (error) {
            whatsappResult = {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                debug: {
                    fatal: true,
                    message: error instanceof Error ? error.message : String(error),
                },
            };
        }
        notificationFailed = !whatsappResult.success;
        const { error: whatsappUpdateError } = await supabase
            .from("orders")
            .update({
                whatsapp_notified: whatsappResult.success,
                whatsapp_error: whatsappResult.error,
                whatsapp_debug: whatsappResult.debug ?? null,
            })
            .eq("id", order.id);
        if (whatsappUpdateError) {
            console.error("[ArtisanDolls] Failed to save WhatsApp debug", whatsappUpdateError);
        }
    }

    // Schedule the customer email a few seconds out so DB replicas converge.
    if (order.customer_email) {
        await enqueueOrderEmail(order.id);
    }

    // Durable, multi-step lifecycle (reminder + follow-up). Fails silently if
    // QStash is not configured — the synchronous fallback above still ran.
    await startOrderLifecycleWorkflow(order.id);

    console.info("[ArtisanDolls] Order created", {
        orderId: order.id,
        orderNumber: order.order_number,
        queued,
        notificationFailed,
    });

    redirect({
        href: {
            pathname: `/catalog/${dollSlug}/success`,
            query: notificationFailed
                ? { orderId: order.id, notificationError: "1" }
                : { orderId: order.id },
        },
        locale,
    });
}

/**
 * Preview-validate a coupon for the doll checkout summary. The discount shown
 * here is advisory only — `createOrderAction` recomputes it from trusted prices
 * before charging, so a tampered `base`/`extras` can only fool the buyer's own
 * preview, never the final order.
 */
export async function validateDollCouponAction(input: {
    code: string;
    mode: CatalogMode;
    base: number;
    extras: number;
}): Promise<DollCouponValidation> {
    const code = String(input?.code ?? "").trim();
    if (!code) {
        return {
            ok: false,
            couponId: null,
            code: "",
            type: null,
            value: null,
            discountBase: null,
            discountAmount: 0,
            description: null,
            error: "not_found",
        };
    }
    const mode: CatalogMode = input?.mode === "buy" ? "buy" : "rent";
    const base = Math.max(0, Math.round(Number(input?.base) || 0));
    const extras = Math.max(0, Math.round(Number(input?.extras) || 0));
    return validateDollCoupon(code, mode, base, extras);
}
