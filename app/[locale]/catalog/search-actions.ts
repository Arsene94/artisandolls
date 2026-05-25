"use server";

import { isSupportedLocale } from "@/i18n/format";
import { defaultLocale, type Locale } from "@/i18n/routing";
import { semanticSearch } from "@/lib/upstash/vector-search";

type SearchResult = {
    /** Slugs ordered by relevance, or null when semantic search is disabled. */
    slugs: string[] | null;
};

export async function searchCatalogSemantic(
    query: string,
    rawLocale: string,
): Promise<SearchResult> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return { slugs: null };

    const locale: Locale = isSupportedLocale(rawLocale) ? rawLocale : defaultLocale;

    const hits = await semanticSearch(trimmed, locale, 40);
    if (!hits) return { slugs: null };

    return { slugs: hits.map((hit) => hit.slug) };
}
