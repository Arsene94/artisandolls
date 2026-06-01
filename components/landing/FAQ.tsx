"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { safeLdJson } from "@/lib/seo/ld-json";
import PrimaryButton from "@/components/landing/PrimaryButton";

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
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-16 lg:py-24">
                {/* Intro column — `display:contents` on mobile so the questions sit
                    between the centered header/chips and the contact CTA (Figma order:
                    header → chips → questions → button). On lg it is the left column. */}
                <div className="contents lg:flex lg:flex-col">
                    <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
                        <h2
                            id="faq-title"
                            className="font-display text-[28px] leading-[1.3] tracking-tight text-silk lg:text-[clamp(2.25rem,4.5vw,4rem)] lg:leading-[1.05]"
                        >
                            {t("title")}
                        </h2>
                        <span
                            aria-hidden="true"
                            className="mt-6 block h-px w-[60px] bg-gold/60 mx-auto lg:mx-0"
                        />
                        <p className="mt-7 max-w-lg text-[12px] leading-relaxed text-[#b9b2aa] lg:text-[18px]">
                            {t("subtitle")}
                        </p>

                        <ul className="mt-12 w-full space-y-5 text-center lg:text-left">
                            {CHIP_KEYS.map((key) => (
                                <li key={key}>
                                    <a
                                        href={`#faq-${key}`}
                                        className="inline-flex items-center font-sans text-[12px] font-medium uppercase tracking-[0.083em] text-ivory transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold lg:text-[15px] lg:tracking-[0.067em]"
                                    >
                                        {t(`chips.${key}`)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="order-3 mt-4 flex justify-center lg:mt-12 lg:justify-start">
                        <PrimaryButton
                            href="/contact"
                            variant="outline"
                            ariaLabel={t("contactCta")}
                        >
                            {t("contactCta")}
                        </PrimaryButton>
                    </div>
                </div>

                {items.length > 0 && (
                    <ul className="order-2 divide-y divide-[#6a5330]/20">
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
                                            className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-[18px] font-semibold leading-snug text-gold transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold lg:text-[20px]"
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
                                            <p className="pb-6 pr-12 text-[12px] leading-relaxed text-[#b9b2aa] lg:text-[0.88rem]">
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
