import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
    CustomizationGroupRow,
    CustomizationGroupWithOptions,
    CustomizationMode,
    CustomizationOptionRow,
} from "@/lib/customizations/shared";

export type {
    CustomizationGroupRow,
    CustomizationGroupWithOptions,
    CustomizationMode,
    CustomizationOptionRow,
    CustomizationSelectionType,
} from "@/lib/customizations/shared";

export {
    formatCustomizationMode,
    formatSelectionType,
} from "@/lib/customizations/shared";

export async function getCustomizationGroups(includeInactive = false) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("doll_customization_groups")
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

    return (data ?? []) as CustomizationGroupRow[];
}

export async function getCustomizationGroupBySlug(slug: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_customization_groups")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        return null;
    }

    return data as CustomizationGroupRow;
}

export async function getCustomizationOptionsByGroup(groupId: string, includeInactive = false) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("doll_customization_options")
        .select("*")
        .eq("group_id", groupId)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []) as CustomizationOptionRow[];
}

export async function getCustomizationGroupsWithOptionsForMode(mode: Exclude<CustomizationMode, "both">) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_customization_groups")
        .select(`
            *,
            options:doll_customization_options(*)
        `)
        .eq("is_active", true)
        .in("mode", [mode, "both"])
        .order("display_order", { ascending: true })
        .order("display_order", {
            ascending: true,
            referencedTable: "doll_customization_options",
        });

    if (error) {
        throw new Error(error.message);
    }

    return ((data ?? []) as CustomizationGroupWithOptions[]).map((group) => ({
        ...group,
        options: (group.options ?? [])
            .filter((option) => option.is_active)
            .sort((a, b) => a.display_order - b.display_order),
    }));
}

export async function getCustomizationGroupsWithOptionsForCatalog() {
    const [rent, buy] = await Promise.all([
        getCustomizationGroupsWithOptionsForMode("rent"),
        getCustomizationGroupsWithOptionsForMode("buy"),
    ]);

    return { rent, buy };
}
