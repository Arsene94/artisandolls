import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFaqItems } from "@/lib/faq/queries";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import type { FaqCategory, FaqItem } from "@/lib/faq/shared";
import { FAQ_CATEGORIES } from "@/lib/faq/shared";
import FaqIndex from "@/components/faq/FaqIndex";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "faq" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/faq");

    return {
        title: t("indexTitle"),
        description: t("indexDescription"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/faq"),
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

function groupByCategory(items: FaqItem[]): Map<FaqCategory, FaqItem[]> {
    const groups = new Map<FaqCategory, FaqItem[]>();
    for (const item of items) {
        const existing = groups.get(item.category);
        if (existing) existing.push(item);
        else groups.set(item.category, [item]);
    }
    return groups;
}

export default async function FaqIndexPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [t, tCategory, settings, items] = await Promise.all([
        getTranslations({ locale, namespace: "faq" }),
        getTranslations({ locale, namespace: "faq.category" }),
        getPublicPlatformSettings().catch(() => null),
        getFaqItems(locale),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const groups = groupByCategory(items);
    const orderedGroups = FAQ_CATEGORIES.filter(
        (cat) => (groups.get(cat)?.length ?? 0) > 0,
    ).map((cat) => ({
        category: cat,
        label: tCategory(cat),
        items: groups.get(cat) ?? [],
    }));

    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${localeUrl(siteUrl, locale, "/faq")}#faq`,
        url: localeUrl(siteUrl, locale, "/faq"),
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
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
                item: localeUrl(siteUrl, locale, "/faq"),
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-12 max-w-2xl">
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

                {items.length === 0 ? (
                    <div className="border border-velvet-800 rounded-3xl p-12 text-center text-silk/70">
                        {t("emptyTitle")}
                    </div>
                ) : (
                    <FaqIndex
                        groups={orderedGroups}
                        searchPlaceholder={t("searchPlaceholder")}
                        searchNoResults={t("searchNoResults")}
                        jumpLabel={t("jumpLabel")}
                    />
                )}
            </div>
        </main>
    );
}
