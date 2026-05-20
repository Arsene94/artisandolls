import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PublicPlatformSettings } from "@/lib/settings/shared";

type PublicUnavailableNoticeProps = {
    title: string;
    description: string;
    settings: PublicPlatformSettings;
};

function getContactHref(settings: PublicPlatformSettings) {
    if (settings.whatsapp_phone) {
        return `https://wa.me/${settings.whatsapp_phone.replace(/[^\d]/g, "")}`;
    }

    if (settings.contact_phone) {
        return `tel:${settings.contact_phone}`;
    }

    if (settings.contact_email) {
        return `mailto:${settings.contact_email}`;
    }

    return "/";
}

export default async function PublicUnavailableNotice({
                                                    title,
                                                    description,
                                                    settings,
                                                }: PublicUnavailableNoticeProps) {
    const t = await getTranslations("common");

    return (
        <main id="hero">
            <div className="hero-bg-pattern" />

            <div className="hero-content">
                <div className="hero-text">
                    <div className="eyebrow">{settings.business_name}</div>
                    <h1>{title}</h1>
                    <p>{description}</p>

                    <div className="hero-cta">
                        <Link href="/" className="btn btn-outline-light">
                            {t("backHome")}
                        </Link>

                        <a href={getContactHref(settings)} className="btn btn-gold">
                            {t("contactUs")}
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
