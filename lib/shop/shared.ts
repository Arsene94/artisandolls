export type ShopOrderStatus =
    | "new"
    | "in_review"
    | "confirmed"
    | "packing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded";

export type ShopCategoryRow = {
    id: string;
    slug: string;
    name: string;
    name_en: string | null;
    name_nl: string | null;
    description: string | null;
    description_en: string | null;
    description_nl: string | null;
    badge: string | null;
    image_path: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type ShopCategory = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    badge: string | null;
    image: string | null;
};

export type ShopProductRow = {
    id: string;
    slug: string;
    sku: string | null;
    name: string;
    short_description: string | null;
    description: string | null;
    brand: string | null;
    main_image_path: string | null;
    image_paths: string[];
    price: number;
    compare_at_price: number | null;
    currency: string;
    stock_quantity: number;
    low_stock_threshold: number;
    track_stock: boolean;
    weight_grams: number | null;
    tags: string[];
    doll_modes: string[];
    age_restricted: boolean;
    is_featured: boolean;
    is_active: boolean;
    display_order: number;
    category_id: string | null;
    variant_group_id: string | null;
    variant_axes: Record<string, string> | null;
    variant_label: string | null;
    created_at: string;
    updated_at: string;
};

export type ShopProduct = {
    id: string;
    slug: string;
    sku: string | null;
    name: string;
    shortDescription: string | null;
    description: string | null;
    brand: string | null;
    image: string | null;
    images: string[];
    price: number;
    compareAtPrice: number | null;
    currency: string;
    stockQuantity: number;
    /** stock_quantity minus the sum of soft reservations across active carts */
    availableQuantity: number;
    trackStock: boolean;
    tags: string[];
    dollModes: string[];
    isFeatured: boolean;
    isInStock: boolean;
    categoryId: string | null;
    variantGroupId: string | null;
    variantAxes: Record<string, string> | null;
    variantLabel: string | null;
};

export function mapCategoryRow(row: ShopCategoryRow): ShopCategory {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        badge: row.badge,
        image: row.image_path,
    };
}

export function mapProductRow(row: ShopProductRow): ShopProduct {
    return {
        id: row.id,
        slug: row.slug,
        sku: row.sku,
        name: row.name,
        shortDescription: row.short_description,
        description: row.description,
        brand: row.brand,
        image: row.main_image_path,
        images: row.image_paths ?? [],
        price: row.price,
        compareAtPrice: row.compare_at_price,
        currency: row.currency,
        stockQuantity: row.stock_quantity,
        availableQuantity: row.track_stock ? row.stock_quantity : Number.MAX_SAFE_INTEGER,
        trackStock: row.track_stock,
        tags: row.tags ?? [],
        dollModes: row.doll_modes ?? [],
        isFeatured: row.is_featured,
        isInStock: !row.track_stock || row.stock_quantity > 0,
        categoryId: row.category_id,
        variantGroupId: row.variant_group_id,
        variantAxes: row.variant_axes,
        variantLabel: row.variant_label,
    };
}

/**
 * Apply the live reservation totals on top of a product (or a list of
 * products) loaded from the database. Reservations come from
 * `reservedTotals()` in `lib/shop/reservations.ts`.
 */
export function applyReservations(
    products: ShopProduct[],
    reserved: Map<string, number>,
): ShopProduct[] {
    return products.map((product) => {
        if (!product.trackStock) return product;
        const taken = reserved.get(product.slug) ?? 0;
        if (taken <= 0) return product;
        const available = Math.max(0, product.stockQuantity - taken);
        return {
            ...product,
            availableQuantity: available,
            isInStock: available > 0,
        };
    });
}

export function localizedCategoryName(
    row: Pick<ShopCategoryRow, "name" | "name_en" | "name_nl">,
    locale: string,
): string {
    if (locale === "en" && row.name_en) return row.name_en;
    if (locale === "nl" && row.name_nl) return row.name_nl;
    return row.name;
}

export function localizedCategoryDescription(
    row: Pick<ShopCategoryRow, "description" | "description_en" | "description_nl">,
    locale: string,
): string | null {
    if (locale === "en" && row.description_en) return row.description_en;
    if (locale === "nl" && row.description_nl) return row.description_nl;
    return row.description;
}

export type ShopCouponType = "percentage" | "fixed" | "free_shipping";

/** Which product surface a coupon may be redeemed on. */
export type CouponScope = "shop" | "dolls" | "both";

/** Doll order mode a coupon is limited to. Empty array == all modes. */
export type CouponDollMode = "rent" | "buy";

/** What part of a doll order the discount applies to. */
export type CouponDiscountBase = "total" | "base" | "extras";

export type ShopCouponRow = {
    id: string;
    code: string;
    type: ShopCouponType;
    value: number;
    max_discount: number | null;
    min_subtotal: number;
    currency: string;
    description: string | null;
    starts_at: string | null;
    expires_at: string | null;
    max_redemptions: number | null;
    redemptions_count: number;
    applies_to_categories: string[];
    applies_to: CouponScope;
    doll_modes: CouponDollMode[];
    doll_discount_base: CouponDiscountBase;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type CouponError =
    | "not_found"
    | "not_started"
    | "expired"
    | "exhausted"
    | "subtotal_too_low"
    | "category_mismatch"
    | "inactive";

export type CouponValidation = {
    ok: boolean;
    couponId: string | null;
    code: string;
    type: ShopCouponType | null;
    discountAmount: number;
    description: string | null;
    error: CouponError | null;
};

/** Doll coupons add a mode restriction on top of the shop error set. */
export type DollCouponError = CouponError | "mode_mismatch";

export type DollCouponValidation = {
    ok: boolean;
    couponId: string | null;
    code: string;
    type: ShopCouponType | null;
    /** Raw coupon value: the percent (0–100) or the fixed amount. */
    value: number | null;
    discountBase: CouponDiscountBase | null;
    discountAmount: number;
    description: string | null;
    error: DollCouponError | null;
};

export const SHOP_ORDER_STATUS_OPTIONS: Array<{
    value: ShopOrderStatus;
    label: string;
    description: string;
}> = [
    { value: "new", label: "Cerere nouă", description: "Comandă proaspăt înregistrată." },
    { value: "in_review", label: "În verificare", description: "Verificăm stocul și detaliile clientului." },
    { value: "confirmed", label: "Confirmată", description: "Confirmată cu clientul, urmează împachetarea." },
    { value: "packing", label: "Împachetare", description: "Produsele sunt împachetate discret." },
    { value: "shipped", label: "Expediată", description: "Coletul a plecat către client." },
    { value: "delivered", label: "Livrată", description: "Coletul a ajuns la client." },
    { value: "completed", label: "Finalizată", description: "Tranzacție închisă, plata confirmată." },
    { value: "cancelled", label: "Anulată", description: "Comandă anulată." },
    { value: "refunded", label: "Rambursată", description: "Banii au fost restituiți." },
];
