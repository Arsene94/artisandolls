import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
    categoriesAsPublic,
    getProductsBySlugs,
    getProductsForCategory,
    getShopCategories,
    getShopProductBySlug,
    localizeCategories,
    localizeProducts,
} from "@/lib/shop/products";
import { similarShopProducts } from "@/lib/upstash/shop-vector-search";
import { getPublicPlatformSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/shop/format";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { getApprovedReviewsForTarget } from "@/lib/reviews/queries";
import { buildReviewsLd } from "@/lib/reviews/ld";
import VariantSelector from "@/components/shop/VariantSelector";
import { getVariantSiblings } from "@/lib/shop/products";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ShopProductCard from "@/components/shop/ShopProductCard";
import type { Locale } from "@/i18n/routing";
import { safeLdJson } from "@/lib/seo/ld-json";

type Props = {
    params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const [rawProduct, settings] = await Promise.all([
        getShopProductBySlug(slug),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    if (!rawProduct) return { robots: { index: false, follow: true } };
    const [product] = await localizeProducts([rawProduct], locale);

    const canonical = localeUrl(siteUrl, locale, `/shop/p/${slug}`);
    const imageUrl = product.image
        ? getSupabaseImageUrl(product.image, "card")
        : undefined;

    return {
        title: product.name,
        description: product.shortDescription ?? product.description ?? undefined,
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/shop/p/${slug}`),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: product.name,
            description: product.shortDescription ?? undefined,
            images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
        },
        robots: { index: product.isInStock, follow: true },
    };
}

export default async function ShopProductPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const rawProduct = await getShopProductBySlug(slug);
    if (!rawProduct) notFound();

    const [categoryRows, t, settings] = await Promise.all([
        getShopCategories().catch(() => []),
        getTranslations("shop"),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const [product] = await localizeProducts([rawProduct], locale);
    const localizedCategories = await localizeCategories(
        categoriesAsPublic(categoryRows, locale),
        categoryRows,
        locale,
    );
    const category = localizedCategories.find((c) => c.id === product.categoryId);

    const seedText = [
        product.name,
        product.brand ?? "",
        product.shortDescription ?? "",
        product.description ?? "",
        (product.tags ?? []).join(" "),
    ]
        .filter(Boolean)
        .join(" . ");

    const semanticHits = await similarShopProducts(
        product.slug,
        seedText,
        locale,
        6,
    );

    let related = semanticHits.length > 0
        ? (await getProductsBySlugs(semanticHits.map((h) => h.slug))).slice(0, 4)
        : [];

    if (related.length === 0 && product.categoryId) {
        related = (await getProductsForCategory(product.categoryId))
            .filter((p) => p.slug !== product.slug)
            .slice(0, 4);
    }
    related = await localizeProducts(related, locale);

    const onSale =
        product.compareAtPrice !== null && product.compareAtPrice > product.price;
    const stockBadge = !product.isInStock
        ? t("outOfStock")
        : product.trackStock && product.stockQuantity <= 5
          ? t("lowStock")
          : t("inStock");

    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonicalUrl = localeUrl(siteUrl, locale, `/shop/p/${product.slug}`);
    const galleryImages = [product.image, ...(product.images ?? [])]
        .filter((src): src is string => Boolean(src))
        .map((src) => getSupabaseImageUrl(src, "gallery"));
    const priceValidUntil = new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString().slice(0, 10);

    const productLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name: product.name,
        description: product.description ?? product.shortDescription ?? undefined,
        sku: product.sku ?? product.slug,
        mpn: product.sku ?? product.slug,
        brand: { "@type": "Brand", name: product.brand ?? "Velvet Companions" },
        audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
        isFamilyFriendly: false,
        offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: product.currency,
            price: product.price,
            priceValidUntil,
            itemCondition: "https://schema.org/NewCondition",
            availability: product.isInStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@id": `${siteUrl}/#org` },
        },
    };
    if (galleryImages.length > 0) productLd.image = galleryImages;
    if (category) productLd.category = category.name;

    const variantSiblings = product.variantGroupId
        ? await getVariantSiblings(product.variantGroupId)
        : [];
    const hasVariants = variantSiblings.length > 1;

    let productGroupLd: Record<string, unknown> | null = null;
    if (hasVariants && product.variantGroupId) {
        // Schema ProductGroup descrie grupul abstract; fiecare variantă rămâne
        // un Product distinct cu propriul URL + propriul Offer. variesBy
        // enumerează axele detectate în siblings — Google le folosește pentru
        // a afișa selector în SERP rich result.
        const variesBy = new Set<string>();
        for (const sibling of variantSiblings) {
            if (sibling.variantAxes) {
                for (const axis of Object.keys(sibling.variantAxes)) {
                    variesBy.add(axis);
                }
            }
        }
        productGroupLd = {
            "@context": "https://schema.org",
            "@type": "ProductGroup",
            "@id": `${siteUrl}/#variant-group/${product.variantGroupId}`,
            name: product.name,
            description: product.description ?? product.shortDescription ?? undefined,
            brand: { "@type": "Brand", name: product.brand ?? "Velvet Companions" },
            productGroupID: product.variantGroupId,
            variesBy: Array.from(variesBy).map((axis) => `https://schema.org/${axis}`),
            hasVariant: variantSiblings.map((sibling) => ({
                "@type": "Product",
                "@id": `${localeUrl(siteUrl, locale, `/shop/p/${sibling.slug}`)}#product`,
                url: localeUrl(siteUrl, locale, `/shop/p/${sibling.slug}`),
                name: sibling.variantLabel ?? sibling.name,
                sku: sibling.sku ?? sibling.slug,
                additionalProperty: sibling.variantAxes
                    ? Object.entries(sibling.variantAxes).map(([name, value]) => ({
                          "@type": "PropertyValue",
                          name,
                          value,
                      }))
                    : undefined,
                offers: {
                    "@type": "Offer",
                    priceCurrency: sibling.currency,
                    price: sibling.price,
                    availability: sibling.isInStock
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                },
            })),
        };
        productLd.isVariantOf = { "@id": productGroupLd["@id"] };
        if (product.variantAxes) {
            productLd.additionalProperty = Object.entries(product.variantAxes).map(
                ([name, value]) => ({
                    "@type": "PropertyValue",
                    name,
                    value,
                }),
            );
        }
    }

    const { reviews: productReviews, aggregate: productAggregate } =
        await getApprovedReviewsForTarget("shop_product", product.id);
    const reviewsLd = buildReviewsLd(productReviews, productAggregate);
    if (reviewsLd) Object.assign(productLd, reviewsLd);

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: t("title"),
                item: localeUrl(siteUrl, locale, "/shop"),
            },
            ...(category
                ? [
                      {
                          "@type": "ListItem",
                          position: 2,
                          name: category.name,
                          item: localeUrl(siteUrl, locale, `/shop/c/${category.slug}`),
                      },
                  ]
                : []),
            {
                "@type": "ListItem",
                position: category ? 3 : 2,
                name: product.name,
                item: canonicalUrl,
            },
        ],
    };

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Breadcrumb"
                    className="text-[0.78rem] tracking-[0.18em] uppercase text-silk/60 mb-8"
                >
                    <Link
                        href="/shop"
                        className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                    >
                        {t("title")}
                    </Link>
                    {category ? (
                        <>
                            <span aria-hidden="true" className="mx-2">
                                /
                            </span>
                            <Link
                                href={`/shop/c/${category.slug}`}
                                className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                            >
                                {category.name}
                            </Link>
                        </>
                    ) : null}
                    <span aria-hidden="true" className="mx-2">
                        /
                    </span>
                    <span className="text-gold" aria-current="page">
                        {product.name}
                    </span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-velvet-900 border border-gold/15">
                            {product.image ? (
                                <Image
                                    src={getSupabaseImageUrl(product.image, "gallery")}
                                    alt={[product.name, product.brand, category?.name]
                                        .filter(Boolean)
                                        .join(" — ")}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                    className="object-cover object-center"
                                />
                            ) : null}
                        </div>
                        {product.images.length > 0 ? (
                            <ul className="grid grid-cols-4 gap-2 list-none p-0">
                                {product.images.slice(0, 4).map((path, idx) => (
                                    <li
                                        key={path}
                                        className="relative aspect-square overflow-hidden rounded-xl bg-velvet-900 border border-velvet-800"
                                    >
                                        <Image
                                            src={getSupabaseImageUrl(path, "card")}
                                            alt={`${product.name} — vedere ${idx + 2}`}
                                            fill
                                            sizes="120px"
                                            className="object-cover object-center"
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>

                    <div>
                        {product.brand ? (
                            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/80">
                                {product.brand}
                            </p>
                        ) : null}
                        <h1 className="mt-2 font-display italic font-medium text-4xl sm:text-5xl text-silk leading-tight">
                            {product.name}
                        </h1>
                        {product.shortDescription ? (
                            <p className="mt-4 text-silk/80 leading-relaxed text-base sm:text-lg">
                                {product.shortDescription}
                            </p>
                        ) : null}

                        <div className="mt-6 flex items-baseline gap-3">
                            <span className="font-display font-medium text-3xl text-gold">
                                {formatMoney(product.price, locale, product.currency)}
                            </span>
                            {onSale ? (
                                <span className="text-base text-silk/55 line-through">
                                    {formatMoney(
                                        product.compareAtPrice ?? 0,
                                        locale,
                                        product.currency,
                                    )}
                                </span>
                            ) : null}
                            <span
                                className={[
                                    "ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] uppercase tracking-[0.18em] font-semibold",
                                    product.isInStock
                                        ? product.trackStock && product.stockQuantity <= 5
                                            ? "bg-warning/15 text-warning"
                                            : "bg-success/15 text-success"
                                        : "bg-danger/15 text-danger",
                                ].join(" ")}
                            >
                                {stockBadge}
                            </span>
                        </div>

                        {hasVariants ? (
                            <VariantSelector
                                current={product}
                                siblings={variantSiblings}
                                label={t("variantsLabel")}
                                outOfStockLabel={t("outOfStock")}
                            />
                        ) : null}

                        <div className="mt-8 max-w-sm">
                            <AddToCartButton
                                slug={product.slug}
                                disabled={!product.isInStock}
                            />
                        </div>

                        {product.description ? (
                            <div className="mt-10 max-w-prose">
                                <p className="text-silk/85 leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        ) : null}

                        {product.sku || product.tags.length > 0 ? (
                            <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm border-t border-velvet-800 pt-6">
                                {product.sku ? (
                                    <>
                                        <dt className="text-silk/55 uppercase tracking-[0.18em] text-[0.72rem] self-center">
                                            {t("sku")}
                                        </dt>
                                        <dd className="text-silk font-mono text-[0.85rem] self-center">
                                            {product.sku}
                                        </dd>
                                    </>
                                ) : null}
                                {product.tags.length > 0 ? (
                                    <>
                                        <dt className="text-silk/55 uppercase tracking-[0.18em] text-[0.72rem] self-start pt-0.5">
                                            {t("tagsLabel")}
                                        </dt>
                                        <dd className="flex flex-wrap gap-1.5">
                                            {product.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-velvet-900 border border-velvet-700 text-[0.72rem] text-silk/80"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </dd>
                                    </>
                                ) : null}
                            </dl>
                        ) : null}
                    </div>
                </div>

                {related.length > 0 ? (
                    <section
                        aria-labelledby="related-products"
                        className="mt-20 pt-12 border-t border-velvet-800/40"
                    >
                        <h2
                            id="related-products"
                            className="font-display italic text-2xl sm:text-3xl mb-8"
                        >
                            {t("crossSellTitle")}
                        </h2>
                        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
                            {related.map((p) => (
                                <li key={p.id}>
                                    <ShopProductCard
                                        product={p}
                                        locale={locale}
                                        variant="compact"
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </div>

            <ReviewsSection
                locale={locale}
                reviews={productReviews}
                aggregate={productAggregate}
            />

            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(productLd) }}
            />
            {productGroupLd ? (
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: safeLdJson(productGroupLd),
                    }}
                />
            ) : null}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(breadcrumbLd) }}
            />
        </main>
    );
}
