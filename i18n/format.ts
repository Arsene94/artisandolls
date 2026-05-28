import type { Locale } from "@/i18n/routing";

const FALLBACK_CURRENCY = "RON";

const LOCALE_MAP: Record<Locale, string> = {
    ro: "ro-RO",
    en: "en-GB",
    nl: "nl-NL",
    de: "de-DE",
};

const OG_LOCALE_MAP: Record<Locale, string> = {
    ro: "ro_RO",
    en: "en_GB",
    nl: "nl_NL",
    de: "de_DE",
};

export function getIntlLocale(locale: string) {
    if (locale === "en") return LOCALE_MAP.en;
    if (locale === "nl") return LOCALE_MAP.nl;
    if (locale === "de") return LOCALE_MAP.de;
    return LOCALE_MAP.ro;
}

/** BCP47 cu underscore — formatul cerut de Open Graph (e.g. `de_DE`). */
export function getOgLocale(locale: string) {
    if (locale === "en") return OG_LOCALE_MAP.en;
    if (locale === "nl") return OG_LOCALE_MAP.nl;
    if (locale === "de") return OG_LOCALE_MAP.de;
    return OG_LOCALE_MAP.ro;
}

export function formatPrice(
    value: number,
    locale: string,
    currency: string = FALLBACK_CURRENCY,
) {
    try {
        return new Intl.NumberFormat(getIntlLocale(locale), {
            style: "currency",
            currency,
            maximumFractionDigits: value % 1 === 0 ? 0 : 2,
        }).format(value);
    } catch {
        return `${value.toLocaleString(getIntlLocale(locale))} ${currency}`;
    }
}

/**
 * Kept for compatibility with existing callers that hard-coded the "lei" suffix
 * before the platform_settings.currency wiring was introduced. Prefer
 * formatPrice for any new code.
 */
export function formatLei(value: number, locale: string) {
    return `${value.toLocaleString(getIntlLocale(locale))} lei`;
}

export function isSupportedLocale(locale: string): locale is Locale {
    return (
        locale === "ro" ||
        locale === "en" ||
        locale === "nl" ||
        locale === "de"
    );
}

export function localizePath(pathname: string, locale: string) {
    if (locale === "ro") return pathname;
    return `/${locale}${pathname === "/" ? "" : pathname}`;
}
