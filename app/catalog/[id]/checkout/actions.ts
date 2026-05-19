"use server";

import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {getInitialOrderStatus, getRentalDays, type OrderRow} from "@/lib/orders/shared";
import { notifyAdminsAboutOrder } from "@/lib/whatsapp";
import type { CatalogMode } from "@/lib/dolls";
import {
    getPublicPlatformSettings,
    isCatalogModeEnabled,
} from "@/lib/settings";

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

function getTotalAmount(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function normalizePhone(value: string) {
    return value.replace(/[^\d+]/g, "");
}

export async function createOrderAction(formData: FormData) {
    const supabase = createSupabaseServiceClient();

    const mode = getMode(getString(formData, "mode"));
    const settings = await getPublicPlatformSettings();

    if (settings.maintenance_mode) {
        throw new Error("Platforma este momentan în mentenanță.");
    }

    if (!settings.catalog_enabled) {
        throw new Error("Catalogul este momentan indisponibil.");
    }

    if (!isCatalogModeEnabled(mode, settings)) {
        throw new Error(
            mode === "rent"
                ? "Închirierile sunt momentan indisponibile."
                : "Cumpărările sunt momentan indisponibile."
        );
    }
    const dollSlug = getString(formData, "doll_slug");

    const { data: doll, error: dollError } = await supabase
        .from("dolls")
        .select("id, slug, name, available_for_rent, available_for_buy")
        .eq("slug", dollSlug)
        .single();

    if (dollError || !doll) {
        throw new Error("Păpușa nu a fost găsită.");
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
            throw new Error("Ținuta selectată nu mai este disponibilă.");
        }

        if (outfit.mode !== "both" && outfit.mode !== mode) {
            throw new Error("Ținuta selectată nu este disponibilă pentru acest tip de comandă.");
        }

        selectedOutfit = outfit;
    }

    if (mode === "rent" && !doll.available_for_rent) {
        throw new Error("Această păpușă nu este disponibilă pentru închiriere.");
    }

    if (mode === "buy" && !doll.available_for_buy) {
        throw new Error("Această păpușă nu este disponibilă pentru cumpărare.");
    }

    const startDate = getNullableString(formData, "start_date");
    const endDate = getNullableString(formData, "end_date");

    if (!startDate || !endDate) {
        throw new Error("Alege perioada înainte de confirmare.");
    }

    const rentalDays = mode === "rent" ? getRentalDays(startDate, endDate) : null;

    const totalAmount = getTotalAmount(getString(formData, "total"));

    const customerEmail = getString(formData, "email").toLowerCase();
    const customerPhone = getString(formData, "phone");
    const customerName = getString(formData, "full_name");
    const deliveryAddress = getString(formData, "delivery_address");

    const { data: customer, error: customerError } = await supabase
        .from("customers")
        .upsert(
            {
                full_name: customerName,
                email: customerEmail,
                phone: customerPhone,
                normalized_phone: normalizePhone(customerPhone),
                last_delivery_address: deliveryAddress,
            },
            {
                onConflict: "email",
            }
        )
        .select("id")
        .single();

    if (customerError || !customer) {
        throw new Error(customerError?.message ?? "Clientul nu a putut fi salvat.");
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
        selected_options: getSelectedOptions(getString(formData, "options")),

        customer_id: customer.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_time: getString(formData, "delivery_time"),
        return_time: getNullableString(formData, "return_time"),
        notes: getNullableString(formData, "notes"),

        subtotal_amount: totalAmount,
        custom_price_amount: null,
        discount_type: "none",
        discount_value: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        total_label:
            totalAmount > 0
                ? `${totalAmount.toLocaleString("ro-RO")} lei`
                : "Se confirmă după verificare",
    };

    const { data: insertedOrder, error: insertError } = await supabase
        .from("orders")
        .insert(payload)
        .select("*")
        .single();

    if (insertError || !insertedOrder) {
        throw new Error(insertError?.message ?? "Comanda nu a putut fi salvată.");
    }

    const order = insertedOrder as OrderRow;

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

    console.info("[ArtisanDolls] Order created", {
        orderId: order.id,
        orderNumber: order.order_number,
        whatsappNotified: whatsappResult.success,
        whatsappError: whatsappResult.error,
    });

    redirect(`/catalog/${dollSlug}/success?orderId=${order.id}`);
}
