"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Categories = {
    necessary: true;
    analytics: boolean;
};

const STORAGE_KEY = "ad-cookie-consent.v2";

function readConsent(): Categories | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.necessary === true) {
            return { necessary: true, analytics: Boolean(parsed.analytics) };
        }
    } catch {
        return null;
    }
    return null;
}

function writeConsent(value: Categories) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        /* private mode: silently no-op */
    }
}

function broadcast(value: Categories) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("ad:consent-change", { detail: value }));
}

export default function CookieConsent() {
    const t = useTranslations("cookies");
    const titleId = useId();
    const descId = useId();
    const [visible, setVisible] = useState(false);
    const [showPrefs, setShowPrefs] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const prefsRef = useRef<HTMLDivElement>(null);
    const openTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (readConsent() === null) {
            setVisible(true);
        }
    }, []);

    const commit = useCallback((value: Categories) => {
        writeConsent(value);
        broadcast(value);
        setVisible(false);
        setShowPrefs(false);
    }, []);

    const acceptAll = useCallback(
        () => commit({ necessary: true, analytics: true }),
        [commit],
    );
    const rejectAll = useCallback(
        () => commit({ necessary: true, analytics: false }),
        [commit],
    );
    const saveSelection = useCallback(
        () => commit({ necessary: true, analytics }),
        [commit, analytics],
    );

    useEffect(() => {
        if (!showPrefs) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowPrefs(false);
                openTriggerRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [showPrefs]);

    if (!visible) return null;

    return (
        <>
            <div
                role="region"
                aria-label={t("title")}
                className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-velvet-700/50 bg-velvet-950/96 p-5 text-silk shadow-2xl backdrop-blur sm:p-6"
            >
                <h2
                    id={titleId}
                    className="font-heading text-base font-semibold text-silk"
                >
                    {t("title")}
                </h2>
                <p
                    id={descId}
                    className="mt-2 text-sm leading-relaxed text-silk/80"
                >
                    {t("description")}{" "}
                    <Link
                        href="/cookies"
                        className="text-gold-light underline underline-offset-4 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                    >
                        {t("learnMore")}
                    </Link>
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={acceptAll}
                        className="inline-flex items-center justify-center rounded-full bg-gold hover:bg-gold-light px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-velvet-950 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                    >
                        {t("acceptAll")}
                    </button>
                    <button
                        type="button"
                        onClick={rejectAll}
                        className="inline-flex items-center justify-center rounded-full bg-velvet-700 hover:bg-velvet-600 px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-silk transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                    >
                        {t("acceptNecessary")}
                    </button>
                    <button
                        ref={openTriggerRef}
                        type="button"
                        onClick={() => setShowPrefs(true)}
                        aria-haspopup="dialog"
                        aria-expanded={showPrefs}
                        className="inline-flex items-center justify-center rounded-full border border-silk/35 hover:border-silk px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-silk hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                    >
                        {t("manage")}
                    </button>
                </div>
            </div>

            {showPrefs ? (
                <div
                    className="fixed inset-0 z-[70] bg-velvet-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowPrefs(false);
                            openTriggerRef.current?.focus();
                        }
                    }}
                >
                    <div
                        ref={prefsRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`${titleId}-prefs`}
                        className="w-full max-w-lg bg-velvet-900 text-silk rounded-2xl border border-gold/25 p-6 sm:p-7 shadow-2xl"
                        data-surface="dark"
                    >
                        <h3
                            id={`${titleId}-prefs`}
                            className="font-heading text-lg font-semibold mb-1"
                        >
                            {t("manage")}
                        </h3>
                        <p className="text-sm text-silk/75 mb-5 leading-relaxed">
                            {t("description")}
                        </p>

                        <fieldset className="space-y-4">
                            <legend className="sr-only">{t("manage")}</legend>

                            <div className="rounded-xl bg-velvet-950/60 border border-velvet-800 p-4 flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked
                                    disabled
                                    aria-disabled="true"
                                    className="mt-1 w-5 h-5 rounded border-silk/30 bg-velvet-900 accent-pearl-500"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-silk text-sm">
                                        {t("necessaryLabel")}
                                    </p>
                                    <p className="text-[0.82rem] text-silk/65 leading-snug mt-1">
                                        {t("necessaryHelp")}
                                    </p>
                                </div>
                            </div>

                            <label
                                htmlFor={`${titleId}-analytics`}
                                className="rounded-xl bg-velvet-950/60 border border-velvet-800 p-4 flex items-start gap-3 cursor-pointer"
                            >
                                <input
                                    id={`${titleId}-analytics`}
                                    type="checkbox"
                                    checked={analytics}
                                    onChange={(e) => setAnalytics(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-silk/30 bg-velvet-900"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-silk text-sm">
                                        {t("analyticsLabel")}
                                    </p>
                                    <p className="text-[0.82rem] text-silk/65 leading-snug mt-1">
                                        {t("analyticsHelp")}
                                    </p>
                                </div>
                            </label>
                        </fieldset>

                        <div className="mt-6 grid gap-2 sm:grid-cols-3">
                            <button
                                type="button"
                                onClick={rejectAll}
                                className="inline-flex items-center justify-center rounded-full bg-velvet-700 hover:bg-velvet-600 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-silk transition-colors motion-reduce:transition-none"
                            >
                                {t("acceptNecessary")}
                            </button>
                            <button
                                type="button"
                                onClick={saveSelection}
                                className="inline-flex items-center justify-center rounded-full border border-silk/35 hover:border-silk px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-silk transition-colors motion-reduce:transition-none"
                            >
                                {t("save")}
                            </button>
                            <button
                                type="button"
                                onClick={acceptAll}
                                className="inline-flex items-center justify-center rounded-full bg-gold hover:bg-gold-light px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-velvet-950 transition-colors motion-reduce:transition-none"
                            >
                                {t("acceptAll")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
