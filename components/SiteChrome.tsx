import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { getPublicPlatformSettings } from "@/lib/settings";

export default async function SiteChrome({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = await getTranslations("nav");
    const settings = await getPublicPlatformSettings().catch(() => null);
    const brandName = settings?.business_name?.trim() || "Velvet Studio";

    return (
        <>
            <a href="#main-content" className="skip-to-content">
                {t("skipToContent")}
            </a>
            <Navbar brandName={brandName.toUpperCase()} />
            <main id="main-content" tabIndex={-1}>
                {children}
            </main>
            <Footer brandName={brandName.toUpperCase()} />
            <CookieConsent />
        </>
    );
}
