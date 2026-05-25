import "server-only";
import {
    isVectorEnabled,
    VECTOR_NAMESPACES,
    vectorIndex,
    type DollVectorMeta,
    type VectorLocale,
} from "@/lib/upstash/vector";

const SEARCH_TIMEOUT_MS = 1200;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise<T>((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            resolve(fallback);
        }, ms);
        promise
            .then((value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                resolve(value);
            })
            .catch((err) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                console.warn("[vector] query failed", err);
                resolve(fallback);
            });
    });
}

export type SemanticSearchHit = {
    slug: string;
    score: number;
    metadata: DollVectorMeta | null;
};

export async function semanticSearch(
    query: string,
    locale: VectorLocale,
    topK = 24,
): Promise<SemanticSearchHit[] | null> {
    if (!isVectorEnabled() || !vectorIndex) return null;
    const trimmed = query.trim();
    if (!trimmed) return null;

    const run = vectorIndex
        .query(
            { data: trimmed, topK, includeMetadata: true },
            { namespace: VECTOR_NAMESPACES[locale] },
        )
        .then((res) =>
            res.map((r) => ({
                slug: (r.metadata?.slug ?? String(r.id).split(":")[0]) as string,
                score: r.score ?? 0,
                metadata: (r.metadata ?? null) as DollVectorMeta | null,
            })),
        );

    return withTimeout(run, SEARCH_TIMEOUT_MS, [] as SemanticSearchHit[]);
}

export async function similarDolls(
    seedSlug: string,
    seedText: string,
    locale: VectorLocale,
    topK = 5,
): Promise<SemanticSearchHit[]> {
    if (!isVectorEnabled() || !vectorIndex) return [];
    if (!seedText.trim()) return [];

    const run = vectorIndex
        .query(
            {
                data: seedText,
                topK: topK + 1,
                includeMetadata: true,
            },
            { namespace: VECTOR_NAMESPACES[locale] },
        )
        .then((res) =>
            res
                .map((r) => ({
                    slug: (r.metadata?.slug ?? String(r.id).split(":")[0]) as string,
                    score: r.score ?? 0,
                    metadata: (r.metadata ?? null) as DollVectorMeta | null,
                }))
                .filter((hit) => hit.slug !== seedSlug)
                .slice(0, topK),
        );

    return withTimeout(run, SEARCH_TIMEOUT_MS, [] as SemanticSearchHit[]);
}
