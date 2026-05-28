import "server-only";
import { randomBytes } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type {
    ReviewOrderType,
    ReviewTargetType,
} from "@/lib/reviews/shared";

export type ReviewInvitationInput = {
    targetType: ReviewTargetType;
    targetId: string;
    orderType: ReviewOrderType;
    orderId: string;
    customerName?: string | null;
    locale?: "ro" | "en" | "nl" | "de" | null;
};

export type ReviewInvitation = {
    id: string;
    token: string;
    status: "invited" | "pending" | "approved" | "rejected";
    /** Adevărat dacă invitația a fost creată în acest apel; fals dacă reluăm una existentă. */
    isNew: boolean;
};

// Generator URL-safe pe 24 bytes — ~192 biți, nepredictibil cryptografic.
function generateToken(): string {
    return randomBytes(24).toString("base64url");
}

/**
 * Idempotent: dacă există deja un review pentru perechea
 * (target, order) cu status în {invited, pending, approved}, îl returnăm
 * neschimbat. Asta evită spam-ul în caz de re-trigger la schimbarea repetată
 * de status sau de double-click pe butonul manual.
 *
 * Folosește service client — ocolește RLS pentru că în mod normal rândul nou
 * are status `invited` (ascuns publicului), iar callerul e deja autorizat ca
 * admin la nivel de server action.
 */
export async function createOrFetchInvitation(
    input: ReviewInvitationInput,
): Promise<ReviewInvitation> {
    const supabase = createSupabaseServiceClient();

    // 1. Caută existing pentru perechea (order_id, target_id). Filtrul pe order
    //    type previne coliziuni teoretice între un doll și un shop product cu
    //    același UUID generat (extrem de improbabil, dar tipăm strict).
    const { data: existing } = await supabase
        .from("reviews")
        .select("id, review_token, status")
        .eq("target_type", input.targetType)
        .eq("target_id", input.targetId)
        .eq("order_id", input.orderId)
        .eq("order_type", input.orderType)
        .maybeSingle();

    if (existing && existing.status !== "rejected") {
        return {
            id: existing.id as string,
            token: existing.review_token as string,
            status: existing.status as ReviewInvitation["status"],
            isNew: false,
        };
    }

    // 2. Creează rândul nou.
    const token = generateToken();
    const { data: inserted, error } = await supabase
        .from("reviews")
        .insert({
            target_type: input.targetType,
            target_id: input.targetId,
            order_type: input.orderType,
            order_id: input.orderId,
            customer_name: input.customerName ?? null,
            locale: input.locale ?? null,
            review_token: token,
            status: "invited",
        })
        .select("id")
        .single();

    if (error || !inserted) {
        throw new Error(error?.message ?? "Nu am putut crea invitația de review.");
    }

    return {
        id: inserted.id as string,
        token,
        status: "invited",
        isNew: true,
    };
}

// Helpers pure (`composeReviewMessage`, `whatsappDeepLink`) au fost mutate
// în `lib/reviews/wa-helpers.ts` ca să fie importabile din componente client
// fără să tragă acest modul `server-only` în bundle. Re-export pentru
// compat — orice cod server care le importa de aici continuă să funcționeze.
export { composeReviewMessage, whatsappDeepLink } from "@/lib/reviews/wa-helpers";
