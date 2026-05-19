import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CollectionType = "category" | "series";

export type CollectionRow = {
    id: string;
    slug: string;
    name: string;
    type: CollectionType;
    description: string | null;
    badge: string | null;
    image_path: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export function formatCollectionType(type: CollectionType) {
    return type === "series" ? "Serie" : "Categorie";
}

export async function getCollectionRows(includeInactive = false) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("doll_collections")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as CollectionRow[];
}

export async function getCollectionRowBySlug(slug: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_collections")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        return null;
    }

    return data as CollectionRow;
}
