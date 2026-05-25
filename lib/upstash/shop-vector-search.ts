import "server-only";
import {
    isVectorEnabled,
    SHOP_VECTOR_NAMESPACES,
    vectorIndex,
    type ShopVectorMeta,
    type VectorLocale,
} from "@/lib/upstash/vector";

const SEARCH_TIMEOUT_MS = 1200;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise<T>((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            resolve(fallback);
        }, ms);
        promise
            .then((value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                resolve(value);
            })
            .catch((err) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                console.warn("[shop-vector] query failed", err);
                resolve(fallback);
            });
    });
}

export type ShopSemanticHit = {
    slug: string;
    score: number;
    metadata: ShopVectorMeta | null;
};

function extractSlug(raw: unknown, rawId: string): string {
    if (typeof raw === "string" && raw.length > 0) return raw;
    // Vector id format: `shop:<slug>:<locale>`. Strip prefix + suffix.
    const parts = rawId.split(":");
    if (parts.length >= 3 && parts[0] === "shop") {
        return parts.slice(1, -1).join(":");
    }
    return rawId;
}

/** Free-text semantic search over the shop catalog. */
export async function shopSemanticSearch(
    query: string,
    locale: VectorLocale,
    topK = 24,
): Promise<ShopSemanticHit[] | null> {
    if (!isVectorEnabled() || !vectorIndex) return null;
    const trimmed = query.trim();
    if (!trimmed) return null;

    const run = vectorIndex
        .query(
            { data: trimmed, topK, includeMetadata: true },
            { namespace: SHOP_VECTOR_NAMESPACES[locale] },
        )
        .then((res) =>
            res.map((r) => ({
                slug: extractSlug(r.metadata?.slug, String(r.id)),
                score: r.score ?? 0,
                metadata: (r.metadata ?? null) as ShopVectorMeta | null,
            })),
        );

    return withTimeout(run, SEARCH_TIMEOUT_MS, [] as ShopSemanticHit[]);
}

/**
 * Find shop products similar to a given seed (used on product detail page).
 * Excludes the seed slug. Returns at most `topK` hits.
 */
export async function similarShopProducts(
    seedSlug: string,
    seedText: string,
    locale: VectorLocale,
    topK = 5,
): Promise<ShopSemanticHit[]> {
    if (!isVectorEnabled() || !vectorIndex) return [];
    if (!seedText.trim()) return [];

    const run = vectorIndex
        .query(
            { data: seedText, topK: topK + 1, includeMetadata: true },
            { namespace: SHOP_VECTOR_NAMESPACES[locale] },
        )
        .then((res) =>
            res
                .map((r) => ({
                    slug: extractSlug(r.metadata?.slug, String(r.id)),
                    score: r.score ?? 0,
                    metadata: (r.metadata ?? null) as ShopVectorMeta | null,
                }))
                .filter((hit) => hit.slug !== seedSlug)
                .slice(0, topK),
        );

    return withTimeout(run, SEARCH_TIMEOUT_MS, [] as ShopSemanticHit[]);
}

/**
 * Semantically pick shop products to cross-sell on a doll detail page. The
 * seed text is whatever the caller already builds for the doll (name + tags
 * + collection). We filter by metadata `dollModes` matching the current mode.
 */
export async function crossSellShopForDoll(
    seedText: string,
    mode: "rent" | "buy",
    locale: VectorLocale,
    topK = 4,
): Promise<ShopSemanticHit[]> {
    if (!isVectorEnabled() || !vectorIndex) return [];
    if (!seedText.trim()) return [];

    const run = vectorIndex
        .query(
            {
                data: seedText,
                topK: topK + 6,
                includeMetadata: true,
                filter: `dollModes CONTAINS '${mode}' AND inStock = true`,
            },
            { namespace: SHOP_VECTOR_NAMESPACES[locale] },
        )
        .then((res) =>
            res
                .map((r) => ({
                    slug: extractSlug(r.metadata?.slug, String(r.id)),
                    score: r.score ?? 0,
                    metadata: (r.metadata ?? null) as ShopVectorMeta | null,
                }))
                .slice(0, topK),
        );

    return withTimeout(run, SEARCH_TIMEOUT_MS, [] as ShopSemanticHit[]);
}
