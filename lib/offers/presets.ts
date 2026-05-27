// Predefined commercial banner messages, grouped per offer type. The keys are
// stable identifiers stored in `site_offers.preset_key`; the actual copy lives
// in the i18n catalogs under `offers.presets.<type>.<key>.{badge,title,subtitle}`
// so official presets are hand-translated per locale (never AI-translated).
// Keep this in sync with the `offers.presets` object in messages/{ro,en,nl}.json.

import type { OfferType } from "@/lib/offers/shared";

export const OFFER_PRESETS: Record<OfferType, readonly string[]> = {
    threshold_percent: ["seasonal", "more_you_buy"],
    threshold_fixed: ["instant_off", "welcome_off"],
    threshold_gift: ["free_gift", "surprise_gift"],
    buy_x_get_y: ["bogo", "bundle"],
    collection_percent: ["collection_sale", "category_deal"],
    promo: ["new_arrivals", "limited_time", "free_shipping", "weekend"],
};

/** Maps an offer display column to its preset sub-key. */
export const OFFER_PRESET_FIELD_MAP = [
    { column: "badge_label", preset: "badge" },
    { column: "title", preset: "title" },
    { column: "subtitle", preset: "subtitle" },
] as const;

export function isValidPresetForType(
    type: OfferType,
    key: string | null | undefined,
): boolean {
    return typeof key === "string" && OFFER_PRESETS[type]?.includes(key) === true;
}

/** First preset of a type — the sensible default when creating/switching type. */
export function defaultPresetForType(type: OfferType): string {
    return OFFER_PRESETS[type]?.[0] ?? "";
}

/**
 * Romanian labels for the admin preset selector. The admin UI is RO-only (no
 * next-intl provider), so these live in code rather than the i18n catalog; the
 * customer-facing copy still comes from `offers.presets` in messages/*.json.
 */
export const OFFER_PRESET_ADMIN_LABELS: Record<
    OfferType,
    Record<string, string>
> = {
    threshold_percent: {
        seasonal: "Reduceri de sezon",
        more_you_buy: "Cumperi mai mult, economisești mai mult",
    },
    threshold_fixed: {
        instant_off: "Reducere instant",
        welcome_off: "Bonus la comenzile mari",
    },
    threshold_gift: {
        free_gift: "Cadou la comandă",
        surprise_gift: "Surpriză inclusă",
    },
    buy_x_get_y: {
        bogo: "Cumperi unul, al doilea redus",
        bundle: "Mai multe, mai ieftin",
    },
    collection_percent: {
        collection_sale: "Reduceri pe colecție",
        category_deal: "Ofertă pe categorie",
    },
    promo: {
        new_arrivals: "Noutăți în colecție",
        limited_time: "Ofertă pe timp limitat",
        free_shipping: "Transport gratuit",
        weekend: "Ofertă de weekend",
    },
};
