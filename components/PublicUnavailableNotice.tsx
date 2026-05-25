import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PublicPlatformSettings } from "@/lib/settings/shared";

type ContactChannel = {
    href: string;
    label: string;
    target?: "_blank";
    rel?: "noopener noreferrer";
};

function buildContactChannels(
    settings: Pick<
        PublicPlatformSettings,
        "whatsapp_phone" | "contact_phone" | "contact_email"
    >,
    contactLabel: string,
): ContactChannel | null {
    if (settings.whatsapp_phone) {
        return {
            href: `https://wa.me/${settings.whatsapp_phone.replace(/[^\d]/g, "")}`,
            label: contactLabel,
            target: "_blank",
            rel: "noopener noreferrer",
        };
    }
    if (settings.contact_email) {
        return {
            href: `mailto:${settings.contact_email}`,
            label: contactLabel,
        };
    }
    if (settings.contact_phone) {
        return {
            href: `tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`,
            label: contactLabel,
        };
    }
    return null;
}

type PublicUnavailableNoticeProps = {
    title: string;
    description: string;
    settings: PublicPlatformSettings;
};

export default async function PublicUnavailableNotice({
    title,
    description,
    settings,
}: PublicUnavailableNoticeProps) {
    const t = await getTranslations("common");
    const contact = buildContactChannels(
        {
            whatsapp_phone: settings.whatsapp_phone,
            contact_email: settings.contact_email,
            contact_phone: settings.contact_phone,
        },
        t("contactUs"),
    );

    return (
        <section
            aria-labelledby="notice-title"
            className="relative min-h-[70vh] bg-velvet-950 text-silk overflow-hidden"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 50%, rgba(179,57,81,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.10) 0%, transparent 40%)",
                }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold mb-4">
                    {settings.business_name}
                </p>
                <h1
                    id="notice-title"
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-white"
                >
                    {title}
                </h1>
                <p className="mt-6 text-base sm:text-lg text-silk/85 leading-relaxed">
                    {description}
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full border border-silk/30 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-silk hover:border-gold hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                    >
                        {t("backHome")}
                    </Link>
                    {contact && (
                        <a
                            href={contact.href}
                            target={contact.target}
                            rel={contact.rel}
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-dark px-7 py-3 text-sm font-semibold uppercase tracking-wider text-velvet-950 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none motion-reduce:hover:scale-100"
                        >
                            {contact.label}
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
