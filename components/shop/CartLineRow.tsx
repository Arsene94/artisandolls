"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatMoney } from "@/lib/shop/format";
import {
    removeFromCartAction,
    updateCartQtyAction,
} from "@/app/[locale]/shop/cart-actions";
import type { ShopProduct } from "@/lib/shop/shared";

type Props = {
    slug: string;
    product: ShopProduct;
    qty: number;
    lineTotal: number;
    locale: string;
};

export default function CartLineRow({
    slug,
    product,
    qty,
    lineTotal,
    locale,
}: Props) {
    const t = useTranslations("shop");
    const [pending, startTransition] = useTransition();

    const setQty = (nextQty: number) => {
        startTransition(async () => {
            await updateCartQtyAction(slug, nextQty);
        });
    };

    const remove = () => {
        startTransition(async () => {
            await removeFromCartAction(slug);
        });
    };

    const imageUrl = product.image
        ? getSupabaseImageUrl(product.image, "card")
        : null;
    // Allow the buyer to keep their own qty even if other carts pushed the
    // available number below it. The checkout server action does the final
    // truth check against `stock − other-cart reservations`.
    const maxStock = product.trackStock
        ? Math.max(qty, product.availableQuantity)
        : 99;

    return (
        <li className="flex gap-4 py-5 first:pt-0 border-b border-velvet-800/40 last:border-b-0">
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-velvet-900">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className="object-cover object-center"
                    />
                ) : null}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                        {product.brand ? (
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-silk/55">
                                {product.brand}
                            </p>
                        ) : null}
                        <h3 className="font-display italic text-lg text-silk leading-tight">
                            <Link
                                href={`/shop/p/${product.slug}`}
                                className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                            >
                                {product.name}
                            </Link>
                        </h3>
                        {product.shortDescription ? (
                            <p className="mt-1 text-[0.82rem] text-silk/65 line-clamp-2">
                                {product.shortDescription}
                            </p>
                        ) : null}
                    </div>
                    <p className="font-display text-lg text-gold whitespace-nowrap">
                        {formatMoney(lineTotal, locale, product.currency)}
                    </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                    <div
                        className="inline-flex items-center rounded-full border border-velvet-700 bg-velvet-950/50"
                        role="group"
                        aria-label={t("quantity")}
                    >
                        <button
                            type="button"
                            onClick={() => setQty(Math.max(0, qty - 1))}
                            disabled={pending || qty <= 1}
                            aria-label={t("decrease")}
                            className="w-9 h-9 inline-flex items-center justify-center text-silk hover:text-gold disabled:text-silk/30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                        >
                            −
                        </button>
                        <span className="min-w-[2rem] text-center text-silk text-sm font-medium tabular-nums">
                            {qty}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQty(qty + 1)}
                            disabled={pending || qty >= maxStock}
                            aria-label={t("increase")}
                            className="w-9 h-9 inline-flex items-center justify-center text-silk hover:text-gold disabled:text-silk/30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                        >
                            +
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={remove}
                        disabled={pending}
                        className="text-[0.78rem] uppercase tracking-[0.16em] text-silk/65 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md px-2 py-1"
                    >
                        {t("remove")}
                    </button>
                </div>
            </div>
        </li>
    );
}
