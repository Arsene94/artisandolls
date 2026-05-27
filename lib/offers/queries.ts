import "server-only";
import { cache } from "react";
import { getTranslations } from "next-intl/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";
import { getEntityTranslations } from "@/lib/translations/store";
import { formatPrice } from "@/i18n/format";
import {
    OFFER_PRESET_FIELD_MAP,
    isValidPresetForType,
} from "@/lib/offers/presets";
import type { Locale } from "@/i18n/routing";
import type { OfferRow } from "@/lib/offers/shared";

const OFFERS_TTL = 120;

/**
 * All active offers, ordered by priority. Includes offers whose start/expiry
 * window may not be current — callers run `offerIsLive()` against the request
 * time so the cache can stay time-agnostic.
 *
 * Wrapped in React `cache()` so repeated calls within a single request (e.g.
 * every product card resolving its badge) share one Redis/DB round-trip.
 */
export const getActiveOffers = cache(async (): Promise<OfferRow[]> => {
    return cached(CACHE_KEYS.offers, OFFERS_TTL, async () => {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("site_offers")
            .select("*")
            .eq("is_active", true)
            .order("priority", { ascending: false });
        if (error) {
            console.warn("[offers] load failed", error);
            return [];
        }
        return (data ?? []) as OfferRow[];
    });
});

type PresetOpts = {
    thresholdAmount?: number | null;
    currency?: string | null;
};
type PresetGetter = (
    type: string,
    presetKey: string,
    presetField: string,
    opts?: PresetOpts,
) => string | null;

/**
 * Builds a getter over the `offers.presets` i18n namespace for one locale.
 * Threshold-aware presets use an ICU `{hasThreshold, select, ...}` switch, so
 * the offer's `threshold_amount` (formatted as money in this locale) is passed
 * to every lookup; presets without the placeholder simply ignore it.
 */
async function buildPresetGetter(locale: Locale): Promise<PresetGetter> {
    const t = await getTranslations({ locale, namespace: "offers.presets" });
    const has = (t as unknown as { has?: (key: string) => boolean }).has;
    return (type, presetKey, presetField, opts) => {
        const path = `${type}.${presetKey}.${presetField}`;
        const hasThreshold =
            typeof opts?.thresholdAmount === "number" &&
            opts.thresholdAmount > 0;
        const values = {
            hasThreshold: hasThreshold ? "yes" : "no",
            threshold: hasThreshold
                ? formatPrice(
                      opts.thresholdAmount as number,
                      locale,
                      opts.currency || "RON",
                  )
                : "",
        };
        try {
            if (typeof has === "function" && !has.call(t, path)) return null;
            const value = t(path, values);
            return typeof value === "string" && value.trim().length > 0
                ? value.trim()
                : null;
        } catch {
            return null;
        }
    };
}

/**
 * Resolves the display copy (badge/title/subtitle) for each offer in `locale`:
 *
 *  1. Operator-authored RO text wins. Its EN/NL come from the AI pipeline
 *     (content_translations, entity "site_offer"); a legacy manual `_en`/`_nl`
 *     column still takes precedence if present.
 *  2. Otherwise, if the offer points at a predefined commercial preset
 *     (`preset_key`), the copy comes from the hand-translated `offers.presets`
 *     i18n catalog — never AI-translated.
 *
 * Values land in the `_en`/`_nl` (and RO fallback) columns so the shared
 * `offerBadgeLabel` / `offerTitle` / `offerSubtitle` pickers keep working. The
 * cached source rows are never mutated — each touched offer is shallow-copied.
 */
export async function localizeOffers(
    offers: OfferRow[],
    locale: string,
): Promise<OfferRow[]> {
    if (offers.length === 0) return offers;
    const isTarget = locale === "en" || locale === "nl";
    const hasPreset = offers.some((o) =>
        isValidPresetForType(o.type, o.preset_key),
    );
    if (!isTarget && !hasPreset) return offers;

    const translations = isTarget
        ? await getEntityTranslations(
              "site_offer",
              offers.map((o) => o.id),
              locale as Locale,
          )
        : new Map<string, Record<string, string>>();

    const getRo = hasPreset ? await buildPresetGetter("ro") : null;
    const getLoc =
        hasPreset && isTarget ? await buildPresetGetter(locale as Locale) : getRo;

    const suffix = locale === "en" ? "_en" : locale === "nl" ? "_nl" : "";

    return offers.map((offer) => {
        const ai = translations.get(offer.id);
        const usePreset = isValidPresetForType(offer.type, offer.preset_key);
        if (!ai && !usePreset) return offer;

        const next = { ...offer } as OfferRow & Record<string, unknown>;
        for (const { column, preset } of OFFER_PRESET_FIELD_MAP) {
            const rawCustom = offer[column];
            const customRo =
                typeof rawCustom === "string" ? rawCustom.trim() : "";

            if (customRo) {
                if (isTarget && suffix) {
                    const localeCol = `${column}${suffix}`;
                    const existing = next[localeCol];
                    const translated = ai?.[column];
                    if (
                        (typeof existing !== "string" ||
                            existing.trim().length === 0) &&
                        translated &&
                        translated.trim().length > 0
                    ) {
                        next[localeCol] = translated;
                    }
                }
                continue;
            }

            if (usePreset && offer.preset_key) {
                const opts: PresetOpts = {
                    thresholdAmount: offer.threshold_amount,
                    currency: offer.currency,
                };
                const ro =
                    getRo?.(offer.type, offer.preset_key, preset, opts) ?? null;
                if (ro) next[column] = ro; // RO column = universal fallback
                if (isTarget && suffix) {
                    const localeText =
                        getLoc?.(offer.type, offer.preset_key, preset, opts) ??
                        null;
                    if (localeText) next[`${column}${suffix}`] = localeText;
                }
            }
        }
        return next;
    });
}

/** `getActiveOffers` with the localized-copy overlay applied for `locale`. */
export async function getLocalizedOffers(locale: string): Promise<OfferRow[]> {
    const offers = await getActiveOffers();
    return localizeOffers(offers, locale);
}
