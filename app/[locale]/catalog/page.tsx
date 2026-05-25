import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DollsCatalog from "@/components/DollsCatalog";
import { getCollections, getDolls, type CatalogMode } from "@/lib/dolls";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    getSafeCatalogMode,
} from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type CatalogPageProps = {
    params: Promise<{ locale: Locale }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "metadata" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/catalog");

    return {
        title: t("catalogTitle"),
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
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
    };
}

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
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

    const startDate = getSearchParamValue(params?.start);
    const endDate = getSearchParamValue(params?.end);

    const [dolls, collections] = await Promise.all([getDolls(), getCollections()]);

    const siteUrl = getSiteUrl(settings.public_site_url ?? null);
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
        numberOfItems: dolls.length,
        itemListElement: dolls.slice(0, 24).map((doll, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: localeUrl(siteUrl, locale, `/catalog/${doll.id}`),
            name: doll.name,
        })),
    };

    return (
        <>
            <DollsCatalog
                dolls={dolls}
                collections={collections}
                initialMode={mode}
                initialStartDate={startDate}
                initialEndDate={endDate}
                settings={settings}
            />
            <Script
                id="ld-catalog-breadcrumb"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <Script
                id="ld-catalog-itemlist"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
            />
        </>
    );
}
