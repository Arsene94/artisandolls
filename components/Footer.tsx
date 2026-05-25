import { getTranslations } from "next-intl/server";
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

function PaymentMarks() {
    return (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
            {[
                { label: "Visa", letters: "VISA" },
                { label: "Mastercard", letters: "MC" },
                { label: "Cash", letters: "CASH" },
            ].map((mark) => (
                <li
                    key={mark.label}
                    aria-label={mark.label}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-silk/15 bg-velvet-900 text-silk/85 text-[0.65rem] font-mono tracking-[0.18em] uppercase"
                >
                    {mark.letters}
                </li>
            ))}
        </ul>
    );
}

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

    const navLinks = [
        { href: "/", label: t("navHome") },
        { href: "/catalog", label: t("navCatalog") },
        { href: "/#servicii", label: t("navServices") },
        { href: "/#hygiene", label: t("navHygiene") },
        { href: "/#contact", label: t("navContact") },
    ];

    const legalLinks = [
        { href: "/terms", label: t("terms") },
        { href: "/privacy", label: t("privacy") },
        { href: "/cookies", label: t("cookies") },
        { href: "/age-policy", label: t("ageLimit") },
    ];

    return (
        <footer
            data-surface="dark"
            className="site-footer bg-velvet-950 text-silk/85 pt-16 pb-10 border-t border-velvet-800/40"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-12 pb-10 border-b border-velvet-800/50">
                    <div className="md:col-span-4">
                        <Link
                            href="/"
                            className="inline-flex items-baseline gap-2 font-display italic font-medium text-2xl text-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                            aria-label={`${display} — ${t("tagline")}`}
                        >
                            <span className="text-gold">{display.charAt(0)}</span>
                            <span>{display.slice(1)}</span>
                        </Link>
                        <p className="mt-4 text-sm text-silk/75 leading-relaxed max-w-sm">
                            {t("tagline")}
                        </p>
                        <p className="mt-3 text-[0.78rem] text-silk/55 leading-relaxed max-w-sm">
                            {t("description")}
                        </p>
                        <div className="mt-6">
                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-silk/55 mb-2">
                                {t("paymentsTitle")}
                            </p>
                            <PaymentMarks />
                            <p className="mt-3 text-[0.78rem] text-silk/65 leading-snug max-w-sm">
                                {t("paymentsNote")}
                            </p>
                        </div>
                    </div>

                    <nav className="md:col-span-2" aria-label={t("navigation")}>
                        <h2 className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-silk mb-4">
                            {t("navigation")}
                        </h2>
                        <ul className="flex flex-col gap-2 text-sm">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="inline-block py-1 text-silk/80 hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:underline focus-visible:text-gold underline-offset-4"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav className="md:col-span-2" aria-label={t("legal")}>
                        <h2 className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-silk mb-4">
                            {t("legal")}
                        </h2>
                        <ul className="flex flex-col gap-2 text-sm">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="inline-block py-1 text-silk/80 hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:underline focus-visible:text-gold underline-offset-4"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="mt-2 pt-2 border-t border-velvet-800/60">
                                <a
                                    href="https://anpc.ro/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-silk/65 hover:text-gold transition-colors motion-reduce:transition-none text-[0.78rem]"
                                >
                                    {t("anpcConsumer")} ↗
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://anpc.ro/ce-este-sal/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-silk/65 hover:text-gold transition-colors motion-reduce:transition-none text-[0.78rem]"
                                >
                                    {t("anpcSal")} ↗
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://ec.europa.eu/consumers/odr/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block py-1 text-silk/65 hover:text-gold transition-colors motion-reduce:transition-none text-[0.78rem]"
                                >
                                    {t("anpcOdr")} ↗
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className="md:col-span-4">
                        <h2 className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-silk mb-4">
                            {t("company")}
                        </h2>
                        <dl className="grid grid-cols-1 gap-2 text-[0.82rem] text-silk/75">
                            <div>
                                <dt className="text-silk/55 text-[0.72rem]">{t("companyName")}</dt>
                                <dd className="text-silk/90">{operator}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3">
                                <div>
                                    <dt className="text-silk/55 text-[0.72rem]">{t("cui")}</dt>
                                    <dd className="font-mono text-silk/90">{cui}</dd>
                                </div>
                                <div>
                                    <dt className="text-silk/55 text-[0.72rem]">{t("regCom")}</dt>
                                    <dd className="font-mono text-silk/90">{regCom}</dd>
                                </div>
                            </div>
                            <div>
                                <dt className="text-silk/55 text-[0.72rem]">{t("address")}</dt>
                                <dd className="text-silk/85 leading-snug">{address}</dd>
                            </div>
                            {contactPhone ? (
                                <div>
                                    <dt className="text-silk/55 text-[0.72rem]">
                                        {t("contactPhoneLabel")}
                                    </dt>
                                    <dd>
                                        <a
                                            href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                                            className="text-silk/90 hover:text-gold transition-colors motion-reduce:transition-none"
                                        >
                                            {contactPhone}
                                        </a>
                                    </dd>
                                </div>
                            ) : null}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                                <div>
                                    <dt className="text-silk/55 text-[0.72rem]">
                                        {t("contactEmailLabel")}
                                    </dt>
                                    <dd>
                                        <a
                                            href={`mailto:${contactEmail}`}
                                            className="text-silk/90 hover:text-gold transition-colors motion-reduce:transition-none break-all"
                                        >
                                            {contactEmail}
                                        </a>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-silk/55 text-[0.72rem]">
                                        {t("dpoLabel")}
                                    </dt>
                                    <dd>
                                        <a
                                            href={`mailto:${dpoEmail}`}
                                            className="text-silk/90 hover:text-gold transition-colors motion-reduce:transition-none break-all"
                                        >
                                            {dpoEmail}
                                        </a>
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[0.78rem] text-silk/65">
                    <p>{t("copyright", { year, brand: display })}</p>
                    <p className="sm:max-w-md sm:text-right">{t("ageNotice")}</p>
                </div>
            </div>
        </footer>
    );
}
