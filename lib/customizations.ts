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

export async function getCustomizationGroupsWithOptionsForMode(
    mode: Exclude<CustomizationMode, "both">,
    includeInactive = false
) {
    const supabase = await createSupabaseServerClient();

    let groupsQuery = supabase
        .from("doll_customization_groups")
        .select("*")
        .in("mode", [mode, "both"])
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        groupsQuery = groupsQuery.eq("is_active", true);
    }

    const { data: groupsData, error: groupsError } = await groupsQuery;

    if (groupsError) {
        throw new Error(groupsError.message);
    }

    const groups = (groupsData ?? []) as CustomizationGroupRow[];

    if (groups.length === 0) {
        return [] as CustomizationGroupWithOptions[];
    }

    const groupIds = groups.map((group) => group.id);

    let optionsQuery = supabase
        .from("doll_customization_options")
        .select("*")
        .in("group_id", groupIds)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        optionsQuery = optionsQuery.eq("is_active", true);
    }

    const { data: optionsData, error: optionsError } = await optionsQuery;

    if (optionsError) {
        throw new Error(optionsError.message);
    }

    const options = (optionsData ?? []) as CustomizationOptionRow[];

    const optionsByGroup = new Map<string, CustomizationOptionRow[]>();

    for (const option of options) {
        const currentOptions = optionsByGroup.get(option.group_id) ?? [];
        currentOptions.push(option);
        optionsByGroup.set(option.group_id, currentOptions);
    }

    return groups.map((group) => ({
        ...group,
        options: optionsByGroup.get(group.id) ?? [],
    }));
}

export async function getAllCustomizationGroupsWithOptions(includeInactive = true) {
    const supabase = await createSupabaseServerClient();

    let groupsQuery = supabase
        .from("doll_customization_groups")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        groupsQuery = groupsQuery.eq("is_active", true);
    }

    const { data: groupsData, error: groupsError } = await groupsQuery;

    if (groupsError) {
        throw new Error(groupsError.message);
    }

    const groups = (groupsData ?? []) as CustomizationGroupRow[];

    if (groups.length === 0) {
        return [] as CustomizationGroupWithOptions[];
    }

    const groupIds = groups.map((group) => group.id);

    let optionsQuery = supabase
        .from("doll_customization_options")
        .select("*")
        .in("group_id", groupIds)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (!includeInactive) {
        optionsQuery = optionsQuery.eq("is_active", true);
    }

    const { data: optionsData, error: optionsError } = await optionsQuery;

    if (optionsError) {
        throw new Error(optionsError.message);
    }

    const options = (optionsData ?? []) as CustomizationOptionRow[];

    const optionsByGroup = new Map<string, CustomizationOptionRow[]>();

    for (const option of options) {
        const currentOptions = optionsByGroup.get(option.group_id) ?? [];
        currentOptions.push(option);
        optionsByGroup.set(option.group_id, currentOptions);
    }

    return groups.map((group) => ({
        ...group,
        options: optionsByGroup.get(group.id) ?? [],
    }));
}

export async function getCustomizationOptionById(id: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_customization_options")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as CustomizationOptionRow;
}

export async function getCustomizationGroupsWithOptionsForCatalog() {
    const [rent, buy] = await Promise.all([
        getCustomizationGroupsWithOptionsForMode("rent"),
        getCustomizationGroupsWithOptionsForMode("buy"),
    ]);

    return { rent, buy };
}
