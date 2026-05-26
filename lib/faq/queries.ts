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
    return rows.map((row) => mapFaqRowToItem(row, locale));
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
