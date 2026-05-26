import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cached, cacheKey, invalidatePrefix } from "@/lib/upstash/cache";
import { reservedTotals } from "@/lib/shop/reservations";
import {
    applyReservations,
    mapCategoryRow,
    mapProductRow,
    type ShopCategory,
    type ShopCategoryRow,
    type ShopProduct,
    type ShopProductRow,
} from "@/lib/shop/shared";
import type { Locale } from "@/i18n/routing";
import { getEntityTranslations } from "@/lib/translations/store";

const CACHE = {
    categories: cacheKey("shop", "categories", "v1"),
    products: cacheKey("shop", "products", "v1"),
    productBySlug: (slug: string) => cacheKey("shop", "product", slug, "v1"),
    productsPrefix: cacheKey("shop", "product"),
} as const;

export async function getShopCategories(): Promise<ShopCategoryRow[]> {
    return cached(CACHE.categories, 600, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("shop_categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });
        if (error) throw new Error(error.message);
        return (data ?? []) as ShopCategoryRow[];
    });
}

export async function getShopCategory(slug: string): Promise<ShopCategoryRow | null> {
    const all = await getShopCategories();
    return all.find((row) => row.slug === slug) ?? null;
}

export function categoriesAsPublic(
    rows: ShopCategoryRow[],
    locale: string,
): ShopCategory[] {
    return rows.map((row) => ({
        ...mapCategoryRow(row),
        name:
            locale === "en" && row.name_en
                ? row.name_en
                : locale === "nl" && row.name_nl
                  ? row.name_nl
                  : row.name,
        description:
            locale === "en" && row.description_en
                ? row.description_en
                : locale === "nl" && row.description_nl
                  ? row.description_nl
                  : row.description,
    }));
}

/**
 * Raw products fetched from Supabase, cached. Reservations are NOT applied
 * here so the cache can be shared across all users; the caller composes the
 * reservation overlay via {@link withLiveAvailability}.
 */
async function getRawShopProducts(): Promise<ShopProduct[]> {
    return cached(CACHE.products, 300, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("shop_products")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        return ((data ?? []) as ShopProductRow[]).map(mapProductRow);
    });
}

/**
 * Aplică traducerile auto-generate pentru un set de produse. RO trece prin
 * fără modificări. Pentru EN/NL, suprascriem `name`, `shortDescription`,
 * `description` cu valoarea localizată (dacă există). Câmpurile rămân la
 * RO ca fallback dacă jobul nu a rulat încă.
 */
export async function localizeProducts(
    products: ShopProduct[],
    locale: Locale,
): Promise<ShopProduct[]> {
    if (locale === "ro" || products.length === 0) return products;
    const translations = await getEntityTranslations(
        "shop_product",
        products.map((p) => p.id),
        locale,
    );
    if (translations.size === 0) return products;
    return products.map((product) => {
        const t = translations.get(product.id);
        if (!t) return product;
        return {
            ...product,
            name: t.name?.trim() || product.name,
            shortDescription: t.short_description?.trim() || product.shortDescription,
            description: t.description?.trim() || product.description,
        };
    });
}

export async function localizeCategories(
    categories: ShopCategory[],
    rows: ShopCategoryRow[],
    locale: Locale,
): Promise<ShopCategory[]> {
    // `categoriesAsPublic` deja folosește coloanele _en/_nl când există. Aici
    // doar acoperim cazul în care editorul nu le-a completat manual și worker-ul
    // a populat content_translations.
    if (locale === "ro" || categories.length === 0) return categories;
    const translations = await getEntityTranslations(
        "shop_category",
        categories.map((c) => c.id),
        locale,
    );
    if (translations.size === 0) return categories;
    const rowById = new Map(rows.map((r) => [r.id, r]));
    return categories.map((cat) => {
        const t = translations.get(cat.id);
        if (!t) return cat;
        const row = rowById.get(cat.id);
        const manualName = locale === "en" ? row?.name_en : row?.name_nl;
        const manualDesc =
            locale === "en" ? row?.description_en : row?.description_nl;
        return {
            ...cat,
            name: manualName?.trim() || t.name?.trim() || cat.name,
            description: manualDesc?.trim() || t.description?.trim() || cat.description,
        };
    });
}

export async function withLiveAvailability(
    products: ShopProduct[],
): Promise<ShopProduct[]> {
    if (products.length === 0) return products;
    const trackedSlugs = products
        .filter((p) => p.trackStock)
        .map((p) => p.slug);
    if (trackedSlugs.length === 0) return products;
    const reserved = await reservedTotals(trackedSlugs);
    return applyReservations(products, reserved);
}

export async function getShopProducts(): Promise<ShopProduct[]> {
    const raw = await getRawShopProducts();
    return withLiveAvailability(raw);
}

export async function getShopProductBySlug(slug: string): Promise<ShopProduct | null> {
    const cachedProduct = await cached(CACHE.productBySlug(slug), 300, async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("shop_products")
            .select("*")
            .eq("slug", slug)
            .eq("is_active", true)
            .maybeSingle();
        if (error || !data) return null;
        return mapProductRow(data as ShopProductRow);
    });

    if (!cachedProduct) return null;
    const [withAvailability] = await withLiveAvailability([cachedProduct]);
    return withAvailability;
}

export async function getShopProductRowBySlug(slug: string): Promise<ShopProductRow | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
    if (error || !data) return null;
    return data as ShopProductRow;
}

export async function getProductsByIds(ids: string[]): Promise<ShopProduct[]> {
    if (ids.length === 0) return [];
    const all = await getShopProducts();
    return all.filter((p) => ids.includes(p.id));
}

export async function getProductsBySlugs(slugs: string[]): Promise<ShopProduct[]> {
    if (slugs.length === 0) return [];
    const all = await getShopProducts();
    const order = new Map<string, number>(slugs.map((slug, idx) => [slug, idx]));
    return all
        .filter((p) => order.has(p.slug))
        .sort(
            (a, b) =>
                (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
                (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
        );
}

export async function getFeaturedProducts(limit = 8): Promise<ShopProduct[]> {
    const all = await getShopProducts();
    return all.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getProductsForCategory(
    categoryId: string,
): Promise<ShopProduct[]> {
    const all = await getShopProducts();
    return all.filter((p) => p.categoryId === categoryId);
}

/** Toate variantele active dintr-un group, incluzând produsul-seed. Ordinea
 *  e cea din `display_order`/insert order, păstrată de cache-ul shared. */
export async function getVariantSiblings(
    variantGroupId: string,
): Promise<ShopProduct[]> {
    const all = await getShopProducts();
    return all.filter((p) => p.variantGroupId === variantGroupId);
}

/** Used by admin actions after any product/category mutation. */
export async function invalidateShopCache(): Promise<void> {
    await invalidatePrefix(cacheKey("shop"));
}
