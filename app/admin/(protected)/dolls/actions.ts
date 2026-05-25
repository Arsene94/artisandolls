"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import type { DollAvailability } from "@/lib/dolls";
import { invalidateCatalog } from "@/lib/upstash/cache";
import {
    deleteDollVectors,
    upsertDollVectors,
} from "@/lib/upstash/vector-sync";
import type { DollRow } from "@/lib/dolls";

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

async function revalidatePublicDollPaths(slug?: string) {
    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/nl");
    revalidatePath("/catalog");
    revalidatePath("/en/catalog");
    revalidatePath("/nl/catalog");

    if (slug) {
        revalidatePath(`/catalog/${slug}`);
        revalidatePath(`/en/catalog/${slug}`);
        revalidatePath(`/nl/catalog/${slug}`);
    }

    await invalidateCatalog();
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

async function getDollPayload(
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
    formData: FormData
) {
    const name = getString(formData, "name");
    const customSlug = getString(formData, "slug");
    const slug = slugify(customSlug || name);

    const mainImagePath = getString(formData, "main_image_path");
    const imagePaths = getStringArrayFromJson(formData, "image_paths");
    const tags = getStringArrayFromJson(formData, "tags");

    const collectionId = getString(formData, "collection_id");

    const { data: collection, error: collectionError } = await supabase
        .from("doll_collections")
        .select("id, name")
        .eq("id", collectionId)
        .single();

    if (collectionError || !collection) {
        throw new Error(collectionError?.message ?? "Colecția selectată nu a fost găsită.");
    }

    return {
        slug,
        name,
        collection_id: collection.id,
        collection: collection.name,
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
        show_on_home_hero: getBoolean(formData, "show_on_home_hero"),
        display_order: getNullableNumber(formData, "display_order") ?? 0,
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createDollAction(formData: FormData) {
    const supabase = await requireAdminSupabase();
    const payload = await getDollPayload(supabase, formData);

    if (payload.show_on_home_hero) {
        const { error: clearError } = await supabase
            .from("dolls")
            .update({ show_on_home_hero: false })
            .eq("show_on_home_hero", true);

        if (clearError) {
            throw new Error(clearError.message);
        }
    }

    const { data: inserted, error } = await supabase
        .from("dolls")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    await revalidatePublicDollPaths(payload.slug);
    revalidatePath("/admin/dolls");
    if (inserted) {
        await upsertDollVectors(inserted as DollRow);
    }

    redirect("/admin/dolls");
}

export async function updateDollAction(id: string, formData: FormData) {
    const supabase = await requireAdminSupabase();
    const payload = await getDollPayload(supabase, formData);

    if (payload.show_on_home_hero) {
        const { error: clearError } = await supabase
            .from("dolls")
            .update({ show_on_home_hero: false })
            .eq("show_on_home_hero", true)
            .neq("id", id);

        if (clearError) {
            throw new Error(clearError.message);
        }
    }

    const { data: updated, error } = await supabase
        .from("dolls")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    await revalidatePublicDollPaths(payload.slug);
    revalidatePath("/admin/dolls");
    if (updated) {
        await upsertDollVectors(updated as DollRow);
    }

    redirect("/admin/dolls");
}

export async function deleteDollAction(id: string) {
    const supabase = await requireAdminSupabase();

    const { data: existing } = await supabase
        .from("dolls")
        .select("slug")
        .eq("id", id)
        .maybeSingle();

    const { error } = await supabase
        .from("dolls")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    await revalidatePublicDollPaths();
    revalidatePath("/admin/dolls");
    if (existing?.slug) {
        await deleteDollVectors(existing.slug);
    }
}

export async function bulkDeleteDollsAction(ids: string[]) {
    const supabase = await requireAdminSupabase();

    if (ids.length === 0) {
        return;
    }

    const { data: existing } = await supabase
        .from("dolls")
        .select("slug")
        .in("id", ids);

    const { error } = await supabase
        .from("dolls")
        .delete()
        .in("id", ids);

    if (error) {
        throw new Error(error.message);
    }

    await revalidatePublicDollPaths();
    revalidatePath("/admin/dolls");
    if (existing) {
        await Promise.all(
            existing.map((row) => deleteDollVectors(row.slug as string)),
        );
    }
}
