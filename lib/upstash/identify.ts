import "server-only";
import { headers } from "next/headers";

/** Best-effort client IP from common reverse-proxy headers. */
export async function clientIp(): Promise<string> {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }
    return (
        h.get("x-real-ip") ||
        h.get("cf-connecting-ip") ||
        h.get("fly-client-ip") ||
        "127.0.0.1"
    );
}

/** Stable identifier for a phone number across formatting variations. */
export function normalisePhone(raw: string): string {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return "";
    // RO local numbers without country prefix → assume +40
    if (digits.length === 10 && digits.startsWith("0")) {
        return `40${digits.slice(1)}`;
    }
    return digits;
}
