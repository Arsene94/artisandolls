import "server-only";
import { redis } from "@/lib/upstash/redis";
import type { CartItem } from "@/lib/shop/cart";

const RESERVATION_TTL_SECONDS = 60 * 30; // 30 min
const SCAN_BATCH = 200;
const RESERVATION_PREFIX = "artisandolls:shop:reservation:";

function key(cartId: string): string {
    return `${RESERVATION_PREFIX}${cartId}`;
}

/**
 * Overwrite the cart's reservation snapshot. Called from every cart mutation
 * — the truth is the cart state itself, not an incremental ledger, which
 * keeps recovery trivial.
 */
export async function refreshReservation(
    cartId: string,
    items: readonly CartItem[],
): Promise<void> {
    if (!redis) return;
    const hashKey = key(cartId);
    try {
        if (items.length === 0) {
            await redis.del(hashKey);
            return;
        }
        const snapshot = Object.fromEntries(
            items.map((item) => [item.slug, item.qty]),
        );
        // pipeline: replace contents + reset TTL atomically
        const pipe = redis.pipeline();
        pipe.del(hashKey);
        pipe.hset(hashKey, snapshot);
        pipe.expire(hashKey, RESERVATION_TTL_SECONDS);
        await pipe.exec();
    } catch (err) {
        console.warn("[shop/reserve] refresh failed", cartId, err);
    }
}

export async function releaseReservation(cartId: string): Promise<void> {
    if (!redis) return;
    try {
        await redis.del(key(cartId));
    } catch (err) {
        console.warn("[shop/reserve] release failed", cartId, err);
    }
}

/**
 * Sum reservations across all live carts. Implemented via SCAN to avoid
 * blocking Redis. At our scale (a few hundred carts at most) this stays
 * comfortably below the 1000-ops Upstash free tier window.
 *
 * If a specific subset of slugs is requested, the result only contains
 * those keys (zero-value entries are omitted).
 */
export async function reservedTotals(
    slugs?: readonly string[],
): Promise<Map<string, number>> {
    const totals = new Map<string, number>();
    if (!redis) return totals;

    const wanted = slugs && slugs.length > 0 ? new Set(slugs) : null;

    try {
        let cursor: string | number = 0;
        do {
            const [next, keys] = (await redis.scan(cursor, {
                match: `${RESERVATION_PREFIX}*`,
                count: SCAN_BATCH,
            })) as [string, string[]];
            cursor = next;

            if (keys.length === 0) continue;

            const pipe = redis.pipeline();
            for (const k of keys) {
                pipe.hgetall(k);
            }
            const responses = (await pipe.exec()) as Array<Record<
                string,
                string | number
            > | null>;

            for (const response of responses) {
                if (!response) continue;
                for (const [slug, raw] of Object.entries(response)) {
                    if (wanted && !wanted.has(slug)) continue;
                    const qty = typeof raw === "number" ? raw : Number(raw);
                    if (!Number.isFinite(qty) || qty <= 0) continue;
                    totals.set(slug, (totals.get(slug) ?? 0) + qty);
                }
            }
        } while (String(cursor) !== "0");
    } catch (err) {
        console.warn("[shop/reserve] aggregate failed", err);
    }

    return totals;
}

/**
 * Reservation snapshot for one specific cart, used at checkout to subtract
 * the user's own reservation before validating availability.
 */
export async function reservationForCart(
    cartId: string,
): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    if (!redis) return result;
    try {
        const raw = (await redis.hgetall(key(cartId))) as Record<
            string,
            string | number
        > | null;
        if (!raw) return result;
        for (const [slug, value] of Object.entries(raw)) {
            const qty = typeof value === "number" ? value : Number(value);
            if (Number.isFinite(qty) && qty > 0) result.set(slug, qty);
        }
    } catch (err) {
        console.warn("[shop/reserve] read cart reservation failed", cartId, err);
    }
    return result;
}
