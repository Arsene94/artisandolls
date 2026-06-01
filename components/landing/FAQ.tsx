"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { safeLdJson } from "@/lib/seo/ld-json";

type FaqItem = { q: string; a: string };

type Props = {
    items?: FaqItem[];
};

const CHIP_KEYS = [
    "rental",
    "purchase",
    "hygiene",
    "privacy",
    "payment",
] as const;

export default function FAQ({ items: itemsProp }: Props = {}) {
    const t = useTranslations("home.faq");
    const baseId = useId();

    const items = useMemo<FaqItem[]>(() => {
        if (itemsProp && itemsProp.length > 0) return itemsProp;
        try {
            return (t.raw("items") as FaqItem[]) ?? [];
        } catch {
            return [];
        }
    }, [t, itemsProp]);

    const [open, setOpen] = useState<number | null>(0);

    const toggle = useCallback((idx: number) => {
        setOpen((cur) => (cur === idx ? null : idx));
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
            data-surface="dark"
            className="velvet-faq relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-14 px-6 py-24 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-16">
                <div className="flex flex-col">
                    <h2
                        id="faq-title"
                        className="font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-silk"
                    >
                        {t("title")}
                    </h2>
                    <span
                        aria-hidden="true"
                        className="mt-6 block h-px w-[60px] bg-gold/60"
                    />
                    <p className="mt-7 max-w-md text-sm leading-relaxed text-silk/70">
                        {t("subtitle")}
                    </p>

                    <ul className="mt-12 space-y-5">
                        {CHIP_KEYS.map((key) => (
                            <li key={key}>
                                <a
                                    href={`#faq-${key}`}
                                    className="inline-flex items-center font-heading text-sm font-semibold uppercase tracking-[0.22em] text-silk/70 transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold"
                                >
                                    {t(`chips.${key}`)}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-12">
                        <Link
                            href="/contact"
                            className="group inline-flex items-center gap-3 rounded-full border border-gold/60 bg-velvet-950/40 px-6 py-3 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-silk transition-all duration-300 hover:border-gold hover:bg-gold hover:text-velvet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                        >
                            {t("contactCta")}
                            <span
                                aria-hidden="true"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 transition-transform duration-300 group-hover:translate-x-0.5"
                            >
                                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>

                {items.length > 0 && (
                    <ul className="divide-y divide-velvet-800/70">
                        {items.map(({ q, a }, idx) => {
                            const isOpen = open === idx;
                            const buttonId = `${baseId}-faq-button-${idx}`;
                            const panelId = `${baseId}-faq-panel-${idx}`;
                            return (
                                <li key={idx} className="py-1">
                                    <h3 className="m-0">
                                        <button
                                            id={buttonId}
                                            type="button"
                                            onClick={() => toggle(idx)}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                            className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-lg italic leading-snug text-gold-light transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold"
                                        >
                                            <span>{q}</span>
                                            <span
                                                aria-hidden="true"
                                                className={`shrink-0 text-silk/70 transition-transform duration-300 ${
                                                    isOpen ? "rotate-45" : ""
                                                }`}
                                            >
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 18 18"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M3 9h12M9 3v12"
                                                        stroke="currentColor"
                                                        strokeWidth="1.2"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </span>
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
                                            <p className="pb-6 pr-12 text-[0.88rem] leading-relaxed text-silk/65">
                                                {a}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeLdJson(jsonLd) }}
            />
        </section>
    );
}
