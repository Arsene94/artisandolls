import "server-only";
import { Redis } from "@upstash/redis";

declare global {
    // eslint-disable-next-line no-var
    var __artisanRedis: Redis | null | undefined;
    // eslint-disable-next-line no-var
    var __artisanRedisChecked: boolean | undefined;
}

function buildClient(): Redis | null {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
        if (!globalThis.__artisanRedisChecked && process.env.NODE_ENV !== "production") {
            console.warn(
                "[upstash] UPSTASH_REDIS_REST_URL / TOKEN missing — cache & ratelimit run in degraded fallback mode",
            );
            globalThis.__artisanRedisChecked = true;
        }
        return null;
    }
    return new Redis({ url, token });
}

export const redis: Redis | null =
    globalThis.__artisanRedis !== undefined
        ? globalThis.__artisanRedis
        : (globalThis.__artisanRedis = buildClient());

export function hasRedis(): boolean {
    return redis !== null;
}
