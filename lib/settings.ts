import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
    PlatformSettingsRow,
    PublicPlatformSettings,
} from "@/lib/settings/shared";
import type { CatalogMode } from "@/lib/dolls";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";

export type {
    PlatformSettingsRow,
    PublicPlatformSettings,
} from "@/lib/settings/shared";

const defaultPublicSettings: PublicPlatformSettings = {
    business_name: "Artisan Dolls",
    public_site_url: null,
    contact_email: null,
    contact_phone: null,
    whatsapp_phone: null,
    currency: "RON",
    locale: "ro-RO",
    catalog_enabled: true,
    rent_enabled: true,
    buy_enabled: true,
    maintenance_mode: false,
    default_delivery_start_time: null,
    default_delivery_end_time: null,
    default_return_start_time: null,
    default_return_end_time: null,
    order_terms: null,
    privacy_note: null,
    online_payment_enabled: false,
    online_payment_provider: "netopia",
    stripe_publishable_key: null,
    shop_checkout_mode: "own",
    ucp_enabled: false,
};

export async function getPlatformSettings() {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("id", "default")
        .single();

    if (error || !data) {
        throw new Error(error?.message ?? "Setările platformei nu au fost găsite.");
    }

    return data as PlatformSettingsRow;
}

export async function getPublicPlatformSettings() {
    return cached(CACHE_KEYS.settings, 60, async () => {
        const supabase = createSupabaseServiceClient();

        const { data, error } = await supabase
            .from("platform_settings")
            .select(`
                business_name,
                public_site_url,
                contact_email,
                contact_phone,
                whatsapp_phone,
                currency,
                locale,
                catalog_enabled,
                rent_enabled,
                buy_enabled,
                maintenance_mode,
                default_delivery_start_time,
                default_delivery_end_time,
                default_return_start_time,
                default_return_end_time,
                order_terms,
                privacy_note,
                online_payment_enabled,
                online_payment_provider,
                stripe_publishable_key,
                shop_checkout_mode,
                ucp_enabled
            `)
            .eq("id", "default")
            .single();

        if (error || !data) {
            return defaultPublicSettings;
        }

        return data as PublicPlatformSettings;
    });
}

export function isCatalogModeEnabled(
    mode: CatalogMode,
    settings: Pick<PublicPlatformSettings, "rent_enabled" | "buy_enabled">
) {
    return mode === "rent" ? settings.rent_enabled : settings.buy_enabled;
}

export function getSafeCatalogMode(
    requestedMode: CatalogMode,
    settings: Pick<PublicPlatformSettings, "rent_enabled" | "buy_enabled">
): CatalogMode | null {
    if (isCatalogModeEnabled(requestedMode, settings)) {
        return requestedMode;
    }

    if (settings.rent_enabled) {
        return "rent";
    }

    if (settings.buy_enabled) {
        return "buy";
    }

    return null;
}
