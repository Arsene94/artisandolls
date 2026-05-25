import type { Metadata } from "next";
import Script from "next/script";
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
} from "@/lib/shop/products";
import { similarShopProducts } from "@/lib/upstash/shop-vector-search";
import { getPublicPlatformSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/shop/format";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ShopProductCard from "@/components/shop/ShopProductCard";
import type { Locale } from "@/i18n/routing";

type Props = {
    params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const [product, settings] = await Promise.all([
        getShopProductBySlug(slug),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    if (!product) return { robots: { index: false, follow: true } };

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

    const product = await getShopProductBySlug(slug);
    if (!product) notFound();

    const [categoryRows, t, settings] = await Promise.all([
        getShopCategories().catch(() => []),
        getTranslations("shop"),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const category = categoriesAsPublic(categoryRows, locale).find(
        (c) => c.id === product.categoryId,
    );

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

    const onSale =
        product.compareAtPrice !== null && product.compareAtPrice > product.price;
    const stockBadge = !product.isInStock
        ? t("outOfStock")
        : product.trackStock && product.stockQuantity <= 5
          ? t("lowStock")
          : t("inStock");

    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const productLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description ?? product.shortDescription ?? undefined,
        sku: product.sku ?? undefined,
        brand: product.brand ?? undefined,
        image: product.image
            ? [getSupabaseImageUrl(product.image, "card")]
            : undefined,
        offers: {
            "@type": "Offer",
            url: localeUrl(siteUrl, locale, `/shop/p/${product.slug}`),
            priceCurrency: product.currency,
            price: product.price,
            availability: product.isInStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        },
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
                                    alt={product.name}
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
                                            alt={`${product.name} — ${idx + 2}`}
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

            <Script
                id={`ld-shop-product-${product.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
            />
        </main>
    );
}
