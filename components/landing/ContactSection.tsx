"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

type ContactSectionProps = {
    contactPhone: string | null;
    whatsappPhone: string | null;
    contactEmail: string | null;
};

type InterestKey = "custom" | "rent" | "buy" | "catalog";

type FormValues = {
    name: string;
    contactMethod: string;
    interest: InterestKey;
    message: string;
    age: boolean;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const VALID_INTERESTS: readonly InterestKey[] = ["custom", "rent", "buy", "catalog"];
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function detectContactKind(value: string): "email" | "phone" | "other" {
    if (EMAIL_PATTERN.test(value)) return "email";
    if (PHONE_PATTERN.test(value.replace(/[\s-]/g, ""))) return "phone";
    return "other";
}

function buildWhatsappHref(rawPhone: string, message: string) {
    const digits = rawPhone.replace(/[^\d]/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function buildMailtoHref(email: string, subject: string, body: string) {
    const params = new URLSearchParams({ subject, body });
    return `mailto:${email}?${params.toString()}`;
}

function buildTelHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function parseInterest(value: string | null): InterestKey {
    if (value && (VALID_INTERESTS as readonly string[]).includes(value)) {
        return value as InterestKey;
    }
    return "custom";
}

export default function ContactSection({
    contactPhone,
    whatsappPhone,
    contactEmail,
}: ContactSectionProps) {
    const t = useTranslations("home.contact");
    const searchParams = useSearchParams();

    const initialInterest = parseInterest(searchParams.get("interest"));

    const [values, setValues] = useState<FormValues>({
        name: "",
        contactMethod: "",
        interest: initialInterest,
        message: "",
        age: false,
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const firstErrorRef = useRef<HTMLElement | null>(null);

    const displayPhone = whatsappPhone ?? contactPhone ?? "";
    const displayEmail = contactEmail ?? "";

    useEffect(() => {
        if (initialInterest !== values.interest) {
            setValues((v) => ({ ...v, interest: initialInterest }));
        }
        // We intentionally only re-sync when the URL changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialInterest]);

    function validate(v: FormValues): FieldErrors {
        const next: FieldErrors = {};
        if (!v.name.trim()) next.name = t("validationName");
        const contactKind = detectContactKind(v.contactMethod.trim());
        if (!v.contactMethod.trim() || contactKind === "other") {
            next.contactMethod = t("validationContact");
        }
        if (!(VALID_INTERESTS as readonly string[]).includes(v.interest)) {
            next.interest = t("validationInterest");
        }
        if (!v.age) next.age = t("validationAge");
        return next;
    }

    function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        const nextErrors = validate(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            const firstKey = Object.keys(nextErrors)[0] as keyof FieldErrors;
            const el = document.getElementById(`contact-${firstKey}`);
            if (el instanceof HTMLElement) {
                firstErrorRef.current = el;
                el.focus({ preventScroll: false });
            }
            return;
        }

        setSubmitting(true);

        const interestLabel = t(
            values.interest === "custom"
                ? "interestCustom"
                : values.interest === "rent"
                  ? "interestRent"
                  : values.interest === "buy"
                    ? "interestBuy"
                    : "interestCatalog",
        );

        const lines = [
            values.name ? `${t("nameLabel")}: ${values.name}` : null,
            values.contactMethod ? `${t("contactLabel")}: ${values.contactMethod}` : null,
            `${t("interestLabel")}: ${interestLabel}`,
            values.message ? `${t("messageLabel")}: ${values.message}` : null,
        ].filter(Boolean) as string[];

        const body = lines.join("\n");

        let href: string | null = null;
        if (whatsappPhone) {
            href = buildWhatsappHref(whatsappPhone, body);
        } else if (contactEmail) {
            href = buildMailtoHref(contactEmail, interestLabel, body);
        } else if (contactPhone) {
            href = buildTelHref(contactPhone);
        }

        if (href) {
            const navigated = window.open(href, "_blank", "noopener,noreferrer");
            if (!navigated) {
                window.location.href = href;
            }
        }

        setSubmitting(false);
        setSubmitted(true);
    };

    const dismissSuccess = () => {
        setSubmitted(false);
        setValues({
            name: "",
            contactMethod: "",
            interest: initialInterest,
            message: "",
            age: false,
        });
    };

    const inputClass =
        "w-full bg-velvet-950 border border-silk/25 rounded-xl px-4 py-3.5 text-silk placeholder-silk/60 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent transition text-sm";
    const labelClass =
        "block text-[0.72rem] font-semibold text-silk/85 uppercase tracking-[0.18em] mb-2";

    return (
        <section
            id="contact"
            aria-labelledby="contact-title"
            className="py-24 bg-velvet-900 text-white relative"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-velvet-950 to-velvet-900 pointer-events-none"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-0 bg-velvet-950/85 rounded-3xl overflow-hidden border border-gold/15 shadow-2xl">
                    <div className="w-full lg:w-5/12 p-8 sm:p-12 bg-gradient-to-br from-velvet-900 to-velvet-950 flex flex-col justify-between lg:border-r border-velvet-800">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-2">
                                {t("badge")}
                            </span>
                            <h2
                                id="contact-title"
                                className="text-3xl sm:text-4xl font-bold mb-6 font-serif"
                            >
                                {t("title")}
                            </h2>
                            <p className="text-silk/85 text-sm sm:text-base leading-relaxed mb-8">
                                {t("description")}
                            </p>

                            <ul className="space-y-5">
                                {displayPhone ? (
                                    <li>
                                        <a
                                            href={
                                                whatsappPhone
                                                    ? buildWhatsappHref(whatsappPhone, "")
                                                    : buildTelHref(displayPhone)
                                            }
                                            target={whatsappPhone ? "_blank" : undefined}
                                            rel={whatsappPhone ? "noopener noreferrer" : undefined}
                                            className="flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1"
                                        >
                                            <span className="w-12 h-12 bg-velvet-800 group-hover:bg-velvet-700 rounded-full flex items-center justify-center text-gold border border-gold/30 transition shrink-0">
                                                <svg
                                                    className="w-5 h-5"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                    focusable="false"
                                                >
                                                    <path d="M20.52 3.48A12 12 0 003.48 20.52L2 22l1.55-4.4A11.97 11.97 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.94 9.94 0 01-5.07-1.38l-.36-.22-3.06.87.81-2.99-.24-.38A9.96 9.96 0 1122 12c0 5.51-4.49 10-10 10zm5.49-7.55c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.36.22-.66.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.28.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.23 5.13 4.53.72.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.34z" />
                                                </svg>
                                            </span>
                                            <span>
                                                <span className="block text-[10px] text-silk/70 uppercase tracking-widest mb-0.5">
                                                    {t("whatsappSub")}
                                                </span>
                                                <span className="block font-semibold text-sm sm:text-base text-white group-hover:text-gold transition">
                                                    {displayPhone}
                                                </span>
                                            </span>
                                        </a>
                                    </li>
                                ) : null}
                                {displayEmail ? (
                                    <li>
                                        <a
                                            href={`mailto:${displayEmail}`}
                                            className="flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1"
                                        >
                                            <span className="w-12 h-12 bg-velvet-800 group-hover:bg-velvet-700 rounded-full flex items-center justify-center text-gold border border-gold/30 transition shrink-0">
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
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                            </span>
                                            <span>
                                                <span className="block text-[10px] text-silk/70 uppercase tracking-widest mb-0.5">
                                                    {t("emailSub")}
                                                </span>
                                                <span className="block font-semibold text-sm sm:text-base text-white group-hover:text-gold transition">
                                                    {displayEmail}
                                                </span>
                                            </span>
                                        </a>
                                    </li>
                                ) : null}
                            </ul>
                        </div>

                        <p className="mt-12 pt-6 border-t border-velvet-800 text-sm text-silk/70">
                            {t("footnote")}
                        </p>
                    </div>

                    <div className="w-full lg:w-7/12 p-8 sm:p-12 bg-velvet-950/40">
                        {submitted ? (
                            <div
                                role="status"
                                aria-live="polite"
                                className="rounded-2xl border border-gold/30 bg-gradient-to-br from-velvet-800 to-velvet-900 p-6 text-center"
                            >
                                <svg
                                    className="w-10 h-10 text-gold mx-auto mb-3"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <p className="font-bold text-white text-lg">
                                    {t("successTitle")}
                                </p>
                                <p className="text-sm text-silk/80 mt-2">
                                    {t("successDescription")}
                                </p>
                                <button
                                    type="button"
                                    onClick={dismissSuccess}
                                    className="mt-5 inline-flex items-center justify-center rounded-full border border-silk/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-silk hover:border-gold hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                >
                                    {t("successDismiss")}
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                aria-describedby="contact-form-help"
                                className="space-y-6"
                            >
                                {submitError ? (
                                    <div
                                        role="alert"
                                        className="rounded-2xl border border-red-400/60 bg-red-500/10 p-4 text-sm text-red-100"
                                    >
                                        <p className="font-semibold">{t("errorTitle")}</p>
                                        <p className="opacity-90">{submitError}</p>
                                    </div>
                                ) : null}

                                <fieldset className="space-y-6">
                                    <legend className="sr-only">{t("title")}</legend>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="contact-name" className={labelClass}>
                                                {t("nameLabel")}{" "}
                                                <span className="text-gold" aria-hidden="true">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                id="contact-name"
                                                name="name"
                                                value={values.name}
                                                onChange={(e) => setField("name", e.target.value)}
                                                placeholder={t("namePlaceholder")}
                                                autoComplete="name"
                                                required
                                                aria-required="true"
                                                aria-invalid={errors.name ? "true" : "false"}
                                                aria-describedby={errors.name ? "contact-name-error" : undefined}
                                                className={inputClass}
                                            />
                                            {errors.name ? (
                                                <p
                                                    id="contact-name-error"
                                                    role="alert"
                                                    className="mt-1.5 text-xs text-red-300"
                                                >
                                                    {errors.name}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <label htmlFor="contact-contactMethod" className={labelClass}>
                                                {t("contactLabel")}
                                            </label>
                                            <input
                                                type="text"
                                                id="contact-contactMethod"
                                                name="contact_method"
                                                inputMode="email"
                                                value={values.contactMethod}
                                                onChange={(e) =>
                                                    setField("contactMethod", e.target.value)
                                                }
                                                placeholder={t("contactPlaceholder")}
                                                required
                                                aria-required="true"
                                                aria-invalid={errors.contactMethod ? "true" : "false"}
                                                aria-describedby={
                                                    errors.contactMethod
                                                        ? "contact-contactMethod-error"
                                                        : undefined
                                                }
                                                className={inputClass}
                                            />
                                            {errors.contactMethod ? (
                                                <p
                                                    id="contact-contactMethod-error"
                                                    role="alert"
                                                    className="mt-1.5 text-xs text-red-300"
                                                >
                                                    {errors.contactMethod}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="contact-interest" className={labelClass}>
                                            {t("interestLabel")}{" "}
                                            <span className="text-gold" aria-hidden="true">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            id="contact-interest"
                                            name="interest"
                                            value={values.interest}
                                            onChange={(e) =>
                                                setField("interest", e.target.value as InterestKey)
                                            }
                                            required
                                            aria-required="true"
                                            className={inputClass}
                                        >
                                            <option value="custom">{t("interestCustom")}</option>
                                            <option value="rent">{t("interestRent")}</option>
                                            <option value="buy">{t("interestBuy")}</option>
                                            <option value="catalog">{t("interestCatalog")}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="contact-message" className={labelClass}>
                                            {t("messageLabel")}
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            name="message"
                                            rows={4}
                                            value={values.message}
                                            onChange={(e) => setField("message", e.target.value)}
                                            placeholder={t("messagePlaceholder")}
                                            className={`${inputClass} resize-y`}
                                        />
                                    </div>
                                </fieldset>

                                <div className="flex items-start gap-3 rounded-xl bg-velvet-950/60 border border-velvet-800 p-4">
                                    <input
                                        type="checkbox"
                                        id="contact-age"
                                        name="age"
                                        checked={values.age}
                                        onChange={(e) => setField("age", e.target.checked)}
                                        required
                                        aria-required="true"
                                        aria-invalid={errors.age ? "true" : "false"}
                                        aria-describedby={errors.age ? "contact-age-error" : undefined}
                                        className="h-5 w-5 rounded border-silk/30 accent-gold bg-velvet-900 mt-0.5 cursor-pointer shrink-0"
                                    />
                                    <div className="flex-1">
                                        <label
                                            htmlFor="contact-age"
                                            className="text-sm font-medium text-silk leading-relaxed cursor-pointer select-none"
                                        >
                                            {t("ageLabel")}
                                        </label>
                                        {errors.age ? (
                                            <p
                                                id="contact-age-error"
                                                role="alert"
                                                className="mt-1 text-xs text-red-300"
                                            >
                                                {errors.age}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <p id="contact-form-help" className="sr-only">
                                    {t("description")}
                                </p>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-4 rounded-xl transition-colors duration-200 tracking-[0.16em] uppercase text-xs inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:bg-velvet-700 disabled:text-silk/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                                >
                                    <span>{submitting ? t("submitting") : t("submitButton")}</span>
                                    {!submitting && (
                                        <svg
                                            className="w-3.5 h-3.5 ml-2"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <path d="M12 1a5 5 0 00-5 5h2a3 3 0 016 0v4H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V6a5 5 0 00-5-5z" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
