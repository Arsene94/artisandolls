"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { clientIp } from "@/lib/upstash/identify";
import { adminLoginLimiter, blockLimit } from "@/lib/upstash/ratelimit";

export type AdminLoginState = {
    status: "idle" | "error";
    message: string | null;
};

const RATE_WAIT_MS = 4_000;

export async function signInAdminAction(
    _prev: AdminLoginState,
    formData: FormData,
): Promise<AdminLoginState> {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
        return { status: "error", message: "Completează email și parolă." };
    }

    // Brute-force pe login-ul de admin este surface-ul cel mai concret pentru
    // takeover. `blockLimit` așteaptă până la `RATE_WAIT_MS` ca un token să
    // se elibereze; după limita din `adminLoginLimiter` (5 / 15m) cere o
    // pauză. `failClosed` blochează login-urile dacă Upstash e down — preferăm
    // o oră fără admin decât o oră de brute-force liber.
    const ip = await clientIp();
    const limit = await blockLimit(
        adminLoginLimiter,
        `${ip}:${email}`,
        RATE_WAIT_MS,
    );
    if (!limit.success) {
        return {
            status: "error",
            message: "Prea multe încercări. Reîncearcă în câteva minute.",
        };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !data.user) {
        // Mesaj generic — nu confirmăm dacă email-ul există în baza de date.
        return { status: "error", message: "Email sau parolă incorectă." };
    }

    if (!isAdminUser(data.user)) {
        // Contul există, dar nu are rol admin. Curățăm sesiunea imediat ca să
        // nu rămână un cookie sb-… valid pentru un cont non-admin pe origin-ul
        // admin.
        await supabase.auth.signOut();
        return {
            status: "error",
            message: "Contul există, dar nu are rol de admin.",
        };
    }

    redirect("/admin");
}
