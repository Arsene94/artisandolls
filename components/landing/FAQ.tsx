"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type FaqItem = { q: string; a: string };

const HIGHLIGHT_THRESHOLD = 2;

function normalize(value: string) {
    return value
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
}

type Props = {
    /** Lista de Q&A. Dacă lipsește, cade pe `messages.home.faq.items` (legacy). */
    items?: FaqItem[];
};

export default function FAQ({ items: itemsProp }: Props = {}) {
    const t = useTranslations("home.faq");
    const baseId = useId();
    const items = useMemo(() => {
        if (itemsProp && itemsProp.length > 0) return itemsProp;
        try {
            return (t.raw("items") as FaqItem[]) ?? [];
        } catch {
            return [];
        }
    }, [t, itemsProp]);

    const [open, setOpen] = useState<number | null>(null);
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const needle = normalize(query);
        if (needle.length < HIGHLIGHT_THRESHOLD) {
            return items.map((item, idx) => ({ ...item, idx }));
        }
        return items
            .map((item, idx) => ({ ...item, idx }))
            .filter(
                ({ q, a }) =>
                    normalize(q).includes(needle) || normalize(a).includes(needle),
            );
    }, [items, query]);

    useEffect(() => {
        if (filtered.length > 0 && filtered.every(({ idx }) => idx !== open)) {
            setOpen(null);
        }
    }, [filtered, open]);

    const toggle = useCallback((idx: number) => {
        setOpen((current) => (current === idx ? null : idx));
    }, []);

    const jsonLd = useMemo(
        () => ({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
            })),
        }),
        [items],
    );

    return (
        <section
            id="faq"
            aria-labelledby="faq-title"
            className="surface-light py-24 bg-silk text-silk-800"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 lg:mb-12">
                    <span className="inline-block text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-velvet-700 bg-velvet-100 px-4 py-2 rounded-full">
                        {t("badge")}
                    </span>
                    <h2
                        id="faq-title"
                        className="text-3xl sm:text-4xl lg:text-5xl font-display italic font-medium mt-5 text-velvet-900"
                    >
                        {t("title")}
                    </h2>
                    <p className="mt-4 mx-auto max-w-xl text-silk-600 leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="mb-8 max-w-xl mx-auto">
                    <label htmlFor={`${baseId}-search`} className="sr-only">
                        {t("searchPlaceholder")}
                    </label>
                    <div className="relative">
                        <svg
                            aria-hidden="true"
                            focusable="false"
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silk-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                            id={`${baseId}-search`}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            autoComplete="off"
                            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-silk-300 text-silk-800 placeholder:text-silk-600/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-velvet-600 focus-visible:border-velvet-600"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <p
                        role="status"
                        className="text-center text-silk-600 py-12"
                    >
                        {t("searchNoResults")}
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {filtered.map(({ q, a, idx }) => {
                            const isOpen = open === idx;
                            const buttonId = `${baseId}-faq-button-${idx}`;
                            const panelId = `${baseId}-faq-panel-${idx}`;
                            return (
                                <li
                                    key={idx}
                                    className="bg-white border border-silk-300 rounded-2xl shadow-sm transition-shadow duration-200 motion-reduce:transition-none hover:shadow-md"
                                >
                                    <h3 className="m-0">
                                        <button
                                            id={buttonId}
                                            type="button"
                                            onClick={() => toggle(idx)}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            className="w-full flex items-center justify-between gap-4 text-left py-5 px-5 sm:px-6 font-heading text-base sm:text-lg font-semibold text-velvet-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-velvet-600 rounded-2xl"
                                        >
                                            <span>{q}</span>
                                            <svg
                                                className={`shrink-0 w-5 h-5 text-velvet-700 transition-transform duration-300 motion-reduce:transition-none ${
                                                    isOpen ? "rotate-180" : ""
                                                }`}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                                focusable="false"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>
                                    </h3>
                                    <div
                                        id={panelId}
                                        role="region"
                                        aria-labelledby={buttonId}
                                        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                                        style={{
                                            gridTemplateRows: isOpen ? "1fr" : "0fr",
                                        }}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="px-5 sm:px-6 pb-5 text-[0.95rem] leading-relaxed text-silk-800">
                                                {a}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="mt-12 text-center">
                    <p className="text-silk-600 text-sm mb-3">{t("moreQuestions")}</p>
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-velvet-700 text-velvet-900 font-semibold text-sm tracking-wide hover:bg-velvet-700 hover:text-silk transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-velvet-600 focus-visible:ring-offset-2 focus-visible:ring-offset-silk"
                    >
                        {t("moreQuestionsCta")}
                        <svg
                            aria-hidden="true"
                            focusable="false"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </section>
    );
}
