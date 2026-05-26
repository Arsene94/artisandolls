import "server-only";
import { Index } from "@upstash/vector";

export type DollVectorMeta = {
    slug: string;
    name: string;
    collection: string;
    badge: string;
    availability: string;
    availableForRent: boolean;
    availableForBuy: boolean;
    buyPrice: number | null;
    height: number | null;
    tags: string[];
};

export type ShopVectorMeta = {
    slug: string;
    name: string;
    sku: string | null;
    categoryId: string | null;
    price: number;
    currency: string;
    tags: string[];
    dollModes: string[];
    inStock: boolean;
};

/**
 * The Upstash index stores both dolls and shop products. We keep a single
 * client and disambiguate by namespace (`<entity>:<locale>`). Querying with
 * `Record<string, unknown>` here keeps the index generic and lets each
 * caller assert its own metadata type at the boundary.
 */
declare global {
    // eslint-disable-next-line no-var
    var __artisanVector: Index<Record<string, unknown>> | null | undefined;
}

function buildIndex(): Index<Record<string, unknown>> | null {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) return null;
    return new Index<Record<string, unknown>>({ url, token });
}

export const vectorIndex: Index<Record<string, unknown>> | null =
    globalThis.__artisanVector !== undefined
        ? globalThis.__artisanVector
        : (globalThis.__artisanVector = buildIndex());

export function isVectorEnabled(): boolean {
    if (!vectorIndex) return false;
    if (process.env.VECTOR_SEARCH_ENABLED === "0") return false;
    return true;
}

export const VECTOR_NAMESPACES = {
    ro: "ro",
    en: "en",
    nl: "nl",
} as const;

export type VectorLocale = keyof typeof VECTOR_NAMESPACES;

export const SHOP_VECTOR_NAMESPACES = {
    ro: "shop:ro",
    en: "shop:en",
    nl: "shop:nl",
} as const;
