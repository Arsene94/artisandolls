import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
    categoriesAsPublic,
    getFeaturedProducts,
    getShopCategories,
    getShopProducts,
} from "@/lib/shop/products";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import ShopProductCard from "@/components/shop/ShopProductCard";
import ShopSearchBar from "@/components/shop/ShopSearchBar";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "shop" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/shop");
    return {
        title: t("title"),
        description: t("subtitle"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/shop"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("title"),
            description: t("subtitle"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        robots: { index: true, follow: true },
    };
}

export default async function ShopLandingPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [categoryRows, featured, allProducts] = await Promise.all([
        getShopCategories().catch(() => []),
        getFeaturedProducts(8).catch(() => []),
        getShopProducts().catch(() => []),
    ]);
    const categories = categoriesAsPublic(categoryRows, locale);
    const t = await getTranslations("shop");

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                    {t("label")}
                </p>
                <h1 className="mt-4 font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                    {t("title")}
                    <span className="block text-gold-light not-italic font-sans text-base sm:text-lg mt-3 tracking-[0.22em] uppercase">
                        {t("titleEmphasis")}
                    </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base sm:text-lg text-silk/75 leading-relaxed">
                    {t("subtitle")}
                </p>

                {allProducts.length > 0 ? (
                    <div className="mt-8">
                        <ShopSearchBar products={allProducts} />
                    </div>
                ) : null}
            </header>

            {categories.length === 0 && featured.length === 0 ? (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 border border-velvet-800 rounded-3xl">
                    <p className="font-display italic text-2xl text-silk">
                        {t("emptyTitle")}
                    </p>
                    <p className="mt-3 text-silk/75">{t("emptyDescription")}</p>
                </div>
            ) : null}

            {categories.length > 0 ? (
                <section
                    aria-labelledby="shop-categories"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
                >
                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <h2
                                id="shop-categories"
                                className="font-display italic text-2xl sm:text-3xl"
                            >
                                {t("categoriesTitle")}
                            </h2>
                            <p className="text-silk/70 mt-1 max-w-xl">
                                {t("categoriesSubtitle")}
                            </p>
                        </div>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
                        {categories.map((category) => (
                            <li key={category.id}>
                                <Link
                                    href={`/shop/c/${category.slug}`}
                                    className="group relative block aspect-[5/3] overflow-hidden rounded-2xl border border-gold/15 hover:border-gold/45 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                >
                                    {category.image ? (
                                        <Image
                                            src={getSupabaseImageUrl(category.image, "card")}
                                            alt={category.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                        />
                                    ) : (
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-0 bg-gradient-to-br from-velvet-800 to-velvet-950"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-velvet-950 via-velvet-950/40 to-transparent" />
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        {category.badge ? (
                                            <span className="self-start mb-2 inline-flex items-center px-2.5 py-1 rounded-full bg-gold text-velvet-950 text-[0.65rem] font-bold uppercase tracking-[0.18em]">
                                                {category.badge}
                                            </span>
                                        ) : null}
                                        <h3 className="font-display italic text-2xl text-silk leading-tight">
                                            {category.name}
                                        </h3>
                                        {category.description ? (
                                            <p className="mt-1 text-sm text-silk/75 line-clamp-2">
                                                {category.description}
                                            </p>
                                        ) : null}
                                        <span className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] uppercase tracking-[0.18em] text-gold-light">
                                            {t("browseCategory")}
                                            <svg
                                                aria-hidden="true"
                                                focusable="false"
                                                className="w-3.5 h-3.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {featured.length > 0 ? (
                <section
                    aria-labelledby="shop-featured"
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                >
                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <h2
                                id="shop-featured"
                                className="font-display italic text-2xl sm:text-3xl"
                            >
                                {t("featuredTitle")}
                            </h2>
                            <p className="text-silk/70 mt-1 max-w-xl">
                                {t("featuredSubtitle")}
                            </p>
                        </div>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
                        {featured.map((product) => (
                            <li key={product.id}>
                                <ShopProductCard product={product} locale={locale} />
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </main>
    );
}
