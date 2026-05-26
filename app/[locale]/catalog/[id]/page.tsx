import type { Metadata } from "next";
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
import { CANONICAL_BRAND, getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { getApprovedReviewsForTarget } from "@/lib/reviews/queries";
import { buildReviewsLd } from "@/lib/reviews/ld";
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
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;
    const description = doll.description?.slice(0, 200) ?? t("homeDescription");
    const imageUrl = doll.image ? getSupabaseImageUrl(doll.image, "gallery") : undefined;

    return {
        title: `${doll.name} — ${businessName}`,
        description,
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/catalog/${id}`),
        },
        openGraph: {
            // Folosim `product.item` ca să asociem corect prețul în share cards
            // (Facebook Catalog & WhatsApp). `og:type=product` rămâne canonical
            // chiar și pentru închiriere — Schema.org RentAction nu are echivalent OG.
            type: "website",
            url: canonical,
            title: doll.name,
            description,
            images: imageUrl
                ? [{ url: imageUrl, alt: `${doll.name} — ${businessName}` }]
                : undefined,
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        twitter: {
            card: "summary_large_image",
            title: doll.name,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
        other: {
            ...(doll.buyPrice && doll.availableForBuy
                ? {
                      "product:price:amount": String(doll.buyPrice),
                      "product:price:currency": settings?.currency || "RON",
                      "product:availability": "in stock",
                      "product:condition": "new",
                      "product:brand": businessName,
                  }
                : {}),
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
    const businessName = settings.business_name?.trim() || CANONICAL_BRAND;
    const canonicalUrl = localeUrl(siteUrl, locale, `/catalog/${id}`);
    const galleryImages = (doll.images?.length ? doll.images : [doll.image])
        .filter(Boolean)
        .map((src) => getSupabaseImageUrl(src as string, "gallery"));
    const primaryImage = galleryImages[0];

    // priceValidUntil cere format ISO; setăm 90 zile rolling — Google penalizează
    // ofertele fără termen explicit, iar pe nișa noastră prețurile se ajustează
    // sezonier oricum.
    const priceValidUntil = new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString().slice(0, 10);

    type SchemaOffer = Record<string, unknown>;
    const offers: SchemaOffer[] = [];
    if (doll.availableForRent && doll.rentPricePerDay) {
        offers.push({
            "@type": "Offer",
            priceCurrency: currency,
            price: doll.rentPricePerDay,
            availability: "https://schema.org/InStock",
            url: canonicalUrl + "?mode=rent",
            priceValidUntil,
            category: "Rental",
            seller: { "@id": `${siteUrl}/#org` },
            // Schema-ul nu are un type dedicat „per-day"; convenția acceptată e
            // un PriceSpecification cu unitCode `DAY` (UN/CEFACT recommendation 20).
            priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: doll.rentPricePerDay,
                priceCurrency: currency,
                unitCode: "DAY",
                referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
            },
        });
    }
    if (doll.availableForBuy && doll.buyPrice) {
        offers.push({
            "@type": "Offer",
            priceCurrency: currency,
            price: doll.buyPrice,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: canonicalUrl + "?mode=buy",
            priceValidUntil,
            seller: { "@id": `${siteUrl}/#org` },
        });
    }

    const offerNode: SchemaOffer | undefined =
        offers.length === 0
            ? undefined
            : offers.length === 1
              ? offers[0]
              : {
                    "@type": "AggregateOffer",
                    priceCurrency: currency,
                    lowPrice: Math.min(
                        ...offers
                            .map((o) => Number(o.price))
                            .filter((n) => Number.isFinite(n)),
                    ),
                    highPrice: Math.max(
                        ...offers
                            .map((o) => Number(o.price))
                            .filter((n) => Number.isFinite(n)),
                    ),
                    offerCount: offers.length,
                    offers,
                };

    const materialTag = doll.tags?.find((tag) => /tpe|silicon/i.test(tag));
    const heightTag = doll.tags?.find((tag) => /\d+\s*cm/i.test(tag));

    const productLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: doll.name,
        description: doll.description || undefined,
        sku: doll.id,
        mpn: doll.id,
        brand: { "@type": "Brand", name: businessName },
        category: doll.collection || undefined,
        audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
        isFamilyFriendly: false,
    };
    if (galleryImages.length > 0) productLd.image = galleryImages;
    if (materialTag) productLd.material = materialTag;
    if (heightTag) {
        productLd.height = {
            "@type": "QuantitativeValue",
            value: parseInt(heightTag, 10),
            unitCode: "CMT",
        };
    }
    if (offerNode) productLd.offers = offerNode;

    const { reviews: dollReviews, aggregate: dollAggregate } =
        await getApprovedReviewsForTarget("doll", doll.id);
    const reviewsLd = buildReviewsLd(dollReviews, dollAggregate);
    if (reviewsLd) Object.assign(productLd, reviewsLd);

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
            <ReviewsSection
                locale={locale}
                reviews={dollReviews}
                aggregate={dollAggregate}
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
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
        </>
    );
}
