import type { MetadataRoute } from "next";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { locales, type Locale } from "@/i18n/routing";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";
import { GLOSSARY_TERMS } from "@/lib/glossary/terms";
import { CITY_PILLARS } from "@/lib/cities";
import { getAllBlogPostSlugs } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = SitemapEntry["changeFrequency"];

type DollRow = { slug: string; updated_at: string | null; main_image_path: string | null };
type ShopRow = { slug: string; updated_at: string | null; image: string | null };

async function fetchDollSlugs(): Promise<DollRow[]> {
    try {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("dolls")
            .select("slug, updated_at, main_image_path")
            .eq("is_active", true);
        if (error || !data) return [];
        return data.filter((row) => typeof row.slug === "string" && row.slug.length > 0);
    } catch {
        return [];
    }
}

async function fetchShopProducts(): Promise<ShopRow[]> {
    try {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("shop_products")
            .select("slug, updated_at, image")
            .eq("is_active", true);
        if (error || !data) return [];
        return data.filter((row) => typeof row.slug === "string" && row.slug.length > 0);
    } catch {
        return [];
    }
}

async function fetchShopCategories(): Promise<ShopRow[]> {
    try {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("shop_categories")
            .select("slug, updated_at, image")
            .eq("is_active", true);
        if (error || !data) return [];
        return data.filter((row) => typeof row.slug === "string" && row.slug.length > 0);
    } catch {
        return [];
    }
}

const STATIC_PATHS: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/catalog", priority: 0.9, changeFrequency: "daily" },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" },
    { path: "/colectii", priority: 0.7, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
    { path: "/glosar", priority: 0.6, changeFrequency: "monthly" },
    { path: "/about", priority: 0.5, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
    { path: "/age-policy", priority: 0.3, changeFrequency: "yearly" },
];

// Expandăm fiecare path în câte un entry per locale. Google recomandă să
// enumerăm explicit fiecare variantă lingvistică drept primary, fiecare cu
// alternates complet — altfel non-default-locale rămân doar ca hreflang și
// pierd crawl signal-ul direct.
function expandLocales(
    siteUrl: string,
    path: string,
    lastModified: Date,
    priority: number,
    changeFrequency: ChangeFrequency,
    images?: string[],
): SitemapEntry[] {
    const alternates = { languages: localeAlternates(siteUrl, path) };
    return locales.map((locale: Locale): SitemapEntry => {
        const entry: SitemapEntry = {
            url: localeUrl(siteUrl, locale, path),
            lastModified,
            changeFrequency,
            priority,
            alternates,
        };
        if (images && images.length > 0) {
            entry.images = images;
        }
        return entry;
    });
}

async function resolveImage(path: string | null | undefined): Promise<string[] | undefined> {
    if (!path) return undefined;
    const url = await getSupabaseImageUrlServer(path, "gallery");
    return url ? [url] : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const settings = await getPublicPlatformSettings().catch(() => null);

    // În maintenance scoatem conținutul activ — robots.txt deja blochează
    // crawler-ele, dar sitemap-ul gol e mai curat decât să servim URL-uri
    // care vor răspunde cu noindex.
    if (settings?.maintenance_mode) return [];

    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const now = new Date();

    const entries: MetadataRoute.Sitemap = [];

    for (const { path, priority, changeFrequency } of STATIC_PATHS) {
        entries.push(...expandLocales(siteUrl, path, now, priority, changeFrequency));
    }

    const [dolls, products, categories] = await Promise.all([
        fetchDollSlugs(),
        fetchShopProducts(),
        fetchShopCategories(),
    ]);

    for (const row of dolls) {
        const path = `/catalog/${row.slug}`;
        const images = await resolveImage(row.main_image_path);
        entries.push(
            ...expandLocales(
                siteUrl,
                path,
                row.updated_at ? new Date(row.updated_at) : now,
                0.8,
                "weekly",
                images,
            ),
        );
    }

    for (const row of categories) {
        const path = `/shop/c/${row.slug}`;
        const images = await resolveImage(row.image);
        entries.push(
            ...expandLocales(
                siteUrl,
                path,
                row.updated_at ? new Date(row.updated_at) : now,
                0.7,
                "weekly",
                images,
            ),
        );
    }

    for (const row of products) {
        const path = `/shop/p/${row.slug}`;
        const images = await resolveImage(row.image);
        entries.push(
            ...expandLocales(
                siteUrl,
                path,
                row.updated_at ? new Date(row.updated_at) : now,
                0.7,
                "weekly",
                images,
            ),
        );
    }

    // Doll collections — link la `/colectii/<slug>`. Datele vin din tabel
    // `doll_collections`, dar reluăm fetch-ul aici ca să avem `updated_at`
    // (e suficient de ieftin, sub 100 rânduri).
    try {
        const supabase = createSupabaseServiceClient();
        const { data } = await supabase
            .from("doll_collections")
            .select("slug, updated_at, main_image_path")
            .eq("is_active", true);
        for (const row of data ?? []) {
            if (typeof row.slug !== "string") continue;
            const images = await resolveImage(row.main_image_path);
            entries.push(
                ...expandLocales(
                    siteUrl,
                    `/colectii/${row.slug}`,
                    row.updated_at ? new Date(row.updated_at) : now,
                    0.7,
                    "weekly",
                    images,
                ),
            );
        }
    } catch {
        // Catalog-ul de colecții e opțional în sitemap — eșecul e tolerabil.
    }

    // Glosar — hardcoded, fără data updated, folosim `now`. Per-locale.
    for (const term of GLOSSARY_TERMS) {
        entries.push(
            ...expandLocales(siteUrl, `/glosar/${term.slug}`, now, 0.5, "monthly"),
        );
    }

    // Blog — Supabase-backed; folosim `updated_at` ca lastmod și includem doar
    // posturile active publicate.
    try {
        const blogSlugs = await getAllBlogPostSlugs();
        for (const row of blogSlugs) {
            entries.push(
                ...expandLocales(
                    siteUrl,
                    `/blog/${row.slug}`,
                    new Date(row.updated_at),
                    0.7,
                    "weekly",
                ),
            );
        }
    } catch {
        // Sitemap-ul nu trebuie să se rupă dacă blog-ul nu e încă migrat.
    }

    // City pillars — RO-only. Nu apar pe en/nl; adăugăm manual fără
    // `expandLocales` ca să evităm hreflang care duce la 404.
    for (const city of CITY_PILLARS) {
        const url = localeUrl(siteUrl, "ro", `/${city.slug}`);
        entries.push({
            url,
            lastModified: now,
            changeFrequency: "monthly" as ChangeFrequency,
            priority: 0.8,
            alternates: { languages: { ro: url, "x-default": url } },
        });
    }

    return entries;
}
