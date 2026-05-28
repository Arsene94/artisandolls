import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DollsCatalog from "@/components/DollsCatalog";
import Pagination from "@/components/Pagination";
import { getCollections, getDolls, type CatalogMode } from "@/lib/dolls";
import { getLocalizedOffers } from "@/lib/offers/queries";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    getSafeCatalogMode,
} from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { safeLdJson } from "@/lib/seo/ld-json";

const PAGE_SIZE = 24;

type CatalogPageProps = {
    params: Promise<{ locale: Locale }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

function parsePage(raw: string): number {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
}

function buildCanonical(siteUrl: string, locale: Locale, page: number): string {
    const base = localeUrl(siteUrl, locale, "/catalog");
    // Page 1 canonical pe URL fără `?page=` ca să consolidăm signal-ul; paginile
    // ≥ 2 sunt self-canonical pentru a fi indexabile distinct.
    return page <= 1 ? base : `${base}?page=${page}`;
}

export async function generateMetadata({
    params,
    searchParams,
}: CatalogPageProps): Promise<Metadata> {
    const { locale } = await params;
    const sp = await searchParams;
    const page = parsePage(getSearchParamValue(sp?.page));
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "metadata" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = buildCanonical(siteUrl, locale, page);
    const pageSuffix = page > 1 ? ` — pagina ${page}` : "";

    return {
        title: `${t("catalogTitle")}${pageSuffix}`,
        description: t("catalogDescription"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/catalog"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("catalogTitle"),
            description: t("catalogDescription"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : locale === "de" ? "de_DE" : "en_GB",
        },
        // Paginile dincolo de prima sunt cu `noindex` pe `follow` — Google a
        // depreciat rel=prev/next în 2019, dar un index dispersat pe pagini
        // identice ca temă canibalizează rangul. Lăsăm pagina 1 ca țintă.
        robots:
            page > 1
                ? { index: false, follow: true }
                : { index: true, follow: true },
    };
}

export default async function CatalogPage({
    params: pageParams,
    searchParams,
}: CatalogPageProps) {
    const { locale } = await pageParams;
    setRequestLocale(locale);

    const params = await searchParams;
    const tNotice = await getTranslations({ locale, namespace: "notice" });
    const tCatalog = await getTranslations({ locale, namespace: "catalog" });
    const tFooter = await getTranslations({ locale, namespace: "footer" });

    const settings = await getPublicPlatformSettings();

    if (settings.maintenance_mode || !settings.catalog_enabled) {
        return (
            <PublicUnavailableNotice
                title={tNotice("catalogTitle")}
                description={tNotice("catalogDescription")}
                settings={settings}
            />
        );
    }

    const rawMode = getSearchParamValue(params?.mode);
    const requestedMode: CatalogMode = rawMode === "buy" ? "buy" : "rent";
    const mode = getSafeCatalogMode(requestedMode, settings);

    if (!mode) {
        return (
            <PublicUnavailableNotice
                title={tNotice("ordersTitle")}
                description={tNotice("ordersDescription")}
                settings={settings}
            />
        );
    }

    const [allDolls, collections, offers] = await Promise.all([
        getDolls(locale),
        getCollections(),
        getLocalizedOffers(locale).catch(() => []),
    ]);

    const totalPages = Math.max(1, Math.ceil(allDolls.length / PAGE_SIZE));
    const requestedPage = parsePage(getSearchParamValue(params?.page));
    const page = Math.min(requestedPage, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const pagedDolls = allDolls.slice(start, start + PAGE_SIZE);

    const siteUrl = getSiteUrl(settings.public_site_url ?? null);
    const canonical = buildCanonical(siteUrl, locale, page);

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: tFooter("navigation"),
                item: localeUrl(siteUrl, locale, "/"),
            },
            {
                "@type": "ListItem",
                position: 2,
                name: tCatalog("title"),
                item: localeUrl(siteUrl, locale, "/catalog"),
            },
        ],
    };

    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        numberOfItems: allDolls.length,
        itemListElement: pagedDolls.map((doll, index) => ({
            "@type": "ListItem",
            position: start + index + 1,
            url: localeUrl(siteUrl, locale, `/catalog/${doll.id}`),
            name: doll.name,
        })),
    };

    return (
        <>
            <DollsCatalog
                dolls={pagedDolls}
                collections={collections}
                initialMode={mode}
                settings={settings}
                offers={offers}
            />
            {totalPages > 1 ? (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    hrefFor={(p) => (p <= 1 ? "/catalog" : `/catalog?page=${p}`)}
                    label={tCatalog("paginationLabel")}
                    prevLabel={tCatalog("paginationPrev")}
                    nextLabel={tCatalog("paginationNext")}
                />
            ) : null}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(itemListLd) }}
            />
        </>
    );
}

