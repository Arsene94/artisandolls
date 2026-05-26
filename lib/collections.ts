import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CollectionRow } from "@/lib/collections/shared";
import type { Locale } from "@/i18n/routing";
import { getEntityTranslations } from "@/lib/translations/store";

export type {
    CollectionRow,
    CollectionType,
} from "@/lib/collections/shared";

export {
    formatCollectionType,
} from "@/lib/collections/shared";

/**
 * Aplică traducerile auto pe rândurile de colecție. `name`, `description`
 * și `badge` sunt câmpurile enqueued în lib/translations/queue.
 */
export async function localizeCollectionRows(
    rows: CollectionRow[],
    locale: Locale,
): Promise<CollectionRow[]> {
    if (locale === "ro" || rows.length === 0) return rows;
    const translations = await getEntityTranslations(
        "doll_collection",
        rows.map((r) => r.id),
        locale,
    );
    if (translations.size === 0) return rows;
    return rows.map((row) => {
        const t = translations.get(row.id);
        if (!t) return row;
        return {
            ...row,
            name: t.name?.trim() || row.name,
            description: t.description?.trim() || row.description,
            badge: t.badge?.trim() || row.badge,
        };
    });
}

export async function getCollectionRows(includeInactive = false) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("doll_collections")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as CollectionRow[];
}

export async function getCollectionRowBySlug(slug: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_collections")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        return null;
    }

    return data as CollectionRow;
}
