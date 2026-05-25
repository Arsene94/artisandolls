"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { formatPrice, isSupportedLocale } from "@/i18n/format";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getInitialOrderStatus, getRentalDays, type OrderRow } from "@/lib/orders/shared";
import { notifyAdminsAboutOrder } from "@/lib/whatsapp";
import type { CatalogMode } from "@/lib/dolls";
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
            "id, slug, name, available_for_rent, available_for_buy, rent_price_per_day, buy_price",
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

    const startDate = getNullableString(formData, "start_date");
    const endDate = getNullableString(formData, "end_date");

    if (mode === "rent" && (!startDate || !endDate)) {
        throw new CheckoutValidationError(tCheckout("periodError"));
    }

    const rentalDays = mode === "rent" ? getRentalDays(startDate ?? "", endDate ?? "") : null;

    const selectedOptionIds = getSelectedOptions(getString(formData, "options"));
    let customizationsTotal = 0;

    if (selectedOptionIds.length > 0) {
        const { data: selectedOptions, error: selectedOptionsError } = await supabase
            .from("doll_customization_options")
            .select("id, price, is_active")
            .in("id", selectedOptionIds);

        if (selectedOptionsError) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        const activeOptions = selectedOptions?.filter((option) => option.is_active) ?? [];

        if (activeOptions.length !== selectedOptionIds.length) {
            throw new CheckoutValidationError(tCheckout("submitErrorDescription"));
        }

        customizationsTotal = activeOptions.reduce((sum, option) => {
            return sum + Number(option.price ?? 0);
        }, 0);
    }

    const outfitTotal = selectedOutfit?.price ?? 0;
    const baseTotal =
        mode === "rent"
            ? (rentalDays ?? 0) * Number(doll.rent_price_per_day ?? 0)
            : Number(doll.buy_price ?? 0);
    const totalAmount = Math.max(0, baseTotal + outfitTotal + customizationsTotal);

    const customerName = getString(formData, "full_name");
    const customerPhone = getString(formData, "phone");
    const customerEmailRaw = getString(formData, "email").toLowerCase();
    const customerEmail = customerEmailRaw || null;
    const deliveryAddress = getString(formData, "delivery_address");
    const deliveryCity = getNullableString(formData, "delivery_city");
    const deliveryCounty = getNullableString(formData, "delivery_county");
    const contactMethod = getNullableString(formData, "contact_method");
    const contactWindowStart = getNullableString(formData, "contact_window_start");
    const contactWindowEnd = getNullableString(formData, "contact_window_end");
    const deliveryTime = getString(formData, "delivery_time");
    const returnTime = getNullableString(formData, "return_time");
    const notes = getNullableString(formData, "notes");
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
    if (mode === "rent" && (!deliveryTime || !returnTime)) {
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

        subtotal_amount: totalAmount,
        custom_price_amount: null,
        discount_type: "none",
        discount_value: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        total_label:
            totalAmount > 0
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
