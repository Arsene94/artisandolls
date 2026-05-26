import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cached, cacheKey, invalidatePrefix } from "@/lib/upstash/cache";
import type { Locale } from "@/i18n/routing";
import type { TranslatableEntity } from "@/lib/translations/shared";

/**
 * Reader pentru content_translations. Citește batch traducerile pentru un
 * set de entități și un locale, le cache-uiește 5 min în Redis, apoi le
 * livrează ca Map<entityId, Record<field, value>> pentru consum în paginile
 * locale-aware.
 */

type TranslationRow = {
    entity_id: string;
    field: string;
    value: string | null;
    status: string;
};

function translationsCacheKey(
    entity: TranslatableEntity,
    locale: Locale,
): string {
    return cacheKey("translations", entity, locale, "v1");
}

/**
 * Returnează doar traducerile cu status='ready' și value non-empty pentru
 * entitățile cerute. Jobs `pending`/`failed` sunt excluse — UI fallback-uiește
 * la RO până când worker-ul completează rândurile.
 */
export async function getEntityTranslations(
    entity: TranslatableEntity,
    entityIds: string[],
    locale: Locale,
): Promise<Map<string, Record<string, string>>> {
    if (locale === "ro" || entityIds.length === 0) {
        return new Map();
    }

    // Cache full per (entity, locale) set — apoi filtrăm in-memory pe ids.
    // Numărul total de rânduri per entity rămâne mic (sub câteva mii) deci
    // overhead-ul de cache invalidation > overhead-ul de filtrare.
    const all = await cached(
        translationsCacheKey(entity, locale),
        300,
        async () => {
            const supabase = await createSupabaseServerClient();
            const { data, error } = await supabase
                .from("content_translations")
                .select("entity_id, field, value, status")
                .eq("entity_type", entity)
                .eq("locale", locale)
                .eq("status", "ready");
            if (error) {
                console.warn("[translations] read failed", entity, locale, error);
                return [] as TranslationRow[];
            }
            return (data ?? []) as TranslationRow[];
        },
    );

    const wanted = new Set(entityIds);
    const out = new Map<string, Record<string, string>>();
    for (const row of all) {
        if (!wanted.has(row.entity_id)) continue;
        if (!row.value || row.value.trim().length === 0) continue;
        const bucket = out.get(row.entity_id) ?? {};
        bucket[row.field] = row.value;
        out.set(row.entity_id, bucket);
    }
    return out;
}

/**
 * Aplică un overlay de traduceri peste un array de rânduri Supabase. Pentru
 * fiecare rând, câmpurile listate sunt suprascrise cu valoarea localizată,
 * dacă există. Restul rămân la valoarea RO.
 *
 * Nu mutează rândurile primite — întoarce mereu o copie shallow.
 */
export async function applyTranslations<
    Row extends { id: string } & Record<string, unknown>,
>(
    entity: TranslatableEntity,
    rows: Row[],
    locale: Locale,
    fields: ReadonlyArray<keyof Row & string>,
): Promise<Row[]> {
    if (locale === "ro" || rows.length === 0 || fields.length === 0) {
        return rows;
    }
    const map = await getEntityTranslations(
        entity,
        rows.map((r) => r.id),
        locale,
    );
    if (map.size === 0) return rows;

    return rows.map((row) => {
        const overlay = map.get(row.id);
        if (!overlay) return row;
        const next: Record<string, unknown> = { ...row };
        for (const field of fields) {
            const translated = overlay[field];
            if (translated && translated.trim().length > 0) {
                next[field] = translated;
            }
        }
        return next as Row;
    });
}

/** Variantă pe un singur rând — convenabilă pentru paginile detail. */
export async function applyTranslationToRow<
    Row extends { id: string } & Record<string, unknown>,
>(
    entity: TranslatableEntity,
    row: Row | null,
    locale: Locale,
    fields: ReadonlyArray<keyof Row & string>,
): Promise<Row | null> {
    if (!row) return row;
    const [out] = await applyTranslations(entity, [row], locale, fields);
    return out ?? row;
}

/**
 * Folosit de worker după ce scrie un batch de traduceri, ca să spargă
 * cache-ul de read pentru (entity, locale). Acceptă oricare locale,
 * inclusiv RO (noop pe sursa-de-adevăr).
 */
export async function invalidateTranslationsCache(
    entity: TranslatableEntity,
    locale: Locale,
): Promise<void> {
    if (locale === "ro") return;
    await invalidatePrefix(translationsCacheKey(entity, locale));
}
