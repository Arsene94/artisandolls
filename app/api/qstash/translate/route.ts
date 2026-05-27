import "server-only";
import { withSignatureVerification } from "@/lib/upstash/qstash-receiver";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
    isTranslationProviderConfigured,
    translateFields,
} from "@/lib/translations/provider";
import { invalidateTranslationsCache } from "@/lib/translations/store";
import type {
    TranslatableEntity,
} from "@/lib/translations/shared";
import { TARGET_LOCALES } from "@/lib/translations/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_ENTITIES: ReadonlySet<TranslatableEntity> = new Set<TranslatableEntity>([
    "shop_category",
    "shop_product",
    "faq_item",
    "blog_post",
    "doll",
    "doll_collection",
    "doll_outfit",
    "doll_customization_group",
    "doll_customization_option",
    "site_offer",
]);

const TARGET_LOCALES_SET = new Set<string>(TARGET_LOCALES);

type Job = {
    entity?: TranslatableEntity;
    entityId?: string;
    locale?: string;
    fields?: string[];
};

async function handler(request: Request) {
    const job = (await request.json()) as Job;

    if (
        !job.entity ||
        !job.entityId ||
        !job.locale ||
        !Array.isArray(job.fields) ||
        job.fields.length === 0 ||
        !VALID_ENTITIES.has(job.entity) ||
        !TARGET_LOCALES_SET.has(job.locale)
    ) {
        return Response.json({ error: "invalid job payload" }, { status: 400 });
    }

    const entity = job.entity;
    const entityId = job.entityId;
    const locale = job.locale as Exclude<"ro", "ro"> extends never
        ? "en" | "nl"
        : never;
    // Cast e safe — TARGET_LOCALES_SET filtrează deja non-RO.
    const targetLocale = job.locale as "en" | "nl";
    const fields = Array.from(new Set(job.fields)).filter(
        (f) => typeof f === "string" && f.length > 0,
    );

    if (!isTranslationProviderConfigured()) {
        // Fail-open: rândurile rămân pending; un re-run admin le va relua.
        // Nu aruncăm — QStash ar relua infinit fără rezultat.
        console.warn("[translate] AI gateway not configured, skipping job", entity, entityId);
        return Response.json({ ok: true, skipped: "provider-missing" });
    }

    const supabase = createSupabaseServiceClient();

    const { data: rows, error: readError } = await supabase
        .from("content_translations")
        .select("field, source_value, status, attempts")
        .eq("entity_type", entity)
        .eq("entity_id", entityId)
        .eq("locale", targetLocale)
        .in("field", fields);

    if (readError) {
        throw new Error(`failed to load pending translations: ${readError.message}`);
    }
    if (!rows || rows.length === 0) {
        // Rândurile au fost șterse între enqueue și worker — nu mai e nimic de făcut.
        return Response.json({ ok: true, skipped: "no-rows" });
    }

    const sources: Array<{ key: string; value: string }> = [];
    for (const row of rows) {
        const value = typeof row.source_value === "string" ? row.source_value.trim() : "";
        if (value.length === 0) continue;
        sources.push({ key: row.field as string, value });
    }

    if (sources.length === 0) {
        return Response.json({ ok: true, skipped: "empty-source" });
    }

    // void argument — TypeScript narrow happiness
    void locale;

    let translated: Record<string, string>;
    try {
        const result = await translateFields({
            entity,
            entityId,
            locale: targetLocale,
            fields: sources,
        });
        translated = result.translations;
    } catch (err) {
        // Marcăm attempts++ ca să vedem din admin câte încercări s-au consumat.
        // Aruncăm înapoi ca QStash să facă retry — la final retry va atinge max
        // și jobul devine `failed` (sweeper-ul din admin poate marca manual).
        await supabase
            .from("content_translations")
            .update({
                attempts: (rows[0]?.attempts ?? 0) + 1,
                error: err instanceof Error ? err.message.slice(0, 500) : "unknown error",
                updated_at: new Date().toISOString(),
            })
            .eq("entity_type", entity)
            .eq("entity_id", entityId)
            .eq("locale", targetLocale)
            .in("field", fields);
        throw err instanceof Error ? err : new Error(String(err));
    }

    const nowIso = new Date().toISOString();
    const updates = sources
        .map((source) => {
            const value = translated[source.key];
            if (typeof value !== "string" || value.trim().length === 0) return null;
            return {
                field: source.key,
                value: value.trim(),
            };
        })
        .filter((u): u is { field: string; value: string } => u !== null);

    if (updates.length === 0) {
        await supabase
            .from("content_translations")
            .update({
                status: "failed",
                error: "translator returned no usable values",
                updated_at: nowIso,
            })
            .eq("entity_type", entity)
            .eq("entity_id", entityId)
            .eq("locale", targetLocale)
            .in("field", fields);
        return Response.json({ ok: false, reason: "no-translations" }, { status: 200 });
    }

    // Update per field — păstrăm fail granular dacă un singur field e scurs.
    // În practică numărul de câmpuri per entitate e mic (1-6) deci nu mergem
    // pe un upsert bulk care ar suprascrie source_value cu valori vechi.
    await Promise.all(
        updates.map((u) =>
            supabase
                .from("content_translations")
                .update({
                    value: u.value,
                    status: "ready",
                    error: null,
                    attempts: 0,
                    updated_at: nowIso,
                })
                .eq("entity_type", entity)
                .eq("entity_id", entityId)
                .eq("locale", targetLocale)
                .eq("field", u.field),
        ),
    );

    // Marcăm câmpurile pentru care LLM-ul nu a returnat valoare ca `failed`,
    // ca admin-ul să poată reuploada manual fără să blocheze restul.
    const handled = new Set(updates.map((u) => u.field));
    const missing = sources.map((s) => s.key).filter((k) => !handled.has(k));
    if (missing.length > 0) {
        await supabase
            .from("content_translations")
            .update({
                status: "failed",
                error: "translator omitted this field",
                updated_at: nowIso,
            })
            .eq("entity_type", entity)
            .eq("entity_id", entityId)
            .eq("locale", targetLocale)
            .in("field", missing);
    }

    await invalidateTranslationsCache(entity, targetLocale);

    return Response.json({ ok: true, translated: updates.length, failed: missing.length });
}

export const POST = withSignatureVerification(handler);
