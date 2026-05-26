import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCollectionRowBySlug } from "@/lib/collections";
import { getDollsByCollectionId } from "@/lib/dolls";
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

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const [collection, settings, t] = await Promise.all([
        getCollectionRowBySlug(slug),
        getPublicPlatformSettings().catch(() => null),
        getTranslations({ locale, namespace: "collections" }),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    if (!collection || !collection.is_active) {
        return { robots: { index: false, follow: true }, title: t("indexTitle") };
    }

    const canonical = localeUrl(siteUrl, locale, `/colectii/${collection.slug}`);
    const description = collection.description ?? t("indexDescription");

    return {
        title: collection.name,
        description,
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/colectii/${collection.slug}`),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: collection.name,
            description,
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        robots: { index: true, follow: true },
    };
}

export default async function CollectionDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const collection = await getCollectionRowBySlug(slug);
    if (!collection || !collection.is_active) notFound();

    const [t, tCatalog, settings, dolls] = await Promise.all([
        getTranslations({ locale, namespace: "collections" }),
        getTranslations({ locale, namespace: "catalog" }),
        getPublicPlatformSettings().catch(() => null),
        getDollsByCollectionId(collection.id, locale),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const heroImagePath = collection.main_image_path || collection.image_path;

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
            {
                "@type": "ListItem",
                position: 3,
                name: collection.name,
                item: localeUrl(siteUrl, locale, `/colectii/${collection.slug}`),
            },
        ],
    };

    const collectionPageLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${localeUrl(siteUrl, locale, `/colectii/${collection.slug}`)}#collection`,
        name: collection.name,
        description: collection.description ?? undefined,
        url: localeUrl(siteUrl, locale, `/colectii/${collection.slug}`),
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: dolls.length,
            itemListElement: dolls.slice(0, 30).map((doll, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: localeUrl(siteUrl, locale, `/catalog/${doll.id}`),
                name: doll.name,
            })),
        },
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
                <nav
                    aria-label="Breadcrumb"
                    className="mb-8 text-[0.78rem] tracking-[0.18em] uppercase text-silk/60"
                >
                    <Link
                        href="/colectii"
                        className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                    >
                        {t("indexTitle")}
                    </Link>
                    <span aria-hidden="true" className="mx-2">/</span>
                    <span className="text-gold" aria-current="page">{collection.name}</span>
                </nav>

                <header className="grid lg:grid-cols-2 gap-10 items-center mb-16">
                    <div>
                        {collection.badge ? (
                            <span className="inline-block text-[0.72rem] uppercase tracking-[0.22em] text-velvet-950 bg-gold px-3 py-1.5 rounded-full mb-4">
                                {collection.badge}
                            </span>
                        ) : null}
                        <h1 className="font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                            {collection.name}
                        </h1>
                        {collection.description ? (
                            <p className="mt-6 text-base sm:text-lg text-silk/85 leading-relaxed">
                                {collection.description}
                            </p>
                        ) : null}
                        <p className="mt-6 text-sm text-silk/60">
                            {t("countLabel", { count: dolls.length })}
                        </p>
                    </div>
                    {heroImagePath ? (
                        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-gold/15">
                            <Image
                                src={getSupabaseImageUrl(heroImagePath, "gallery")}
                                alt={collection.name}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover object-center"
                            />
                        </div>
                    ) : null}
                </header>

                {dolls.length === 0 ? (
                    <div className="max-w-2xl mx-auto py-16 text-center border border-velvet-800 rounded-3xl">
                        <p className="font-display italic text-xl">{t("emptyCollectionTitle")}</p>
                        <p className="mt-3 text-silk/70">{t("emptyCollectionDescription")}</p>
                        <div className="mt-6">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold-light text-velvet-950 px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] font-semibold transition-colors motion-reduce:transition-none"
                            >
                                {tCatalog("backToCatalog")}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 list-none p-0">
                        {dolls.map((doll) => (
                            <li key={doll.id}>
                                <Link
                                    href={`/catalog/${doll.id}`}
                                    className="group block bg-velvet-950 border border-gold/15 hover:border-gold/40 rounded-2xl overflow-hidden transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                >
                                    <div className="relative aspect-[4/5]">
                                        {doll.image ? (
                                            <Image
                                                src={getSupabaseImageUrl(doll.image, "card")}
                                                alt={`${doll.name} — ${collection.name}`}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                            />
                                        ) : (
                                            <div
                                                aria-hidden="true"
                                                className="absolute inset-0 bg-velvet-900"
                                            />
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-display italic text-xl text-silk leading-tight">
                                            {doll.name}
                                        </h3>
                                        {doll.tags?.[0] ? (
                                            <p className="mt-2 text-sm text-silk/65">{doll.tags[0]}</p>
                                        ) : null}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
