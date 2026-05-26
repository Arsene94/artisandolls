"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { invalidateReviews } from "@/lib/upstash/cache";
import { orderLimiter } from "@/lib/upstash/ratelimit";

// Inițiale curățate: 1-3 caractere alfa, fără spații. Folosit ca etichetă
// publică a recenziei când clientul nu vrea să apară numele complet.
function deriveInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .filter(Boolean)
        .join("")
        .slice(0, 3)
        .toUpperCase();
}

function clampRating(raw: FormDataEntryValue | null): number | null {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    if (n < 1 || n > 5) return null;
    return Math.round(n);
}

function clampText(raw: FormDataEntryValue | null, max: number): string {
    const str = (typeof raw === "string" ? raw : "").trim();
    return str.slice(0, max);
}

export type SubmitReviewState = {
    status: "idle" | "ok" | "error";
    message: string | null;
};

export async function submitReviewAction(
    token: string,
    _prev: SubmitReviewState,
    formData: FormData,
): Promise<SubmitReviewState> {
    if (!token || typeof token !== "string" || token.length < 16) {
        return { status: "error", message: "Token invalid." };
    }

    // Rate-limit pe IP — folosim limiter-ul shared cu order-flow ca să nu
    // adăugăm încă un namespace Upstash. Vot dublu accidental e blocat oricum
    // prin verificarea de status mai jos.
    if (orderLimiter) {
        const ratelimitKey = `review:${token}`;
        const { success } = await orderLimiter.limit(ratelimitKey);
        if (!success) {
            return {
                status: "error",
                message: "Prea multe încercări. Reîncearcă în câteva minute.",
            };
        }
    }

    const rating = clampRating(formData.get("rating"));
    const body = clampText(formData.get("body"), 4000);
    const title = clampText(formData.get("title"), 120) || null;
    const customerName = clampText(formData.get("customer_name"), 80) || null;
    const usePublicName = formData.get("public_name") === "on";

    if (rating === null) {
        return { status: "error", message: "Selectează un punctaj între 1 și 5 stele." };
    }
    if (body.length < 30) {
        return {
            status: "error",
            message: "Recenzia trebuie să aibă cel puțin 30 de caractere.",
        };
    }

    const supabase = createSupabaseServiceClient();
    const { data: existing, error: fetchError } = await supabase
        .from("reviews")
        .select("id, status, target_type, target_id, expires_at")
        .eq("review_token", token)
        .maybeSingle();

    if (fetchError || !existing) {
        return { status: "error", message: "Linkul nu mai este valid." };
    }
    if (new Date(existing.expires_at).getTime() < Date.now()) {
        return { status: "error", message: "Linkul a expirat. Contactează-ne pentru altul." };
    }
    if (existing.status !== "invited" && existing.status !== "pending") {
        return {
            status: "error",
            message: "Recenzia a fost deja trimisă și e în moderare sau publicată.",
        };
    }

    const initials = customerName ? deriveInitials(customerName) : null;

    const { error: updateError } = await supabase
        .from("reviews")
        .update({
            rating,
            title,
            body,
            customer_name: usePublicName ? customerName : null,
            customer_initials: initials,
            status: "pending",
            submitted_at: new Date().toISOString(),
        })
        .eq("review_token", token);

    if (updateError) {
        return { status: "error", message: "Eroare la salvare. Încearcă din nou." };
    }

    revalidatePath(`/review/${token}`);
    await invalidateReviews({
        type: existing.target_type as "doll" | "shop_product",
        id: existing.target_id as string,
    });

    return { status: "ok", message: null };
}
