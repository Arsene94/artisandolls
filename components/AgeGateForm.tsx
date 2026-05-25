"use client";

import { useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { confirmAge } from "@/app/age-gate/actions";

const MONTHS: Record<Locale, string[]> = {
    ro: [
        "Ianuarie",
        "Februarie",
        "Martie",
        "Aprilie",
        "Mai",
        "Iunie",
        "Iulie",
        "August",
        "Septembrie",
        "Octombrie",
        "Noiembrie",
        "Decembrie",
    ],
    en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
    nl: [
        "Januari",
        "Februari",
        "Maart",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Augustus",
        "September",
        "Oktober",
        "November",
        "December",
    ],
};

type Props = {
    next: string;
};

export default function AgeGateForm({ next }: Props) {
    const t = useTranslations("ageGate");
    const locale = useLocale() as Locale;
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");
    const formId = useId();

    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const errorText =
        errorParam === "under18"
            ? t("errorUnder18")
            : errorParam === "invalid"
              ? t("errorInvalid")
              : errorParam === "rate"
                ? t("errorRate")
                : null;

    const thisYear = new Date().getUTCFullYear();
    const years = Array.from({ length: 100 }, (_, i) => thisYear - i);
    const months = MONTHS[locale];

    return (
        <main
            data-surface="dark"
            className="min-h-screen flex items-center justify-center bg-velvet-950 text-silk px-4 py-16"
        >
            <div className="w-full max-w-lg bg-velvet-900 border border-gold/25 rounded-3xl p-7 sm:p-9 shadow-2xl">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light mb-3">
                    {t("eyebrow")}
                </p>
                <h1 className="font-display italic text-3xl sm:text-4xl text-silk leading-tight mb-3">
                    {t("title")}
                </h1>
                <p className="text-silk/80 text-[0.95rem] leading-relaxed mb-7">
                    {t("description")}
                </p>

                <form action={confirmAge} className="space-y-5" noValidate>
                    <input type="hidden" name="next" value={next} />

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label
                                htmlFor={`${formId}-day`}
                                className="block text-[0.72rem] uppercase tracking-[0.18em] text-silk/65 mb-1.5"
                            >
                                {t("dayLabel")}
                            </label>
                            <select
                                id={`${formId}-day`}
                                name="day"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                required
                                className="w-full bg-velvet-950 border border-silk/25 text-silk px-3 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none"
                            >
                                <option value="">—</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor={`${formId}-month`}
                                className="block text-[0.72rem] uppercase tracking-[0.18em] text-silk/65 mb-1.5"
                            >
                                {t("monthLabel")}
                            </label>
                            <select
                                id={`${formId}-month`}
                                name="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                required
                                className="w-full bg-velvet-950 border border-silk/25 text-silk px-3 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none"
                            >
                                <option value="">—</option>
                                {months.map((label, idx) => (
                                    <option key={label} value={idx + 1}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor={`${formId}-year`}
                                className="block text-[0.72rem] uppercase tracking-[0.18em] text-silk/65 mb-1.5"
                            >
                                {t("yearLabel")}
                            </label>
                            <select
                                id={`${formId}-year`}
                                name="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                required
                                className="w-full bg-velvet-950 border border-silk/25 text-silk px-3 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none"
                            >
                                <option value="">—</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {errorText ? (
                        <p
                            role="alert"
                            className="text-danger text-[0.85rem] leading-snug bg-velvet-950/60 border border-danger/30 rounded-lg px-3 py-2"
                        >
                            {errorText}
                        </p>
                    ) : null}

                    <p className="text-[0.78rem] text-silk/55 leading-snug">
                        {t("rememberHint")}
                    </p>

                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3.5 rounded-xl text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                    >
                        {t("confirm")}
                    </button>

                    <a
                        href="https://www.google.com"
                        rel="noopener noreferrer nofollow"
                        className="block text-center text-silk/55 hover:text-silk text-[0.82rem] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm py-1"
                    >
                        {t("leave")}
                    </a>

                    <p className="text-[0.72rem] text-silk/55 leading-snug text-center">
                        {t.rich("termsHint", {
                            terms: (chunks) => (
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gold-light underline underline-offset-4 hover:text-gold"
                                >
                                    {chunks}
                                </Link>
                            ),
                            privacy: (chunks) => (
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gold-light underline underline-offset-4 hover:text-gold"
                                >
                                    {chunks}
                                </Link>
                            ),
                        })}
                    </p>
                </form>
            </div>
        </main>
    );
}
