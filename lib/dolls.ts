import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";

export type CatalogMode = "rent" | "buy";

export type DollAvailability = "available" | "custom" | "limited" | "sold_out";

export type Doll = {
    id: string;
    name: string;
    collection: string;
    description: string;
    image: string;
    images?: string[];
    badge: string;
    availability: DollAvailability;
    availableForRent: boolean;
    availableForBuy: boolean;
    rentPricePerDay: number | null;
    buyPrice: number | null;
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
    rent_price_per_day: number | null;
    buy_price: number | null;
    tags: string[];
    show_on_home_hero: boolean;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export function mapDollRowToDoll(row: DollRow): Doll {
    return {
        id: row.slug,
        name: row.name,
        collection: row.collection,
        description: row.description,
        image: row.main_image_path ?? row.main_image_url ?? "",
        images: row.image_paths ?? row.image_urls ?? [],
        badge: row.badge,
        availability: row.availability,
        availableForRent: row.available_for_rent,
        availableForBuy: row.available_for_buy,
        rentPricePerDay: row.rent_price_per_day,
        buyPrice: row.buy_price,
        tags: row.tags,
        showOnHomeHero: row.show_on_home_hero ?? false,
    };
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

export async function getDolls() {
    return cached(CACHE_KEYS.dolls, 300, async () => {
        const rows = await getDollRows(false);
        return rows.map(mapDollRowToDoll);
    });
}

export async function getDollBySlug(slug: string) {
    return cached(CACHE_KEYS.dollBySlug(slug), 300, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("dolls")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error || !data) return null;
        return mapDollRowToDoll(data as DollRow);
    });
}

export async function getHomepageHeroDoll() {
    return cached(CACHE_KEYS.heroDoll, 300, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("dolls")
            .select("*")
            .eq("is_active", true)
            .eq("show_on_home_hero", true)
            .maybeSingle();

        if (error || !data) return null;
        return mapDollRowToDoll(data as DollRow);
    });
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
