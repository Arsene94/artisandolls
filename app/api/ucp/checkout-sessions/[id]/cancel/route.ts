import "server-only";
import { authoriseUcpRequest } from "@/lib/ucp/auth";
import { loadSession, persistSession } from "@/lib/ucp/sessions";
import { ucpError, ucpJson } from "@/lib/ucp/responder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
    const auth = await authoriseUcpRequest();
    if (!auth.ok) return ucpError(auth.status, auth.reason, "UCP request rejected");

    const { id } = await ctx.params;
    const row = await loadSession(id);
    if (!row) return ucpError(404, "session_not_found", "Unknown checkout session");

    if (row.status === "completed" || row.status === "canceled") {
        return ucpError(
            409,
            "session_terminal",
            "Session is already in a terminal state",
        );
    }

    const session = {
        ...row.state,
        status: "canceled" as const,
        messages: undefined,
    };

    await persistSession({
        session,
        cartId: row.cart_id,
        requestProfile: auth.profile,
    });

    return ucpJson(session, 200);
}
