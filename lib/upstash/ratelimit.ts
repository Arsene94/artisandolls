import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/upstash/redis";

const ephemeralCache = new Map<string, number>();

function build(prefix: string, limit: Ratelimit["limiter"]): Ratelimit | null {
    if (!redis) return null;
    return new Ratelimit({
        redis,
        prefix,
        limiter: limit,
        analytics: true,
        ephemeralCache,
    });
}

export const ageGateLimiter = build(
    "rl:age-gate",
    Ratelimit.slidingWindow(10, "1 h"),
);

export const orderLimiter = build(
    "rl:order",
    Ratelimit.slidingWindow(3, "10 m"),
);

export const contactLimiter = build(
    "rl:contact",
    Ratelimit.slidingWindow(5, "1 h"),
);

export const inquiryLimiter = build(
    "rl:inquiry",
    Ratelimit.slidingWindow(10, "1 h"),
);

export const adminLoginLimiter = build(
    "rl:admin-login",
    Ratelimit.slidingWindow(5, "15 m"),
);

export type LimitResult = {
    success: boolean;
    /** True when Upstash was unreachable. */
    degraded: boolean;
    /** Epoch ms when the next token frees up. 0 when allowed or degraded. */
    reset: number;
    remaining: number;
};

const ALLOW: LimitResult = { success: true, degraded: false, reset: 0, remaining: -1 };
const DEGRADED_OPEN: LimitResult = {
    success: true,
    degraded: true,
    reset: 0,
    remaining: -1,
};
const DEGRADED_CLOSED: LimitResult = {
    success: false,
    degraded: true,
    reset: Date.now() + 5_000,
    remaining: 0,
};

/**
 * Run a limiter with explicit fail-open/closed policy. Default is fail-open
 * so a transient Upstash outage never makes the public site unusable; pass
 * `{ failClosed: true }` for security-critical surfaces (admin login).
 */
export async function safeLimit(
    limiter: Ratelimit | null,
    identifier: string,
    opts: { failClosed?: boolean } = {},
): Promise<LimitResult> {
    if (!limiter) return ALLOW;
    try {
        const r = await limiter.limit(identifier);
        return {
            success: r.success,
            degraded: false,
            reset: r.reset,
            remaining: r.remaining,
        };
    } catch (err) {
        console.error("[ratelimit] Upstash failure on", identifier, err);
        return opts.failClosed ? DEGRADED_CLOSED : DEGRADED_OPEN;
    }
}

/**
 * Slow brute-force on admin login by waiting up to `timeoutMs` for a token
 * before rejecting. Only use on low-traffic, security-critical endpoints.
 */
export async function blockLimit(
    limiter: Ratelimit | null,
    identifier: string,
    timeoutMs: number,
): Promise<LimitResult> {
    if (!limiter) return ALLOW;
    try {
        const r = await limiter.blockUntilReady(identifier, timeoutMs);
        return {
            success: r.success,
            degraded: false,
            reset: r.reset,
            remaining: r.remaining,
        };
    } catch (err) {
        console.error("[ratelimit] blockUntilReady failed on", identifier, err);
        return DEGRADED_CLOSED;
    }
}
