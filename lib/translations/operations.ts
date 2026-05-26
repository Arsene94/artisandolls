import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
    TARGET_LOCALES,
    type TranslatableEntity,
    type TranslatableField,
} from "@/lib/translations/shared";
import {
    TRANSLATION_REGISTRY,
    findRegistration,
    type EntityRegistration,
} from "@/lib/translations/registry";
import { enqueueEntityTranslations } from "@/lib/translations/queue";

export interface EntityStats {
    entity: TranslatableEntity;
    label: string;
    /** Numărul de rânduri RO din sursă. */
    totalRows: number;
    /** Slots = rows × locales × fields. Reprezintă universul total de traduceri. */
    totalSlots: number;
    readySlots: number;
    pendingSlots: number;
    failedSlots: number;
    /** Slots fără rând în content_translations — nici un job nu a fost enqueued. */
    untouchedSlots: number;
}

export interface OperationsSnapshot {
    perEntity: EntityStats[];
    totals: {
        totalSlots: number;
        readySlots: number;
        pendingSlots: number;
        failedSlots: number;
        untouchedSlots: number;
    };
}

type SourceRow = {
    id: string;
    [field: string]: unknown;
};

async function loadSourceRows(
    registration: EntityRegistration,
): Promise<SourceRow[]> {
    const supabase = createSupabaseServiceClient();
    const columns = ["id", ...registration.fields].join(", ");
    const { data, error } = await supabase
        .from(registration.table)
        .select(columns);
    if (error) {
        console.warn("[ops] failed to load", registration.table, error);
        return [];
    }
    return (data ?? []) as unknown as SourceRow[];
}

interface TranslationRow {
    entity_id: string;
    locale: string;
    field: string;
    status: "pending" | "ready" | "failed";
}

async function loadTranslationRows(
    entity: TranslatableEntity,
): Promise<TranslationRow[]> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
        .from("content_translations")
        .select("entity_id, locale, field, status")
        .eq("entity_type", entity);
    if (error) {
        console.warn("[ops] failed to load translations", entity, error);
        return [];
    }
    return (data ?? []) as TranslationRow[];
}

function fieldHasValue(row: SourceRow, field: string): boolean {
    const value = row[field];
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Calculează statistici detaliate pentru fiecare entitate. „totalSlots" e
 * universul teoretic de traduceri: pentru fiecare rând, pentru fiecare câmp
 * cu valoare RO non-goală, pentru fiecare locale-țintă. Câmpurile goale RO
 * sunt sărite (nimic de tradus), așa că nu intră în total — UI-ul rămâne
 * fidel cu „cât e de făcut" real.
 */
export async function getOperationsSnapshot(): Promise<OperationsSnapshot> {
    const perEntity: EntityStats[] = [];
    let totalSlots = 0;
    let readySlots = 0;
    let pendingSlots = 0;
    let failedSlots = 0;
    let untouchedSlots = 0;

    for (const reg of TRANSLATION_REGISTRY) {
        const [rows, translations] = await Promise.all([
            loadSourceRows(reg),
            loadTranslationRows(reg.entity),
        ]);

        // Index translations pentru lookup O(1) per (id, locale, field).
        const trIndex = new Map<string, TranslationRow["status"]>();
        for (const tr of translations) {
            trIndex.set(`${tr.entity_id}|${tr.locale}|${tr.field}`, tr.status);
        }

        let entityTotal = 0;
        let entityReady = 0;
        let entityPending = 0;
        let entityFailed = 0;
        let entityUntouched = 0;

        for (const row of rows) {
            for (const field of reg.fields) {
                if (!fieldHasValue(row, field)) continue;
                for (const locale of TARGET_LOCALES) {
                    entityTotal++;
                    const status = trIndex.get(`${row.id}|${locale}|${field}`);
                    if (status === "ready") entityReady++;
                    else if (status === "pending") entityPending++;
                    else if (status === "failed") entityFailed++;
                    else entityUntouched++;
                }
            }
        }

        perEntity.push({
            entity: reg.entity,
            label: reg.label,
            totalRows: rows.length,
            totalSlots: entityTotal,
            readySlots: entityReady,
            pendingSlots: entityPending,
            failedSlots: entityFailed,
            untouchedSlots: entityUntouched,
        });

        totalSlots += entityTotal;
        readySlots += entityReady;
        pendingSlots += entityPending;
        failedSlots += entityFailed;
        untouchedSlots += entityUntouched;
    }

    return {
        perEntity,
        totals: {
            totalSlots,
            readySlots,
            pendingSlots,
            failedSlots,
            untouchedSlots,
        },
    };
}

export interface EnqueueResult {
    entity: TranslatableEntity;
    enqueuedRows: number;
    /** Câmpuri trimise la traducător per rând — limitat de fail-skip pentru valori goale. */
    enqueuedSlots: number;
}

export type EnqueueScope =
    /** Doar rândurile/câmpurile care n-au încă status='ready' pentru un locale. */
    | "missing"
    /** Toate rândurile (suprascrie ce există). */
    | "all"
    /** Doar rândurile cu status='failed'. */
    | "retry-failed";

/**
 * Pune la coadă traducerile pentru o entitate dată. Pentru a evita timeout-urile
 * pe acțiunile server, NU așteaptă completarea worker-ilor — doar publică job-urile
 * QStash. Admin-ul se poate întoarce mai târziu să vadă progresul.
 *
 * Pentru a evita o explozie de jobs duplicate, `enqueueEntityTranslations`
 * folosește deja deduplicationId per (entity, entityId, locale), așa că
 * apăsare repetată pe „Enqueue" nu plătește tokens dublu.
 */
export async function enqueueEntityScope(
    entity: TranslatableEntity,
    scope: EnqueueScope,
): Promise<EnqueueResult> {
    const reg = findRegistration(entity);
    if (!reg) {
        return { entity, enqueuedRows: 0, enqueuedSlots: 0 };
    }

    const [rows, translations] = await Promise.all([
        loadSourceRows(reg),
        loadTranslationRows(entity),
    ]);

    const trIndex = new Map<string, TranslationRow["status"]>();
    for (const tr of translations) {
        trIndex.set(`${tr.entity_id}|${tr.locale}|${tr.field}`, tr.status);
    }

    let enqueuedRows = 0;
    let enqueuedSlots = 0;

    for (const row of rows) {
        // Adunăm câmpurile non-goale pe rând. Pentru `missing`/`retry-failed`
        // filtrăm per locale, dar `enqueueEntityTranslations` lucrează pe
        // toate localele simultan — așa că dacă pentru un locale TOATE
        // câmpurile sunt deja ready, vom enqueua oricum pentru celălalt.
        // Acceptabil: deduplicationId asigură idempotență.
        const fields: TranslatableField[] = [];
        let rowNeedsAny = false;
        for (const field of reg.fields) {
            if (!fieldHasValue(row, field)) continue;
            const ro = row[field] as string;
            // Decide dacă slot-ul are nevoie de re-traducere
            let needs = false;
            if (scope === "all") {
                needs = true;
            } else {
                for (const locale of TARGET_LOCALES) {
                    const status = trIndex.get(`${row.id}|${locale}|${field}`);
                    if (scope === "missing" && status !== "ready") {
                        needs = true;
                        break;
                    }
                    if (scope === "retry-failed" && status === "failed") {
                        needs = true;
                        break;
                    }
                }
            }
            if (needs) {
                fields.push({ key: field, value: ro });
                rowNeedsAny = true;
                enqueuedSlots++;
            }
        }

        if (rowNeedsAny && fields.length > 0) {
            enqueuedRows++;
            await enqueueEntityTranslations({
                entity,
                entityId: row.id,
                fields,
            });
        }
    }

    return { entity, enqueuedRows, enqueuedSlots };
}

/** Aplică enqueueEntityScope pe toate entitățile, secvențial. */
export async function enqueueAllScope(scope: EnqueueScope): Promise<EnqueueResult[]> {
    const results: EnqueueResult[] = [];
    for (const reg of TRANSLATION_REGISTRY) {
        const result = await enqueueEntityScope(reg.entity, scope);
        results.push(result);
    }
    return results;
}
