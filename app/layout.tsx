import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter, Montserrat } from "next/font/google";
import { getLocale } from "next-intl/server";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import { defaultLocale, type Locale } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-montserrat",
    display: "swap",
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
    display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const businessName = settings?.business_name ?? "Velvet Companions";

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: businessName,
            template: `%s · ${businessName}`,
        },
        description:
            "Luxury, intimacy and hyper-realism. Discreet rental and purchase of personalised companions.",
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
            index: !settings?.maintenance_mode,
            follow: !settings?.maintenance_mode,
            googleBot: {
                index: !settings?.maintenance_mode,
                follow: !settings?.maintenance_mode,
            },
        },
        alternates: {
            canonical: localeUrl(siteUrl, defaultLocale, "/"),
            languages: localeAlternates(siteUrl, "/"),
        },
        openGraph: {
            type: "website",
            siteName: businessName,
            url: localeUrl(siteUrl, defaultLocale, "/"),
            title: businessName,
            description:
                "Luxury, intimacy and hyper-realism. Discreet rental and purchase of personalised companions.",
        },
        twitter: {
            card: "summary_large_image",
            title: businessName,
            description:
                "Luxury, intimacy and hyper-realism. Discreet rental and purchase of personalised companions.",
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
    const businessName = settings?.business_name ?? "Velvet Companions";

    const organizationLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: businessName,
        url: siteUrl,
        email: settings?.contact_email ?? undefined,
        telephone: settings?.contact_phone ?? settings?.whatsapp_phone ?? undefined,
    };

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${inter.variable} ${montserrat.variable} ${cormorant.variable} font-sans antialiased bg-silk text-silk-800`}
            >
                {children}
                <Script
                    id="ld-organization"
                    type="application/ld+json"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
                />
            </body>
        </html>
    );
}
