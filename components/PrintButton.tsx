"use client";

import { useTranslations } from "next-intl";

export default function PrintButton() {
    const t = useTranslations("success");
    return (
        <button
            type="button"
            onClick={() => {
                if (typeof window !== "undefined") window.print();
            }}
            className="no-print w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-velvet-950 border border-velvet-700 hover:border-gold hover:text-gold text-silk font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-[11px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
        >
            <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
            </svg>
            {t("printReceipt")}
        </button>
    );
}
