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
