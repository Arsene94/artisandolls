import "server-only";
import { cache } from "react";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";
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
