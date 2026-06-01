import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    LEGAL_IDENTIFIERS,
    LEGAL_OPERATOR_NAME,
} from "@/lib/site";

type FooterProps = {
    brandName?: string;
};

export default async function Footer({
    brandName = CANONICAL_BRAND,
}: FooterProps) {
    const t = await getTranslations("footer");
    const settings = await getPublicPlatformSettings().catch(() => null);
    const year = new Date().getFullYear();

    const operator = settings?.business_name ?? LEGAL_OPERATOR_NAME;
    const contactPhone = settings?.contact_phone ?? null;
    const contactEmail = settings?.contact_email ?? LEGAL_IDENTIFIERS.contactEmail;
    const dpoEmail = LEGAL_IDENTIFIERS.dpoEmail;
    const cui = LEGAL_IDENTIFIERS.cui;
    const regCom = LEGAL_IDENTIFIERS.regCom;
    const address = LEGAL_IDENTIFIERS.address;
    const display = brandName.trim() || CANONICAL_BRAND;

    const COLUMNS: { titleKey: string; links: { href: string; labelKey: string }[] }[] = [
        {
            titleKey: "colCollection",
            links: [
                { href: "/shop", labelKey: "colShop" },
                { href: "/catalog?mode=rent", labelKey: "colRent" },
                { href: "/catalog?mode=buy", labelKey: "colBuy" },
                { href: "/catalog", labelKey: "colCustom" },
            ],
        },
        {
            titleKey: "colInfo",
            links: [
                { href: "/about", labelKey: "infoAbout" },
                { href: "/faq", labelKey: "infoFaq" },
                { href: "/blog", labelKey: "infoBlog" },
                { href: "/contact", labelKey: "infoContact" },
            ],
        },
        {
            titleKey: "colLegal",
            links: [
                { href: "/terms", labelKey: "legalTerms" },
                { href: "/privacy", labelKey: "legalPrivacy" },
                { href: "/cookies", labelKey: "legalCookies" },
                { href: "/age-policy", labelKey: "legalAge" },
            ],
        },
    ];

    return (
        <footer
            data-surface="dark"
            className="site-footer relative bg-velvet-950 text-silk/85"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 pt-20 pb-8 sm:px-10 lg:px-16">
                <div className="grid grid-cols-1 gap-12 pb-12 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:rounded-sm sm:justify-start"
                            aria-label={`${display} — ${t("tagline")}`}
                        >
                            <Image
                                src="/logo-artisan-dolls.png"
                                alt={display}
                                width={137}
                                height={137}
                                className="h-20 w-auto select-none lg:h-24"
                            />
                        </Link>
                        <p className="mt-6 mx-auto max-w-xs text-sm leading-relaxed text-silk/65 sm:mx-0">
                            {t("tagline")}
                        </p>
                    </div>

                    {COLUMNS.map((col) => (
                        <nav key={col.titleKey} aria-label={t(col.titleKey)} className="text-center sm:text-left">
                            <h2 className="font-sans text-sm font-bold uppercase tracking-[0.06em] text-gold lg:text-[16px]">
                                {t(col.titleKey)}
                            </h2>
                            <ul className="mt-6 flex flex-col items-center gap-4 text-sm sm:items-start">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="font-sans text-sm font-light leading-[22px] text-silk/75 transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold"
                                        >
                                            {t(link.labelKey)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="border-t border-velvet-800/60 pt-8 grid grid-cols-1 gap-x-8 gap-y-4 text-center text-[0.72rem] leading-relaxed text-silk/55 sm:grid-cols-2 sm:text-left lg:grid-cols-4">
                    <div>
                        <p className="text-silk/85">{operator}</p>
                        <p>
                            {t("cui")} {cui} · {t("regCom")} {regCom}
                        </p>
                        <p>{address}</p>
                    </div>
                    <div>
                        {contactPhone ? (
                            <p>
                                {t("contactPhoneLabel")}:{" "}
                                <a
                                    href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                                    className="text-silk/85 hover:text-gold"
                                >
                                    {contactPhone}
                                </a>
                            </p>
                        ) : null}
                        <p>
                            {t("contactEmailLabel")}:{" "}
                            <a
                                href={`mailto:${contactEmail}`}
                                className="text-silk/85 hover:text-gold break-all"
                            >
                                {contactEmail}
                            </a>
                        </p>
                        <p>
                            {t("dpoLabel")}:{" "}
                            <a
                                href={`mailto:${dpoEmail}`}
                                className="text-silk/85 hover:text-gold break-all"
                            >
                                {dpoEmail}
                            </a>
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:items-start">
                        <a
                            href="https://anpc.ro/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gold"
                        >
                            {t("anpcConsumer")} ↗
                        </a>
                        <a
                            href="https://anpc.ro/ce-este-sal/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gold"
                        >
                            {t("anpcSal")} ↗
                        </a>
                        <a
                            href="https://ec.europa.eu/consumers/odr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gold"
                        >
                            {t("anpcOdr")} ↗
                        </a>
                    </div>
                    <ul
                        aria-label={t("paymentsTitle")}
                        className="flex flex-wrap items-start justify-center gap-2 sm:justify-start"
                    >
                        {[
                            { label: "Visa", letters: "VISA" },
                            { label: "Mastercard", letters: "MC" },
                            { label: "Cash", letters: "CASH" },
                        ].map((mark) => (
                            <li
                                key={mark.label}
                                aria-label={mark.label}
                                className="inline-flex items-center justify-center rounded border border-silk/15 bg-velvet-900 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-silk/75"
                            >
                                {mark.letters}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3 border-t border-velvet-800/60 pt-6 text-center text-[0.72rem] uppercase tracking-[0.18em] text-silk/55 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <p>{t("copyright", { year, brand: display.toUpperCase() })}</p>
                    <p>{t("ageNotice")}</p>
                </div>
            </div>
        </footer>
    );
}
