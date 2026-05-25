import "server-only";
import { headers } from "next/headers";
import { authoriseUcpRequest } from "@/lib/ucp/auth";
import { lookupIdempotency, storeIdempotency } from "@/lib/ucp/idempotency";
import { buildSession } from "@/lib/ucp/serialize";
import {
    defaultExpiry,
    newSessionId,
    persistSession,
} from "@/lib/ucp/sessions";
import { ucpError, ucpJson } from "@/lib/ucp/responder";
import type { UcpCreateSessionRequest } from "@/lib/ucp/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickItems(req: UcpCreateSessionRequest) {
    if (!Array.isArray(req.line_items)) return [];
    return req.line_items
        .map((line) => ({
            slug: String(line.item?.id ?? "").trim(),
            qty: Math.max(1, Math.floor(line.quantity ?? 1)),
        }))
        .filter((item) => item.slug.length > 0);
}

export async function POST(request: Request) {
    const auth = await authoriseUcpRequest();
    if (!auth.ok) {
        return ucpError(auth.status, auth.reason, "UCP request rejected");
    }

    const h = await headers();
    const idempotencyKey = h.get("idempotency-key");

    if (idempotencyKey) {
        const cached = await lookupIdempotency(`POST:checkout-sessions:${idempotencyKey}`);
        if (cached) {
            return new Response(JSON.stringify(cached.response), {
                status: cached.status_code,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    let body: UcpCreateSessionRequest;
    try {
        body = (await request.json()) as UcpCreateSessionRequest;
    } catch {
        return ucpError(400, "invalid_json", "Request body must be valid JSON");
    }

    const items = pickItems(body);
    if (items.length === 0) {
        return ucpError(400, "missing_line_items", "At least one line_item is required");
    }

    const sessionId = newSessionId();
    const session = await buildSession({
        sessionId,
        status: "incomplete",
        currency: "RON",
        expiresAt: defaultExpiry(),
        items,
        buyer: body.buyer,
        context: body.context,
    });

    try {
        await persistSession({
            session,
            requestProfile: auth.profile,
            idempotencyKey,
        });
    } catch (err) {
        console.error("[ucp/create] persist failed", err);
        return ucpError(500, "session_persist_failed", "Could not store session");
    }

    if (idempotencyKey) {
        await storeIdempotency(
            `POST:checkout-sessions:${idempotencyKey}`,
            session,
            201,
        );
    }

    return ucpJson(session, 201);
}
