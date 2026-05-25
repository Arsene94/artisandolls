"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { addToCartAction } from "@/app/[locale]/shop/cart-actions";

type Props = {
    slug: string;
    qty?: number;
    disabled?: boolean;
    variant?: "primary" | "secondary";
    className?: string;
    onAdded?: () => void;
};

export default function AddToCartButton({
    slug,
    qty = 1,
    disabled = false,
    variant = "primary",
    className,
    onAdded,
}: Props) {
    const t = useTranslations("shop");
    const [pending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<"idle" | "added" | "error">("idle");

    const handleClick = () => {
        if (disabled || pending) return;
        startTransition(async () => {
            const result = await addToCartAction(slug, qty);
            if (!result.ok) {
                setFeedback("error");
                window.setTimeout(() => setFeedback("idle"), 1600);
                return;
            }
            setFeedback("added");
            onAdded?.();
            window.setTimeout(() => setFeedback("idle"), 1600);
        });
    };

    const base =
        variant === "primary"
            ? "w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3 rounded-full text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:bg-velvet-700 disabled:text-silk/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
            : "w-full inline-flex items-center justify-center gap-2 border border-gold/60 hover:border-gold hover:bg-gold/10 text-gold font-semibold py-2.5 rounded-full text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950";

    const label =
        feedback === "added"
            ? t("addedToCart")
            : feedback === "error"
              ? t("outOfStock")
              : disabled
                ? t("outOfStock")
                : t("addToCart");

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || pending}
            aria-live="polite"
            className={[base, className].filter(Boolean).join(" ")}
        >
            <span>{label}</span>
            {feedback === "added" ? (
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M3 4h2l2.4 12.1a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.8L20 8H6" />
                    <circle cx="9" cy="20" r="1.4" />
                    <circle cx="17" cy="20" r="1.4" />
                </svg>
            )}
        </button>
    );
}
