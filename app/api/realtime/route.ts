import "server-only";
import { handle } from "@upstash/realtime";
import { realtime } from "@/lib/upstash/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// When realtime is not configured the handler 404s — the client hook
// retries silently, which is the behaviour we want during local dev.
export const GET = realtime
    ? handle({ realtime })
    : async () => new Response(null, { status: 404 });
