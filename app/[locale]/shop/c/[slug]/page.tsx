import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
    categoriesAsPublic,
    getProductsForCategory,
    getShopCategories,
    localizeCategories,
    localizeProducts,
} from "@/lib/shop/products";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import ShopProductCard from "@/components/shop/ShopProductCard";
import Pagination from "@/components/Pagination";
import type { Locale } from "@/i18n/routing";
import { safeLdJson } from "@/lib/seo/ld-json";

const PAGE_SIZE = 24;

type Props = {
    params: Promise<{ locale: Locale; slug: string }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

function parsePage(raw: string): number {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
}

function buildCategoryCanonical(
    siteUrl: string,
    locale: Locale,
    slug: string,
    page: number,
): string {
    const base = localeUrl(siteUrl, locale, `/shop/c/${slug}`);
    return page <= 1 ? base : `${base}?page=${page}`;
}

export async function generateMetadata({
    params,
    searchParams,
}: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const sp = await searchParams;
    const page = parsePage(getParam(sp?.page));
    const [categoryRows, settings, t] = await Promise.all([
        getShopCategories().catch(() => []),
        getPublicPlatformSettings().catch(() => null),
        getTranslations({ locale, namespace: "shop" }),
    ]);
    const localizedCategories = await localizeCategories(
        categoriesAsPublic(categoryRows, locale),
        categoryRows,
        locale,
    );
    const category = localizedCategories.find((c) => c.slug === slug);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = buildCategoryCanonical(siteUrl, locale, slug, page);
    const pageSuffix = page > 1 ? ` — pagina ${page}` : "";

    return {
        title: category ? `${category.name}${pageSuffix} — ${t("title")}` : t("title"),
        description: category?.description ?? t("subtitle"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/shop/c/${slug}`),
        },
        robots:
            page > 1
                ? { index: false, follow: true }
                : { index: true, follow: true },
    };
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const sp = await searchParams;
    const [categoryRows, t, settings] = await Promise.all([
        getShopCategories().catch(() => []),
        getTranslations("shop"),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const localizedCategories = await localizeCategories(
        categoriesAsPublic(categoryRows, locale),
        categoryRows,
        locale,
    );
    const category = localizedCategories.find((c) => c.slug === slug);
    if (!category) notFound();

    const allProducts = await localizeProducts(
        await getProductsForCategory(category.id),
        locale,
    );
    const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
    const requestedPage = parsePage(getParam(sp?.page));
    const page = Math.min(requestedPage, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const products = allProducts.slice(start, start + PAGE_SIZE);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

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
            {
                "@type": "ListItem",
                position: 2,
                name: category.name,
                item: localeUrl(siteUrl, locale, `/shop/c/${category.slug}`),
            },
        ],
    };

    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: category.name,
        description: category.description ?? undefined,
        numberOfItems: allProducts.length,
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: start + index + 1,
            url: localeUrl(siteUrl, locale, `/shop/p/${product.slug}`),
            name: product.name,
        })),
    };

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
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
                    <span aria-hidden="true" className="mx-2">
                        /
                    </span>
                    <span className="text-gold" aria-current="page">
                        {category.name}
                    </span>
                </nav>

                <header className="mb-12 max-w-3xl">
                    {category.badge ? (
                        <span className="inline-block text-[0.72rem] uppercase tracking-[0.22em] text-velvet-950 bg-gold px-3 py-1.5 rounded-full mb-4">
                            {category.badge}
                        </span>
                    ) : null}
                    <h1 className="font-display italic font-medium text-4xl sm:text-5xl leading-tight">
                        {category.name}
                    </h1>
                    {category.description ? (
                        <p className="mt-4 text-silk/75 leading-relaxed text-base sm:text-lg">
                            {category.description}
                        </p>
                    ) : null}
                </header>

                {products.length === 0 ? (
                    <div className="py-16 text-center border border-velvet-800 rounded-3xl max-w-2xl mx-auto">
                        <p className="font-display italic text-xl">
                            {t("emptyTitle")}
                        </p>
                        <p className="mt-3 text-silk/70">{t("emptyDescription")}</p>
                        <div className="mt-6">
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold-light text-velvet-950 px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] font-semibold transition-colors motion-reduce:transition-none"
                            >
                                {t("backToShop")}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0">
                            {products.map((product) => (
                                <li key={product.id}>
                                    <ShopProductCard product={product} locale={locale} />
                                </li>
                            ))}
                        </ul>
                        {totalPages > 1 ? (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                hrefFor={(p) =>
                                    p <= 1
                                        ? `/shop/c/${slug}`
                                        : `/shop/c/${slug}?page=${p}`
                                }
                                label={t("paginationLabel")}
                                prevLabel={t("paginationPrev")}
                                nextLabel={t("paginationNext")}
                            />
                        ) : null}
                    </>
                )}
            </div>
        </main>
    );
}
