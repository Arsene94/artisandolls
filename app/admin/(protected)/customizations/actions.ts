"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import type {
    CustomizationMode,
    CustomizationSelectionType,
} from "@/lib/customizations/shared";

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

function getMode(formData: FormData): CustomizationMode {
    const value = getString(formData, "mode");

    if (value === "rent" || value === "buy") {
        return value;
    }

    return "both";
}

function getSelectionType(formData: FormData): CustomizationSelectionType {
    return getString(formData, "selection_type") === "single" ? "single" : "multiple";
}

function getGroupPayload(formData: FormData) {
    const title = getString(formData, "title");
    const customSlug = getString(formData, "slug");

    return {
        slug: slugify(customSlug || title),
        title,
        description: getNullableString(formData, "description"),
        mode: getMode(formData),
        selection_type: getSelectionType(formData),
        icon_name: getString(formData, "icon_name") || "sparkles",
        display_order: getNumber(formData, "display_order"),
        is_active: getBoolean(formData, "is_active"),
    };
}

function getOptionPayload(groupId: string, formData: FormData) {
    const label = getString(formData, "label");
    const customSlug = getString(formData, "slug");

    return {
        group_id: groupId,
        slug: slugify(customSlug || label),
        label,
        description: getNullableString(formData, "description"),
        price: Math.max(0, Math.round(getNumber(formData, "price"))),
        icon_name: getString(formData, "icon_name") || "circle",
        icon_color: getNullableString(formData, "icon_color"),
        swatch_color: getNullableString(formData, "swatch_color"),
        display_order: getNumber(formData, "display_order"),
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createCustomizationGroupAction(formData: FormData) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_customization_groups")
        .insert(getGroupPayload(formData));

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customizations");
    revalidatePath("/catalog");
    redirect("/admin/customizations");
}

export async function updateCustomizationGroupAction(id: string, formData: FormData) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_customization_groups")
        .update(getGroupPayload(formData))
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customizations");
    revalidatePath("/catalog");
    redirect("/admin/customizations");
}

export async function deleteCustomizationGroupAction(id: string) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_customization_groups")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customizations");
    revalidatePath("/catalog");
}

export async function createCustomizationOptionAction(groupId: string, formData: FormData) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_customization_options")
        .insert(getOptionPayload(groupId, formData));

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customizations");
    revalidatePath(`/admin/customizations/${groupId}`);
    revalidatePath("/catalog");
}

export async function updateCustomizationOptionAction(optionId: string, formData: FormData) {
    const supabase = await requireAdminSupabase();

    const groupId = getString(formData, "group_id");

    const { error } = await supabase
        .from("doll_customization_options")
        .update(getOptionPayload(groupId, formData))
        .eq("id", optionId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customizations");
    revalidatePath("/catalog");
}

export async function deleteCustomizationOptionAction(optionId: string) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("doll_customization_options")
        .delete()
        .eq("id", optionId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customizations");
    revalidatePath("/catalog");
}
