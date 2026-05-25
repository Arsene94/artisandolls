import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DollDetails from "@/components/DollDetails";
import SimilarDolls, { getSimilarDolls } from "@/components/SimilarDolls";
import CrossSellShop from "@/components/shop/CrossSellShop";
import { getOutfitsForCatalog } from "@/lib/outfits";
import { getCrossSellForDoll } from "@/lib/shop/cross-sell";
import { getDollBySlug, type CatalogMode } from "@/lib/dolls";
import { getCustomizationGroupsWithOptionsForCatalog } from "@/lib/customizations";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    getSafeCatalogMode,
} from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import type { Locale } from "@/i18n/routing";

type DollPageProps = {
    params: Promise<{
        locale: Locale;
        id: string;
    }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

export async function generateMetadata({ params }: DollPageProps): Promise<Metadata> {
    const { id, locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    const [doll, settings] = await Promise.all([
        getDollBySlug(id),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    if (!doll) {
        return {
            title: t("dollUnavailableTitle"),
            robots: { index: false, follow: true },
        };
    }

    const canonical = localeUrl(siteUrl, locale, `/catalog/${id}`);
    const businessName = settings?.business_name ?? "Velvet Studio";
    const description = doll.description?.slice(0, 200) ?? t("homeDescription");
    const imageUrl = doll.image ? getSupabaseImageUrl(doll.image, "card") : undefined;

    return {
        title: `${doll.name} — ${businessName}`,
        description,
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/catalog/${id}`),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: doll.name,
            description,
            images: imageUrl ? [{ url: imageUrl, alt: doll.name }] : undefined,
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        twitter: {
            card: "summary_large_image",
            title: doll.name,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

export default async function DollPage({ params, searchParams }: DollPageProps) {
    const { id, locale } = await params;
    setRequestLocale(locale);

    const resolvedSearchParams = await searchParams;
    const tNotice = await getTranslations({ locale, namespace: "notice" });
    const tDetails = await getTranslations({ locale, namespace: "details" });
    const tFooter = await getTranslations({ locale, namespace: "footer" });

    const [doll, customizations, outfits, settings] = await Promise.all([
        getDollBySlug(id),
        getCustomizationGroupsWithOptionsForCatalog(),
        getOutfitsForCatalog(),
        getPublicPlatformSettings(),
    ]);

    if (!doll) {
        notFound();
    }

    if (settings.maintenance_mode || !settings.catalog_enabled) {
        return (
            <PublicUnavailableNotice
                title={tNotice("catalogTitle")}
                description={tNotice("pageUnavailableDescription")}
                settings={settings}
            />
        );
    }

    const rawMode = getSearchParamValue(resolvedSearchParams?.mode);
    const requestedMode: CatalogMode = rawMode === "buy" ? "buy" : "rent";
    const mode = getSafeCatalogMode(requestedMode, settings);

    if (!mode) {
        return (
            <PublicUnavailableNotice
                title={tNotice("ordersTitle")}
                description={tNotice("ordersShortDescription")}
                settings={settings}
            />
        );
    }

    const startDate = getSearchParamValue(resolvedSearchParams?.start);
    const endDate = getSearchParamValue(resolvedSearchParams?.end);

    const siteUrl = getSiteUrl(settings.public_site_url ?? null);
    const currency = settings.currency || "RON";
    const imageUrl = doll.image ? getSupabaseImageUrl(doll.image, "card") : undefined;

    const offers: Record<string, unknown>[] = [];
    if (doll.availableForRent && doll.rentPricePerDay) {
        offers.push({
            "@type": "Offer",
            priceCurrency: currency,
            price: doll.rentPricePerDay,
            availability: "https://schema.org/InStock",
            category: "Rental",
        });
    }
    if (doll.availableForBuy && doll.buyPrice) {
        offers.push({
            "@type": "Offer",
            priceCurrency: currency,
            price: doll.buyPrice,
            availability: "https://schema.org/InStock",
            category: "Purchase",
        });
    }

    const productLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: doll.name,
        description: doll.description,
        image: imageUrl ? [imageUrl] : undefined,
        sku: doll.id,
        brand: settings.business_name ?? "Velvet Studio",
        category: doll.collection || undefined,
        offers: offers.length === 1 ? offers[0] : offers.length > 1 ? offers : undefined,
    };

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
                name: tDetails("breadcrumbCatalog"),
                item: localeUrl(siteUrl, locale, "/catalog"),
            },
            {
                "@type": "ListItem",
                position: 3,
                name: doll.name,
                item: localeUrl(siteUrl, locale, `/catalog/${id}`),
            },
        ],
    };

    // Pre-fetch both recommendation lists so the wrapper that hosts them
    // only renders when there is actually something to show — otherwise the
    // outer container's bottom padding leaves an empty band under the
    // product detail.
    const [crossSellProducts, similarMatches] = await Promise.all([
        getCrossSellForDoll(doll, mode, locale, 4).catch(() => []),
        getSimilarDolls(doll, locale).catch(() => []),
    ]);
    const hasRecommendations =
        crossSellProducts.length > 0 || similarMatches.length > 0;

    return (
        <>
            <DollDetails
                doll={doll}
                initialMode={mode}
                initialStartDate={startDate}
                initialEndDate={endDate}
                customizations={customizations}
                outfits={outfits}
                settings={settings}
            />
            {hasRecommendations ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
                    {crossSellProducts.length > 0 ? (
                        <CrossSellShop
                            doll={doll}
                            mode={mode}
                            locale={locale}
                            products={crossSellProducts}
                        />
                    ) : null}
                    {similarMatches.length > 0 ? (
                        <SimilarDolls
                            seed={doll}
                            mode={mode}
                            locale={locale}
                            currency={currency}
                            matches={similarMatches}
                        />
                    ) : null}
                </div>
            ) : null}
            <Script
                id={`ld-product-${doll.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
            />
            <Script
                id={`ld-breadcrumb-${doll.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
        </>
    );
}
