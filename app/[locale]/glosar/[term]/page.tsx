import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
    GLOSSARY_SLUGS,
    getGlossaryTermBySlug,
    getRelatedTerms,
} from "@/lib/glossary/terms";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; term: string }> };

// Pre-rendăm toți termenii la build. Lista are dimensiune predictibilă (~25
// intrări × 3 locale = ~75 pagini), deci nu plătim nimic în plus.
export function generateStaticParams() {
    return GLOSSARY_SLUGS.map((slug) => ({ term: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, term: slug } = await params;
    const term = getGlossaryTermBySlug(slug);
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    if (!term) {
        return { robots: { index: false, follow: true } };
    }

    const canonical = localeUrl(siteUrl, locale, `/glosar/${term.slug}`);

    return {
        title: term.name[locale],
        description: term.short[locale],
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/glosar/${term.slug}`),
        },
        openGraph: {
            type: "article",
            url: canonical,
            title: term.name[locale],
            description: term.short[locale],
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        robots: { index: true, follow: true },
    };
}

export default async function GlossaryTermPage({ params }: Props) {
    const { locale, term: slug } = await params;
    setRequestLocale(locale);

    const term = getGlossaryTermBySlug(slug);
    if (!term) notFound();

    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "glossary" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const related = getRelatedTerms(term);

    const definedTermLd = {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        "@id": `${localeUrl(siteUrl, locale, `/glosar/${term.slug}`)}#term`,
        name: term.name[locale],
        description: term.short[locale],
        url: localeUrl(siteUrl, locale, `/glosar/${term.slug}`),
        inDefinedTermSet: {
            "@type": "DefinedTermSet",
            "@id": `${localeUrl(siteUrl, locale, "/glosar")}#set`,
            url: localeUrl(siteUrl, locale, "/glosar"),
        },
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
    };

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
                item: localeUrl(siteUrl, locale, "/glosar"),
            },
            {
                "@type": "ListItem",
                position: 3,
                name: term.name[locale],
                item: localeUrl(siteUrl, locale, `/glosar/${term.slug}`),
            },
        ],
    };

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Breadcrumb"
                    className="mb-8 text-[0.78rem] tracking-[0.18em] uppercase text-silk/60"
                >
                    <Link
                        href="/glosar"
                        className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                    >
                        {t("indexTitle")}
                    </Link>
                    <span aria-hidden="true" className="mx-2">/</span>
                    <span className="text-gold" aria-current="page">
                        {term.name[locale]}
                    </span>
                </nav>

                <header className="mb-10">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold-light/85">
                        {t(`category.${term.category}`)}
                    </p>
                    <h1 className="mt-3 font-display italic font-medium text-4xl sm:text-5xl leading-tight">
                        {term.name[locale]}
                    </h1>
                    <p className="mt-6 text-lg text-silk/85 leading-relaxed">
                        {term.short[locale]}
                    </p>
                </header>

                <article className="prose-light space-y-5 text-base sm:text-[1.05rem] text-silk/85 leading-relaxed">
                    {term.long[locale].split("\n\n").map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </article>

                {related.length > 0 ? (
                    <aside
                        aria-labelledby="related-heading"
                        className="mt-16 pt-10 border-t border-velvet-800"
                    >
                        <h2
                            id="related-heading"
                            className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/70 mb-4"
                        >
                            {t("relatedHeading")}
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                            {related.map((rel) => (
                                <li key={rel.slug}>
                                    <Link
                                        href={`/glosar/${rel.slug}`}
                                        className="block p-4 rounded-2xl border border-velvet-800 hover:border-gold/40 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                    >
                                        <span className="font-display italic text-base text-silk">
                                            {rel.name[locale]}
                                        </span>
                                        <span className="mt-1 block text-sm text-silk/65 line-clamp-2">
                                            {rel.short[locale]}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </aside>
                ) : null}
            </div>
        </main>
    );
}
