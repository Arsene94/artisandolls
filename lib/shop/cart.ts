import "server-only";
import { cookies } from "next/headers";
import { redis } from "@/lib/upstash/redis";
import { validateCoupon } from "@/lib/shop/coupons";
import { getProductsBySlugs, getProductsByIds } from "@/lib/shop/products";
import {
    refreshReservation,
    releaseReservation,
} from "@/lib/shop/reservations";
import type { CouponValidation, ShopProduct } from "@/lib/shop/shared";
import { getLocale } from "next-intl/server";
import { getActiveOffers, localizeOffers } from "@/lib/offers/queries";
import { evaluateCartOffers, type OfferRow } from "@/lib/offers/shared";

const CART_COOKIE = "ad_cart_id";
const CART_COUNT_COOKIE = "ad_cart_count";
const CART_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_QTY_PER_ITEM = 20;
const MAX_DISTINCT_ITEMS = 30;

export type CartItem = {
    slug: string;
    qty: number;
    addedAt: number;
};

export type CartState = {
    id: string;
    items: CartItem[];
    couponCode?: string | null;
    updatedAt: number;
};

export type CartLine = {
    slug: string;
    qty: number;
    product: ShopProduct;
    lineTotal: number;
};

export type CartCouponSnapshot = {
    code: string;
    couponId: string | null;
    type: CouponValidation["type"];
    discountAmount: number;
    description: string | null;
    error: CouponValidation["error"];
    ok: boolean;
};

export type CartGiftProduct = {
    slug: string;
    name: string;
    image: string | null;
};

export type CartOfferProgress = {
    remaining: number;
    offer: OfferRow;
};

export type CartSummary = {
    id: string;
    lines: CartLine[];
    missingSlugs: string[];
    subtotal: number;
    /** Effective discount applied to the total (max of coupon vs offer). */
    discountAmount: number;
    /** Which source produced `discountAmount`. */
    discountSource: "coupon" | "offer" | null;
    total: number;
    currency: string;
    itemCount: number;
    distinctCount: number;
    coupon: CartCouponSnapshot | null;
    /** Auto-discount offer that currently applies (if it won over the coupon). */
    discountOffer: OfferRow | null;
    offerDiscountAmount: number;
    /** Free-gift offer whose threshold is met. */
    giftOffer: OfferRow | null;
    giftProduct: CartGiftProduct | null;
    /** Nearest unmet threshold, for the "spend X more to get Y" hint. */
    offerProgress: CartOfferProgress | null;
};

const EMPTY_CART_SUMMARY: CartSummary = {
    id: "",
    lines: [],
    missingSlugs: [],
    subtotal: 0,
    discountAmount: 0,
    discountSource: null,
    total: 0,
    currency: "RON",
    itemCount: 0,
    distinctCount: 0,
    coupon: null,
    discountOffer: null,
    offerDiscountAmount: 0,
    giftOffer: null,
    giftProduct: null,
    offerProgress: null,
};

function cartKey(id: string): string {
    return `artisandolls:shop:cart:${id}`;
}

function newCartId(): string {
    return globalThis.crypto.randomUUID();
}

async function loadCart(id: string): Promise<CartState | null> {
    if (!redis) return null;
    try {
        const raw = await redis.get<CartState>(cartKey(id));
        if (!raw) return null;
        return raw;
    } catch (err) {
        console.warn("[shop/cart] load failed", id, err);
        return null;
    }
}

async function persistCart(state: CartState): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(cartKey(state.id), state, { ex: CART_TTL_SECONDS });
    } catch (err) {
        console.warn("[shop/cart] persist failed", state.id, err);
    }
}

async function setCartCookies(state: CartState | null): Promise<void> {
    const store = await cookies();
    if (!state) {
        store.delete(CART_COOKIE);
        store.delete(CART_COUNT_COOKIE);
        return;
    }
    const count = state.items.reduce((sum, item) => sum + item.qty, 0);
    store.set(CART_COOKIE, state.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: CART_TTL_SECONDS,
    });
    store.set(CART_COUNT_COOKIE, String(count), {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: CART_TTL_SECONDS,
    });
}

/** Returns the current cart id (cookie) without creating one. */
export async function getCartId(): Promise<string | null> {
    const store = await cookies();
    return store.get(CART_COOKIE)?.value ?? null;
}

async function ensureCart(): Promise<CartState> {
    const existingId = await getCartId();
    if (existingId) {
        const state = await loadCart(existingId);
        if (state) return state;
    }
    const fresh: CartState = {
        id: existingId ?? newCartId(),
        items: [],
        updatedAt: Date.now(),
    };
    await persistCart(fresh);
    await setCartCookies(fresh);
    return fresh;
}

export async function getCart(): Promise<CartState | null> {
    const id = await getCartId();
    if (!id) return null;
    return loadCart(id);
}

export async function getCartSummary(): Promise<CartSummary> {
    const state = await getCart();
    if (!state || state.items.length === 0) return EMPTY_CART_SUMMARY;

    const slugs = state.items.map((item) => item.slug);
    const products = await getProductsBySlugs(slugs);
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const lines: CartLine[] = [];
    const missingSlugs: string[] = [];

    for (const item of state.items) {
        const product = bySlug.get(item.slug);
        if (!product) {
            missingSlugs.push(item.slug);
            continue;
        }
        const qty = Math.min(item.qty, MAX_QTY_PER_ITEM);
        lines.push({
            slug: item.slug,
            qty,
            product,
            lineTotal: product.price * qty,
        });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const currency = lines[0]?.product.currency ?? "RON";

    let coupon: CartCouponSnapshot | null = null;
    let discountAmount = 0;
    if (state.couponCode) {
        const categoryIds = Array.from(
            new Set(
                lines
                    .map((line) => line.product.categoryId)
                    .filter((id): id is string => Boolean(id)),
            ),
        );
        const validation = await validateCoupon(
            state.couponCode,
            subtotal,
            categoryIds,
        );
        coupon = {
            code: validation.code,
            couponId: validation.couponId,
            type: validation.type,
            discountAmount: validation.discountAmount,
            description: validation.description,
            error: validation.error,
            ok: validation.ok,
        };
        if (validation.ok) {
            discountAmount = Math.min(subtotal, validation.discountAmount);
        }
    }

    // Automatic offers. Evaluated against the same lines; the discount-bearing
    // offer competes with the coupon (no stacking — the larger discount wins).
    const rawOffers = await getActiveOffers().catch(() => [] as OfferRow[]);
    // Overlay localized badge/title copy so the offer label surfaced in the
    // cart summary matches the shopper's locale. getLocale() is request-scoped;
    // every getCartSummary caller runs under the [locale] segment.
    const locale = await getLocale().catch(() => "ro");
    const offers = await localizeOffers(rawOffers, locale).catch(() => rawOffers);
    const evalLines = lines.map((line) => ({
        categoryId: line.product.categoryId,
        unitPrice: line.product.price,
        qty: line.qty,
    }));
    const offerResult = evaluateCartOffers(offers, evalLines, subtotal);
    const offerDiscountAmount = Math.min(subtotal, offerResult.discountAmount);

    let giftProduct: CartGiftProduct | null = null;
    if (offerResult.giftProductId) {
        const [gift] = await getProductsByIds([offerResult.giftProductId]).catch(
            () => [] as ShopProduct[],
        );
        if (gift) {
            giftProduct = { slug: gift.slug, name: gift.name, image: gift.image };
        }
    }

    const couponDiscount = discountAmount;
    let discountSource: "coupon" | "offer" | null = null;
    let effectiveDiscount = 0;
    if (couponDiscount >= offerDiscountAmount && couponDiscount > 0) {
        discountSource = "coupon";
        effectiveDiscount = couponDiscount;
    } else if (offerDiscountAmount > 0) {
        discountSource = "offer";
        effectiveDiscount = offerDiscountAmount;
    }

    const total = Math.max(0, subtotal - effectiveDiscount);

    return {
        id: state.id,
        lines,
        missingSlugs,
        subtotal,
        discountAmount: effectiveDiscount,
        discountSource,
        total,
        currency,
        itemCount: lines.reduce((sum, line) => sum + line.qty, 0),
        distinctCount: lines.length,
        coupon,
        discountOffer: discountSource === "offer" ? offerResult.discountOffer : null,
        offerDiscountAmount,
        giftOffer: offerResult.giftOffer,
        giftProduct,
        offerProgress: offerResult.progress
            ? {
                  remaining: offerResult.progress.remaining,
                  offer:
                      offers.find((o) => o.id === offerResult.progress!.offerId) ??
                      offerResult.discountOffer ??
                      offerResult.giftOffer!,
              }
            : null,
    };
}

export async function applyCoupon(
    code: string,
): Promise<{
    ok: boolean;
    state: CartState | null;
    validation: CouponValidation;
}> {
    const trimmed = code.trim();
    const state = await getCart();
    if (!state || state.items.length === 0) {
        return {
            ok: false,
            state,
            validation: {
                ok: false,
                couponId: null,
                code: trimmed,
                type: null,
                discountAmount: 0,
                description: null,
                error: "subtotal_too_low",
            },
        };
    }

    const slugs = state.items.map((item) => item.slug);
    const products = await getProductsBySlugs(slugs);
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const subtotal = state.items.reduce((sum, item) => {
        const product = bySlug.get(item.slug);
        if (!product) return sum;
        return sum + product.price * Math.min(item.qty, MAX_QTY_PER_ITEM);
    }, 0);
    const categoryIds = Array.from(
        new Set(
            products
                .map((product) => product.categoryId)
                .filter((id): id is string => Boolean(id)),
        ),
    );

    const validation = await validateCoupon(trimmed, subtotal, categoryIds);
    if (!validation.ok) {
        return { ok: false, state, validation };
    }

    const next: CartState = {
        ...state,
        couponCode: validation.code,
        updatedAt: Date.now(),
    };
    await persistCart(next);
    await setCartCookies(next);
    return { ok: true, state: next, validation };
}

export async function removeCoupon(): Promise<CartState | null> {
    const state = await getCart();
    if (!state) return null;
    if (!state.couponCode) return state;
    const next: CartState = {
        ...state,
        couponCode: null,
        updatedAt: Date.now(),
    };
    await persistCart(next);
    await setCartCookies(next);
    return next;
}

function mergeItem(
    items: CartItem[],
    slug: string,
    qty: number,
): { items: CartItem[]; ok: boolean; reason?: string } {
    const existing = items.find((i) => i.slug === slug);
    if (existing) {
        const nextQty = Math.min(MAX_QTY_PER_ITEM, existing.qty + qty);
        if (nextQty === existing.qty) {
            return { items, ok: false, reason: "limit_reached" };
        }
        return {
            items: items.map((i) =>
                i.slug === slug ? { ...i, qty: nextQty, addedAt: Date.now() } : i,
            ),
            ok: true,
        };
    }
    if (items.length >= MAX_DISTINCT_ITEMS) {
        return { items, ok: false, reason: "cart_full" };
    }
    return {
        items: [
            ...items,
            { slug, qty: Math.min(qty, MAX_QTY_PER_ITEM), addedAt: Date.now() },
        ],
        ok: true,
    };
}

async function commit(next: CartState): Promise<CartState> {
    await persistCart(next);
    await setCartCookies(next);
    await refreshReservation(next.id, next.items);
    return next;
}

export async function addToCart(
    slug: string,
    qty: number,
): Promise<{ ok: boolean; reason?: string; cart: CartState }> {
    const normalisedQty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, Math.floor(qty)));
    const state = await ensureCart();
    const result = mergeItem(state.items, slug, normalisedQty);
    if (!result.ok) {
        return { ok: false, reason: result.reason, cart: state };
    }
    const next: CartState = {
        ...state,
        items: result.items,
        updatedAt: Date.now(),
    };
    return { ok: true, cart: await commit(next) };
}

export async function updateCartQty(
    slug: string,
    qty: number,
): Promise<CartState | null> {
    const state = await getCart();
    if (!state) return null;
    const normalisedQty = Math.max(0, Math.min(MAX_QTY_PER_ITEM, Math.floor(qty)));
    let nextItems: CartItem[];
    if (normalisedQty === 0) {
        nextItems = state.items.filter((i) => i.slug !== slug);
    } else {
        const existing = state.items.find((i) => i.slug === slug);
        if (!existing) return state;
        nextItems = state.items.map((i) =>
            i.slug === slug ? { ...i, qty: normalisedQty } : i,
        );
    }
    const next: CartState = {
        ...state,
        items: nextItems,
        updatedAt: Date.now(),
    };
    return commit(next);
}

export async function removeFromCart(slug: string): Promise<CartState | null> {
    return updateCartQty(slug, 0);
}

export async function clearCart(): Promise<void> {
    const id = await getCartId();
    if (id) {
        if (redis) {
            try {
                await redis.del(cartKey(id));
            } catch (err) {
                console.warn("[shop/cart] delete failed", id, err);
            }
        }
        await releaseReservation(id);
    }
    await setCartCookies(null);
}
