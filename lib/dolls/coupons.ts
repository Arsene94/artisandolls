import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { CatalogMode } from "@/lib/dolls";
import type {
    CouponDiscountBase,
    DollCouponValidation,
    ShopCouponType,
} from "@/lib/shop/shared";

type ValidationRow = {
    id: string | null;
    code: string | null;
    type: ShopCouponType | null;
    value: number | null;
    max_discount: number | null;
    description: string | null;
    discount_base: CouponDiscountBase | null;
    discount_amount: number | null;
    error: string | null;
};

const EMPTY: DollCouponValidation = {
    ok: false,
    couponId: null,
    code: "",
    type: null,
    value: null,
    discountBase: null,
    discountAmount: 0,
    description: null,
    error: "not_found",
};

/**
 * Validate (but do not redeem) a coupon code against a single doll order.
 * `base` is the rental tier / buy price; `extras` is outfit + customizations.
 * Used by the checkout UI for instant feedback, and again by the checkout
 * server action to recompute the discount from server-trusted data.
 */
export async function validateDollCoupon(
    code: string,
    mode: CatalogMode,
    base: number,
    extras = 0,
): Promise<DollCouponValidation> {
    const trimmed = code.trim();
    if (!trimmed) return { ...EMPTY, code: "", error: "not_found" };

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
        .rpc("validate_doll_coupon", {
            p_code: trimmed,
            p_mode: mode,
            p_base: Math.max(0, Math.round(base)),
            p_extras: Math.max(0, Math.round(extras)),
        })
        .maybeSingle();

    if (error || !data) {
        return { ...EMPTY, code: trimmed, error: "not_found" };
    }

    const row = data as ValidationRow;
    const errorCode = (row.error as DollCouponValidation["error"]) ?? null;
    const discount = row.discount_amount ?? 0;

    return {
        ok: errorCode === null && discount >= 0,
        couponId: row.id,
        code: row.code ?? trimmed,
        type: row.type,
        value: row.value,
        discountBase: row.discount_base,
        discountAmount: discount,
        description: row.description,
        error: errorCode,
    };
}

/**
 * Atomically increment `redemptions_count` and append a doll redemption row.
 * Returns false if the coupon raced out of stock between validation and
 * commit; the caller should then re-price the order without the discount.
 */
export async function redeemDollCoupon(
    couponId: string,
    orderId: string,
    amount: number,
    customerPhone: string | null,
): Promise<boolean> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.rpc("redeem_doll_coupon", {
        p_coupon_id: couponId,
        p_order_id: orderId,
        p_amount: Math.max(0, Math.round(amount)),
        p_customer_phone: customerPhone,
    });
    if (error) {
        console.warn("[dolls/coupons] redeem rpc failed", couponId, error);
        return false;
    }
    return Boolean(data);
}
