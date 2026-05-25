import type { PaymentProviderId } from "@/lib/payments/types";

export type PlatformSettingsRow = {
    id: "default";
    business_name: string;
    public_site_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    whatsapp_phone: string | null;
    currency: string;
    locale: string;
    catalog_enabled: boolean;
    rent_enabled: boolean;
    buy_enabled: boolean;
    maintenance_mode: boolean;
    default_delivery_start_time: string | null;
    default_delivery_end_time: string | null;
    default_return_start_time: string | null;
    default_return_end_time: string | null;
    order_terms: string | null;
    privacy_note: string | null;
    admin_notes: string | null;

    online_payment_enabled: boolean;
    online_payment_provider: PaymentProviderId;
    stripe_account_id: string | null;
    stripe_publishable_key: string | null;
    netopia_pos_signature: string | null;
    netopia_live_mode: boolean;

    shop_checkout_mode: "own" | "ucp";
    ucp_enabled: boolean;
    ucp_api_key_hash: string | null;

    created_at: string;
    updated_at: string;
};

export type PublicPlatformSettings = Pick<
    PlatformSettingsRow,
    | "business_name"
    | "public_site_url"
    | "contact_email"
    | "contact_phone"
    | "whatsapp_phone"
    | "currency"
    | "locale"
    | "catalog_enabled"
    | "rent_enabled"
    | "buy_enabled"
    | "maintenance_mode"
    | "default_delivery_start_time"
    | "default_delivery_end_time"
    | "default_return_start_time"
    | "default_return_end_time"
    | "order_terms"
    | "privacy_note"
    | "online_payment_enabled"
    | "online_payment_provider"
    | "stripe_publishable_key"
    | "shop_checkout_mode"
    | "ucp_enabled"
>;
