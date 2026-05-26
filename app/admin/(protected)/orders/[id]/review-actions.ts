"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { createOrFetchInvitation } from "@/lib/reviews/invitations";
import type {
    ReviewOrderType,
    ReviewTargetType,
} from "@/lib/reviews/shared";

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user)) redirect("/admin/login");
    return supabase;
}

export async function generateReviewTokenAction(input: {
    targetType: ReviewTargetType;
    targetId: string;
    orderType: ReviewOrderType;
    orderId: string;
    customerName?: string | null;
    revalidatePathArg?: string;
}): Promise<{ token: string; isNew: boolean }> {
    await requireAdmin();
    const result = await createOrFetchInvitation({
        targetType: input.targetType,
        targetId: input.targetId,
        orderType: input.orderType,
        orderId: input.orderId,
        customerName: input.customerName ?? null,
        locale: null,
    });
    if (input.revalidatePathArg) revalidatePath(input.revalidatePathArg);
    revalidatePath("/admin/reviews");
    return { token: result.token, isNew: result.isNew };
}
