"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { searchShopSemantic } from "@/app/[locale]/shop/search-actions";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatMoney } from "@/lib/shop/format";
import type { ShopProduct } from "@/lib/shop/shared";

type Props = {
    products: ShopProduct[];
};

export default function ShopSearchBar({ products }: Props) {
    const t = useTranslations("shop");
    const locale = useLocale();
    const [query, setQuery] = useState("");
    const [semanticOrder, setSemanticOrder] = useState<string[] | null>(null);
    const [pending, startTransition] = useTransition();

    const productBySlug = useMemo(
        () => new Map(products.map((p) => [p.slug, p])),
        [products],
    );

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            // Reset the semantic order when the input is cleared. Same debounced
            // pattern as the doll catalog's semantic search.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSemanticOrder(null);
            return;
        }
        const handle = window.setTimeout(() => {
            startTransition(async () => {
                const res = await searchShopSemantic(trimmed, locale);
                setSemanticOrder(res.slugs);
            });
        }, 220);
        return () => window.clearTimeout(handle);
    }, [locale, query]);

    const filtered = useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (trimmed.length < 2) return [] as ShopProduct[];

        if (semanticOrder && semanticOrder.length > 0) {
            return semanticOrder
                .map((slug) => productBySlug.get(slug))
                .filter((p): p is ShopProduct => Boolean(p))
                .slice(0, 8);
        }

        // Fallback substring match while the semantic call is in flight or
        // when Upstash Vector is not configured.
        const needle = trimmed;
        return products
            .filter((p) => {
                return (
                    p.name.toLowerCase().includes(needle) ||
                    (p.shortDescription ?? "")
                        .toLowerCase()
                        .includes(needle) ||
                    (p.brand ?? "").toLowerCase().includes(needle) ||
                    p.tags.some((tag) => tag.toLowerCase().includes(needle))
                );
            })
            .slice(0, 8);
    }, [products, productBySlug, query, semanticOrder]);

    const showResults = query.trim().length >= 2;

    return (
        <div className="relative max-w-2xl">
            <label htmlFor="shop-search" className="sr-only">
                {t("title")}
            </label>
            <div className="relative">
                <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-4 flex items-center text-silk/55 pointer-events-none"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        focusable="false"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                </span>
                <input
                    id="shop-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("title")}
                    aria-autocomplete="list"
                    aria-controls="shop-search-results"
                    autoComplete="off"
                    className="w-full bg-velvet-900/60 border border-velvet-700 focus:border-gold rounded-full pl-12 pr-12 py-3 text-silk placeholder-silk/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold text-sm"
                />
                {query ? (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear"
                        className="absolute inset-y-0 right-3 flex items-center text-silk/65 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md px-1"
                    >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            focusable="false"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                        </svg>
                    </button>
                ) : null}
            </div>

            {showResults ? (
                <div
                    id="shop-search-results"
                    role="listbox"
                    className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-gold/30 bg-velvet-950/95 backdrop-blur shadow-2xl max-h-[28rem] overflow-y-auto"
                >
                    {filtered.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-silk/65">
                            {pending ? "…" : t("emptyTitle")}
                        </p>
                    ) : (
                        <ul className="list-none p-0">
                            {filtered.map((p) => (
                                <li key={p.slug}>
                                    <Link
                                        href={`/shop/p/${p.slug}`}
                                        onClick={() => setQuery("")}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-velvet-900/70 focus-visible:bg-velvet-900/70 focus-visible:outline-none"
                                        role="option"
                                        aria-selected="false"
                                    >
                                        <div className="relative w-12 h-14 shrink-0 overflow-hidden rounded-lg bg-velvet-900">
                                            {p.image ? (
                                                <Image
                                                    src={getSupabaseImageUrl(
                                                        p.image,
                                                        "card",
                                                    )}
                                                    alt={p.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover object-center"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-silk text-sm font-medium truncate">
                                                {p.name}
                                            </p>
                                            {p.brand ? (
                                                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-silk/55">
                                                    {p.brand}
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gold whitespace-nowrap">
                                            {formatMoney(
                                                p.price,
                                                locale,
                                                p.currency,
                                            )}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : null}
        </div>
    );
}
