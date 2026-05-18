"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import type { DollAvailability } from "@/lib/dolls";

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

function getStringArrayFromJson(formData: FormData, key: string) {
    const raw = getString(formData, key);

    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((item) => String(item).trim())
            .filter(Boolean);
    } catch {
        return [];
    }
}

function getDollPayload(formData: FormData) {
    const name = getString(formData, "name");
    const customSlug = getString(formData, "slug");
    const slug = slugify(customSlug || name);

    const mainImagePath = getString(formData, "main_image_path");
    const imagePaths = getStringArrayFromJson(formData, "image_paths");
    const tags = getStringArrayFromJson(formData, "tags");

    return {
        slug,
        name,
        collection: getString(formData, "collection"),
        description: getString(formData, "description"),
        main_image_path: mainImagePath,
        image_paths: imagePaths,
        badge: getString(formData, "badge"),
        availability: getString(formData, "availability") as DollAvailability,
        available_for_rent: getBoolean(formData, "available_for_rent"),
        available_for_buy: getBoolean(formData, "available_for_buy"),
        rent_price_per_day: getNullableNumber(formData, "rent_price_per_day"),
        buy_price: getNullableNumber(formData, "buy_price"),
        tags,
        display_order: getNullableNumber(formData, "display_order") ?? 0,
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createDollAction(formData: FormData) {
    const supabase = await requireAdminSupabase();
    const payload = getDollPayload(formData);

    const { error } = await supabase.from("dolls").insert(payload);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/catalog");
    revalidatePath("/admin/dolls");

    redirect("/admin/dolls");
}

export async function updateDollAction(id: string, formData: FormData) {
    const supabase = await requireAdminSupabase();
    const payload = getDollPayload(formData);

    const { error } = await supabase
        .from("dolls")
        .update(payload)
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/catalog");
    revalidatePath(`/catalog/${payload.slug}`);
    revalidatePath("/admin/dolls");

    redirect("/admin/dolls");
}

export async function deleteDollAction(id: string) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("dolls")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/catalog");
    revalidatePath("/admin/dolls");
}

export async function bulkDeleteDollsAction(ids: string[]) {
    const supabase = await requireAdminSupabase();

    if (ids.length === 0) {
        return;
    }

    const { error } = await supabase
        .from("dolls")
        .delete()
        .in("id", ids);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/catalog");
    revalidatePath("/admin/dolls");
}
