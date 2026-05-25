import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
    categoriesAsPublic,
    getProductsForCategory,
    getShopCategories,
} from "@/lib/shop/products";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import ShopProductCard from "@/components/shop/ShopProductCard";
import type { Locale } from "@/i18n/routing";

type Props = {
    params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const [categoryRows, settings, t] = await Promise.all([
        getShopCategories().catch(() => []),
        getPublicPlatformSettings().catch(() => null),
        getTranslations({ locale, namespace: "shop" }),
    ]);
    const category = categoriesAsPublic(categoryRows, locale).find(
        (c) => c.slug === slug,
    );
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, `/shop/c/${slug}`);

    return {
        title: category ? `${category.name} — ${t("title")}` : t("title"),
        description: category?.description ?? t("subtitle"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/shop/c/${slug}`),
        },
        robots: { index: true, follow: true },
    };
}

export default async function CategoryPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const [categoryRows, t] = await Promise.all([
        getShopCategories().catch(() => []),
        getTranslations("shop"),
    ]);
    const category = categoriesAsPublic(categoryRows, locale).find(
        (c) => c.slug === slug,
    );
    if (!category) notFound();

    const products = await getProductsForCategory(category.id);

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
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0">
                        {products.map((product) => (
                            <li key={product.id}>
                                <ShopProductCard product={product} locale={locale} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
