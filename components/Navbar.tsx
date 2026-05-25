"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import NavbarCartLink from "@/components/shop/NavbarCartLink";

const LANG_FLAGS: Record<Locale, React.ReactElement> = {
    ro: (
        <svg
            className="w-5 h-3.5 shadow-sm rounded-sm shrink-0"
            viewBox="0 0 3 2"
            aria-hidden="true"
            focusable="false"
        >
            <rect width="1" height="2" fill="#002B7F" />
            <rect x="1" width="1" height="2" fill="#FCD116" />
            <rect x="2" width="1" height="2" fill="#CE1126" />
        </svg>
    ),
    en: (
        <svg
            className="w-5 h-3.5 shadow-sm rounded-sm shrink-0"
            viewBox="0 0 50 30"
            aria-hidden="true"
            focusable="false"
        >
            <rect width="50" height="30" fill="#012169" />
            <path d="M0 0 L50 30 M0 30 L50 0" stroke="#fff" strokeWidth="6" />
            <path d="M0 0 L50 30 M0 30 L50 0" stroke="#C8102E" strokeWidth="3" />
            <path d="M25 0 V30 M0 15 H50" stroke="#fff" strokeWidth="10" />
            <path d="M25 0 V30 M0 15 H50" stroke="#C8102E" strokeWidth="6" />
        </svg>
    ),
    nl: (
        <svg
            className="w-5 h-3.5 shadow-sm rounded-sm shrink-0"
            viewBox="0 0 9 6"
            aria-hidden="true"
            focusable="false"
        >
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

const STALE_QUERY_KEYS = new Set(["lang", "locale", "language"]);

type NavbarProps = {
    brandName?: string;
};

function focusableSelector() {
    return [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");
}

export default function Navbar({ brandName = "Velvet Companions" }: NavbarProps) {
    const t = useTranslations("nav");
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const langRef = useRef<HTMLLIElement>(null);
    const langButtonRef = useRef<HTMLButtonElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);
    const mobileToggleRef = useRef<HTMLButtonElement>(null);
    const mobileFirstFocusableRef = useRef<HTMLAnchorElement>(null);

    const switcherHref = useMemo(() => {
        const params = new URLSearchParams(searchParams);
        for (const key of STALE_QUERY_KEYS) params.delete(key);
        const query = params.toString();
        return query ? `${pathname}?${query}` : pathname || "/";
    }, [pathname, searchParams]);

    const normalizedPathname = pathname.replace(
        new RegExp(`^/(${locales.join("|")})(?=/|$)`),
        "",
    ) || "/";
    const isHomePath = normalizedPathname === "/";
    const isCatalogPath =
        normalizedPathname === "/catalog" || normalizedPathname.startsWith("/catalog/");
    const isShopPath =
        normalizedPathname === "/shop" || normalizedPathname.startsWith("/shop/");

    const homePath = locale === defaultLocale ? "/" : `/${locale}`;
    const sectionHref = useCallback(
        (id: string) => (isHomePath ? `#${id}` : `${homePath}#${id}`),
        [isHomePath, homePath],
    );

    const navLinkClassName =
        "inline-flex items-center min-h-11 px-2 text-sm font-medium text-silk/85 hover:text-gold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-sm";
    const catalogLinkClassName = isCatalogPath
        ? "inline-flex items-center min-h-11 px-2 text-sm font-medium text-gold border-b border-gold/40 pb-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-sm"
        : navLinkClassName;
    const shopLinkClassName = isShopPath
        ? "inline-flex items-center min-h-11 px-2 text-sm font-medium text-gold border-b border-gold/40 pb-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-sm"
        : navLinkClassName;

    const trimmed = brandName.trim() || "Velvet Companions";
    const tokens = trimmed.split(/\s+/);
    const brandLead = tokens[0] ?? trimmed;
    const brandSecondary = tokens.slice(1).join(" ");
    const brandFirst = brandLead.charAt(0);
    const brandMain = brandLead.slice(1);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!langOpen) return;
        const onDocClick = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [langOpen]);

    useEffect(() => {
        if (!langOpen && !mobileOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (mobileOpen) {
                    setMobileOpen(false);
                    mobileToggleRef.current?.focus();
                }
                if (langOpen) {
                    setLangOpen(false);
                    langButtonRef.current?.focus();
                }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [langOpen, mobileOpen]);

    useEffect(() => {
        if (!mobileOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const id = window.requestAnimationFrame(() => {
            mobileFirstFocusableRef.current?.focus();
        });
        return () => {
            document.body.style.overflow = previousOverflow;
            window.cancelAnimationFrame(id);
        };
    }, [mobileOpen]);

    useEffect(() => {
        if (!mobileOpen) return;
        const panel = mobilePanelRef.current;
        if (!panel) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            const focusables = panel.querySelectorAll<HTMLElement>(focusableSelector());
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey && (active === first || !panel.contains(active))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };
        panel.addEventListener("keydown", onKeyDown);
        return () => panel.removeEventListener("keydown", onKeyDown);
    }, [mobileOpen]);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    const langMenuId = "primary-language-menu";
    const mobileMenuId = "primary-mobile-menu";

    return (
        <nav
            aria-label={t("menu")}
            className={`site-navbar fixed w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${
                scrolled
                    ? "bg-velvet-950/95 border-velvet-800/80 shadow-2xl shadow-velvet-950/40"
                    : "bg-velvet-900/95 border-velvet-800/60"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            href="/"
                            className="font-display italic font-medium text-2xl sm:text-3xl text-silk flex items-baseline gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-sm"
                            aria-label={trimmed}
                        >
                            <span>
                                <span className="text-gold">{brandFirst}</span>
                                {brandMain}
                            </span>
                            {brandSecondary ? (
                                <span className="text-gold/85 text-[0.7rem] sm:text-sm not-italic font-sans font-medium tracking-[0.22em] uppercase ml-1.5 border-l border-velvet-700/70 pl-2 hidden sm:inline">
                                    {brandSecondary}
                                </span>
                            ) : null}
                        </Link>
                    </div>

                    <ul className="hidden md:flex items-center gap-1 lg:gap-3">
                        <li>
                            {isHomePath ? (
                                <a href={sectionHref("hero")} className={navLinkClassName}>
                                    {t("home")}
                                </a>
                            ) : (
                                <Link href="/" className={navLinkClassName}>
                                    {t("home")}
                                </Link>
                            )}
                        </li>
                        <li>
                            <Link
                                href="/catalog"
                                className={catalogLinkClassName}
                                aria-current={isCatalogPath ? "page" : undefined}
                            >
                                {t("catalog")}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/shop"
                                className={shopLinkClassName}
                                aria-current={isShopPath ? "page" : undefined}
                            >
                                {t("shop")}
                            </Link>
                        </li>
                        <li>
                            <a href={sectionHref("servicii")} className={navLinkClassName}>
                                {t("services")}
                            </a>
                        </li>
                        <li>
                            <a href={sectionHref("galerie")} className={navLinkClassName}>
                                {t("gallery")}
                            </a>
                        </li>
                        <li>
                            <a href={sectionHref("contact")} className={navLinkClassName}>
                                {t("contact")}
                            </a>
                        </li>

                        <li className="ml-1 hidden md:flex items-center">
                            <NavbarCartLink />
                        </li>

                        <li className="relative inline-block text-left ml-2" ref={langRef}>
                            <button
                                ref={langButtonRef}
                                type="button"
                                onClick={() => setLangOpen((v) => !v)}
                                className="inline-flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-full border border-velvet-700 bg-velvet-900/90 text-silk hover:text-gold hover:border-gold/60 transition duration-200 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                                aria-haspopup="menu"
                                aria-expanded={langOpen}
                                aria-controls={langMenuId}
                                aria-label={`${t("language")}: ${LANG_LABEL[locale]}`}
                            >
                                <span className="flex items-center">{LANG_FLAGS[locale]}</span>
                                <span className="tracking-wide">{locale.toUpperCase()}</span>
                                <svg
                                    className={`w-2.5 h-2.5 transition-transform duration-200 ${
                                        langOpen ? "rotate-180" : ""
                                    } motion-reduce:transition-none`}
                                    viewBox="0 0 12 12"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M6 8L1 3h10z" />
                                </svg>
                            </button>
                            <ul
                                id={langMenuId}
                                role="menu"
                                aria-label={t("language")}
                                className={`absolute right-0 mt-2 w-40 rounded-xl bg-velvet-950 border border-gold/40 shadow-2xl z-50 overflow-hidden py-1 backdrop-blur-md origin-top-right transition-all duration-200 motion-reduce:transition-none ${
                                    langOpen
                                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                }`}
                            >
                                {locales.map((target) => (
                                    <li key={target} role="none">
                                        <Link
                                            href={switcherHref}
                                            locale={target}
                                            onClick={() => setLangOpen(false)}
                                            className={`w-full text-left px-3.5 py-3 text-xs font-semibold flex items-center gap-2 transition focus-visible:outline-none focus-visible:bg-velvet-800 focus-visible:text-gold ${
                                                locale === target
                                                    ? "bg-velvet-800 text-gold"
                                                    : "text-silk hover:bg-velvet-800 hover:text-gold"
                                            }`}
                                            role="menuitem"
                                            aria-current={locale === target ? "true" : undefined}
                                        >
                                            {LANG_FLAGS[target]}
                                            <span>{LANG_LABEL[target]}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>

                    <div className="md:hidden flex items-center gap-2">
                        <NavbarCartLink />
                        <button
                            ref={mobileToggleRef}
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-silk hover:text-gold hover:bg-velvet-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                            aria-label={t("menu")}
                            aria-expanded={mobileOpen}
                            aria-controls={mobileMenuId}
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
                                    aria-hidden="true"
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
                                    aria-hidden="true"
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

            <div
                id={mobileMenuId}
                ref={mobilePanelRef}
                className={`md:hidden bg-velvet-950 border-t border-velvet-800/80 px-4 py-6 ${
                    mobileOpen ? "block" : "hidden"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label={t("menu")}
            >
                <ul className="space-y-1">
                    <li>
                        {isHomePath ? (
                            <a
                                ref={mobileFirstFocusableRef}
                                href={sectionHref("hero")}
                                onClick={closeMobile}
                                className="flex items-center min-h-12 px-2 text-base font-medium text-silk hover:text-gold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                                {t("home")}
                            </a>
                        ) : (
                            <Link
                                ref={mobileFirstFocusableRef}
                                href="/"
                                onClick={closeMobile}
                                className="flex items-center min-h-12 px-2 text-base font-medium text-silk hover:text-gold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                                {t("home")}
                            </Link>
                        )}
                    </li>
                    <li>
                        <Link
                            href="/catalog"
                            onClick={closeMobile}
                            aria-current={isCatalogPath ? "page" : undefined}
                            className={`flex items-center min-h-12 px-2 text-base font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                                isCatalogPath ? "text-gold" : "text-silk hover:text-gold"
                            }`}
                        >
                            {t("catalog")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/shop"
                            onClick={closeMobile}
                            aria-current={isShopPath ? "page" : undefined}
                            className={`flex items-center min-h-12 px-2 text-base font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                                isShopPath ? "text-gold" : "text-silk hover:text-gold"
                            }`}
                        >
                            {t("shop")}
                        </Link>
                    </li>
                    <li>
                        <a
                            href={sectionHref("servicii")}
                            onClick={closeMobile}
                            className="flex items-center min-h-12 px-2 text-base font-medium text-silk hover:text-gold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                            {t("services")}
                        </a>
                    </li>
                    <li>
                        <a
                            href={sectionHref("galerie")}
                            onClick={closeMobile}
                            className="flex items-center min-h-12 px-2 text-base font-medium text-silk hover:text-gold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                            {t("gallery")}
                        </a>
                    </li>
                    <li>
                        <a
                            href={sectionHref("contact")}
                            onClick={closeMobile}
                            className="flex items-center min-h-12 px-2 text-base font-medium text-silk hover:text-gold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                            {t("contact")}
                        </a>
                    </li>
                </ul>

                <div className="mt-6 border-t border-velvet-800/60 pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-silk/55 mb-3">
                        {t("language")}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                        {locales.map((target) => (
                            <li key={target}>
                                <Link
                                    href={switcherHref}
                                    locale={target}
                                    onClick={closeMobile}
                                    aria-current={locale === target ? "true" : undefined}
                                    className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                                        locale === target
                                            ? "border-gold text-gold bg-velvet-900"
                                            : "border-velvet-700 text-silk hover:text-gold hover:border-gold"
                                    }`}
                                >
                                    {LANG_FLAGS[target]}
                                    <span>{LANG_LABEL[target]}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
