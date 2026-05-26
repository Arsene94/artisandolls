import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";
import type { Locale } from "@/i18n/routing";
import { getEntityTranslations } from "@/lib/translations/store";
import {
    mapRentalTierRow,
    type RentalTier,
    type RentalTierRow,
} from "@/lib/dolls/tiers";

export type { RentalTier } from "@/lib/dolls/tiers";

export type CatalogMode = "rent" | "buy";

export type DollAvailability = "available" | "custom" | "limited" | "sold_out";

export type Doll = {
    id: string;
    name: string;
    collection: string;
    collectionId: string | null;
    description: string;
    image: string;
    images?: string[];
    badge: string;
    availability: DollAvailability;
    availableForRent: boolean;
    availableForBuy: boolean;
    buyPrice: number | null;
    rentalTiers: RentalTier[];
    tags: string[];
    showOnHomeHero: boolean;
};

export type DollRow = {
    id: string;
    slug: string;
    name: string;
    collection_id: string | null;
    collection: string;
    description: string;
    main_image_path: string;
    image_paths: string[];
    main_image_url?: string;
    image_urls?: string[];
    badge: string;
    availability: DollAvailability;
    available_for_rent: boolean;
    available_for_buy: boolean;
    buy_price: number | null;
    tags: string[];
    show_on_home_hero: boolean;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export function mapDollRowToDoll(row: DollRow, tiers: RentalTier[] = []): Doll {
    return {
        id: row.slug,
        name: row.name,
        collection: row.collection,
        collectionId: row.collection_id,
        description: row.description,
        image: row.main_image_path ?? row.main_image_url ?? "",
        images: row.image_paths ?? row.image_urls ?? [],
        badge: row.badge,
        availability: row.availability,
        availableForRent: row.available_for_rent,
        availableForBuy: row.available_for_buy,
        buyPrice: row.buy_price,
        rentalTiers: tiers,
        tags: row.tags,
        showOnHomeHero: row.show_on_home_hero ?? false,
    };
}

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getRentalTiersByDoll(
    supabase: SupabaseServerClient,
    dollIds: string[],
): Promise<Map<string, RentalTier[]>> {
    const map = new Map<string, RentalTier[]>();
    if (dollIds.length === 0) return map;

    const { data, error } = await supabase
        .from("doll_rental_tiers")
        .select("*")
        .in("doll_id", dollIds)
        .order("display_order", { ascending: true })
        .order("min_qty", { ascending: true });

    if (error || !data) return map;

    for (const row of data as RentalTierRow[]) {
        const list = map.get(row.doll_id) ?? [];
        list.push(mapRentalTierRow(row));
        map.set(row.doll_id, list);
    }
    return map;
}

export async function getRentalTiersForDoll(dollId: string): Promise<RentalTier[]> {
    const supabase = await createSupabaseServerClient();
    const map = await getRentalTiersByDoll(supabase, [dollId]);
    return map.get(dollId) ?? [];
}

/**
 * Aplică traducerile auto-generate peste un array de păpuși. RO trece prin
 * fără modificări. Pentru EN/NL suprascriem `name`, `description` și `badge`
 * dacă există în content_translations.
 *
 * Notă: cheia entității de tradus rămâne `doll` (uuid-ul rândului DB), dar
 * `Doll.id` expus public e slug-ul. Folosim row → id-ul real pentru lookup.
 */
export async function localizeDolls<
    T extends { id: string; name: string; description: string; badge: string },
>(rowOrDolls: Array<T & { id: string }>, locale: Locale): Promise<T[]> {
    if (locale === "ro" || rowOrDolls.length === 0) return rowOrDolls;
    const translations = await getEntityTranslations(
        "doll",
        rowOrDolls.map((d) => d.id),
        locale,
    );
    if (translations.size === 0) return rowOrDolls;
    return rowOrDolls.map((doll) => {
        const t = translations.get(doll.id);
        if (!t) return doll;
        return {
            ...doll,
            name: t.name?.trim() || doll.name,
            description: t.description?.trim() || doll.description,
            badge: t.badge?.trim() || doll.badge,
        };
    });
}

/**
 * Variantă care lucrează cu tipul public `Doll` (unde `id` e slug-ul). Citește
 * separat translation-urile pentru DB-id-urile reale.
 */
export async function localizeDollsBySlug(
    dolls: Doll[],
    rows: Pick<DollRow, "id" | "slug">[],
    locale: Locale,
): Promise<Doll[]> {
    if (locale === "ro" || dolls.length === 0) return dolls;
    const slugToDbId = new Map(rows.map((r) => [r.slug, r.id]));
    const dbIds = dolls
        .map((d) => slugToDbId.get(d.id))
        .filter((id): id is string => Boolean(id));
    if (dbIds.length === 0) return dolls;
    const translations = await getEntityTranslations("doll", dbIds, locale);
    if (translations.size === 0) return dolls;
    return dolls.map((doll) => {
        const dbId = slugToDbId.get(doll.id);
        const t = dbId ? translations.get(dbId) : undefined;
        if (!t) return doll;
        return {
            ...doll,
            name: t.name?.trim() || doll.name,
            description: t.description?.trim() || doll.description,
            badge: t.badge?.trim() || doll.badge,
        };
    });
}

export async function getDollRows(includeInactive = false) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("dolls")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as DollRow[];
}

export async function getDolls(locale?: Locale) {
    // Cache shared per cluster — locale-overlay-ul se aplică in-memory după read.
    const result = await cached(CACHE_KEYS.dolls, 300, async () => {
        const rows = await getDollRows(false);
        const supabase = await createSupabaseServerClient();
        const tiersByDoll = await getRentalTiersByDoll(
            supabase,
            rows.map((row) => row.id),
        );
        return rows.map((row) => ({
            doll: mapDollRowToDoll(row, tiersByDoll.get(row.id) ?? []),
            dbId: row.id,
        }));
    });
    if (!locale || locale === "ro") {
        return result.map((r) => r.doll);
    }
    const localized = await localizeDollsBySlug(
        result.map((r) => r.doll),
        result.map((r) => ({ id: r.dbId, slug: r.doll.id })),
        locale,
    );
    return localized;
}

export async function getDollsByCollectionId(collectionId: string, locale?: Locale) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("dolls")
        .select("*")
        .eq("is_active", true)
        .eq("collection_id", collectionId)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

    if (error || !data) return [];
    const rows = data as DollRow[];
    const tiersByDoll = await getRentalTiersByDoll(
        supabase,
        rows.map((row) => row.id),
    );
    const dolls = rows.map((row) => mapDollRowToDoll(row, tiersByDoll.get(row.id) ?? []));
    if (!locale || locale === "ro") return dolls;
    return localizeDollsBySlug(
        dolls,
        rows.map((r) => ({ id: r.id, slug: r.slug })),
        locale,
    );
}

export async function getDollBySlug(slug: string, locale?: Locale) {
    const cachedDoll = await cached(CACHE_KEYS.dollBySlug(slug), 300, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("dolls")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error || !data) return null;
        const row = data as DollRow;
        const tiersMap = await getRentalTiersByDoll(supabase, [row.id]);
        return {
            doll: mapDollRowToDoll(row, tiersMap.get(row.id) ?? []),
            dbId: row.id,
        };
    });
    if (!cachedDoll) return null;
    if (!locale || locale === "ro") return cachedDoll.doll;
    const [localized] = await localizeDollsBySlug(
        [cachedDoll.doll],
        [{ id: cachedDoll.dbId, slug: cachedDoll.doll.id }],
        locale,
    );
    return localized ?? cachedDoll.doll;
}

export async function getHomepageHeroDoll(locale?: Locale) {
    const cachedHero = await cached(CACHE_KEYS.heroDoll, 300, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("dolls")
            .select("*")
            .eq("is_active", true)
            .eq("show_on_home_hero", true)
            .maybeSingle();

        if (error || !data) return null;
        const row = data as DollRow;
        const tiersMap = await getRentalTiersByDoll(supabase, [row.id]);
        return {
            doll: mapDollRowToDoll(row, tiersMap.get(row.id) ?? []),
            dbId: row.id,
        };
    });
    if (!cachedHero) return null;
    if (!locale || locale === "ro") return cachedHero.doll;
    const [localized] = await localizeDollsBySlug(
        [cachedHero.doll],
        [{ id: cachedHero.dbId, slug: cachedHero.doll.id }],
        locale,
    );
    return localized ?? cachedHero.doll;
}

export async function getDollRowBySlug(slug: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("dolls")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        return null;
    }

    return data as DollRow;
}

export async function getCollections() {
    return cached(CACHE_KEYS.collections, 600, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("doll_collections")
            .select("name")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return (data ?? []).map((collection) => collection.name);
    });
}
