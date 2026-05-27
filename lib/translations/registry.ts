import "server-only";
import type { TranslatableEntity } from "@/lib/translations/shared";

/**
 * Inventarul de entități pe care le poate gestiona meniul de operațiuni
 * traduceri (`/admin/operations/translations`). Folosit pentru:
 *  - a scana sursa de adevăr (RO) și a calcula ce câmpuri lipsesc;
 *  - a (re)enqueua bulk pentru un entity_type dat;
 *  - a afișa label + tabel-țintă în UI.
 *
 * `table` e numele Supabase, `fields` sunt coloanele text-RO care se traduc.
 * Trebuie să rămână în sincron cu payload-urile din `*.actions.ts` admin —
 * cine adaugă un câmp nou la o entitate adaugă aici, altfel UI-ul îl ratează.
 */

export interface EntityRegistration {
    /** Cheia logică folosită în `content_translations.entity_type`. */
    entity: TranslatableEntity;
    /** Numele tabelului Supabase de unde citim sursa RO. */
    table: string;
    /** Label-ul afișat în UI. */
    label: string;
    /** Coloanele text care se trimit la auto-traducere. */
    fields: readonly string[];
    /** Coloană opțională pentru filtrul de "vizibil pe site" (e.g. is_active). */
    activeColumn?: string;
}

export const TRANSLATION_REGISTRY: readonly EntityRegistration[] = [
    {
        entity: "shop_category",
        table: "shop_categories",
        label: "Shop · Categorii",
        fields: ["name", "description"],
        activeColumn: "is_active",
    },
    {
        entity: "shop_product",
        table: "shop_products",
        label: "Shop · Produse",
        fields: ["name", "short_description", "description"],
        activeColumn: "is_active",
    },
    {
        entity: "faq_item",
        table: "faq_items",
        label: "FAQ",
        fields: ["question", "answer"],
        activeColumn: "is_active",
    },
    {
        entity: "blog_post",
        table: "blog_posts",
        label: "Blog",
        fields: ["title", "excerpt", "body", "seo_title", "seo_description"],
        activeColumn: "is_active",
    },
    {
        entity: "doll",
        table: "dolls",
        label: "Păpuși",
        fields: ["name", "description", "badge"],
        activeColumn: "is_active",
    },
    {
        entity: "doll_collection",
        table: "doll_collections",
        label: "Colecții",
        fields: ["name", "description", "badge"],
        activeColumn: "is_active",
    },
    {
        entity: "doll_outfit",
        table: "doll_outfits",
        label: "Ținute",
        fields: ["label", "description"],
        activeColumn: "is_active",
    },
    {
        entity: "doll_customization_group",
        table: "doll_customization_groups",
        label: "Customizări · Grupuri",
        fields: ["title", "description"],
        activeColumn: "is_active",
    },
    {
        entity: "doll_customization_option",
        table: "doll_customization_options",
        label: "Customizări · Opțiuni",
        fields: ["label", "description"],
        activeColumn: "is_active",
    },
    {
        entity: "site_offer",
        table: "site_offers",
        label: "Oferte",
        fields: ["badge_label", "title", "subtitle"],
        activeColumn: "is_active",
    },
];

export function findRegistration(
    entity: TranslatableEntity,
): EntityRegistration | undefined {
    return TRANSLATION_REGISTRY.find((r) => r.entity === entity);
}
