"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";

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

    const { error } = await supabase
        .from("platform_settings")
        .update({
            business_name: getString(formData, "business_name") || "Artisan Dolls",
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
        })
        .eq("id", "default");

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/catalog");
}
