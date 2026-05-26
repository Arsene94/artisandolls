import type { Locale } from "@/i18n/routing";

export type FaqCategory =
    | "delivery"
    | "hygiene"
    | "payment"
    | "materials"
    | "legal"
    | "rental"
    | "purchase"
    | "general";

export const FAQ_CATEGORIES: FaqCategory[] = [
    "delivery",
    "hygiene",
    "payment",
    "materials",
    "rental",
    "purchase",
    "legal",
    "general",
];

export function isFaqCategory(value: unknown): value is FaqCategory {
    return typeof value === "string" && (FAQ_CATEGORIES as string[]).includes(value);
}

export type FaqItemRow = {
    id: string;
    slug: string;
    category: FaqCategory;
    question: string;
    question_en: string | null;
    question_nl: string | null;
    answer: string;
    answer_en: string | null;
    answer_nl: string | null;
    show_on_home: boolean;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type FaqItem = {
    id: string;
    slug: string;
    category: FaqCategory;
    question: string;
    answer: string;
    showOnHome: boolean;
    displayOrder: number;
};

function pick(locale: Locale, base: string, en: string | null, nl: string | null): string {
    if (locale === "en") return (en?.trim() || base);
    if (locale === "nl") return (nl?.trim() || base);
    return base;
}

export function mapFaqRowToItem(row: FaqItemRow, locale: Locale): FaqItem {
    return {
        id: row.id,
        slug: row.slug,
        category: row.category,
        question: pick(locale, row.question, row.question_en, row.question_nl),
        answer: pick(locale, row.answer, row.answer_en, row.answer_nl),
        showOnHome: row.show_on_home,
        displayOrder: row.display_order,
    };
}
