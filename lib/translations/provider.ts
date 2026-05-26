import "server-only";
import { LOCALE_LANGUAGE_NAME, type TranslationJobInput } from "@/lib/translations/shared";

/**
 * Provider de traduceri prin Vercel AI Gateway. Folosim endpoint-ul
 * OpenAI-compatible (`/v1/chat/completions`) cu un model ieftin (gpt-4o-mini
 * implicit, configurabil prin env). Gateway-ul gestionează rate-limit /
 * fail-over către upstream, deci nu avem retry suplimentar aici — QStash
 * face retry-ul exponențial dacă răspunsul nu e 2xx.
 */

const DEFAULT_BASE_URL = "https://ai-gateway.vercel.sh/v1";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

function getEndpoint(): string {
    const raw = process.env.AI_GATEWAY_BASE_URL?.trim();
    const base = raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_BASE_URL;
    return `${base}/chat/completions`;
}

function getModel(): string {
    return process.env.AI_GATEWAY_TRANSLATE_MODEL?.trim() || DEFAULT_MODEL;
}

function getApiKey(): string | null {
    const raw = process.env.AI_GATEWAY_API_KEY?.trim();
    return raw && raw.length > 0 ? raw : null;
}

export function isTranslationProviderConfigured(): boolean {
    return getApiKey() !== null;
}

function buildSystemPrompt(targetLanguage: string): string {
    return [
        `You are a professional translator for an adult premium boutique website (realistic dolls rental + adult accessories).`,
        `Translate Romanian source copy into ${targetLanguage}.`,
        ``,
        `Rules:`,
        `- Keep the tone elegant, tasteful, and aspirational — never crude.`,
        `- Preserve HTML / Markdown markup, line breaks, list bullets, and inline placeholders ({{like_this}}, %s, %d).`,
        `- Do NOT translate brand names, product SKUs, slugs, URLs, or identifiers.`,
        `- Do NOT add explanations, notes, or quotation marks around the result.`,
        `- If a field is a short label (1-3 words), use the natural, idiomatic equivalent — do not over-translate.`,
        `- Return ONLY a single valid JSON object that mirrors the input keys, with the translated strings as values.`,
    ].join("\n");
}

function buildUserPrompt(fields: TranslationJobInput["fields"]): string {
    const payload: Record<string, string> = {};
    for (const field of fields) payload[field.key] = field.value;
    return [
        `Translate the values of this JSON. Keys must remain identical. Return only the JSON object.`,
        ``,
        JSON.stringify(payload, null, 2),
    ].join("\n");
}

function parseTranslatedPayload(raw: string): Record<string, string> | null {
    const trimmed = raw.trim();

    // Modelele pot încadra răspunsul cu ```json … ``` — îl decojim înainte de parse.
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    const candidate = fenced ? fenced[1] : trimmed;

    try {
        const parsed = JSON.parse(candidate);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return null;
        }
        const out: Record<string, string> = {};
        for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "string") out[key] = value;
        }
        return out;
    } catch {
        return null;
    }
}

export interface TranslateResult {
    /** Mapping cheie-sursă → text tradus. Doar cheile primite la input apar aici. */
    translations: Record<string, string>;
}

/**
 * Traduce un set de câmpuri într-un singur LLM call. Aruncă dacă providerul
 * nu e configurat, dacă HTTP nu e 2xx, sau dacă răspunsul nu e JSON valid —
 * worker-ul prinde excepțiile și lasă QStash să facă retry.
 */
export async function translateFields(job: TranslationJobInput): Promise<TranslateResult> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("AI_GATEWAY_API_KEY is not configured.");
    }
    if (job.fields.length === 0) {
        return { translations: {} };
    }

    const targetLanguage = LOCALE_LANGUAGE_NAME[job.locale];
    const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: getModel(),
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: buildSystemPrompt(targetLanguage) },
                { role: "user", content: buildUserPrompt(job.fields) },
            ],
        }),
    });

    if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(
            `AI Gateway responded ${response.status}: ${errBody.slice(0, 400)}`,
        );
    }

    const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("AI Gateway returned no completion content.");
    }

    const parsed = parseTranslatedPayload(content);
    if (!parsed) {
        throw new Error("Translator returned non-JSON payload.");
    }

    // Filtrăm doar cheile cerute — modelul ocazional adaugă chei extra.
    const allowed = new Set(job.fields.map((f) => f.key));
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
        if (allowed.has(key) && value.trim().length > 0) {
            filtered[key] = value;
        }
    }
    return { translations: filtered };
}
