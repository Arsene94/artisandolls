import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArtisanDollsLanding from "@/components/ArtisanDollsLanding";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import { getDolls, getHomepageHeroDoll } from "@/lib/dolls";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type HomePageProps = {
    params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "metadata" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/");

    return {
        title: t("homeTitle"),
        description: t("homeDescription"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("homeTitle"),
            description: t("homeDescription"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
        },
    };
}

export default async function Home({ params }: HomePageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const tNotice = await getTranslations({ locale, namespace: "notice" });

    const [settings, galleryDolls, heroDoll] = await Promise.all([
        getPublicPlatformSettings(),
        getDolls(locale),
        getHomepageHeroDoll(locale),
    ]);

    if (settings.maintenance_mode) {
        return (
            <PublicUnavailableNotice
                title={tNotice("maintenanceTitle")}
                description={tNotice("maintenanceDescription")}
                settings={settings}
            />
        );
    }

    return (
        <ArtisanDollsLanding
            settings={settings}
            galleryDolls={galleryDolls}
            heroDoll={heroDoll}
        />
    );
}
