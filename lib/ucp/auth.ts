import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getPlatformSettings } from "@/lib/settings";
import { constantTimeEqual } from "@/lib/secrets/compare";

export type UcpAuthFailure = { ok: false; status: 401 | 403; reason: string };
export type UcpAuthSuccess = { ok: true; profile: string | null };

function hashKey(value: string): string {
    return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Verifies the inbound UCP REST call:
 *   1. UCP must be enabled in platform_settings
 *   2. The X-API-Key header (or Authorization: Bearer …) must match the
 *      hashed key persisted by the admin.
 *
 * Returns `{ ok: false }` with a status code the caller should mirror, or
 * `{ ok: true, profile }` carrying the validated UCP-Agent profile.
 */
export async function authoriseUcpRequest(): Promise<UcpAuthFailure | UcpAuthSuccess> {
    let settings;
    try {
        settings = await getPlatformSettings();
    } catch {
        return { ok: false, status: 403, reason: "ucp_settings_unavailable" };
    }

    if (!settings.ucp_enabled || settings.shop_checkout_mode !== "ucp") {
        return { ok: false, status: 403, reason: "ucp_disabled" };
    }

    const expectedHash = settings.ucp_api_key_hash;
    if (!expectedHash) {
        return { ok: false, status: 403, reason: "ucp_no_api_key" };
    }

    const h = await headers();
    const directKey = h.get("x-api-key") ?? "";
    const bearer = (h.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const supplied = directKey || bearer;

    if (!supplied) {
        return { ok: false, status: 401, reason: "missing_credentials" };
    }

    if (!constantTimeEqual(hashKey(supplied), expectedHash)) {
        return { ok: false, status: 401, reason: "invalid_api_key" };
    }

    return {
        ok: true,
        profile: parseUcpAgent(h.get("ucp-agent")),
    };
}

/** Returns the `profile` value from a Structured Field per RFC 8941. */
function parseUcpAgent(raw: string | null): string | null {
    if (!raw) return null;
    const match = raw.match(/profile\s*=\s*"([^"]+)"/i);
    return match ? match[1] : null;
}

export { hashKey as hashUcpApiKey };
