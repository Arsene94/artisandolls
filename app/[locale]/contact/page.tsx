import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    LEGAL_IDENTIFIERS,
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
        getTranslations({ locale, namespace: "contact" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/contact");

    return {
        title: t("title"),
        description: t("lede"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/contact"),
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

// Sanitizator pentru linkuri tel:/mailto:/wa.me — păstrăm doar caracterele
// safe pentru schema URI și pentru afișare. Defensiv față de date din admin
// care pot include spații, paranteze, dash-uri (toate legitime pentru afișare,
// dar nu pentru schema E.164 / mailto).
function digits(value: string) {
    return value.replace(/[^\d+]/g, "");
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "contact" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;

    const phone = settings?.contact_phone?.trim() || null;
    const whatsapp = settings?.whatsapp_phone?.trim() || phone;
    const email = settings?.contact_email?.trim() || LEGAL_IDENTIFIERS.contactEmail;
    const dpoEmail = LEGAL_IDENTIFIERS.dpoEmail;

    const contactPageLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": `${localeUrl(siteUrl, locale, "/contact")}#contact`,
        url: localeUrl(siteUrl, locale, "/contact"),
        name: t("title"),
        description: t("lede"),
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        mainEntity: { "@id": `${siteUrl}/#org` },
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
                item: localeUrl(siteUrl, locale, "/contact"),
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
                dangerouslySetInnerHTML={{ __html: safeLdJson(contactPageLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(breadcrumbLd) }}
            />

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-12">
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

                <section
                    aria-labelledby="channels-heading"
                    className="mb-14"
                >
                    <h2
                        id="channels-heading"
                        className="font-display italic text-2xl text-silk mb-6"
                    >
                        {t("channelsHeading")}
                    </h2>
                    <dl className="space-y-6">
                        {whatsapp ? (
                            <div className="flex flex-col gap-1">
                                <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                    {t("whatsappLabel")}
                                </dt>
                                <dd className="text-lg">
                                    <a
                                        href={`https://wa.me/${digits(whatsapp).replace("+", "")}`}
                                        className="text-silk hover:text-gold focus-visible:outline-none focus-visible:underline"
                                        rel="noopener"
                                    >
                                        {whatsapp}
                                    </a>
                                </dd>
                                <p className="text-sm text-silk/65">{t("whatsappHelp")}</p>
                            </div>
                        ) : null}
                        {phone && phone !== whatsapp ? (
                            <div className="flex flex-col gap-1">
                                <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                    {t("phoneLabel")}
                                </dt>
                                <dd className="text-lg">
                                    <a
                                        href={`tel:${digits(phone)}`}
                                        className="text-silk hover:text-gold focus-visible:outline-none focus-visible:underline"
                                    >
                                        {phone}
                                    </a>
                                </dd>
                                <p className="text-sm text-silk/65">{t("phoneHelp")}</p>
                            </div>
                        ) : null}
                        <div className="flex flex-col gap-1">
                            <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                {t("emailLabel")}
                            </dt>
                            <dd className="text-lg">
                                <a
                                    href={`mailto:${email}`}
                                    className="text-silk hover:text-gold focus-visible:outline-none focus-visible:underline"
                                >
                                    {email}
                                </a>
                            </dd>
                            <p className="text-sm text-silk/65">{t("emailHelp")}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                {t("dpoLabel")}
                            </dt>
                            <dd className="text-lg">
                                <a
                                    href={`mailto:${dpoEmail}`}
                                    className="text-silk hover:text-gold focus-visible:outline-none focus-visible:underline"
                                >
                                    {dpoEmail}
                                </a>
                            </dd>
                            <p className="text-sm text-silk/65">{t("dpoHelp")}</p>
                        </div>
                    </dl>
                </section>

                <section
                    aria-labelledby="address-heading"
                    className="pt-10 border-t border-velvet-800"
                >
                    <h2
                        id="address-heading"
                        className="font-display italic text-2xl text-silk mb-4"
                    >
                        {t("addressHeading")}
                    </h2>
                    <address className="not-italic text-base text-silk/85 leading-relaxed">
                        {LEGAL_IDENTIFIERS.address}
                    </address>
                    <p className="mt-4 text-sm text-silk/65">{t("addressNote")}</p>
                </section>

                <section
                    aria-labelledby="legal-heading"
                    className="pt-10 mt-10 border-t border-velvet-800 text-sm text-silk/70 leading-relaxed"
                >
                    <h2 id="legal-heading" className="sr-only">
                        {t("legalDataHeading")}
                    </h2>
                    <p>
                        {t("legalLine", {
                            operator: "Velvet Studio SRL",
                            cui: LEGAL_IDENTIFIERS.cui,
                            reg: LEGAL_IDENTIFIERS.regCom,
                        })}
                    </p>
                    <p className="mt-3">
                        <Link
                            href="/terms"
                            className="text-gold hover:text-gold-light focus-visible:outline-none focus-visible:underline"
                        >
                            {t("termsLink")}
                            <span aria-hidden="true"> →</span>
                        </Link>
                    </p>
                </section>
            </article>
        </main>
    );
}
