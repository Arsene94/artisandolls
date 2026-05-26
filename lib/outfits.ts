import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
    OutfitMode,
    OutfitOptionForCatalog,
    OutfitRow,
} from "@/lib/outfits/shared";
import { getOutfitImage } from "@/lib/outfits/shared";
import type { Locale } from "@/i18n/routing";
import { getEntityTranslations } from "@/lib/translations/store";

export type {
    OutfitMode,
    OutfitOptionForCatalog,
    OutfitRow,
} from "@/lib/outfits/shared";

export {
    formatOutfitMode,
    getOutfitImage,
} from "@/lib/outfits/shared";

export async function getOutfitRows(includeInactive = false) {
    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from("doll_outfits")
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

    return (data ?? []) as OutfitRow[];
}

export async function getOutfitBySlug(slug: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_outfits")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        return null;
    }

    return data as OutfitRow;
}

export async function getOutfitById(id: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("doll_outfits")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as OutfitRow;
}

export async function getOutfitsForMode(
    mode: Exclude<OutfitMode, "both">,
    locale?: Locale,
) {
    const rows = await getOutfitRows(false);
    const filtered = rows.filter(
        (outfit) => outfit.mode === mode || outfit.mode === "both",
    );
    const translations =
        locale && locale !== "ro"
            ? await getEntityTranslations(
                  "doll_outfit",
                  filtered.map((o) => o.id),
                  locale,
              )
            : new Map<string, Record<string, string>>();

    return filtered.map<OutfitOptionForCatalog>((outfit) => {
        const t = translations.get(outfit.id);
        return {
            id: outfit.id,
            label: t?.label?.trim() || outfit.label,
            description: t?.description?.trim() || outfit.description || "",
            price: outfit.price,
            image: getOutfitImage(outfit),
            icon_name: outfit.icon_name,
        };
    });
}

export async function getOutfitsForCatalog(locale?: Locale) {
    const [rent, buy] = await Promise.all([
        getOutfitsForMode("rent", locale),
        getOutfitsForMode("buy", locale),
    ]);

    return { rent, buy };
}
