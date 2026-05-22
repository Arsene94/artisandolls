"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type FooterProps = {
    brandName?: string;
};

export default function Footer({ brandName = "VELVET STUDIO" }: FooterProps) {
    const t = useTranslations("footer");
    const year = new Date().getFullYear();

    const trimmed = brandName.trim();
    const spaceIdx = trimmed.indexOf(" ");
    const brandLead = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const brandSecondary = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1);
    const brandFirst = brandLead.charAt(0);
    const brandMain = brandLead.slice(1);

    return (
        <footer className="site-footer bg-velvet-950 text-silk/50 py-16 border-t border-velvet-800/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-velvet-800/40 pb-10 mb-10 gap-6">
                    <div className="mb-2 md:mb-0 text-center md:text-left">
                        <Link
                            href="/"
                            className="font-serif text-2xl font-bold tracking-widest text-white inline-flex items-center gap-2"
                        >
                            <span>
                                <span className="text-gold">{brandFirst}</span>
                                {brandMain}
                            </span>
                            {brandSecondary && (
                                <span className="text-gold text-base font-light tracking-normal block ml-1 border-l border-velvet-700 pl-2">
                                    {brandSecondary}
                                </span>
                            )}
                        </Link>
                        <p className="text-xs mt-2 font-light max-w-xs">{t("tagline")}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <a href="#" className="hover:text-gold transition">
                            {t("terms")}
                        </a>
                        <a href="#" className="hover:text-gold transition">
                            {t("privacy")}
                        </a>
                        <a href="#" className="hover:text-gold transition">
                            {t("ageLimit")}
                        </a>
                    </div>
                </div>
                <div className="text-center text-xs font-light space-y-2">
                    <p>{t("copyright", { year, brand: trimmed })}</p>
                    <p className="text-velvet-400">{t("ageNotice")}</p>
                </div>
            </div>
        </footer>
    );
}
