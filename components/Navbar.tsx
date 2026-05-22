'use client';

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

const LANG_FLAGS: Record<Locale, React.ReactElement> = {
    ro: (
        <svg className="w-4 h-3 shadow-sm rounded-sm shrink-0" viewBox="0 0 3 2">
            <rect width="1" height="2" fill="#002B7F" />
            <rect x="1" width="1" height="2" fill="#FCD116" />
            <rect x="2" width="1" height="2" fill="#CE1126" />
        </svg>
    ),
    en: (
        <svg className="w-4 h-3 shadow-sm rounded-sm shrink-0" viewBox="0 0 50 30">
            <rect width="50" height="30" fill="#012169" />
            <path d="M0 0 L50 30 M0 30 L50 0" stroke="#fff" strokeWidth="6" />
            <path d="M0 0 L50 30 M0 30 L50 0" stroke="#C8102E" strokeWidth="3" />
            <path d="M25 0 V30 M0 15 H50" stroke="#fff" strokeWidth="10" />
            <path d="M25 0 V30 M0 15 H50" stroke="#C8102E" strokeWidth="6" />
        </svg>
    ),
    nl: (
        <svg className="w-4 h-3 shadow-sm rounded-sm shrink-0" viewBox="0 0 9 6">
            <rect width="9" height="2" fill="#AE1C28" />
            <rect y="2" width="9" height="2" fill="#FFF" />
            <rect y="4" width="9" height="2" fill="#21468B" />
        </svg>
    ),
};

const LANG_LABEL: Record<Locale, string> = {
    ro: "Română",
    en: "English",
    nl: "Nederlands",
};

type NavbarProps = {
    brandName?: string;
};

export default function Navbar({ brandName = "VELVET STUDIO" }: NavbarProps) {
    const t = useTranslations("nav");
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileLangOpen, setMobileLangOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    const query = searchParams.toString();
    const switcherHref = `${pathname}${query ? `?${query}` : ""}`;
    const homePath = locale === defaultLocale ? "/" : `/${locale}`;
    const sectionHref = (id: string) => `${homePath}#${id}`;
    const normalizedPathname = pathname.replace(new RegExp(`^/(${locales.join("|")})(?=/|$)`), "") || "/";
    const isCatalogPath = normalizedPathname === "/catalog" || normalizedPathname.startsWith("/catalog/");
    const navLinkClassName = "text-sm font-medium text-silk/80 hover:text-gold transition-colors duration-200";
    const catalogLinkClassName = isCatalogPath
        ? "text-sm font-medium text-gold transition-colors duration-200 border-b border-gold/40 pb-1"
        : navLinkClassName;

    const trimmed = brandName.trim();
    const spaceIdx = trimmed.indexOf(" ");
    const brandLead = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const brandSecondary = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1);
    const brandFirst = brandLead.charAt(0);
    const brandMain = brandLead.slice(1);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav
            className={`site-navbar fixed w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${
                scrolled
                    ? "bg-velvet-950/95 border-velvet-800/80 shadow-2xl shadow-velvet-950/40"
                    : "bg-velvet-900/95 border-velvet-800/60"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 sm:h-24">
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            href="/"
                            className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-white flex items-center gap-2"
                        >
                            <span>
                                <span className="text-gold">{brandFirst}</span>
                                {brandMain}
                            </span>
                            {brandSecondary && (
                                <span className="text-gold text-sm sm:text-base font-light tracking-normal block ml-1 border-l border-velvet-700 pl-2">
                                    {brandSecondary}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
                        <a
                            href={sectionHref("hero")}
                            className={navLinkClassName}
                        >
                            {t("home")}
                        </a>
                        <Link
                            href="/catalog"
                            className={catalogLinkClassName}
                        >
                            {t("catalog")}
                        </Link>
                        <a
                            href={sectionHref("servicii")}
                            className={navLinkClassName}
                        >
                            {t("services")}
                        </a>
                        <a
                            href={sectionHref("galerie")}
                            className={navLinkClassName}
                        >
                            {t("gallery")}
                        </a>
                        <a
                            href={sectionHref("contact")}
                            className={navLinkClassName}
                        >
                            {t("contact")}
                        </a>

                        <div className="relative inline-block text-left" ref={langRef}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLangOpen((v) => !v);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-velvet-800 bg-velvet-900/90 text-silk hover:text-gold hover:border-gold/50 transition duration-200 text-xs font-semibold focus:outline-none"
                                aria-haspopup="menu"
                                aria-expanded={langOpen}
                                aria-label={t("language")}
                            >
                                <span className="flex items-center">{LANG_FLAGS[locale]}</span>
                                <span className="tracking-wide">{locale.toUpperCase()}</span>
                                <svg
                                    className={`w-2.5 h-2.5 transition-transform duration-200 ${
                                        langOpen ? "rotate-180" : ""
                                    }`}
                                    viewBox="0 0 12 12"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M6 8L1 3h10z" />
                                </svg>
                            </button>
                            <div
                                className={`absolute right-0 mt-2 w-36 rounded-xl bg-velvet-950 border border-gold/40 shadow-2xl z-50 overflow-hidden py-1 backdrop-blur-md origin-top-right transition-all duration-200 ${
                                    langOpen
                                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                }`}
                                role="menu"
                            >
                                {locales.map((target) => (
                                    <Link
                                        key={target}
                                        href={switcherHref || "/"}
                                        locale={target}
                                        onClick={() => setLangOpen(false)}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 transition ${
                                            locale === target
                                                ? "bg-velvet-800 text-gold"
                                                : "text-silk hover:bg-velvet-800 hover:text-gold"
                                        }`}
                                        role="menuitem"
                                    >
                                        {LANG_FLAGS[target]}
                                        <span>{LANG_LABEL[target]}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="md:hidden flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileLangOpen((v) => !v)}
                            className="p-2 border border-velvet-800 bg-velvet-950/40 rounded-lg text-silk hover:text-gold"
                            aria-label={t("language")}
                            aria-expanded={mobileLangOpen}
                        >
                            <span className="block w-5 h-3.5">{LANG_FLAGS[locale]}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="text-silk hover:text-gold transition focus:outline-none p-2"
                            aria-label={t("menu")}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? (
                                <svg
                                    className="w-6 h-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            ) : (
                                <svg
                                    className="w-6 h-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {mobileLangOpen && (
                <div className="md:hidden bg-velvet-950 border-t border-velvet-800/80 px-4 py-3 flex justify-around items-center">
                    {locales.map((target) => (
                        <Link
                            key={target}
                            href={switcherHref || "/"}
                            locale={target}
                            onClick={() => setMobileLangOpen(false)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-velvet-900 border text-xs font-semibold ${
                                locale === target
                                    ? "border-gold text-gold"
                                    : "border-gold/10 text-silk hover:text-gold hover:border-gold"
                            }`}
                        >
                            {LANG_FLAGS[target]} {target.toUpperCase()}
                        </Link>
                    ))}
                </div>
            )}

            {mobileOpen && (
                <div className="md:hidden bg-velvet-900 border-t border-velvet-800/80 px-4 py-6 space-y-4">
                    <a
                        href={sectionHref("hero")}
                        onClick={closeMobile}
                        className="block text-base font-medium text-silk/90 hover:text-gold"
                    >
                        {t("home")}
                    </a>
                    <Link
                        href="/catalog"
                        onClick={closeMobile}
                        className={`block text-base font-medium ${isCatalogPath ? "text-gold" : "text-silk/90 hover:text-gold"}`}
                    >
                        {t("catalog")}
                    </Link>
                    <a
                        href={sectionHref("servicii")}
                        onClick={closeMobile}
                        className="block text-base font-medium text-silk/90 hover:text-gold"
                    >
                        {t("services")}
                    </a>
                    <a
                        href={sectionHref("galerie")}
                        onClick={closeMobile}
                        className="block text-base font-medium text-silk/90 hover:text-gold"
                    >
                        {t("gallery")}
                    </a>
                    <a
                        href={sectionHref("contact")}
                        onClick={closeMobile}
                        className="block text-base font-medium text-silk/90 hover:text-gold"
                    >
                        {t("contact")}
                    </a>
                </div>
            )}
        </nav>
    );
}
