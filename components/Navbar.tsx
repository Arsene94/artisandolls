"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
    de: (
        <svg
            className="w-5 h-3.5 shadow-sm rounded-sm shrink-0"
            viewBox="0 0 5 3"
            aria-hidden="true"
            focusable="false"
        >
            <rect width="5" height="1" fill="#000" />
            <rect y="1" width="5" height="1" fill="#DD0000" />
            <rect y="2" width="5" height="1" fill="#FFCE00" />
        </svg>
    ),
};

const LANG_LABEL: Record<Locale, string> = {
    ro: "Română",
    en: "English",
    nl: "Nederlands",
    de: "Deutsch",
};

const STALE_QUERY_KEYS = new Set(["lang", "locale", "language"]);

type NavbarProps = {
    brandName?: string;
};

type NavItem = {
    href: string;
    label: string;
    active: boolean;
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
    const tShop = useTranslations("shop");
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const langRef = useRef<HTMLDivElement>(null);
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
    const matches = (base: string) =>
        normalizedPathname === base || normalizedPathname.startsWith(`${base}/`);

    const isHomePath = normalizedPathname === "/";
    const isShopPath = matches("/shop");
    const isCatalogPath = matches("/catalog");
    const isBlogPath = matches("/blog");
    const isFaqPath = matches("/faq");
    const isGlossaryPath = matches("/glosar");
    const isAboutPath = normalizedPathname === "/about";
    const isContactPath = normalizedPathname === "/contact";

    const homePath = locale === defaultLocale ? "/" : `/${locale}`;
    const sectionHref = useCallback(
        (id: string) => (isHomePath ? `#${id}` : `${homePath}#${id}`),
        [isHomePath, homePath],
    );

    // Original menu set, distributed around the centered crest (Home renders
    // separately because it keeps its in-page #hero anchor behaviour).
    const leftLinks: NavItem[] = [
        { href: "/catalog", label: t("catalog"), active: isCatalogPath },
        { href: "/shop", label: t("shop"), active: isShopPath },
        { href: "/blog", label: t("blog"), active: isBlogPath },
    ];
    const rightLinks: NavItem[] = [
        { href: "/faq", label: t("faq"), active: isFaqPath },
        { href: "/glosar", label: t("glossary"), active: isGlossaryPath },
        { href: "/about", label: t("about"), active: isAboutPath },
        { href: "/contact", label: t("contact"), active: isContactPath },
    ];
    const mobileLinks: NavItem[] = [...leftLinks, ...rightLinks];

    const trimmed = brandName.trim() || "Velvet Companions";

    // On mobile the crest floats transparently over the hero (per Figma); it
    // turns solid once the page scrolls or the menu opens so the bar stays
    // legible. Desktop keeps its original always-solid treatment via md:.
    const solid = scrolled || mobileOpen;

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

    const navLinkClassName = (active: boolean) =>
        `inline-flex items-center min-h-11 whitespace-nowrap font-nav text-[14px] lg:text-[16px] font-bold tracking-[-0.16px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-sm ${
            active
                ? "text-gold border-b border-gold/50 pb-0.5"
                : "text-silk-200/90 hover:text-gold"
        }`;

    const logo = (
        <Image
            src="/logo-artisan-dolls.png"
            alt={trimmed}
            width={137}
            height={137}
            priority
            className="h-14 w-auto lg:h-[68px] select-none"
        />
    );

    return (
        <nav
            aria-label={t("menu")}
            className={`site-navbar fixed w-full z-50 border-b transition-all duration-300 ${
                solid
                    ? "backdrop-blur-md bg-velvet-950/95 border-velvet-800/80 shadow-2xl shadow-velvet-950/40"
                    : "bg-transparent border-transparent shadow-none md:backdrop-blur-md md:bg-velvet-900/95 md:border-velvet-800/60"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop — centered crest with the full menu split into two groups */}
                <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-20 lg:h-24 gap-3 lg:gap-4">
                    <ul className="flex items-center justify-start gap-3 lg:gap-7">
                        <li>
                            {isHomePath ? (
                                <a href={sectionHref("hero")} className={navLinkClassName(false)}>
                                    {t("home")}
                                </a>
                            ) : (
                                <Link href="/" className={navLinkClassName(false)}>
                                    {t("home")}
                                </Link>
                            )}
                        </li>
                        {leftLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={navLinkClassName(item.active)}
                                    aria-current={item.active ? "page" : undefined}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-center">
                        <Link
                            href="/"
                            aria-label={trimmed}
                            className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-md"
                        >
                            {logo}
                        </Link>
                    </div>

                    <div className="flex items-center justify-end gap-3 lg:gap-5">
                        <ul className="flex items-center gap-3 lg:gap-7">
                            {rightLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={navLinkClassName(item.active)}
                                        aria-current={item.active ? "page" : undefined}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-2 pl-1 border-l border-velvet-700/60">
                            <NavbarCartLink />

                            <div className="relative inline-block text-left" ref={langRef}>
                                <button
                                    ref={langButtonRef}
                                    type="button"
                                    onClick={() => setLangOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 min-h-11 px-3 py-2 rounded-full border border-velvet-700 bg-velvet-900/90 text-silk-200 hover:text-gold hover:border-gold/60 transition duration-200 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
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
                                    className={`absolute right-0 mt-2 w-44 rounded-xl bg-velvet-950 border border-gold/40 shadow-2xl z-50 overflow-hidden py-1 backdrop-blur-md origin-top-right transition-all duration-200 motion-reduce:transition-none ${
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile — centered crest with the menu trigger on the right */}
                <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center h-20">
                    <span aria-hidden="true" />

                    <div className="flex justify-center">
                        <Link
                            href="/"
                            aria-label={trimmed}
                            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 rounded-md"
                        >
                            <Image
                                src="/logo-artisan-dolls.png"
                                alt={trimmed}
                                width={137}
                                height={137}
                                priority
                                className="h-16 w-auto select-none"
                            />
                        </Link>
                    </div>

                    <div className="flex justify-end">
                        <button
                            ref={mobileToggleRef}
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="inline-flex items-center justify-center w-11 h-11 -mr-1 rounded-lg text-gold hover:text-gold/75 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
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
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            ) : (
                                <svg
                                    className="w-7 h-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
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
                                className="flex items-center min-h-12 px-2 font-nav text-base font-bold tracking-[-0.16px] rounded-md text-silk-200 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                                {t("home")}
                            </a>
                        ) : (
                            <Link
                                ref={mobileFirstFocusableRef}
                                href="/"
                                onClick={closeMobile}
                                className="flex items-center min-h-12 px-2 font-nav text-base font-bold tracking-[-0.16px] rounded-md text-silk-200 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                                {t("home")}
                            </Link>
                        )}
                    </li>
                    {mobileLinks.map((item) => (
                        <li key={`${item.href}-${item.label}`}>
                            <Link
                                href={item.href}
                                onClick={closeMobile}
                                aria-current={item.active ? "page" : undefined}
                                className={`flex items-center min-h-12 px-2 font-nav text-base font-bold tracking-[-0.16px] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                                    item.active ? "text-gold" : "text-silk-200 hover:text-gold"
                                }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            href="/shop/cart"
                            onClick={closeMobile}
                            aria-current={isShopPath && normalizedPathname.startsWith("/shop/cart") ? "page" : undefined}
                            className="flex items-center gap-3 min-h-12 px-2 font-nav text-base font-bold tracking-[-0.16px] rounded-md text-silk-200 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M3 4h2l2.4 12.1a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.8L20 8H6" />
                                <circle cx="9" cy="20" r="1.4" />
                                <circle cx="17" cy="20" r="1.4" />
                            </svg>
                            <span>{tShop("cart")}</span>
                        </Link>
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
