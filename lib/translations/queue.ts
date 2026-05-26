import "server-only";
import { buildCallbackUrl, qstash } from "@/lib/upstash/qstash";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
    TARGET_LOCALES,
    type TranslatableEntity,
    type TranslatableField,
} from "@/lib/translations/shared";

/**
 * Enqueue de auto-traducere pentru o entitate. Se cheamă din toate
 * `create*Action` / `update*Action` din admin după ce mutația a reușit.
 *
 * Comportament:
 *  - Câmpurile cu valoare null/empty sunt sărite.
 *  - Pentru fiecare locale-țintă (en, nl) facem upsert al unei intrări
 *    `pending` în content_translations (per câmp), apoi publicăm UN
 *    SINGUR job QStash cu toate câmpurile pentru acel locale.
 *  - Dacă QStash nu e configurat sau publishing-ul eșuează, rândurile
 *    rămân `pending` și pot fi reluate manual din admin (TODO follow-up).
 *  - Politica este fail-open: aruncăm doar erorile de DB de la upsert;
 *    eșecul QStash e doar logat, ca să nu blocăm admin-ul.
 */
export async function enqueueEntityTranslations(params: {
    entity: TranslatableEntity;
    entityId: string;
    fields: TranslatableField[];
}): Promise<void> {
    const cleaned = params.fields
        .map((f) => ({ key: f.key, value: typeof f.value === "string" ? f.value.trim() : "" }))
        .filter((f) => f.value.length > 0);

    if (cleaned.length === 0) return;

    const supabase = createSupabaseServiceClient();
    const nowIso = new Date().toISOString();

    // Marcăm intrările ca pending + actualizăm source_value-ul ca să detectăm
    // staleness la jobs ulterioare (același rând, RO modificat).
    const upserts: Array<Record<string, unknown>> = [];
    for (const locale of TARGET_LOCALES) {
        for (const field of cleaned) {
            upserts.push({
                entity_type: params.entity,
                entity_id: params.entityId,
                locale,
                field: field.key,
                value: null,
                source_value: field.value,
                status: "pending",
                error: null,
                attempts: 0,
                updated_at: nowIso,
            });
        }
    }

    const { error: upsertError } = await supabase
        .from("content_translations")
        .upsert(upserts, { onConflict: "entity_type,entity_id,locale,field" });

    if (upsertError) {
        // Înainte să publicăm jobs ar trebui să avem rândurile pending.
        // Dacă upsert-ul eșuează aruncăm — admin-ul vede eroarea, dar
        // mutația principală e deja commit-ată.
        console.error(
            "[translations] failed to upsert pending rows",
            params.entity,
            params.entityId,
            upsertError,
        );
        return;
    }

    const client = qstash;
    if (!client) return;
    const url = buildCallbackUrl("/api/qstash/translate");
    if (!url) return;

    await Promise.allSettled(
        TARGET_LOCALES.map((locale) =>
            client.publishJSON({
                url,
                body: {
                    entity: params.entity,
                    entityId: params.entityId,
                    locale,
                    fields: cleaned.map((f) => f.key),
                },
                // Deduplicate per (entitate, locale) la fereastra implicită
                // QStash — apăsări duble pe Save în admin nu cheltuie tokens
                // de două ori dacă jobul precedent încă nu a rulat.
                deduplicationId: `tr-${params.entity}-${params.entityId}-${locale}`,
                retries: 3,
            }).catch((err) => {
                console.error(
                    "[translations] qstash publish failed",
                    params.entity,
                    params.entityId,
                    locale,
                    err,
                );
            }),
        ),
    );
}
