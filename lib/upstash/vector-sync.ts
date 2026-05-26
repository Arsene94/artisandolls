import "server-only";
import { vectorIndex, VECTOR_NAMESPACES, type VectorLocale } from "@/lib/upstash/vector";
import type { Doll, DollRow } from "@/lib/dolls";
import { mapDollRowToDoll } from "@/lib/dolls";

const LOCALES: VectorLocale[] = ["ro", "en", "nl"];

function heightFromTags(tags: string[]): number | null {
    for (const tag of tags ?? []) {
        const match = tag.match(/(\d{2,3})\s*cm/i);
        if (match) return Number(match[1]);
    }
    return null;
}

function searchableText(doll: Doll): string {
    return [
        doll.name,
        doll.collection,
        doll.description,
        doll.tags?.join(" ") ?? "",
        doll.badge,
        doll.availability,
    ]
        .filter(Boolean)
        .join(" . ");
}

export async function upsertDollVectors(input: Doll | DollRow): Promise<void> {
    const index = vectorIndex;
    if (!index) return;
    const doll: Doll = "main_image_path" in input ? mapDollRowToDoll(input) : input;
    const text = searchableText(doll);
    const height = heightFromTags(doll.tags ?? []);

    await Promise.all(
        LOCALES.map((locale) =>
            index
                .upsert(
                    {
                        id: `${doll.id}:${locale}`,
                        data: text,
                        metadata: {
                            slug: doll.id,
                            name: doll.name,
                            collection: doll.collection,
                            badge: doll.badge,
                            availability: doll.availability,
                            availableForRent: doll.availableForRent,
                            availableForBuy: doll.availableForBuy,
                            buyPrice: doll.buyPrice,
                            height,
                            tags: doll.tags ?? [],
                        },
                    },
                    { namespace: VECTOR_NAMESPACES[locale] },
                )
                .catch((err: unknown) => {
                    console.warn(
                        "[vector] upsert failed",
                        doll.id,
                        locale,
                        err,
                    );
                }),
        ),
    );
}

export async function deleteDollVectors(slug: string): Promise<void> {
    const index = vectorIndex;
    if (!index) return;
    await Promise.all(
        LOCALES.map((locale) =>
            index
                .delete(`${slug}:${locale}`, {
                    namespace: VECTOR_NAMESPACES[locale],
                })
                .catch((err: unknown) =>
                    console.warn("[vector] delete failed", slug, locale, err),
                ),
        ),
    );
}
