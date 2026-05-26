import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Montserrat } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { getPublicPlatformSettings } from "@/lib/settings";
import { safeLdJson } from "@/lib/seo/ld-json";
import {
    CANONICAL_BRAND,
    LEGAL_IDENTIFIERS,
    LEGAL_OPERATOR_NAME,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin", "latin-ext"],
    weight: ["500", "600", "700"],
    variable: "--font-montserrat",
    display: "swap",
    preload: true,
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin", "latin-ext"],
    weight: ["400", "500", "600"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
    display: "swap",
    preload: true,
});

const SUPABASE_STORAGE_HOST =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? null;

const ogLocaleFor = (locale: Locale): string =>
    locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB";

export async function generateMetadata(): Promise<Metadata> {
    const locale = (await getLocale()) as Locale;
    const [settings, t] = await Promise.all([
        getPublicPlatformSettings().catch(() => null),
        getTranslations({ locale, namespace: "metadata" }),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;
    const description = t("homeDescription");
    const indexable = !settings?.maintenance_mode;

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: businessName,
            template: `%s · ${businessName}`,
        },
        description,
        applicationName: businessName,
        formatDetection: { telephone: false, email: false, address: false },
        icons: {
            icon: [
                { url: "/favicon.ico", sizes: "any" },
                { url: "/icon.svg", type: "image/svg+xml" },
            ],
            apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
        },
        manifest: "/manifest.webmanifest",
        robots: {
            index: indexable,
            follow: indexable,
            googleBot: {
                index: indexable,
                follow: indexable,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        alternates: {
            canonical: localeUrl(siteUrl, locale, "/"),
            languages: localeAlternates(siteUrl, "/"),
        },
        openGraph: {
            type: "website",
            siteName: businessName,
            url: localeUrl(siteUrl, locale, "/"),
            title: businessName,
            description,
            locale: ogLocaleFor(locale),
            alternateLocale: locales
                .filter((l) => l !== locale)
                .map(ogLocaleFor),
            // OG image generat dinamic din `app/opengraph-image.tsx` — Next inserează
            // automat tag-urile width/height/type.
        },
        twitter: {
            card: "summary_large_image",
            title: businessName,
            description,
        },
        // Etichetare adult: `rating=adult` semnalează SafeSearch corect, iar
        // RTA label e standardul ASACP urmat de Bing și de filtrele DNS familiale.
        other: {
            rating: "adult",
            "RATING": "RTA-5042-1996-1400-1577-RTA",
            "google-site-verification":
                process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "",
            "msvalidate.01":
                process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
            "yandex-verification":
                process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? "",
            "facebook-domain-verification":
                process.env.NEXT_PUBLIC_FB_DOMAIN_VERIFICATION ?? "",
        },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#0F0406" },
        { media: "(prefers-color-scheme: light)", color: "#0F0406" },
    ],
    colorScheme: "dark",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = (await getLocale()) as Locale;
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;

    const phone =
        settings?.contact_phone?.trim() || settings?.whatsapp_phone?.trim() || null;
    const email = settings?.contact_email?.trim() || LEGAL_IDENTIFIERS.contactEmail;

    // Organization + OnlineStore — Google folosește prima drept entity principal
    // în Knowledge Graph, a doua e signal-ul de e-commerce pentru Merchant Listings.
    const organizationLd = {
        "@context": "https://schema.org",
        "@type": ["Organization", "OnlineStore"],
        "@id": `${siteUrl}/#org`,
        name: businessName,
        legalName: LEGAL_OPERATOR_NAME,
        url: siteUrl,
        logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/icon.svg`,
        },
        image: `${siteUrl}/opengraph-image`,
        description:
            "Companion premium realist pentru închiriere discretă și achiziție personalizată în România, UE și UK.",
        slogan: "Lux, intimitate și hiper-realism.",
        vatID: LEGAL_IDENTIFIERS.cui,
        taxID: LEGAL_IDENTIFIERS.cui,
        address: {
            "@type": "PostalAddress",
            streetAddress: LEGAL_IDENTIFIERS.address,
            addressLocality: "București",
            addressRegion: "B",
            addressCountry: "RO",
        },
        areaServed: [
            { "@type": "Country", name: "Romania" },
            { "@type": "Country", name: "Netherlands" },
            { "@type": "Country", name: "United Kingdom" },
        ],
        contactPoint: [
            {
                "@type": "ContactPoint",
                contactType: "sales",
                email,
                ...(phone ? { telephone: phone } : {}),
                availableLanguage: ["Romanian", "English", "Dutch"],
                areaServed: ["RO", "NL", "GB", "EU"],
            },
            {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: LEGAL_IDENTIFIERS.dpoEmail,
                availableLanguage: ["Romanian", "English"],
            },
        ],
        audience: {
            "@type": "PeopleAudience",
            suggestedMinAge: 18,
        },
    };

    const websiteLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: businessName,
        inLanguage: ["ro-RO", "en-GB", "nl-NL"],
        publisher: { "@id": `${siteUrl}/#org` },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/catalog?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                {SUPABASE_STORAGE_HOST ? (
                    <>
                        <link rel="preconnect" href={SUPABASE_STORAGE_HOST} crossOrigin="anonymous" />
                        <link rel="dns-prefetch" href={SUPABASE_STORAGE_HOST} />
                    </>
                ) : null}
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {/* JSON-LD ca <script> brut: nu necesită execuție JS, iar `next/script`
                    cu strategie `afterInteractive` întârzie inutil parse-ul de către
                    crawler-e care nu rulează JavaScript. */}
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: safeLdJson(organizationLd) }}
                />
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: safeLdJson(websiteLd) }}
                />
            </head>
            <body
                className={`${inter.variable} ${montserrat.variable} ${cormorant.variable} font-sans antialiased bg-silk text-silk-800`}
            >
                {children}
            </body>
        </html>
    );
}
