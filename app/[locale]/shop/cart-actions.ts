"use server";

import { revalidatePath } from "next/cache";
import {
    addToCart as addToCartImpl,
    applyCoupon as applyCouponImpl,
    clearCart as clearCartImpl,
    removeCoupon as removeCouponImpl,
    removeFromCart as removeFromCartImpl,
    updateCartQty as updateCartQtyImpl,
} from "@/lib/shop/cart";
import { getShopProductBySlug } from "@/lib/shop/products";
import type { CouponError } from "@/lib/shop/shared";

export type CartActionResult = {
    ok: boolean;
    reason?: "limit_reached" | "cart_full" | "out_of_stock" | "not_found";
};

export async function addToCartAction(
    slug: string,
    qty = 1,
): Promise<CartActionResult> {
    const product = await getShopProductBySlug(slug);
    if (!product) return { ok: false, reason: "not_found" };
    if (!product.isInStock) return { ok: false, reason: "out_of_stock" };

    const result = await addToCartImpl(slug, qty);
    revalidatePath("/shop/cart");
    if (!result.ok) {
        return {
            ok: false,
            reason: result.reason === "cart_full" ? "cart_full" : "limit_reached",
        };
    }
    return { ok: true };
}

export async function updateCartQtyAction(
    slug: string,
    qty: number,
): Promise<{ ok: true }> {
    await updateCartQtyImpl(slug, qty);
    revalidatePath("/shop/cart");
    return { ok: true };
}

export async function removeFromCartAction(slug: string): Promise<{ ok: true }> {
    await removeFromCartImpl(slug);
    revalidatePath("/shop/cart");
    return { ok: true };
}

export async function clearCartAction(): Promise<{ ok: true }> {
    await clearCartImpl();
    revalidatePath("/shop/cart");
    return { ok: true };
}

export type ApplyCouponResult =
    | { ok: true; code: string; discountAmount: number }
    | { ok: false; error: CouponError };

export async function applyCouponAction(code: string): Promise<ApplyCouponResult> {
    const result = await applyCouponImpl(code);
    revalidatePath("/shop/cart");
    revalidatePath("/shop/checkout");
    if (result.ok) {
        return {
            ok: true,
            code: result.validation.code,
            discountAmount: result.validation.discountAmount,
        };
    }
    return { ok: false, error: result.validation.error ?? "not_found" };
}

export async function removeCouponAction(): Promise<{ ok: true }> {
    await removeCouponImpl();
    revalidatePath("/shop/cart");
    revalidatePath("/shop/checkout");
    return { ok: true };
}
