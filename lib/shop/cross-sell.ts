import "server-only";
import { getProductsBySlugs, getShopProducts } from "@/lib/shop/products";
import { crossSellShopForDoll } from "@/lib/upstash/shop-vector-search";
import type { CatalogMode, Doll } from "@/lib/dolls";
import type { Locale } from "@/i18n/routing";
import type { ShopProduct } from "@/lib/shop/shared";

function tagScoredFallback(
    pool: ShopProduct[],
    doll: Doll,
    mode: CatalogMode,
    limit: number,
): ShopProduct[] {
    const dollTagSet = new Set(
        (doll.tags ?? []).map((t) => t.toLowerCase().trim()).filter(Boolean),
    );

    const scored = pool
        .filter((product) => product.isInStock)
        .filter((product) =>
            product.dollModes.length === 0 || product.dollModes.includes(mode),
        )
        .map((product) => {
            let score = 0;
            if (product.isFeatured) score += 2;
            for (const tag of product.tags ?? []) {
                if (dollTagSet.has(tag.toLowerCase().trim())) score += 3;
            }
            // Always nudge sanitation / care products to the front for rentals.
            if (mode === "rent" && product.tags.includes("care")) score += 1;
            return { product, score };
        });

    const matched = scored.filter((row) => row.score > 0);
    const finalPool = matched.length > 0 ? matched : scored;

    return finalPool
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((row) => row.product);
}

function buildSeedText(doll: Doll): string {
    return [
        doll.name,
        doll.collection,
        doll.description ?? "",
        (doll.tags ?? []).join(" "),
    ]
        .filter(Boolean)
        .join(" . ");
}

/**
 * Pick shop products relevant to a doll. Tries Upstash Vector first (semantic
 * + metadata filter on doll mode), falls back to the deterministic tag-scorer
 * when the index is disabled, empty, or slow.
 */
export async function getCrossSellForDoll(
    doll: Doll,
    mode: CatalogMode,
    locale: Locale,
    limit = 4,
): Promise<ShopProduct[]> {
    const all = await getShopProducts();
    if (all.length === 0) return [];

    const hits = await crossSellShopForDoll(
        buildSeedText(doll),
        mode,
        locale,
        limit,
    );
    if (hits.length > 0) {
        const products = await getProductsBySlugs(hits.map((h) => h.slug));
        if (products.length >= Math.min(limit, 2)) {
            return products.slice(0, limit);
        }
    }

    return tagScoredFallback(all, doll, mode, limit);
}
