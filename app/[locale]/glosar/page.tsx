import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GLOSSARY_TERMS, type GlossaryTerm } from "@/lib/glossary/terms";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { safeLdJson } from "@/lib/seo/ld-json";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "glossary" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/glosar");

    return {
        title: t("indexTitle"),
        description: t("indexDescription"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/glosar"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("indexTitle"),
            description: t("indexDescription"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : locale === "de" ? "de_DE" : "en_GB",
        },
        robots: { index: true, follow: true },
    };
}

const CATEGORY_ORDER: GlossaryTerm["category"][] = [
    "material",
    "anatomy",
    "process",
    "service",
    "legal",
];

function groupByCategory(locale: Locale) {
    return CATEGORY_ORDER.map((category) => ({
        category,
        terms: GLOSSARY_TERMS.filter((t) => t.category === category).sort(
            (a, b) => a.name[locale].localeCompare(b.name[locale]),
        ),
    })).filter((g) => g.terms.length > 0);
}

export default async function GlossaryIndexPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "glossary" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const groups = groupByCategory(locale);

    const definedTermSetLd = {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        "@id": `${localeUrl(siteUrl, locale, "/glosar")}#set`,
        name: t("indexTitle"),
        description: t("indexDescription"),
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : locale === "de" ? "de-DE" : "en-GB",
        hasDefinedTerm: GLOSSARY_TERMS.map((term) => ({
            "@type": "DefinedTerm",
            "@id": `${localeUrl(siteUrl, locale, `/glosar/${term.slug}`)}#term`,
            name: term.name[locale],
            description: term.short[locale],
            url: localeUrl(siteUrl, locale, `/glosar/${term.slug}`),
            inDefinedTermSet: localeUrl(siteUrl, locale, "/glosar"),
        })),
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
                dangerouslySetInnerHTML={{ __html: safeLdJson(definedTermSetLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(breadcrumbLd) }}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <nav
                    aria-label={t("jumpNavLabel")}
                    className="mb-12 flex flex-wrap gap-2 text-[0.72rem] uppercase tracking-[0.18em]"
                >
                    {groups.map((g) => (
                        <a
                            key={g.category}
                            href={`#${g.category}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-full border border-gold/25 text-gold-light hover:border-gold/60 hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                            {t(`category.${g.category}`)}
                        </a>
                    ))}
                </nav>

                <div className="space-y-16">
                    {groups.map((g) => (
                        <section
                            key={g.category}
                            id={g.category}
                            aria-labelledby={`heading-${g.category}`}
                            className="scroll-mt-32"
                        >
                            <h2
                                id={`heading-${g.category}`}
                                className="font-display italic text-2xl sm:text-3xl text-silk mb-6"
                            >
                                {t(`category.${g.category}`)}
                            </h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                                {g.terms.map((term) => (
                                    <li key={term.slug}>
                                        <Link
                                            href={`/glosar/${term.slug}`}
                                            className="group block h-full p-5 rounded-2xl border border-velvet-800 hover:border-gold/40 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                        >
                                            <h3 className="font-display italic text-lg text-silk leading-tight group-hover:text-gold-light motion-reduce:group-hover:text-silk">
                                                {term.name[locale]}
                                            </h3>
                                            <p className="mt-2 text-sm text-silk/70 leading-relaxed line-clamp-3">
                                                {term.short[locale]}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
