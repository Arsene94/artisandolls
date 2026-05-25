import "server-only";
import { Client } from "@upstash/qstash";

declare global {
    // eslint-disable-next-line no-var
    var __artisanQstash: Client | null | undefined;
}

function buildClient(): Client | null {
    const token = process.env.QSTASH_TOKEN;
    if (!token) return null;
    return new Client({
        token,
        baseUrl: process.env.QSTASH_URL,
    });
}

export const qstash: Client | null =
    globalThis.__artisanQstash !== undefined
        ? globalThis.__artisanQstash
        : (globalThis.__artisanQstash = buildClient());

export function hasQstash(): boolean {
    return qstash !== null;
}

/**
 * Resolves the public base URL used as the destination for QStash callbacks.
 * QStash needs to reach an internet-facing URL, so anything localhost-y
 * disables outbound publishing.
 */
export function getCallbackBase(): string | null {
    const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (!raw) return null;
    const normalised = raw.replace(/\/$/, "");
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(normalised)) return null;
    return normalised;
}

export function buildCallbackUrl(path: string): string | null {
    const base = getCallbackBase();
    if (!base) return null;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
