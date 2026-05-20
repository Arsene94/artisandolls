'use client';

import {useEffect, useState} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

export default function Navbar() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const query = searchParams.toString();
    const switcherHref = `${pathname}${query ? `?${query}` : ""}`;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <header id="header" className={scrolled ? "scrolled" : ""}>
                <Link href="/" className="logo">Artisan<span>Dolls</span></Link>
                <nav>
                    <a href="#hero">{t("home")}</a>
                    <Link href="/catalog">{t("catalog")}</Link>
                    <a href="#galerie">{t("gallery")}</a>
                    <a href="#contact">{t("contact")}</a>
                </nav>
                <div className="language-switcher" aria-label={t("language")}>
                    {locales.map((targetLocale) => (
                        <Link
                            key={targetLocale}
                            href={switcherHref || "/"}
                            locale={targetLocale}
                            className={locale === targetLocale ? "active" : ""}
                        >
                            {t(targetLocale)}
                        </Link>
                    ))}
                </div>
                <button className={`hamburger ${mobileOpen ? "open" : ""}`} id="hamburger" aria-label={t("menu")} onClick={() => setMobileOpen((open) => !open)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>
            <div className={`mobile-nav ${mobileOpen ? "open" : ""}`} id="mobileNav">
                <a href="#hero" className="mobile-link" onClick={() => setMobileOpen(false)}>{t("home")}</a>
                <Link href="/catalog" className="mobile-link" onClick={() => setMobileOpen(false)}>{t("catalog")}</Link>
                <a href="#servicii" className="mobile-link" onClick={() => setMobileOpen(false)}>{t("services")}</a>
                <a href="#galerie" className="mobile-link" onClick={() => setMobileOpen(false)}>{t("gallery")}</a>
                <a href="#contact" className="mobile-link" onClick={() => setMobileOpen(false)}>{t("contact")}</a>
                <div className="mobile-language-switcher" aria-label={t("language")}>
                    {locales.map((targetLocale) => (
                        <Link
                            key={targetLocale}
                            href={switcherHref || "/"}
                            locale={targetLocale}
                            className={locale === targetLocale ? "active" : ""}
                            onClick={() => setMobileOpen(false)}
                        >
                            {t(targetLocale)}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
