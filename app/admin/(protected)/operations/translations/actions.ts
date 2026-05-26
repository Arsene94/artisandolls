"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import {
    enqueueAllScope,
    enqueueEntityScope,
    getOperationsSnapshot,
    type EnqueueResult,
    type EnqueueScope,
    type OperationsSnapshot,
} from "@/lib/translations/operations";
import { findRegistration } from "@/lib/translations/registry";
import type { TranslatableEntity } from "@/lib/translations/shared";

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user)) redirect("/admin/login");
}

const VALID_SCOPES: ReadonlySet<EnqueueScope> = new Set<EnqueueScope>([
    "missing",
    "all",
    "retry-failed",
]);

function parseScope(raw: unknown): EnqueueScope {
    return typeof raw === "string" && VALID_SCOPES.has(raw as EnqueueScope)
        ? (raw as EnqueueScope)
        : "missing";
}

export async function fetchTranslationOpsSnapshot(): Promise<OperationsSnapshot> {
    await requireAdmin();
    return getOperationsSnapshot();
}

export async function enqueueAllTranslationsAction(
    formData: FormData,
): Promise<void> {
    await requireAdmin();
    const scope = parseScope(formData.get("scope"));
    await enqueueAllScope(scope);
    revalidatePath("/admin/operations/translations");
}

export async function enqueueEntityTranslationsAction(
    formData: FormData,
): Promise<void> {
    await requireAdmin();
    const entity = formData.get("entity");
    const scope = parseScope(formData.get("scope"));
    if (typeof entity !== "string" || !findRegistration(entity as TranslatableEntity)) {
        throw new Error("Entitate invalidă.");
    }
    await enqueueEntityScope(entity as TranslatableEntity, scope);
    revalidatePath("/admin/operations/translations");
}

/**
 * Variantă fetch-only pentru client-side polling — nu reia auth complet
 * pentru a ține poll-ul ieftin. Foloșește același helper de snapshot.
 */
export async function pollTranslationOpsSnapshot(): Promise<OperationsSnapshot> {
    await requireAdmin();
    return getOperationsSnapshot();
}

export type TranslationOpsActionResult = EnqueueResult[];
