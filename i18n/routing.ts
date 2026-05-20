import { defineRouting } from "next-intl/routing";

export const locales = ["ro", "en", "nl"] as const;
export const defaultLocale = "ro";

export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: "as-needed",
    localeDetection: false,
});

export type Locale = (typeof locales)[number];
