import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCollectionRows } from "@/lib/collections";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import type { Locale } from "@/i18n/routing";
import { safeLdJson } from "@/lib/seo/ld-json";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "collections" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/colectii");

    return {
        title: t("indexTitle"),
        description: t("indexDescription"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/colectii"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("indexTitle"),
            description: t("indexDescription"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        robots: { index: true, follow: true },
    };
}

export default async function CollectionsIndexPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [t, settings, collections] = await Promise.all([
        getTranslations({ locale, namespace: "collections" }),
        getPublicPlatformSettings().catch(() => null),
        getCollectionRows(false).catch(() => []),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: CANONICAL_BRAND,
                item: localeUrl(siteUrl, locale, "/"),
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("indexTitle"),
                item: localeUrl(siteUrl, locale, "/colectii"),
            },
        ],
    };

    const collectionPageLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${localeUrl(siteUrl, locale, "/colectii")}#collection`,
        name: t("indexTitle"),
        description: t("indexDescription"),
        url: localeUrl(siteUrl, locale, "/colectii"),
        isPartOf: { "@id": `${siteUrl}/#website` },
        hasPart: collections.map((c) => ({
            "@type": "CollectionPage",
            name: c.name,
            url: localeUrl(siteUrl, locale, `/colectii/${c.slug}`),
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
                dangerouslySetInnerHTML={{ __html: safeLdJson(collectionPageLd) }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-16 max-w-3xl">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h1 className="mt-4 font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                        {t("indexTitle")}
                    </h1>
                    <p className="mt-6 text-base sm:text-lg text-silk/75 leading-relaxed">
                        {t("indexLede")}
                    </p>
                </header>

                {collections.length === 0 ? (
                    <div className="max-w-2xl mx-auto py-20 text-center border border-velvet-800 rounded-3xl">
                        <p className="font-display italic text-2xl">{t("emptyTitle")}</p>
                        <p className="mt-3 text-silk/70">{t("emptyDescription")}</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
                        {collections.map((c) => {
                            const imagePath = c.main_image_path || c.image_path;
                            return (
                                <li key={c.id}>
                                    <Link
                                        href={`/colectii/${c.slug}`}
                                        className="group relative block aspect-[5/3] overflow-hidden rounded-2xl border border-gold/15 hover:border-gold/45 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                    >
                                        {imagePath ? (
                                            <Image
                                                src={getSupabaseImageUrl(imagePath, "card")}
                                                alt={c.name}
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
                                            {c.badge ? (
                                                <span className="self-start mb-2 inline-flex items-center px-2.5 py-1 rounded-full bg-gold text-velvet-950 text-[0.65rem] font-bold uppercase tracking-[0.18em]">
                                                    {c.badge}
                                                </span>
                                            ) : null}
                                            <h2 className="font-display italic text-2xl text-silk leading-tight">
                                                {c.name}
                                            </h2>
                                            {c.description ? (
                                                <p className="mt-1 text-sm text-silk/75 line-clamp-2">
                                                    {c.description}
                                                </p>
                                            ) : null}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
