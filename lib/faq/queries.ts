import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { cached, cacheKey } from "@/lib/upstash/cache";
import {
    mapFaqRowToItem,
    type FaqItem,
    type FaqItemRow,
} from "@/lib/faq/shared";
import type { Locale } from "@/i18n/routing";
import { applyTranslations } from "@/lib/translations/store";

const PUBLIC_TTL = 600;
const KEY = cacheKey("faq", "public", "v1");

const COLUMNS = `
    id,
    slug,
    category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home,
    display_order,
    is_active,
    created_at,
    updated_at
`;

async function loadActiveRows(): Promise<FaqItemRow[]> {
    return cached(KEY, PUBLIC_TTL, async () => {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("faq_items")
            .select(COLUMNS)
            .eq("is_active", true)
            .order("display_order", { ascending: true });
        if (error || !data) return [] as FaqItemRow[];
        return data as unknown as FaqItemRow[];
    });
}

export async function getFaqItems(locale: Locale): Promise<FaqItem[]> {
    const rows = await loadActiveRows();
    // Pe coloanele `_en`/`_nl` rămâne preferința editorului uman. Aici doar
    // suplinim valorile lipsă cu cele auto-traduse din content_translations.
    const filled = await fillMissingFaqTranslations(rows, locale);
    return filled.map((row) => mapFaqRowToItem(row, locale));
}

async function fillMissingFaqTranslations(
    rows: FaqItemRow[],
    locale: Locale,
): Promise<FaqItemRow[]> {
    if (locale === "ro" || rows.length === 0) return rows;
    const missing = rows.filter((r) => {
        const q = locale === "en" ? r.question_en : r.question_nl;
        const a = locale === "en" ? r.answer_en : r.answer_nl;
        return !q?.trim() || !a?.trim();
    });
    if (missing.length === 0) return rows;
    const overlayed = await applyTranslations(
        "faq_item",
        missing.map((r) => ({ id: r.id, question: r.question, answer: r.answer })),
        locale,
        ["question", "answer"],
    );
    const byId = new Map(overlayed.map((r) => [r.id, r]));
    return rows.map((row) => {
        const t = byId.get(row.id);
        if (!t) return row;
        if (locale === "en") {
            return {
                ...row,
                question_en: row.question_en?.trim() || (t.question as string),
                answer_en: row.answer_en?.trim() || (t.answer as string),
            };
        }
        return {
            ...row,
            question_nl: row.question_nl?.trim() || (t.question as string),
            answer_nl: row.answer_nl?.trim() || (t.answer as string),
        };
    });
}

export async function getHomeFaqItems(locale: Locale): Promise<FaqItem[]> {
    const items = await getFaqItems(locale);
    return items.filter((i) => i.showOnHome);
}

export async function getFaqItemsForAdmin(): Promise<FaqItemRow[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("faq_items")
        .select(COLUMNS)
        .order("display_order", { ascending: true });
    if (error || !data) return [];
    return data as unknown as FaqItemRow[];
}

export async function getFaqItemRowByIdForAdmin(id: string): Promise<FaqItemRow | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("faq_items")
        .select(COLUMNS)
        .eq("id", id)
        .maybeSingle();
    if (error || !data) return null;
    return data as unknown as FaqItemRow;
}
