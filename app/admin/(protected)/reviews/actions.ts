"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { invalidateReviews } from "@/lib/upstash/cache";
import type {
    ReviewOrderType,
    ReviewStatus,
    ReviewTargetType,
} from "@/lib/reviews/shared";

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user)) redirect("/admin/login");
    return { supabase, user };
}

// Tokenul e folosit într-un URL public, deci-i generăm cu un generator
// cryptografic pe 24 bytes (~192 biți de entropie, codificat URL-safe).
function generateToken(): string {
    return randomBytes(24).toString("base64url");
}

export async function createReviewInvitationAction(input: {
    targetType: ReviewTargetType;
    targetId: string;
    orderType: ReviewOrderType;
    orderId: string;
    customerName?: string | null;
    locale?: "ro" | "en" | "nl" | null;
}): Promise<{ token: string; reviewId: string }> {
    const { supabase } = await requireAdmin();

    const token = generateToken();
    const { data, error } = await supabase
        .from("reviews")
        .insert({
            target_type: input.targetType,
            target_id: input.targetId,
            review_token: token,
            order_type: input.orderType,
            order_id: input.orderId,
            customer_name: input.customerName ?? null,
            locale: input.locale ?? null,
            status: "invited" satisfies ReviewStatus,
        })
        .select("id")
        .single();

    if (error || !data) {
        throw new Error(error?.message ?? "Nu am putut crea invitația.");
    }

    revalidatePath("/admin/reviews");
    if (input.orderType === "shop_order") {
        revalidatePath(`/admin/shop/orders/${input.orderId}`);
    } else {
        revalidatePath(`/admin/orders/${input.orderId}`);
    }

    return { token, reviewId: data.id };
}

export async function approveReviewAction(id: string, formData: FormData) {
    const { supabase, user } = await requireAdmin();
    const adminNote = String(formData.get("admin_note") ?? "").trim() || null;

    const { data, error } = await supabase
        .from("reviews")
        .update({
            status: "approved",
            admin_note: adminNote,
            moderated_at: new Date().toISOString(),
            moderated_by: user.id,
        })
        .eq("id", id)
        .select("target_type, target_id")
        .single();
    if (error) throw new Error(error.message);

    revalidatePath("/admin/reviews");
    revalidatePath(`/admin/reviews/${id}`);
    if (data) {
        await invalidateReviews({
            type: data.target_type as ReviewTargetType,
            id: data.target_id as string,
        });
    }
    redirect("/admin/reviews");
}

export async function rejectReviewAction(id: string, formData: FormData) {
    const { supabase, user } = await requireAdmin();
    const adminNote = String(formData.get("admin_note") ?? "").trim() || null;

    const { data, error } = await supabase
        .from("reviews")
        .update({
            status: "rejected",
            admin_note: adminNote,
            moderated_at: new Date().toISOString(),
            moderated_by: user.id,
        })
        .eq("id", id)
        .select("target_type, target_id")
        .single();
    if (error) throw new Error(error.message);

    revalidatePath("/admin/reviews");
    revalidatePath(`/admin/reviews/${id}`);
    if (data) {
        await invalidateReviews({
            type: data.target_type as ReviewTargetType,
            id: data.target_id as string,
        });
    }
    redirect("/admin/reviews");
}

export async function deleteReviewAction(id: string) {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id)
        .select("target_type, target_id")
        .single();
    if (error) throw new Error(error.message);
    revalidatePath("/admin/reviews");
    if (data) {
        await invalidateReviews({
            type: data.target_type as ReviewTargetType,
            id: data.target_id as string,
        });
    }
}
