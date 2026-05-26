import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";
import {
    mapReviewRowToPublic,
    computeAggregate,
    type Review,
    type ReviewAggregate,
    type ReviewRow,
    type ReviewStatus,
    type ReviewTargetType,
} from "@/lib/reviews/shared";

const PUBLIC_TTL = 300;

const PUBLIC_COLUMNS = `
    id,
    target_type,
    target_id,
    review_token,
    order_type,
    order_id,
    rating,
    title,
    body,
    customer_name,
    customer_initials,
    locale,
    status,
    admin_note,
    invited_at,
    submitted_at,
    moderated_at,
    moderated_by,
    expires_at,
    created_at,
    updated_at
`;

export async function getApprovedReviewsForTarget(
    target_type: ReviewTargetType,
    target_id: string,
): Promise<{ reviews: Review[]; aggregate: ReviewAggregate | null }> {
    const rows = await cached(
        CACHE_KEYS.reviewsByTarget(target_type, target_id),
        PUBLIC_TTL,
        async () => {
            const supabase = createSupabaseServiceClient();
            const { data, error } = await supabase
                .from("reviews")
                .select(PUBLIC_COLUMNS)
                .eq("target_type", target_type)
                .eq("target_id", target_id)
                .eq("status", "approved")
                .order("submitted_at", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false })
                .limit(30);
            if (error || !data) return [] as ReviewRow[];
            return data as ReviewRow[];
        },
    );

    const reviews = rows
        .map((row) => mapReviewRowToPublic(row))
        .filter((r): r is Review => r !== null);

    return {
        reviews,
        aggregate: computeAggregate(reviews),
    };
}

/** Admin-only — bypass RLS, returnează toate review-urile (orice status). */
export async function getReviewsForAdmin(
    statusFilter?: ReviewStatus,
): Promise<ReviewRow[]> {
    const supabase = await createSupabaseServerClient();
    let query = supabase
        .from("reviews")
        .select(PUBLIC_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200);
    if (statusFilter) {
        query = query.eq("status", statusFilter);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data as ReviewRow[];
}

export async function getReviewByToken(token: string): Promise<ReviewRow | null> {
    // Token-ul e nepredictibil; folosim service client pentru că pagina publică
    // are nevoie să vadă statusul `invited` și `pending` (acolo redirectăm
    // utilizatorul). Validarea acoperă scoping-ul.
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
        .from("reviews")
        .select(PUBLIC_COLUMNS)
        .eq("review_token", token)
        .maybeSingle();
    if (error || !data) return null;
    return data as ReviewRow;
}

export async function getReviewByIdForAdmin(id: string): Promise<ReviewRow | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("reviews")
        .select(PUBLIC_COLUMNS)
        .eq("id", id)
        .maybeSingle();
    if (error || !data) return null;
    return data as ReviewRow;
}
