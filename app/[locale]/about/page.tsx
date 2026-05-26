import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    LEGAL_OPERATOR_NAME,
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
        getTranslations({ locale, namespace: "about" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/about");

    return {
        title: t("title"),
        description: t("lede"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/about"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("title"),
            description: t("lede"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
        robots: { index: true, follow: true },
    };
}

export default async function AboutPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "about" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;

    const aboutLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${localeUrl(siteUrl, locale, "/about")}#about`,
        url: localeUrl(siteUrl, locale, "/about"),
        name: t("title"),
        description: t("lede"),
        mainEntity: { "@id": `${siteUrl}/#org` },
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: businessName,
                item: localeUrl(siteUrl, locale, "/"),
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("title"),
                item: localeUrl(siteUrl, locale, "/about"),
            },
        ],
    };

    type Pillar = { heading: string; body: string };
    const pillars = t.raw("pillars") as Pillar[];
    const values = t.raw("values") as { label: string; text: string }[];

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(aboutLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(breadcrumbLd) }}
            />

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-16">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h1 className="mt-4 font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                        {t("title")}
                    </h1>
                    <p className="mt-6 text-lg text-silk/85 leading-relaxed">
                        {t("lede")}
                    </p>
                </header>

                <section className="space-y-12 mb-16">
                    {pillars.map((pillar, idx) => (
                        <div key={idx}>
                            <h2 className="font-display italic text-2xl sm:text-3xl text-silk mb-4 leading-tight">
                                {pillar.heading}
                            </h2>
                            <p className="text-base sm:text-lg text-silk/80 leading-relaxed whitespace-pre-line">
                                {pillar.body}
                            </p>
                        </div>
                    ))}
                </section>

                <section
                    aria-labelledby="values-heading"
                    className="mb-16 pt-12 border-t border-velvet-800"
                >
                    <h2
                        id="values-heading"
                        className="font-display italic text-2xl sm:text-3xl text-silk mb-8"
                    >
                        {t("valuesHeading")}
                    </h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        {values.map((v) => (
                            <div key={v.label}>
                                <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/90">
                                    {v.label}
                                </dt>
                                <dd className="mt-2 text-base text-silk/80 leading-relaxed">
                                    {v.text}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section
                    aria-labelledby="legal-heading"
                    className="pt-12 border-t border-velvet-800"
                >
                    <h2
                        id="legal-heading"
                        className="font-display italic text-2xl sm:text-3xl text-silk mb-6"
                    >
                        {t("legalHeading")}
                    </h2>
                    <p className="text-base text-silk/80 leading-relaxed">
                        {t("legalIntro", { operator: LEGAL_OPERATOR_NAME })}
                    </p>
                    <p className="mt-6 text-sm">
                        <Link
                            href="/contact"
                            className="text-gold hover:text-gold-light focus-visible:outline-none focus-visible:underline"
                        >
                            {t("contactCta")}
                            <span aria-hidden="true"> →</span>
                        </Link>
                    </p>
                </section>
            </article>
        </main>
    );
}
