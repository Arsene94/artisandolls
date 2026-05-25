import "server-only";
import { authoriseUcpRequest } from "@/lib/ucp/auth";
import { buildSession } from "@/lib/ucp/serialize";
import {
    defaultExpiry,
    loadSession,
    persistSession,
} from "@/lib/ucp/sessions";
import { ucpError, ucpJson } from "@/lib/ucp/responder";
import type { UcpLineItem, UcpUpdateSessionRequest } from "@/lib/ucp/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
    const auth = await authoriseUcpRequest();
    if (!auth.ok) return ucpError(auth.status, auth.reason, "UCP request rejected");

    const { id } = await ctx.params;
    const row = await loadSession(id);
    if (!row) return ucpError(404, "session_not_found", "Unknown checkout session");

    return ucpJson(row.state, 200);
}

function asItems(
    raw: UcpUpdateSessionRequest["line_items"],
    fallback: UcpLineItem[],
): Array<{ slug: string; qty: number }> {
    const source = Array.isArray(raw) ? raw : fallback;
    return source
        .map((line) => ({
            slug: String(line.item?.id ?? "").trim(),
            qty: Math.max(1, Math.floor(line.quantity ?? 1)),
        }))
        .filter((line) => line.slug.length > 0);
}

export async function PUT(request: Request, ctx: Ctx) {
    const auth = await authoriseUcpRequest();
    if (!auth.ok) return ucpError(auth.status, auth.reason, "UCP request rejected");

    const { id } = await ctx.params;
    const row = await loadSession(id);
    if (!row) return ucpError(404, "session_not_found", "Unknown checkout session");

    if (row.status === "completed" || row.status === "canceled") {
        return ucpError(
            409,
            "session_terminal",
            "Session is in a terminal state and cannot be updated",
        );
    }

    let body: UcpUpdateSessionRequest;
    try {
        body = (await request.json()) as UcpUpdateSessionRequest;
    } catch {
        return ucpError(400, "invalid_json", "Request body must be valid JSON");
    }

    const previous = row.state;
    const items = asItems(body.line_items, previous.line_items);

    const session = await buildSession({
        sessionId: row.id,
        status: row.status,
        currency: row.currency,
        expiresAt:
            new Date(row.expires_at) > new Date()
                ? new Date(row.expires_at)
                : defaultExpiry(),
        items,
        buyer: body.buyer ?? previous.buyer,
        context: body.context ?? previous.context,
        fulfillment: body.fulfillment ?? previous.fulfillment,
        couponCode: null,
    });

    try {
        await persistSession({
            session,
            cartId: row.cart_id,
            requestProfile: auth.profile,
        });
    } catch (err) {
        console.error("[ucp/update] persist failed", err);
        return ucpError(500, "session_persist_failed", "Could not store session");
    }

    return ucpJson(session, 200);
}
