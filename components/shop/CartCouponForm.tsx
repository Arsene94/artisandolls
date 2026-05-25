"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/shop/format";
import {
    applyCouponAction,
    removeCouponAction,
} from "@/app/[locale]/shop/cart-actions";
import type { CartCouponSnapshot } from "@/lib/shop/cart";
import type { CouponError } from "@/lib/shop/shared";

type Props = {
    coupon: CartCouponSnapshot | null;
    currency: string;
    locale: string;
};

const ERROR_KEY: Record<CouponError, string> = {
    not_found: "couponErrorNotFound",
    not_started: "couponErrorNotStarted",
    expired: "couponErrorExpired",
    exhausted: "couponErrorExhausted",
    subtotal_too_low: "couponErrorSubtotalTooLow",
    category_mismatch: "couponErrorCategoryMismatch",
    inactive: "couponErrorNotFound",
};

export default function CartCouponForm({ coupon, currency, locale }: Props) {
    const t = useTranslations("shop");
    const [pending, startTransition] = useTransition();
    const [code, setCode] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const apply = (formData: FormData) => {
        const value = String(formData.get("code") ?? "").trim();
        if (!value) return;
        setLocalError(null);
        startTransition(async () => {
            const result = await applyCouponAction(value);
            if (!result.ok) {
                setLocalError(t(ERROR_KEY[result.error]));
            } else {
                setCode("");
            }
        });
    };

    const remove = () => {
        setLocalError(null);
        startTransition(async () => {
            await removeCouponAction();
        });
    };

    const activeError =
        coupon && coupon.error
            ? t(ERROR_KEY[coupon.error] ?? "couponErrorNotFound")
            : null;

    if (coupon?.ok) {
        return (
            <div className="rounded-xl border border-gold/30 bg-velvet-900/40 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">
                            {t("couponApplied")}
                        </p>
                        <p className="mt-1 font-mono text-gold-light text-sm break-all">
                            {coupon.code}
                        </p>
                        {coupon.description ? (
                            <p className="mt-1 text-[0.82rem] text-silk/70">
                                {coupon.description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={remove}
                        disabled={pending}
                        className="text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-danger disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md px-2 py-1"
                    >
                        {t("couponRemove")}
                    </button>
                </div>
                <p className="mt-3 text-sm text-silk/85">
                    {t("couponSavings")}:{" "}
                    <span className="text-gold font-semibold">
                        −{formatMoney(coupon.discountAmount, locale, currency)}
                    </span>
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-velvet-800/60 bg-velvet-900/30 p-4">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-silk/70 mb-2">
                {t("couponLabel")}
            </p>
            <form action={apply} className="flex gap-2">
                <label htmlFor="cart-coupon" className="sr-only">
                    {t("couponPlaceholder")}
                </label>
                <input
                    id="cart-coupon"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t("couponPlaceholder")}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-velvet-950 border border-velvet-700 focus:border-gold focus-visible:ring-2 focus-visible:ring-gold rounded-lg px-3 py-2 text-silk text-sm font-mono uppercase tracking-wider focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={pending || code.trim().length === 0}
                    className="bg-gold hover:bg-gold-light text-velvet-950 disabled:bg-velvet-700 disabled:text-silk/55 disabled:cursor-not-allowed font-semibold px-4 py-2 rounded-lg text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                    {pending ? "…" : t("couponApply")}
                </button>
            </form>
            {(localError ?? activeError) ? (
                <p role="alert" className="mt-2 text-[0.82rem] text-danger">
                    {localError ?? activeError}
                </p>
            ) : null}
        </div>
    );
}
