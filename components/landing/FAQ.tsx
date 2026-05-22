"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

const ITEMS = [
    { q: "q1", a: "a1" },
    { q: "q2", a: "a2" },
    { q: "q3", a: "a3" },
] as const;

export default function FAQ() {
    const t = useTranslations("home.faq");
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 bg-silk text-velvet-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-xs font-bold uppercase tracking-widest text-velvet-500">
                        {t("badge")}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold mt-2 font-serif">{t("title")}</h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-gold to-velvet-500 mx-auto mt-4" />
                </div>

                <div className="space-y-4">
                    {ITEMS.map((item, idx) => {
                        const isOpen = open === idx;
                        return (
                            <div
                                key={item.q}
                                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : idx)}
                                    aria-expanded={isOpen}
                                    className="w-full font-bold font-serif text-lg text-velvet-900 flex justify-between items-center text-left cursor-pointer"
                                >
                                    <span>{t(item.q)}</span>
                                    <svg
                                        className={`w-4 h-4 text-gold shrink-0 ml-4 transition-transform duration-300 ${
                                            isOpen ? "rotate-180" : ""
                                        }`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>
                                <div
                                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
                                        isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <p className="text-gray-600 font-light text-sm leading-relaxed">
                                        {t(item.a)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
