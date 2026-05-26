import "server-only";
import { handle } from "@upstash/realtime";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { realtime } from "@/lib/upstash/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stream-ul SSE emite evenimente `new-order` cu nume client + total. E un
// canal exclusiv pentru dashboard-ul admin: gate-uim explicit pe rol înainte
// să predăm conexiunea către handler-ul Upstash, altfel orice vizitator
// neautentificat poate observa volumul de comenzi în timp real.
async function isAdminRequest(): Promise<boolean> {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return Boolean(user && isAdminUser(user));
    } catch {
        return false;
    }
}

export async function GET(request: Request): Promise<Response> {
    if (!realtime) {
        // Când realtime nu e configurat, 404 — clientul `useRealtime` reîncearcă
        // silențios, exact comportamentul dorit în dev.
        return new Response(null, { status: 404 });
    }

    if (!(await isAdminRequest())) {
        return new Response(null, { status: 401 });
    }

    const response = await handle({ realtime })(request);
    return response ?? new Response(null, { status: 204 });
}
