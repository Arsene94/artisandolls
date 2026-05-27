import { getLocale, getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import OfferBanner from "@/components/OfferBanner";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getLocalizedOffers } from "@/lib/offers/queries";
import { homepageOffers } from "@/lib/offers/shared";
import { CANONICAL_BRAND } from "@/lib/site";

export default async function SiteChrome({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = await getTranslations("nav");
    const locale = await getLocale();
    const [settings, offers] = await Promise.all([
        getPublicPlatformSettings().catch(() => null),
        getLocalizedOffers(locale).catch(() => []),
    ]);
    const brandName = settings?.business_name?.trim() || CANONICAL_BRAND;
    const bannerOffers = homepageOffers(offers);

    return (
        <>
            <a href="#main-content" className="skip-to-content">
                {t("skipToContent")}
            </a>
            <Navbar brandName={brandName.toUpperCase()} />
            <OfferBanner offers={bannerOffers} locale={locale} />
            <main id="main-content" tabIndex={-1}>
                {children}
            </main>
            <Footer brandName={brandName.toUpperCase()} />
            <CookieConsent />
        </>
    );
}
