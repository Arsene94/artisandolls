import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCityPillarBySlug } from "@/lib/cities";
import CityPillarSection from "@/components/CityPillar";
import {
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import { getPublicPlatformSettings } from "@/lib/settings";
import type { Locale } from "@/i18n/routing";

const SLUG = "inchiriere-papusi-bucuresti";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const city = getCityPillarBySlug(SLUG);
    const [settings, t] = await Promise.all([
        getPublicPlatformSettings().catch(() => null),
        getTranslations({ locale: "ro", namespace: "cityPillar" }),
    ]);
    if (!city) return { robots: { index: false, follow: true } };

    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    // RO-only intent — canonical e mereu pe RO; hreflang menționează același
    // URL pentru x-default ca să descurajăm Google să indexeze duplicate sub
    // alte locale (am redirect mai jos).
    const canonical = localeUrl(siteUrl, "ro", `/${SLUG}`);

    return {
        title: t("metaTitle", { city: city.cityName }),
        description: t("metaDescription", { city: city.cityName }),
        alternates: {
            canonical,
            languages: {
                ro: canonical,
                "x-default": canonical,
            },
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("metaTitle", { city: city.cityName }),
            description: t("metaDescription", { city: city.cityName }),
            locale: "ro_RO",
        },
        robots:
            locale === "ro"
                ? { index: true, follow: true }
                : { index: false, follow: true },
    };

    // localeAlternates rămâne neutilizat aici intenționat — pagina e RO-only;
    // dacă vrem variante EN/NL în viitor, schimbăm aici.
    void localeAlternates;
}

export default async function CityPillarPage({ params }: Props) {
    const { locale } = await params;

    // Pagina e targeted strict pe queries RO. Pe alte locale redirectăm la
    // catalog ca să nu creăm thin content duplicat și să nu ne canibalizăm
    // ranking-ul prin /en/inchiriere-papusi-bucuresti.
    if (locale !== "ro") {
        redirect("/catalog");
    }

    setRequestLocale(locale);

    const city = getCityPillarBySlug(SLUG);
    if (!city) {
        redirect("/catalog");
    }

    return <CityPillarSection city={city} />;
}
