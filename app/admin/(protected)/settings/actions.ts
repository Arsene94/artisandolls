"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { invalidateSettings } from "@/lib/upstash/cache";
import { hashUcpApiKey } from "@/lib/ucp/auth";

async function requireAdminSupabase() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
        redirect("/admin/login");
    }

    return supabase;
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
    const value = getString(formData, key);
    return value || null;
}

export async function updatePlatformSettingsAction(formData: FormData) {
    const supabase = await requireAdminSupabase();

    const rawProvider = getString(formData, "online_payment_provider");
    const onlinePaymentProvider =
        rawProvider === "stripe" || rawProvider === "netopia"
            ? rawProvider
            : "netopia";

    const { error } = await supabase
        .from("platform_settings")
        .update({
            business_name: getString(formData, "business_name") || "Velvet Companions",
            public_site_url: getNullableString(formData, "public_site_url"),
            contact_email: getNullableString(formData, "contact_email"),
            contact_phone: getNullableString(formData, "contact_phone"),
            whatsapp_phone: getNullableString(formData, "whatsapp_phone"),
            currency: getString(formData, "currency") || "RON",
            locale: getString(formData, "locale") || "ro-RO",

            catalog_enabled: formData.get("catalog_enabled") === "on",
            rent_enabled: formData.get("rent_enabled") === "on",
            buy_enabled: formData.get("buy_enabled") === "on",
            maintenance_mode: formData.get("maintenance_mode") === "on",

            default_delivery_start_time: getNullableString(formData, "default_delivery_start_time"),
            default_delivery_end_time: getNullableString(formData, "default_delivery_end_time"),
            default_return_start_time: getNullableString(formData, "default_return_start_time"),
            default_return_end_time: getNullableString(formData, "default_return_end_time"),

            order_terms: getNullableString(formData, "order_terms"),
            privacy_note: getNullableString(formData, "privacy_note"),
            admin_notes: getNullableString(formData, "admin_notes"),

            online_payment_enabled: getString(formData, "online_payment_enabled") === "1",
            online_payment_provider: onlinePaymentProvider,
            netopia_pos_signature: getNullableString(formData, "netopia_pos_signature"),
            netopia_live_mode: getString(formData, "netopia_live_mode") === "1",
            stripe_publishable_key: getNullableString(formData, "stripe_publishable_key"),
            stripe_account_id: getNullableString(formData, "stripe_account_id"),

            shop_checkout_mode:
                getString(formData, "shop_checkout_mode") === "ucp" ? "ucp" : "own",
            ucp_enabled: getString(formData, "ucp_enabled") === "1",
        })
        .eq("id", "default");

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/catalog");
    await invalidateSettings();
}

/**
 * Generate a fresh UCP API key, persist only its SHA-256 hash, return the
 * plaintext exactly once so the admin can copy it into agent configs.
 */
export async function rotateUcpApiKeyAction(): Promise<{ key: string }> {
    const supabase = await requireAdminSupabase();
    const plaintext = `ucp_${randomBytes(24).toString("base64url")}`;
    const hash = hashUcpApiKey(plaintext);
    const { error } = await supabase
        .from("platform_settings")
        .update({ ucp_api_key_hash: hash })
        .eq("id", "default");
    if (error) throw new Error(error.message);
    revalidatePath("/admin/settings");
    await invalidateSettings();
    return { key: plaintext };
}

export async function clearUcpApiKeyAction(): Promise<void> {
    const supabase = await requireAdminSupabase();
    const { error } = await supabase
        .from("platform_settings")
        .update({ ucp_api_key_hash: null })
        .eq("id", "default");
    if (error) throw new Error(error.message);
    revalidatePath("/admin/settings");
    await invalidateSettings();
}
