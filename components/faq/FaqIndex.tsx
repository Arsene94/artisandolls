"use client";

import { useMemo, useState } from "react";
import type { FaqCategory, FaqItem } from "@/lib/faq/shared";

type Group = {
    category: FaqCategory;
    label: string;
    items: FaqItem[];
};

type Props = {
    groups: Group[];
    searchPlaceholder: string;
    searchNoResults: string;
    jumpLabel: string;
};

function normalize(value: string) {
    return value
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();
}

export default function FaqIndex({
    groups,
    searchPlaceholder,
    searchNoResults,
    jumpLabel,
}: Props) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const needle = normalize(query);
        if (needle.length < 2) return groups;
        return groups
            .map((g) => ({
                ...g,
                items: g.items.filter(
                    (item) =>
                        normalize(item.question).includes(needle) ||
                        normalize(item.answer).includes(needle),
                ),
            }))
            .filter((g) => g.items.length > 0);
    }, [groups, query]);

    return (
        <>
            <div className="mb-10">
                <label className="block">
                    <span className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/70">
                        {searchPlaceholder}
                    </span>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="mt-2 w-full bg-velvet-950 border border-velvet-700 rounded-lg px-4 py-3 text-silk focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold"
                    />
                </label>
            </div>

            {filtered.length > 1 ? (
                <nav
                    aria-label={jumpLabel}
                    className="mb-12 flex flex-wrap gap-2 text-[0.72rem] uppercase tracking-[0.18em]"
                >
                    {filtered.map((g) => (
                        <a
                            key={g.category}
                            href={`#${g.category}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-full border border-gold/25 text-gold-light hover:border-gold/60 hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                            {g.label}
                        </a>
                    ))}
                </nav>
            ) : null}

            {filtered.length === 0 ? (
                <p className="text-silk/70 py-8 text-center">{searchNoResults}</p>
            ) : null}

            <div className="space-y-14">
                {filtered.map((group) => (
                    <section
                        key={group.category}
                        id={group.category}
                        aria-labelledby={`heading-${group.category}`}
                        className="scroll-mt-32"
                    >
                        <h2
                            id={`heading-${group.category}`}
                            className="font-display italic text-2xl sm:text-3xl text-silk mb-6"
                        >
                            {group.label}
                        </h2>
                        <div className="space-y-4">
                            {group.items.map((item) => (
                                <details
                                    key={item.id}
                                    className="group border border-velvet-800 rounded-2xl"
                                >
                                    <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-4 text-silk font-medium hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl">
                                        <span>{item.question}</span>
                                        <span
                                            aria-hidden="true"
                                            className="shrink-0 mt-0.5 text-gold transition-transform group-open:rotate-45 motion-reduce:transition-none"
                                        >
                                            +
                                        </span>
                                    </summary>
                                    <p className="px-5 pb-5 text-base text-silk/85 leading-relaxed whitespace-pre-line">
                                        {item.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}
