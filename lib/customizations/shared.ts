export type CustomizationMode = "rent" | "buy" | "both";
export type CustomizationSelectionType = "single" | "multiple";

export type CustomizationOptionRow = {
    id: string;
    group_id: string;
    slug: string;
    label: string;
    description: string | null;
    price: number;
    icon_name: string;
    icon_color: string | null;
    swatch_color: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type CustomizationGroupRow = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    mode: CustomizationMode;
    selection_type: CustomizationSelectionType;
    icon_name: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type CustomizationGroupWithOptions = CustomizationGroupRow & {
    options: CustomizationOptionRow[];
};

export function formatCustomizationMode(mode: CustomizationMode) {
    if (mode === "rent") return "Închiriere";
    if (mode === "buy") return "Cumpărare";
    return "Ambele";
}

export function formatSelectionType(type: CustomizationSelectionType) {
    return type === "single" ? "O singură alegere" : "Alegere multiplă";
}
