import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { constantTimeEqual } from "@/lib/secrets/compare";
import {
    deleteDollVectors,
    upsertDollVectors,
} from "@/lib/upstash/vector-sync";
import type { DollRow } from "@/lib/dolls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload =
    | { type: "upsert"; slug: string }
    | { type: "delete"; slug: string };

function authorise(request: Request): boolean {
    const expected = process.env.INTERNAL_WEBHOOK_SECRET;
    if (!expected) return false;
    const provided = request.headers.get("x-internal-secret") ?? "";
    return constantTimeEqual(provided, expected);
}

export async function POST(request: Request) {
    if (!authorise(request)) {
        return new Response("Unauthorized", { status: 401 });
    }

    const payload = (await request.json().catch(() => null)) as Payload | null;
    if (!payload || !payload.type || !payload.slug) {
        return new Response("Bad request", { status: 400 });
    }

    if (payload.type === "delete") {
        await deleteDollVectors(payload.slug);
        return Response.json({ ok: true });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
        .from("dolls")
        .select("*")
        .eq("slug", payload.slug)
        .single();

    if (error || !data) {
        return new Response("Not found", { status: 404 });
    }

    await upsertDollVectors(data as DollRow);
    return Response.json({ ok: true });
}
