"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { invalidateShopCache } from "@/lib/shop/products";
import {
    deleteShopProductVectors,
    upsertShopProductVectors,
} from "@/lib/upstash/shop-vector-sync";
import type { ShopOrderStatus, ShopProductRow } from "@/lib/shop/shared";
import { enqueueEntityTranslations } from "@/lib/translations/queue";

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user)) redirect("/admin/login");
    return supabase;
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}
function getNullableString(formData: FormData, key: string) {
    return getString(formData, key) || null;
}
function getNumber(formData: FormData, key: string, fallback = 0) {
    const raw = getString(formData, key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function getNullableNumber(formData: FormData, key: string) {
    const raw = getString(formData, key);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}
function getBoolean(formData: FormData, key: string) {
    return formData.get(key) === "on";
}
function getStringArray(formData: FormData, key: string) {
    const raw = getString(formData, key);
    if (!raw) return [];
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

/** Accept either a JSON array (from the new gallery uploader) or a CSV string. */
function getJsonOrCsvArray(formData: FormData, key: string) {
    const raw = getString(formData, key);
    if (!raw) return [];
    if (raw.startsWith("[")) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item) => String(item).trim())
                    .filter(Boolean);
            }
        } catch {
            // fall through to CSV
        }
    }
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

async function revalidateShopPaths() {
    revalidatePath("/shop");
    revalidatePath("/en/shop");
    revalidatePath("/nl/shop");
    revalidatePath("/admin/shop/products");
    revalidatePath("/admin/shop/categories");
    await invalidateShopCache();
}

// ─── Categories ────────────────────────────────────────────────────

function categoryPayload(formData: FormData) {
    const name = getString(formData, "name");
    const customSlug = getString(formData, "slug");
    return {
        slug: slugify(customSlug || name),
        name,
        name_en: getNullableString(formData, "name_en"),
        name_nl: getNullableString(formData, "name_nl"),
        description: getNullableString(formData, "description"),
        description_en: getNullableString(formData, "description_en"),
        description_nl: getNullableString(formData, "description_nl"),
        badge: getNullableString(formData, "badge"),
        image_path: getNullableString(formData, "image_path"),
        display_order: getNumber(formData, "display_order"),
        is_active: getBoolean(formData, "is_active"),
    };
}

function categoryTranslatableFields(payload: ReturnType<typeof categoryPayload>) {
    return [
        { key: "name", value: payload.name },
        { key: "description", value: payload.description },
    ];
}

export async function createCategoryAction(formData: FormData) {
    const supabase = await requireAdmin();
    const payload = categoryPayload(formData);
    if (!payload.name) throw new Error("Numele este obligatoriu.");
    const { data: inserted, error } = await supabase
        .from("shop_categories")
        .insert(payload)
        .select("id")
        .single();
    if (error) throw new Error(error.message);
    await revalidateShopPaths();
    if (inserted?.id) {
        await enqueueEntityTranslations({
            entity: "shop_category",
            entityId: inserted.id as string,
            fields: categoryTranslatableFields(payload),
        });
    }
    redirect("/admin/shop/categories");
}

export async function updateCategoryAction(id: string, formData: FormData) {
    const supabase = await requireAdmin();
    const payload = categoryPayload(formData);
    if (!payload.name) throw new Error("Numele este obligatoriu.");
    const { error } = await supabase
        .from("shop_categories")
        .update(payload)
        .eq("id", id);
    if (error) throw new Error(error.message);
    await revalidateShopPaths();
    await enqueueEntityTranslations({
        entity: "shop_category",
        entityId: id,
        fields: categoryTranslatableFields(payload),
    });
    redirect("/admin/shop/categories");
}

export async function deleteCategoryAction(id: string) {
    const supabase = await requireAdmin();
    const { error } = await supabase
        .from("shop_categories")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    await revalidateShopPaths();
}

// ─── Products ──────────────────────────────────────────────────────

function parseVariantAxes(raw: string): Record<string, string> | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            const out: Record<string, string> = {};
            for (const [k, v] of Object.entries(parsed)) {
                const key = String(k).trim();
                if (!key) continue;
                out[key] = String(v).trim();
            }
            return Object.keys(out).length > 0 ? out : null;
        }
    } catch {
        // Acceptăm și forma „size: L; color: red" pentru când admin-ul nu vrea JSON.
        const pairs = raw
            .split(/[;\n]+/)
            .map((p) => p.split(":").map((s) => s.trim()))
            .filter((pair) => pair.length === 2 && pair[0] && pair[1]);
        if (pairs.length > 0) {
            return Object.fromEntries(pairs) as Record<string, string>;
        }
    }
    return null;
}

function productPayload(formData: FormData) {
    const name = getString(formData, "name");
    const customSlug = getString(formData, "slug");
    return {
        slug: slugify(customSlug || name),
        sku: getNullableString(formData, "sku"),
        name,
        short_description: getNullableString(formData, "short_description"),
        description: getNullableString(formData, "description"),
        brand: getNullableString(formData, "brand"),
        category_id: getNullableString(formData, "category_id"),
        main_image_path: getNullableString(formData, "main_image_path"),
        image_paths: getJsonOrCsvArray(
            formData,
            formData.get("image_paths_json") !== null
                ? "image_paths_json"
                : "image_paths",
        ),
        price: getNumber(formData, "price"),
        compare_at_price: getNullableNumber(formData, "compare_at_price"),
        currency: getString(formData, "currency") || "RON",
        stock_quantity: getNumber(formData, "stock_quantity"),
        low_stock_threshold: getNumber(formData, "low_stock_threshold", 5),
        track_stock: getBoolean(formData, "track_stock"),
        weight_grams: getNullableNumber(formData, "weight_grams"),
        tags: getStringArray(formData, "tags"),
        doll_modes: getStringArray(formData, "doll_modes"),
        age_restricted: getBoolean(formData, "age_restricted"),
        is_featured: getBoolean(formData, "is_featured"),
        is_active: getBoolean(formData, "is_active"),
        display_order: getNumber(formData, "display_order"),
        variant_group_id: getNullableString(formData, "variant_group_id"),
        variant_axes: parseVariantAxes(getString(formData, "variant_axes")),
        variant_label: getNullableString(formData, "variant_label"),
    };
}

function productTranslatableFields(payload: ReturnType<typeof productPayload>) {
    return [
        { key: "name", value: payload.name },
        { key: "short_description", value: payload.short_description },
        { key: "description", value: payload.description },
    ];
}

export async function createProductAction(formData: FormData) {
    const supabase = await requireAdmin();
    const payload = productPayload(formData);
    if (!payload.name) throw new Error("Numele este obligatoriu.");
    const { data: inserted, error } = await supabase
        .from("shop_products")
        .insert(payload)
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    await revalidateShopPaths();
    if (inserted) {
        await upsertShopProductVectors(inserted as ShopProductRow);
        await enqueueEntityTranslations({
            entity: "shop_product",
            entityId: (inserted as ShopProductRow).id,
            fields: productTranslatableFields(payload),
        });
    }
    redirect("/admin/shop/products");
}

export async function updateProductAction(id: string, formData: FormData) {
    const supabase = await requireAdmin();
    const payload = productPayload(formData);
    if (!payload.name) throw new Error("Numele este obligatoriu.");
    const { data: updated, error } = await supabase
        .from("shop_products")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
    if (error) throw new Error(error.message);
    await revalidateShopPaths();
    if (updated) {
        await upsertShopProductVectors(updated as ShopProductRow);
    }
    await enqueueEntityTranslations({
        entity: "shop_product",
        entityId: id,
        fields: productTranslatableFields(payload),
    });
    redirect("/admin/shop/products");
}

export async function deleteProductAction(id: string) {
    const supabase = await requireAdmin();
    const { data: existing } = await supabase
        .from("shop_products")
        .select("slug")
        .eq("id", id)
        .maybeSingle();
    const { error } = await supabase
        .from("shop_products")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    await revalidateShopPaths();
    if (existing?.slug) {
        await deleteShopProductVectors(existing.slug as string);
    }
}

// ─── Shop coupons ─────────────────────────────────────────────────

const COUPON_TYPES = ["percentage", "fixed", "free_shipping"] as const;
type CouponType = (typeof COUPON_TYPES)[number];

function getCouponType(formData: FormData): CouponType {
    const raw = getString(formData, "type");
    return (COUPON_TYPES as readonly string[]).includes(raw)
        ? (raw as CouponType)
        : "percentage";
}

function getTimestamp(formData: FormData, key: string): string | null {
    const raw = getString(formData, key);
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

const COUPON_SCOPES = ["shop", "dolls", "both"] as const;
type CouponScope = (typeof COUPON_SCOPES)[number];

function getCouponScope(formData: FormData): CouponScope {
    const raw = getString(formData, "applies_to");
    return (COUPON_SCOPES as readonly string[]).includes(raw)
        ? (raw as CouponScope)
        : "shop";
}

const DISCOUNT_BASES = ["total", "base", "extras"] as const;
type DiscountBase = (typeof DISCOUNT_BASES)[number];

function getDiscountBase(formData: FormData): DiscountBase {
    const raw = getString(formData, "doll_discount_base");
    return (DISCOUNT_BASES as readonly string[]).includes(raw)
        ? (raw as DiscountBase)
        : "total";
}

/** All checked values of a same-named checkbox group (getAll, not get). */
function getCheckboxValues(formData: FormData, key: string): string[] {
    return formData
        .getAll(key)
        .map((value) => String(value).trim())
        .filter(Boolean);
}

function getDollModes(formData: FormData): string[] {
    return getCheckboxValues(formData, "doll_modes").filter(
        (mode) => mode === "rent" || mode === "buy",
    );
}

function couponPayload(formData: FormData) {
    const rawCode = getString(formData, "code");
    const scope = getCouponScope(formData);
    return {
        code: rawCode.toUpperCase(),
        type: getCouponType(formData),
        value: Math.max(0, getNumber(formData, "value")),
        max_discount: getNullableNumber(formData, "max_discount"),
        min_subtotal: Math.max(0, getNumber(formData, "min_subtotal")),
        currency: getString(formData, "currency") || "RON",
        description: getNullableString(formData, "description"),
        starts_at: getTimestamp(formData, "starts_at"),
        expires_at: getTimestamp(formData, "expires_at"),
        max_redemptions: getNullableNumber(formData, "max_redemptions"),
        applies_to_categories: getCheckboxValues(formData, "applies_to_categories"),
        applies_to: scope,
        doll_modes: scope === "shop" ? [] : getDollModes(formData),
        doll_discount_base: getDiscountBase(formData),
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createCouponAction(formData: FormData) {
    const supabase = await requireAdmin();
    const payload = couponPayload(formData);
    if (!payload.code) throw new Error("Codul este obligatoriu.");
    const { error } = await supabase.from("shop_coupons").insert(payload);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/shop/coupons");
    redirect("/admin/shop/coupons");
}

export async function updateCouponAction(id: string, formData: FormData) {
    const supabase = await requireAdmin();
    const payload = couponPayload(formData);
    if (!payload.code) throw new Error("Codul este obligatoriu.");
    const { error } = await supabase
        .from("shop_coupons")
        .update(payload)
        .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/shop/coupons");
    redirect("/admin/shop/coupons");
}

export async function deleteCouponAction(id: string) {
    const supabase = await requireAdmin();
    const { error } = await supabase
        .from("shop_coupons")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/shop/coupons");
}

// ─── Shop orders ───────────────────────────────────────────────────

const VALID_STATUSES: ShopOrderStatus[] = [
    "new",
    "in_review",
    "confirmed",
    "packing",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
    "refunded",
];

const SHOP_DELIVERED_STATUSES: ShopOrderStatus[] = ["delivered", "completed"];

export async function updateShopOrderStatusAction(
    id: string,
    status: ShopOrderStatus,
) {
    if (!VALID_STATUSES.includes(status)) {
        throw new Error("Status invalid.");
    }
    const supabase = await requireAdmin();
    const { error } = await supabase
        .from("shop_orders")
        .update({ status })
        .eq("id", id);
    if (error) throw new Error(error.message);

    if (SHOP_DELIVERED_STATUSES.includes(status)) {
        // Generăm invitații de review pentru fiecare produs din comandă. Lazy
        // import — evităm încărcarea modulului review-invitations la fiecare hit
        // pe actions.ts când nu e nevoie de el (e folosit doar pe terminale).
        try {
            const { data: lines } = await supabase
                .from("shop_order_items")
                .select("product_id")
                .eq("order_id", id);
            const { data: order } = await supabase
                .from("shop_orders")
                .select("customer_name")
                .eq("id", id)
                .maybeSingle();
            if (Array.isArray(lines) && lines.length > 0) {
                const { createOrFetchInvitation } = await import(
                    "@/lib/reviews/invitations"
                );
                for (const line of lines) {
                    if (typeof line.product_id !== "string") continue;
                    await createOrFetchInvitation({
                        targetType: "shop_product",
                        targetId: line.product_id,
                        orderType: "shop_order",
                        orderId: id,
                        customerName:
                            typeof order?.customer_name === "string"
                                ? order.customer_name
                                : null,
                    }).catch((err) => {
                        console.warn(
                            "[reviews] shop invitation auto-create failed",
                            id,
                            line.product_id,
                            err,
                        );
                    });
                }
            }
        } catch (err) {
            console.warn("[reviews] shop invitations bulk failed", id, err);
        }
    }

    revalidatePath("/admin/shop/orders");
    revalidatePath(`/admin/shop/orders/${id}`);
}
