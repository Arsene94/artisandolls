import { timingSafeEqual } from "node:crypto";

/**
 * Compară două șiruri în timp constant. Întoarce `false` și pentru lungimi
 * diferite (timingSafeEqual aruncă altfel). Folosește-l pentru orice secret
 * partajat verificat la marginea unei rute API: header-uri „x-internal-...",
 * token-uri din query string, API keys etc.
 */
export function constantTimeEqual(a: string, b: string): boolean {
    try {
        const ab = Buffer.from(a, "utf8");
        const bb = Buffer.from(b, "utf8");
        if (ab.length !== bb.length) return false;
        return timingSafeEqual(ab, bb);
    } catch {
        return false;
    }
}
