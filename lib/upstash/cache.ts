import "server-only";
import { redis } from "@/lib/upstash/redis";

const NAMESPACE = "artisandolls";

export function cacheKey(...parts: string[]): string {
    return [NAMESPACE, ...parts].join(":");
}

export const CACHE_KEYS = {
    settings: cacheKey("settings", "public", "v1"),
    dolls: cacheKey("dolls", "public", "v1"),
    collections: cacheKey("collections", "public", "v1"),
    heroDoll: cacheKey("dolls", "hero", "v1"),
    dollBySlug: (slug: string) => cacheKey("dolls", "slug", slug, "v1"),
} as const;

export async function cached<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
): Promise<T> {
    if (!redis) return loader();

    try {
        const hit = await redis.get<T>(key);
        if (hit !== null) return hit;
    } catch (err) {
        console.warn("[cache] read failed for", key, err);
    }

    const fresh = await loader();

    // fire-and-forget — caching a response should never block the response
    void redis
        .set(key, fresh as unknown as Record<string, unknown>, { ex: ttlSeconds })
        .catch((err) => console.warn("[cache] write failed for", key, err));

    return fresh;
}

export async function invalidateKeys(...keys: string[]): Promise<void> {
    if (!redis || keys.length === 0) return;
    try {
        await redis.del(...keys);
    } catch (err) {
        console.warn("[cache] invalidate failed for", keys.join(","), err);
    }
}

/** Invalidate every key under a literal prefix using SCAN. Safe but slow — use sparingly. */
export async function invalidatePrefix(prefix: string): Promise<void> {
    if (!redis) return;
    try {
        let cursor: string | number = 0;
        do {
            const result = (await redis.scan(cursor, {
                match: `${prefix}*`,
                count: 200,
            })) as [string, string[]];
            cursor = result[0];
            const keys = result[1];
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (String(cursor) !== "0");
    } catch (err) {
        console.warn("[cache] invalidatePrefix failed for", prefix, err);
    }
}

/** Convenience: nuke the public catalog blast radius. */
export async function invalidateCatalog(): Promise<void> {
    await invalidateKeys(CACHE_KEYS.dolls, CACHE_KEYS.collections, CACHE_KEYS.heroDoll);
    await invalidatePrefix(cacheKey("dolls", "slug"));
}

export async function invalidateSettings(): Promise<void> {
    await invalidateKeys(CACHE_KEYS.settings);
}
