import type { MetadataRoute } from "next";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// Crawler-uri AI pe care le vrem să ne citeze. Le declarăm explicit pentru că
// multe dintre ele aplică deny-by-default pentru conținut marcat adult — fără
// o regulă `Allow: /` adresată direct, riscăm să ieșim din corpus.
const AI_USER_AGENTS = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "cohere-ai",
    "Diffbot",
    "YouBot",
    "Amazonbot",
    "MistralAI-User",
];

// URL-uri cu intent strict tranzacțional / cu state pe utilizator. Le scoatem
// din index ca să evităm duplicate content (variante `?mode=`, `?start=`) și
// ca să nu cheltuim crawl budget pe pagini de checkout cu rate-limit.
const DISALLOW_PRIVATE = [
    "/admin",
    "/admin/",
    "/api/",
    "/age-gate",
    "/age-gate/",
    "/*/age-gate",
    "/*/age-gate/",
    "/shop/cart",
    "/*/shop/cart",
    "/shop/checkout",
    "/*/shop/checkout",
    "/shop/order/",
    "/*/shop/order/",
    "/catalog/*/checkout",
    "/*/catalog/*/checkout",
    "/catalog/*/success",
    "/*/catalog/*/success",
];

// Variantele filtrate ale catalog-ului produc combinatorial duplicate. Canonical-ul
// de pe pagina părinte e suficient; cerem boților să nu indexeze versiunile.
const DISALLOW_QUERY_VARIANTS = [
    "/*?mode=*",
    "/*?start=*",
    "/*?end=*",
    "/*?page=*",
    "/*?sort=*",
    "/*?filter=*",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    // Pe modul mentenanță scoatem totul din index — Next blochează metadata
    // robots la nivel de pagină, dar robots.txt e ultimul safeguard pentru cazul
    // în care un crawler ignoră meta tags.
    if (settings?.maintenance_mode) {
        return {
            rules: [{ userAgent: "*", disallow: "/" }],
            sitemap: `${siteUrl}/sitemap.xml`,
            host: siteUrl,
        };
    }

    const disallowAll = [...DISALLOW_PRIVATE, ...DISALLOW_QUERY_VARIANTS];

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: disallowAll,
            },
            // Permisiune explicită pentru bot-urile AI, cu același set de disallows.
            ...AI_USER_AGENTS.map((userAgent) => ({
                userAgent,
                allow: "/",
                disallow: disallowAll,
            })),
            // Boții agresivi de scraping comercial — îi blocăm complet ca să nu
            // re-publice catalogul pe site-uri afiliate care ne pot canibaliza SERP.
            {
                userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot", "PetalBot"],
                disallow: "/",
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
