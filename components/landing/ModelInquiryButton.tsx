"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type ModelInquiryButtonProps = {
    modelName: string;
    label: string;
    whatsappPhone?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    variant?: "primary" | "ghost";
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

function isValidContact(value: string) {
    const trimmed = value.trim();
    if (EMAIL_PATTERN.test(trimmed)) return true;
    if (PHONE_PATTERN.test(trimmed.replace(/[\s-]/g, ""))) return true;
    return false;
}

function detectInputMode(value: string): "email" | "tel" {
    return value.includes("@") ? "email" : "tel";
}

function focusableSelector() {
    return [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");
}

export default function ModelInquiryButton({
    modelName,
    label,
    whatsappPhone = null,
    contactEmail = null,
    contactPhone = null,
    variant = "primary",
}: ModelInquiryButtonProps) {
    const t = useTranslations("home.contact");
    const tCheckout = useTranslations("checkout");
    const reactId = useId();
    const titleId = `${reactId}-inquiry-title`;
    const descriptionId = `${reactId}-inquiry-description`;
    const inputId = `${reactId}-inquiry-input`;
    const errorId = `${reactId}-inquiry-error`;
    const ageId = `${reactId}-inquiry-age`;

    const [open, setOpen] = useState(false);
    const [contact, setContact] = useState("");
    const [age, setAge] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ageError, setAgeError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const close = useCallback(() => {
        setOpen(false);
        setSent(false);
        setError(null);
        setAgeError(null);
    }, []);

    const buildHref = useCallback(
        (contactValue: string) => {
            const message = `${t("modalTitleTemplate", { name: modelName })}\n${t("contactLabel")}: ${contactValue}`;
            if (whatsappPhone) {
                const digits = whatsappPhone.replace(/[^\d]/g, "");
                return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
            }
            if (contactEmail) {
                const params = new URLSearchParams({
                    subject: t("modalTitleTemplate", { name: modelName }),
                    body: message,
                });
                return `mailto:${contactEmail}?${params.toString()}`;
            }
            if (contactPhone) {
                return `tel:${contactPhone.replace(/[^\d+]/g, "")}`;
            }
            return null;
        },
        [contactEmail, contactPhone, modelName, t, whatsappPhone],
    );

    const submit = useCallback(() => {
        const value = contact.trim();
        let blocked = false;
        if (!isValidContact(value)) {
            setError(t("validationContact"));
            blocked = true;
        } else {
            setError(null);
        }
        if (!age) {
            setAgeError(tCheckout("ageRequired"));
            blocked = true;
        } else {
            setAgeError(null);
        }
        if (blocked) return;

        const href = buildHref(value);
        if (href) {
            const navigated = window.open(href, "_blank", "noopener,noreferrer");
            if (!navigated) {
                window.location.href = href;
            }
        }
        setSent(true);
        setContact("");
    }, [age, buildHref, contact, t, tCheckout]);

    useEffect(() => {
        if (!open) return;
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const id = window.requestAnimationFrame(() => inputRef.current?.focus());
        return () => {
            window.cancelAnimationFrame(id);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus?.();
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                close();
                triggerRef.current?.focus();
                return;
            }
            if (e.key === "Tab") {
                const dialog = dialogRef.current;
                if (!dialog) return;
                const focusables = dialog.querySelectorAll<HTMLElement>(focusableSelector());
                if (focusables.length === 0) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                const active = document.activeElement as HTMLElement | null;
                if (e.shiftKey && (active === first || !dialog.contains(active))) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && active === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [close, open]);

    const backdropClick = useMemo(
        () => (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) close();
        },
        [close],
    );

    const triggerClass =
        variant === "primary"
            ? "inline-flex items-center justify-center gap-1.5 min-h-11 bg-gold hover:bg-gold-light text-velvet-950 text-xs font-semibold tracking-[0.12em] uppercase px-5 py-2.5 rounded-full transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
            : "inline-flex items-center justify-center gap-1.5 min-h-11 border border-gold/40 hover:border-gold text-gold hover:text-gold-light text-xs font-semibold tracking-[0.12em] uppercase px-5 py-2.5 rounded-full transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900";

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={triggerClass}
            >
                <span>{label}</span>
                <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
            </button>

            {open ? (
                <div
                    className="fixed inset-0 z-[100] bg-velvet-950/85 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto"
                    onMouseDown={backdropClick}
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                        className="bg-velvet-900 text-silk p-7 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gold/30"
                        data-surface="dark"
                    >
                        <div className="flex justify-between items-start mb-5 gap-3">
                            <h2
                                id={titleId}
                                className="font-display italic text-2xl text-silk"
                            >
                                {t("modalTitleTemplate", { name: modelName })}
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    close();
                                    triggerRef.current?.focus();
                                }}
                                className="inline-flex w-11 h-11 items-center justify-center rounded-full text-silk/85 hover:text-gold hover:bg-velvet-800 transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                aria-label={t("modalClose")}
                            >
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <p id={descriptionId} className="text-sm text-silk/85 mb-5 leading-relaxed">
                            {t("modalDescriptionTemplate", { name: modelName })}
                        </p>

                        {sent ? (
                            <div
                                role="status"
                                aria-live="polite"
                                className="rounded-2xl border border-gold/30 bg-velvet-800 p-5 text-center"
                            >
                                <svg
                                    className="w-8 h-8 text-gold mx-auto mb-2"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <p className="font-semibold text-silk">{t("modalSent")}</p>
                                <p className="text-xs text-silk/80 mt-1">{t("modalFooter")}</p>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submit();
                                }}
                                className="space-y-4"
                                noValidate
                            >
                                <div>
                                    <label
                                        htmlFor={inputId}
                                        className="block text-[0.72rem] uppercase tracking-[0.18em] text-silk/70 mb-2"
                                    >
                                        {t("contactLabel")}
                                    </label>
                                    <input
                                        ref={inputRef}
                                        id={inputId}
                                        type="text"
                                        value={contact}
                                        onChange={(e) => {
                                            setContact(e.target.value);
                                            if (error) setError(null);
                                        }}
                                        inputMode={detectInputMode(contact)}
                                        autoComplete="email"
                                        aria-required="true"
                                        aria-invalid={error ? "true" : "false"}
                                        aria-describedby={error ? errorId : undefined}
                                        className="w-full bg-velvet-950 border border-silk/25 rounded-xl px-4 py-3 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold transition text-sm text-silk placeholder-silk/55"
                                        placeholder={t("modalPlaceholder")}
                                    />
                                    {error ? (
                                        <p id={errorId} role="alert" className="text-xs text-danger mt-1.5">
                                            {error}
                                        </p>
                                    ) : null}
                                </div>

                                <label
                                    htmlFor={ageId}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-velvet-950/60 border border-velvet-800 cursor-pointer"
                                >
                                    <input
                                        id={ageId}
                                        type="checkbox"
                                        checked={age}
                                        onChange={(e) => {
                                            setAge(e.target.checked);
                                            if (ageError) setAgeError(null);
                                        }}
                                        className="mt-0.5 w-5 h-5 rounded border-silk/30 bg-velvet-900"
                                        aria-required="true"
                                        aria-invalid={ageError ? "true" : "false"}
                                    />
                                    <span className="text-[0.78rem] text-silk/85 leading-snug">
                                        {tCheckout("ageConfirmDescription")}
                                    </span>
                                </label>
                                {ageError ? (
                                    <p role="alert" className="text-xs text-danger -mt-2">
                                        {ageError}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3.5 rounded-xl text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                                >
                                    <span>{t("modalSubmit")}</span>
                                    <svg
                                        className="w-3.5 h-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </button>
                            </form>
                        )}

                        <p className="text-[11px] text-silk/65 mt-5 text-center leading-relaxed">
                            {t("modalFooter")}
                        </p>
                    </div>
                </div>
            ) : null}
        </>
    );
}
