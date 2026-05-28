/**
 * Definițiile partajate pentru sistemul de auto-traducere. Sunt importate
 * atât din server actions (admin) cât și din worker-ul QStash, deci nu
 * adăugăm aici dependențe de runtime Supabase / Upstash.
 */

import type { Locale } from "@/i18n/routing";

/**
 * Identificatorul logic al unei entități traduse. Toate stringurile sunt
 * folosite ca atare în coloana `content_translations.entity_type` — orice
 * rename necesită migrare de date.
 */
export type TranslatableEntity =
    | "shop_category"
    | "shop_product"
    | "faq_item"
    | "blog_post"
    | "doll"
    | "doll_collection"
    | "doll_outfit"
    | "doll_customization_group"
    | "doll_customization_option"
    | "site_offer";

/** Localele non-RO către care traducem. RO e sursa și nu apare aici. */
export const TARGET_LOCALES: ReadonlyArray<Exclude<Locale, "ro">> = [
    "en",
    "nl",
    "de",
];

/**
 * Numele afișabil al locale-ului în engleză — folosit ca instrucțiune
 * pentru LLM (e.g. "Translate from Romanian to Dutch"). Mapping deliberat
 * verbos, nu se generalizează din ISO ca să rămână ușor de auditat.
 */
export const LOCALE_LANGUAGE_NAME: Record<Exclude<Locale, "ro">, string> = {
    en: "English",
    nl: "Dutch (Nederlands)",
    de: "German (Deutsch)",
};

export interface TranslatableField {
    /** Numele coloanei sursă din tabelul originator (e.g. "name", "description"). */
    key: string;
    /** Valoarea RO curentă. Poate fi null/empty — în acest caz nu se enqueue. */
    value: string | null | undefined;
}

export interface TranslationJobInput {
    entity: TranslatableEntity;
    entityId: string;
    locale: Exclude<Locale, "ro">;
    fields: Array<{ key: string; value: string }>;
}
