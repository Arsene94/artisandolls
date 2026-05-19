export type OutfitMode = "rent" | "buy" | "both";

export type OutfitRow = {
    id: string;
    slug: string;
    label: string;
    description: string | null;
    mode: OutfitMode;
    price: number;
    image_path: string | null;
    image_url: string | null;
    icon_name: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type OutfitOptionForCatalog = {
    id: string;
    label: string;
    description: string;
    price: number;
    image: string;
    icon_name: string;
};

export function formatOutfitMode(mode: OutfitMode) {
    if (mode === "rent") return "Închiriere";
    if (mode === "buy") return "Cumpărare";
    return "Ambele";
}

export function getOutfitImage(outfit: Pick<OutfitRow, "image_path" | "image_url">) {
    return outfit.image_path || outfit.image_url || "";
}
