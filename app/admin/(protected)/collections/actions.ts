"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import type { CollectionType } from "@/lib/collections/shared";

async function requireAdminSupabase() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
        redirect("/admin/login");
    }

    return supabase;
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
    const value = getString(formData, key);
    return value || null;
}

function getNullableNumber(formData: FormData, key: string) {
    const value = getString(formData, key);

    if (!value) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

function getBoolean(formData: FormData, key: string) {
    return formData.get(key) === "on";
}

function getCollectionType(formData: FormData): CollectionType {
    const value = getString(formData, "type");

    return value === "series" ? "series" : "category";
}

function getCollectionPayload(formData: FormData) {
    const name = getString(formData, "name");
    const customSlug = getString(formData, "slug");
    const imageValue = getNullableString(formData, "image_path");

    return {
        slug: slugify(customSlug || name),
        name,
        type: getCollectionType(formData),
        description: getNullableString(formData, "description"),
        badge: getNullableString(formData, "badge"),
        image_path: imageValue?.startsWith("http") ? null : imageValue,
        image_url: imageValue?.startsWith("http") ? imageValue : null,
        display_order: getNullableNumber(formData, "display_order") ?? 0,
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createCollectionAction(formData: FormData) {
    const supabase = await requireAdminSupabase();
    const payload = getCollectionPayload(formData);

    const { error } = await supabase
        .from("doll_collections")
        .insert(payload);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/collections");
    revalidatePath("/admin/dolls");
    revalidatePath("/catalog");

    redirect("/admin/collections");
}

export async function updateCollectionAction(id: string, formData: FormData) {
    const supabase = await requireAdminSupabase();
    const payload = getCollectionPayload(formData);

    const { error } = await supabase
        .from("doll_collections")
        .update(payload)
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    await supabase
        .from("dolls")
        .update({
            collection: payload.name,
        })
        .eq("collection_id", id);

    revalidatePath("/admin/collections");
    revalidatePath("/admin/dolls");
    revalidatePath("/catalog");

    redirect("/admin/collections");
}

export async function deleteCollectionAction(id: string) {
    const supabase = await requireAdminSupabase();

    const { count, error: countError } = await supabase
        .from("dolls")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", id);

    if (countError) {
        throw new Error(countError.message);
    }

    if ((count ?? 0) > 0) {
        throw new Error("Colecția nu poate fi ștearsă pentru că are păpuși asociate.");
    }

    const { error } = await supabase
        .from("doll_collections")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/collections");
    revalidatePath("/admin/dolls");
    revalidatePath("/catalog");
}

export async function bulkDeleteCollectionsAction(ids: string[]) {
    const supabase = await requireAdminSupabase();

    if (ids.length === 0) {
        return;
    }

    const { count, error: countError } = await supabase
        .from("dolls")
        .select("id", { count: "exact", head: true })
        .in("collection_id", ids);

    if (countError) {
        throw new Error(countError.message);
    }

    if ((count ?? 0) > 0) {
        throw new Error("Unele colecții au păpuși asociate. Mută păpușile înainte să ștergi colecțiile.");
    }

    const { error } = await supabase
        .from("doll_collections")
        .delete()
        .in("id", ids);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/collections");
    revalidatePath("/admin/dolls");
    revalidatePath("/catalog");
}
