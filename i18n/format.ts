import type { Locale } from "@/i18n/routing";

export function getIntlLocale(locale: string) {
    if (locale === "en") return "en-US";
    if (locale === "nl") return "nl-NL";
    return "ro-RO";
}

export function formatLei(value: number, locale: string) {
    return `${value.toLocaleString(getIntlLocale(locale))} lei`;
}

export function formatLeiPerDay(value: number, locale: string, perDayLabel: string) {
    return `${formatLei(value, locale)} ${perDayLabel}`;
}

export function isSupportedLocale(locale: string): locale is Locale {
    return locale === "ro" || locale === "en" || locale === "nl";
}

export function localizePath(pathname: string, locale: string) {
    if (locale === "ro") {
        return pathname;
    }

    return `/${locale}${pathname === "/" ? "" : pathname}`;
}
