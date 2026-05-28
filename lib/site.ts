import { locales, defaultLocale, type Locale } from "@/i18n/routing";

// Fallback folosit doar la dezvoltare locală / preview neconfigurat. În producție
// `NEXT_PUBLIC_SITE_URL` din `.env` trebuie să fie setat — altfel canonical-urile,
// hreflang-urile, sitemap-ul și OpenGraph-ul vor cita acest domeniu.
const FALLBACK_SITE_URL = "https://velvet-companions.com";

/** Numele canonic al brandului, folosit ca fallback în UI și meta. */
export const CANONICAL_BRAND = "Velvet Companions";

/** Numele legal complet al operatorului (apare în factură & legal). */
export const LEGAL_OPERATOR_NAME = "Velvet Studio SRL";

/**
 * Datele de identificare obligatorii pentru un operator e-commerce RO
 * (Legea 365/2002, OUG 34/2014). Suprascrise prin platform_settings dacă există.
 */
export const LEGAL_IDENTIFIERS = {
    cui: "RO00000000",
    regCom: "J40/0000/2026",
    address: "București, sector 1, str. — de completat —",
    contactEmail: "contact@velvet-companions.com",
    dpoEmail: "dpo@velvet-companions.com",
} as const;

/** Ultima actualizare pentru toate documentele legale. */
export const LEGAL_LAST_UPDATED = "2026-05-25";

/** Lista subprocesoarelor pentru anexa GDPR Art. 28. */
export const SUBPROCESSORS = [
    { name: "Supabase Inc.", purpose: "Stocare bază de date & autentificare", region: "EU (Frankfurt)" },
    { name: "Meta / WhatsApp Business API", purpose: "Notificări către consilieri", region: "EU / Irlanda" },
    { name: "Sameday Courier", purpose: "Livrare colete neutre", region: "România" },
    { name: "FanCourier", purpose: "Livrare alternativă", region: "România" },
] as const;

export function getSiteUrl(override?: string | null): string {
    const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
    const raw = override?.trim() || fromEnv?.trim() || FALLBACK_SITE_URL;
    const trimmed = raw.replace(/\/$/, "");
    // Defensiv: dacă admin-ul scrie `velvet-companions.com` fără schemă, o completăm
    // ca să nu producem URL-uri rupte în sitemap / canonical.
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function localePath(locale: Locale, path: string): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (locale === defaultLocale) {
        return normalized === "/" ? "/" : normalized;
    }
    return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function localeUrl(siteUrl: string, locale: Locale, path: string): string {
    return `${siteUrl}${localePath(locale, path)}`;
}

export function localeAlternates(siteUrl: string, path: string): Record<string, string> {
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
        alternates[locale] = localeUrl(siteUrl, locale, path);
    }
    alternates["x-default"] = localeUrl(siteUrl, defaultLocale, path);
    return alternates;
}

/** Format human-readable al datei LEGAL_LAST_UPDATED pe locale. */
export function formatLastUpdated(locale: Locale): string {
    const d = new Date(LEGAL_LAST_UPDATED);
    return d.toLocaleDateString(
        locale === "ro"
            ? "ro-RO"
            : locale === "nl"
              ? "nl-NL"
              : locale === "de"
                ? "de-DE"
                : "en-GB",
        { day: "numeric", month: "long", year: "numeric" },
    );
}
