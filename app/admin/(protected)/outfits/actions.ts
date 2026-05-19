"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import type { OutfitMode } from "@/lib/outfits/shared";

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

function getNumber(formData: FormData, key: string) {
    const value = getString(formData, key);
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
}

function getBoolean(formData: FormData, key: string) {
    return formData.get(key) === "on";
}

function getMode(formData: FormData): OutfitMode {
    const value = getString(formData, "mode");

    if (value === "rent" || value === "buy") {
        return value;
    }

    return "both";
}

function getOutfitPayload(formData: FormData) {
    const label = getString(formData, "label");
    const customSlug = getString(formData, "slug");
    const imageValue = getNullableString(formData, "image_path");

    return {
        slug: slugify(customSlug || label),
        label,
        description: getNullableString(formData, "description"),
        mode: getMode(formData),
        price: Math.max(0, Math.round(getNumber(formData, "price"))),
        image_path: imageValue?.startsWith("http") ? null : imageValue,
        image_url: imageValue?.startsWith("http") ? imageValue : null,
        icon_name: getString(formData, "icon_name") || "hanger",
        display_order: getNumber(formData, "display_order"),
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createOutfitAction(formData: FormData) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_outfits")
        .insert(getOutfitPayload(formData));

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/outfits");
    revalidatePath("/catalog");
    redirect("/admin/outfits");
}

export async function updateOutfitAction(id: string, formData: FormData) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_outfits")
        .update(getOutfitPayload(formData))
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/outfits");
    revalidatePath("/catalog");
    redirect("/admin/outfits");
}

export async function deleteOutfitAction(id: string) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_outfits")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/outfits");
    revalidatePath("/catalog");
}

export async function bulkDeleteOutfitsAction(ids: string[]) {
    const supabase = await requireAdminSupabase();

    if (ids.length === 0) {
        return;
    }

    const { error } = await supabase
        .from("doll_outfits")
        .delete()
        .in("id", ids);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/outfits");
    revalidatePath("/catalog");
}
