import type { MetadataRoute } from "next";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { locales, defaultLocale } from "@/i18n/routing";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type Slug = { slug: string; updated_at: string | null };

async function listActiveSlugs(table: string): Promise<Slug[]> {
    try {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from(table)
            .select("slug, updated_at")
            .eq("is_active", true);
        if (error || !data) return [];
        return data.filter((d) => typeof d.slug === "string" && d.slug.length > 0);
    } catch {
        return [];
    }
}

const STATIC_PATHS = [
    "/",
    "/catalog",
    "/shop",
    "/terms",
    "/privacy",
    "/cookies",
    "/age-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const now = new Date();

    const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
        url: localeUrl(siteUrl, defaultLocale, path),
        lastModified: now,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.6,
        alternates: { languages: localeAlternates(siteUrl, path) },
    }));

    const [dollSlugs, productSlugs, categorySlugs] = await Promise.all([
        listActiveSlugs("dolls"),
        listActiveSlugs("shop_products"),
        listActiveSlugs("shop_categories"),
    ]);

    for (const { slug, updated_at } of dollSlugs) {
        const path = `/catalog/${slug}`;
        entries.push({
            url: localeUrl(siteUrl, defaultLocale, path),
            lastModified: updated_at ? new Date(updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.8,
            alternates: { languages: localeAlternates(siteUrl, path) },
        });
    }
    for (const { slug, updated_at } of categorySlugs) {
        const path = `/shop/c/${slug}`;
        entries.push({
            url: localeUrl(siteUrl, defaultLocale, path),
            lastModified: updated_at ? new Date(updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: { languages: localeAlternates(siteUrl, path) },
        });
    }
    for (const { slug, updated_at } of productSlugs) {
        const path = `/shop/p/${slug}`;
        entries.push({
            url: localeUrl(siteUrl, defaultLocale, path),
            lastModified: updated_at ? new Date(updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: { languages: localeAlternates(siteUrl, path) },
        });
    }

    return entries;
}

// Silences "unused" warning when locales import is only used transitively above.
void locales;
