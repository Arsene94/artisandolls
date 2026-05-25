"use server";

import { defaultLocale, type Locale } from "@/i18n/routing";
import { isSupportedLocale } from "@/i18n/format";
import { shopSemanticSearch } from "@/lib/upstash/shop-vector-search";

type SearchResult = {
    slugs: string[] | null;
};

export async function searchShopSemantic(
    query: string,
    rawLocale: string,
): Promise<SearchResult> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return { slugs: null };

    const locale: Locale = isSupportedLocale(rawLocale) ? rawLocale : defaultLocale;
    const hits = await shopSemanticSearch(trimmed, locale, 30);
    if (!hits) return { slugs: null };
    return { slugs: hits.map((h) => h.slug) };
}
