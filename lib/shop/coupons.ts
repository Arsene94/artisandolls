import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { CouponValidation, ShopCouponType } from "@/lib/shop/shared";

type ValidationRow = {
    id: string | null;
    code: string | null;
    type: ShopCouponType | null;
    value: number | null;
    max_discount: number | null;
    description: string | null;
    discount_amount: number | null;
    error: string | null;
};

const EMPTY: CouponValidation = {
    ok: false,
    couponId: null,
    code: "",
    type: null,
    discountAmount: 0,
    description: null,
    error: "not_found",
};

/**
 * Validate (but do not redeem) a coupon code against a given subtotal.
 * Used by the cart UI for instant feedback, and again by the checkout
 * server action to recompute the discount from server-trusted data.
 */
export async function validateCoupon(
    code: string,
    subtotal: number,
    categoryIds: readonly string[] = [],
): Promise<CouponValidation> {
    const trimmed = code.trim();
    if (!trimmed) return { ...EMPTY, code: "", error: "not_found" };

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
        .rpc("shop_validate_coupon", {
            p_code: trimmed,
            p_subtotal: Math.max(0, Math.round(subtotal)),
            p_category_ids: categoryIds,
        })
        .maybeSingle();

    if (error || !data) {
        return { ...EMPTY, code: trimmed, error: "not_found" };
    }

    const row = data as ValidationRow;
    const errorCode = (row.error as CouponValidation["error"]) ?? null;
    const discount = row.discount_amount ?? 0;

    return {
        ok: errorCode === null && discount >= 0,
        couponId: row.id,
        code: row.code ?? trimmed,
        type: row.type,
        discountAmount: discount,
        description: row.description,
        error: errorCode,
    };
}

/**
 * Atomically increment `redemptions_count` and append a redemption row.
 * Returns false if the coupon raced out of stock between validation and
 * commit; the caller should refuse to apply the discount.
 */
export async function redeemCoupon(
    couponId: string,
    orderId: string,
    amount: number,
    customerPhone: string | null,
): Promise<boolean> {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.rpc("shop_redeem_coupon", {
        p_coupon_id: couponId,
        p_order_id: orderId,
        p_amount: Math.max(0, Math.round(amount)),
        p_customer_phone: customerPhone,
    });
    if (error) {
        console.warn("[shop/coupons] redeem rpc failed", couponId, error);
        return false;
    }
    return Boolean(data);
}
