"use client";

import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, {
    type RentalRangeValue,
} from "@/components/RentalDateRangePicker";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatPrice, formatPricePerDay, getIntlLocale } from "@/i18n/format";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import {
    getCountyByCode,
    romanianCounties,
    type RomanianCountyCode,
} from "@/lib/locations/romania";
import LocalityCombobox from "@/components/LocalityCombobox";

type OrderCheckoutProps = {
    doll: Doll;
    mode: CatalogMode;
    startDate: string;
    endDate: string;
    outfitId: string;
    options: string;
    total: string;
    action: (formData: FormData) => Promise<void>;
    settings: PublicPlatformSettings;
};

type ContactMethod = "whatsapp" | "telegram" | "call" | "email";

type OrderFormState = {
    fullName: string;
    email: string;
    phone: string;
    contactMethod: ContactMethod;
    contactWindowStart: string;
    contactWindowEnd: string;
    county: "" | RomanianCountyCode;
    city: string;
    deliveryAddress: string;
    deliveryTime: string;
    returnTime: string;
    notes: string;
    ageConfirmed: boolean;
    privacyAccepted: boolean;
};

type FieldErrors = Partial<Record<keyof OrderFormState | "period", string>>;

const PHONE_PATTERN = /^\+?[0-9 \-().]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDRESS_MAX = 500;

function formatDate(value: string, locale: string, fallback: string) {
    if (!value) return fallback;
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(`${year}-${month}-${day}T00:00:00`));
}

function getBackHref(dollId: string, mode: CatalogMode, startDate: string, endDate: string) {
    const params = new URLSearchParams({ mode });
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    return `/catalog/${dollId}?${params.toString()}`;
}

function parseDate(value: string) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getRentalDays(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return 0;
    const diff = end.getTime() - start.getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil(diff / dayMs));
}

function localizedHref(locale: string, path: string) {
    return locale === "ro" ? path : `/${locale}${path}`;
}

const inputBase =
    "w-full bg-velvet-950 border border-velvet-700 rounded-xl px-4 py-3.5 text-white placeholder-silk/55 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold transition text-sm";
const inputWithIcon =
    "w-full bg-velvet-950 border border-velvet-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-silk/55 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold transition text-sm";

function IconLeft({ children }: { children: React.ReactNode }) {
    return (
        <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 pl-4 flex items-center text-silk/70 pointer-events-none"
        >
            {children}
        </span>
    );
}

export default function OrderCheckout({
    doll,
    mode,
    startDate,
    endDate,
    outfitId,
    options,
    total,
    action,
    settings,
}: OrderCheckoutProps) {
    const locale = useLocale();
    const t = useTranslations("checkout");
    const tCommon = useTranslations("common");
    const tFooter = useTranslations("footer");
    const currency = settings.currency || "RON";
    const reactId = useId();
    const formId = `${reactId}-checkout-form`;

    const [checkoutPeriod, setCheckoutPeriod] = useState<RentalRangeValue>({
        startDate,
        endDate,
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const formDirtyRef = useRef(false);

    const periodSectionRef = useRef<HTMLDivElement | null>(null);
    const hasCompletePeriod = Boolean(checkoutPeriod.startDate && checkoutPeriod.endDate);

    const initialRentalDays = mode === "rent" ? getRentalDays(startDate, endDate) : 0;
    const initialBaseTotal =
        mode === "rent"
            ? initialRentalDays * (doll.rentPricePerDay ?? 0)
            : doll.buyPrice ?? 0;

    const initialTotalAmount = Number(total);
    const extrasTotal =
        Number.isFinite(initialTotalAmount) && initialTotalAmount > initialBaseTotal
            ? initialTotalAmount - initialBaseTotal
            : 0;

    const liveRentalDays =
        mode === "rent"
            ? getRentalDays(checkoutPeriod.startDate, checkoutPeriod.endDate)
            : 0;
    const liveBaseTotal =
        mode === "rent"
            ? liveRentalDays * (doll.rentPricePerDay ?? 0)
            : doll.buyPrice ?? 0;
    const liveTotalAmount = Math.max(0, liveBaseTotal + extrasTotal);

    const [form, setForm] = useState<OrderFormState>({
        fullName: "",
        email: "",
        phone: "",
        contactMethod: "whatsapp",
        contactWindowStart: "",
        contactWindowEnd: "",
        county: "",
        city: "",
        deliveryAddress: "",
        deliveryTime: settings.default_delivery_start_time ?? "",
        returnTime: settings.default_return_start_time ?? "",
        notes: "",
        ageConfirmed: false,
        privacyAccepted: false,
    });

    const markDirty = useCallback(() => {
        formDirtyRef.current = true;
    }, []);

    function updateField<K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) {
        setForm((current) => ({ ...current, [field]: value }));
        markDirty();
        setErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    const updateCheckoutPeriod = useCallback((value: RentalRangeValue) => {
        setCheckoutPeriod((current) => {
            if (current.startDate === value.startDate && current.endDate === value.endDate) {
                return current;
            }
            return value;
        });
        formDirtyRef.current = true;
        if (value.startDate && value.endDate) {
            setErrors((current) => {
                if (!current.period) return current;
                const next = { ...current };
                delete next.period;
                return next;
            });
        }
    }, []);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!formDirtyRef.current || isPending) return;
            e.preventDefault();
            e.returnValue = t("unsavedChangesWarning");
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isPending, t]);

    const totalLabel = useMemo(() => {
        if (!Number.isFinite(liveTotalAmount) || liveTotalAmount <= 0) {
            return t("pendingTotal");
        }
        return formatPrice(liveTotalAmount, locale, currency);
    }, [currency, liveTotalAmount, locale, t]);

    const modeLabel = mode === "rent" ? tCommon("rent") : tCommon("buy");
    const summaryTypeLabel = mode === "rent" ? t("serviceTypeRent") : t("serviceTypeBuy");
    const isRent = mode === "rent";

    function validateForm(): FieldErrors {
        const next: FieldErrors = {};
        if (!form.fullName.trim()) next.fullName = t("fieldRequired");
        const phoneClean = form.phone.replace(/[\s-]/g, "");
        if (!form.phone.trim()) {
            next.phone = t("fieldRequired");
        } else if (!PHONE_PATTERN.test(phoneClean) || phoneClean.replace(/[^\d]/g, "").length < 7) {
            next.phone = t("fieldInvalidPhone");
        }
        if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
            next.email = t("fieldInvalidEmail");
        }
        if (
            form.contactWindowStart &&
            form.contactWindowEnd &&
            form.contactWindowEnd <= form.contactWindowStart
        ) {
            next.contactWindowEnd = t("contactWindowError");
        }
        if (!form.county) next.county = t("fieldRequired");
        if (!form.city) next.city = t("fieldRequired");
        if (!form.deliveryAddress.trim()) next.deliveryAddress = t("fieldRequired");
        if (isRent && (!form.deliveryTime || !form.returnTime)) {
            if (!form.deliveryTime) next.deliveryTime = t("fieldRequired");
            if (!form.returnTime) next.returnTime = t("fieldRequired");
        }
        if (isRent && !hasCompletePeriod) next.period = t("periodError");
        if (!form.ageConfirmed) next.ageConfirmed = t("ageRequired");
        if (!form.privacyAccepted) next.privacyAccepted = t("privacyRequired");
        return next;
    }

    const submitInvalid = useMemo(() => {
        return Object.keys(validateForm()).length > 0;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, checkoutPeriod, hasCompletePeriod, isRent]);

    function focusFirstError(fieldErrors: FieldErrors) {
        const fieldOrder: (keyof OrderFormState | "period")[] = [
            "fullName",
            "phone",
            "email",
            "contactWindowEnd",
            "county",
            "city",
            "period",
            "deliveryTime",
            "returnTime",
            "deliveryAddress",
            "ageConfirmed",
            "privacyAccepted",
        ];
        for (const key of fieldOrder) {
            if (!fieldErrors[key]) continue;
            const container = document.querySelector<HTMLElement>(
                `[data-field="${key}"]`,
            );
            if (!container) break;
            container.scrollIntoView({ behavior: "smooth", block: "center" });
            const focusTarget =
                container.matches("input,select,textarea,button")
                    ? (container as HTMLElement)
                    : container.querySelector<HTMLElement>(
                          "input:not([type='hidden']), select, textarea, button",
                      );
            window.setTimeout(
                () => focusTarget?.focus({ preventScroll: true }),
                220,
            );
            break;
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitError(null);
        const fieldErrors = validateForm();
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) {
            focusFirstError(fieldErrors);
            return;
        }
        const formData = new FormData(event.currentTarget);
        formDirtyRef.current = false;
        startTransition(async () => {
            try {
                await action(formData);
            } catch (error) {
                if (
                    error instanceof Error &&
                    "digest" in error &&
                    typeof (error as { digest?: unknown }).digest === "string" &&
                    ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
                        (error as { digest: string }).digest === "NEXT_NOT_FOUND")
                ) {
                    throw error;
                }
                formDirtyRef.current = true;
                const message =
                    error instanceof Error ? error.message : t("submitErrorDescription");
                setSubmitError(message);
            }
        });
    }

    const cardClass =
        "bg-velvet-900/40 border border-velvet-700 rounded-3xl p-6 sm:p-8 shadow-xl";
    const legendClass =
        "text-xl font-bold font-serif text-gold mb-6 flex items-center gap-3 border-b border-velvet-700 pb-4";
    const stepBadge =
        "w-8 h-8 rounded-full bg-velvet-950 border border-gold/40 flex items-center justify-center text-sm text-gold font-bold";

    const renderError = (key: keyof FieldErrors) =>
        errors[key] ? (
            <p role="alert" className="mt-1.5 text-xs text-red-300">
                {errors[key]}
            </p>
        ) : null;

    return (
        <div className="bg-velvet-950 text-silk min-h-screen relative overflow-hidden">
            <div
                aria-hidden="true"
                className="absolute top-40 left-0 w-96 h-96 bg-velvet-500/10 rounded-full filter blur-[120px] pointer-events-none"
            />
            <div
                aria-hidden="true"
                className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-[100px] pointer-events-none"
            />

            <div className="pt-28 pb-32 lg:pt-36 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <nav
                    aria-label={t("breadcrumbSecure")}
                    className="text-sm text-silk/80 mb-6 flex items-center gap-2 flex-wrap relative z-10"
                >
                    <Link href="/" className="hover:text-gold transition focus-visible:outline-none focus-visible:underline">
                        {t("breadcrumbHome")}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link
                        href={`/catalog?mode=${mode}`}
                        className="hover:text-gold transition focus-visible:outline-none focus-visible:underline"
                    >
                        {t("breadcrumbCatalog")}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link
                        href={getBackHref(doll.id, mode, startDate, endDate)}
                        className="hover:text-gold transition focus-visible:outline-none focus-visible:underline"
                    >
                        {doll.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-gold" aria-current="page">
                        {t("breadcrumbSecure")}
                    </span>
                </nav>

                <header className="mb-8 relative z-10">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white mb-3 leading-tight">
                        {t.rich("title", {
                            mode: modeLabel,
                            em: (chunks) => <em className="text-gold not-italic">{chunks}</em>,
                        })}
                    </h1>
                    <p className="text-silk/85 text-sm sm:text-base">{t("subtitle")}</p>

                    <ol
                        role="list"
                        aria-label={t("step", { current: 1, total: 3 })}
                        className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-silk/80"
                    >
                        {[t("stepContact"), t("stepDelivery"), t("stepConfirm")].map(
                            (label, idx) => (
                                <li
                                    key={label}
                                    className="flex items-center gap-2"
                                    aria-current={idx === 0 ? "step" : undefined}
                                >
                                    <span
                                        className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                                            idx === 0
                                                ? "border-gold bg-gold/10 text-gold"
                                                : "border-velvet-700 text-silk/70"
                                        }`}
                                    >
                                        {idx + 1}
                                    </span>
                                    <span className={idx === 0 ? "text-gold" : ""}>{label}</span>
                                    {idx < 2 && (
                                        <span
                                            aria-hidden="true"
                                            className="hidden sm:inline-block w-8 h-px bg-velvet-700"
                                        />
                                    )}
                                </li>
                            ),
                        )}
                    </ol>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10">
                    <div className="lg:col-span-7">
                        <form
                            id={formId}
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-8"
                        >
                            <input type="hidden" name="_locale" value={locale} />
                            <input type="hidden" name="mode" value={mode} />
                            <input type="hidden" name="doll_slug" value={doll.id} />
                            <input type="hidden" name="outfit_id" value={outfitId} />
                            <input type="hidden" name="options" value={options} />
                            <input type="hidden" name="total" value={String(liveTotalAmount)} />
                            <input type="hidden" name="start_date" value={checkoutPeriod.startDate} />
                            <input type="hidden" name="end_date" value={checkoutPeriod.endDate} />

                            {submitError ? (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="rounded-2xl border border-red-400/60 bg-red-500/10 p-4 text-sm text-red-100"
                                >
                                    <p className="font-semibold">{t("submitErrorTitle")}</p>
                                    <p className="opacity-90 mt-1">{submitError}</p>
                                </div>
                            ) : null}

                            <fieldset className={cardClass}>
                                <legend className={legendClass}>
                                    <span className={stepBadge}>1</span>
                                    {t("contactSectionTitle")}
                                </legend>

                                <div className="space-y-5">
                                    <div data-field="fullName">
                                        <label
                                            htmlFor={`${formId}-fullName`}
                                            className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                        >
                                            {t("fullName")}{" "}
                                            <span className="text-gold" aria-hidden="true">*</span>
                                        </label>
                                        <p className="text-xs text-silk/70 mb-2">{t("fullNameHelp")}</p>
                                        <div className="relative">
                                            <IconLeft>
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                                    <circle cx="12" cy="8" r="4" />
                                                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                                                </svg>
                                            </IconLeft>
                                            <input
                                                id={`${formId}-fullName`}
                                                type="text"
                                                name="full_name"
                                                value={form.fullName}
                                                onChange={(event) => updateField("fullName", event.target.value)}
                                                autoComplete="name"
                                                required
                                                aria-required="true"
                                                aria-invalid={errors.fullName ? "true" : "false"}
                                                aria-describedby={errors.fullName ? `${formId}-fullName-error` : undefined}
                                                placeholder={t("fullNamePlaceholder")}
                                                className={inputWithIcon}
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p id={`${formId}-fullName-error`} role="alert" className="mt-1.5 text-xs text-red-300">
                                                {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div data-field="phone">
                                            <label
                                                htmlFor={`${formId}-phone`}
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("phone")} <span className="text-gold" aria-hidden="true">*</span>
                                            </label>
                                            <p className="text-xs text-silk/70 mb-2">{t("phoneHelp")}</p>
                                            <div className="relative">
                                                <IconLeft>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                                                    </svg>
                                                </IconLeft>
                                                <input
                                                    id={`${formId}-phone`}
                                                    type="tel"
                                                    name="phone"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    value={form.phone}
                                                    onChange={(event) => updateField("phone", event.target.value)}
                                                    required
                                                    aria-required="true"
                                                    aria-invalid={errors.phone ? "true" : "false"}
                                                    placeholder={t("phonePlaceholder")}
                                                    className={inputWithIcon}
                                                />
                                            </div>
                                            {renderError("phone")}
                                        </div>

                                        <div data-field="email">
                                            <label
                                                htmlFor={`${formId}-email`}
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("emailLabel")}
                                            </label>
                                            <div className="relative">
                                                <IconLeft>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                                        <rect x="3" y="5" width="18" height="14" rx="2" />
                                                        <path d="M3 7l9 6 9-6" />
                                                    </svg>
                                                </IconLeft>
                                                <input
                                                    id={`${formId}-email`}
                                                    type="email"
                                                    name="email"
                                                    autoComplete="email"
                                                    value={form.email}
                                                    onChange={(event) => updateField("email", event.target.value)}
                                                    aria-invalid={errors.email ? "true" : "false"}
                                                    placeholder={t("emailPlaceholder")}
                                                    className={inputWithIcon}
                                                />
                                            </div>
                                            {renderError("email")}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label
                                                htmlFor={`${formId}-contactMethod`}
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("contactMethod")}
                                            </label>
                                            <p className="text-xs text-silk/70 mb-2">{t("contactMethodHelp")}</p>
                                            <select
                                                id={`${formId}-contactMethod`}
                                                name="contact_method"
                                                value={form.contactMethod}
                                                onChange={(event) =>
                                                    updateField("contactMethod", event.target.value as ContactMethod)
                                                }
                                                className={`${inputBase} cursor-pointer`}
                                            >
                                                <option value="whatsapp">{t("contactMethodWhatsapp")}</option>
                                                <option value="telegram">{t("contactMethodTelegram")}</option>
                                                <option value="call">{t("contactMethodCall")}</option>
                                                <option value="email">{t("contactMethodEmail")}</option>
                                            </select>
                                        </div>

                                        <div data-field="contactWindowEnd">
                                            <label
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("contactWindow")}
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="time"
                                                    name="contact_window_start"
                                                    value={form.contactWindowStart}
                                                    onChange={(event) =>
                                                        updateField("contactWindowStart", event.target.value)
                                                    }
                                                    aria-label={t("contactWindowFromAria")}
                                                    className={`${inputBase} cursor-pointer`}
                                                    style={{ colorScheme: "dark" }}
                                                />
                                                <span aria-hidden="true" className="text-silk/70 font-bold">–</span>
                                                <input
                                                    type="time"
                                                    name="contact_window_end"
                                                    value={form.contactWindowEnd}
                                                    onChange={(event) =>
                                                        updateField("contactWindowEnd", event.target.value)
                                                    }
                                                    aria-label={t("contactWindowToAria")}
                                                    className={`${inputBase} cursor-pointer`}
                                                    style={{ colorScheme: "dark" }}
                                                />
                                            </div>
                                            {renderError("contactWindowEnd")}
                                            {form.contactWindowStart && form.contactWindowEnd && !errors.contactWindowEnd && (
                                                <p className="mt-1.5 text-xs text-silk/80">
                                                    {t("contactWindowSummary", {
                                                        from: form.contactWindowStart,
                                                        to: form.contactWindowEnd,
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className={cardClass}>
                                <legend className={legendClass}>
                                    <span className={stepBadge}>2</span>
                                    {t("deliverySectionTitle")}
                                </legend>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div data-field="county">
                                            <label
                                                htmlFor={`${formId}-county`}
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("county")} <span className="text-gold" aria-hidden="true">*</span>
                                            </label>
                                            <select
                                                id={`${formId}-county`}
                                                name="delivery_county"
                                                value={form.county}
                                                onChange={(event) => {
                                                    const next = event.target.value as "" | RomanianCountyCode;
                                                    setForm((current) => ({
                                                        ...current,
                                                        county: next,
                                                        city: "",
                                                    }));
                                                    markDirty();
                                                    setErrors((curr) => {
                                                        const n = { ...curr };
                                                        delete n.county;
                                                        delete n.city;
                                                        return n;
                                                    });
                                                }}
                                                required
                                                aria-required="true"
                                                aria-invalid={errors.county ? "true" : "false"}
                                                autoComplete="address-level1"
                                                className={`${inputBase} cursor-pointer`}
                                            >
                                                <option value="">{t("countyChoose")}</option>
                                                {romanianCounties.map((county) => (
                                                    <option key={county.code} value={county.code}>
                                                        {county.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {renderError("county")}
                                        </div>

                                        <div data-field="city">
                                            <label
                                                id={`${formId}-city-label`}
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("city")} <span className="text-gold" aria-hidden="true">*</span>
                                            </label>
                                            <LocalityCombobox
                                                name="delivery_city"
                                                value={form.city}
                                                onChange={(next) => updateField("city", next)}
                                                groups={
                                                    (form.county &&
                                                        getCountyByCode(form.county)?.groups) ||
                                                    []
                                                }
                                                disabled={!form.county}
                                                required
                                                placeholder={t("cityPlaceholder")}
                                                emptyPlaceholder={t("cityCountyFirst")}
                                                searchPlaceholder={t("citySearchPlaceholder")}
                                                noResultsLabel={t("cityNoResults")}
                                                aria-labelledby={`${formId}-city-label`}
                                            />
                                            {renderError("city")}
                                        </div>
                                    </div>

                                    <div className="bg-velvet-900/60 p-4 rounded-xl border border-velvet-700">
                                        <p className="block text-[11px] font-bold text-gold uppercase tracking-wider mb-2">
                                            {t("serviceType")}
                                        </p>
                                        <p className="text-white text-sm">{summaryTypeLabel}</p>
                                        <p className="text-xs text-silk/70 mt-1">{t("serviceTypeHelp")}</p>
                                    </div>

                                    {isRent && (
                                        <div className="space-y-5 pt-2" ref={periodSectionRef} data-field="period">
                                            <div>
                                                <label
                                                    className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                                >
                                                    {t("rentPeriod")} <span className="text-gold" aria-hidden="true">*</span>
                                                </label>
                                                <RentalDateRangePicker
                                                    initialStartDate={checkoutPeriod.startDate}
                                                    initialEndDate={checkoutPeriod.endDate}
                                                    onChange={updateCheckoutPeriod}
                                                    placement="bottom"
                                                />
                                                {renderError("period")}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div data-field="deliveryTime">
                                                    <label
                                                        htmlFor={`${formId}-deliveryTime`}
                                                        className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                                    >
                                                        {t("deliveryTime")} <span className="text-gold" aria-hidden="true">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <IconLeft>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <path d="M12 6v6l4 2" />
                                                            </svg>
                                                        </IconLeft>
                                                        <input
                                                            id={`${formId}-deliveryTime`}
                                                            type="time"
                                                            name="delivery_time"
                                                            value={form.deliveryTime}
                                                            onChange={(event) =>
                                                                updateField("deliveryTime", event.target.value)
                                                            }
                                                            required
                                                            aria-required="true"
                                                            aria-invalid={errors.deliveryTime ? "true" : "false"}
                                                            className={`${inputWithIcon} cursor-pointer`}
                                                            style={{ colorScheme: "dark" }}
                                                        />
                                                    </div>
                                                    {renderError("deliveryTime")}
                                                </div>

                                                <div data-field="returnTime">
                                                    <label
                                                        htmlFor={`${formId}-returnTime`}
                                                        className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                                    >
                                                        {t("returnTime")} <span className="text-gold" aria-hidden="true">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <IconLeft>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                                                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                                                                <path d="M3 3v5h5" />
                                                            </svg>
                                                        </IconLeft>
                                                        <input
                                                            id={`${formId}-returnTime`}
                                                            type="time"
                                                            name="return_time"
                                                            value={form.returnTime}
                                                            onChange={(event) =>
                                                                updateField("returnTime", event.target.value)
                                                            }
                                                            required
                                                            aria-required="true"
                                                            aria-invalid={errors.returnTime ? "true" : "false"}
                                                            className={`${inputWithIcon} cursor-pointer`}
                                                            style={{ colorScheme: "dark" }}
                                                        />
                                                    </div>
                                                    {renderError("returnTime")}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isRent && (
                                        <div>
                                            <label
                                                htmlFor={`${formId}-deliveryTime`}
                                                className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                            >
                                                {t("deliveryTime")}
                                            </label>
                                            <input
                                                id={`${formId}-deliveryTime`}
                                                type="time"
                                                name="delivery_time"
                                                value={form.deliveryTime}
                                                onChange={(event) => updateField("deliveryTime", event.target.value)}
                                                className={`${inputBase} cursor-pointer`}
                                                style={{ colorScheme: "dark" }}
                                            />
                                        </div>
                                    )}

                                    <div data-field="deliveryAddress">
                                        <label
                                            htmlFor={`${formId}-deliveryAddress`}
                                            className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                        >
                                            {t("deliveryAddress")} <span className="text-gold" aria-hidden="true">*</span>
                                        </label>
                                        <p className="text-xs text-silk/70 mb-2">{t("deliveryAddressHelp")}</p>
                                        <textarea
                                            id={`${formId}-deliveryAddress`}
                                            name="delivery_address"
                                            rows={3}
                                            value={form.deliveryAddress}
                                            onChange={(event) =>
                                                updateField("deliveryAddress", event.target.value.slice(0, ADDRESS_MAX))
                                            }
                                            required
                                            aria-required="true"
                                            aria-invalid={errors.deliveryAddress ? "true" : "false"}
                                            maxLength={ADDRESS_MAX}
                                            autoComplete="street-address"
                                            placeholder={t("deliveryAddressPlaceholder")}
                                            className={`${inputBase} resize-y`}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            {renderError("deliveryAddress")}
                                            <p className="ml-auto text-[11px] text-silk/60">
                                                {t("deliveryAddressCounter", {
                                                    count: form.deliveryAddress.length,
                                                    max: ADDRESS_MAX,
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor={`${formId}-notes`}
                                            className="block text-xs font-bold text-silk/85 uppercase tracking-wider mb-2"
                                        >
                                            {t("notes")}
                                        </label>
                                        <textarea
                                            id={`${formId}-notes`}
                                            name="notes"
                                            rows={3}
                                            value={form.notes}
                                            onChange={(event) => updateField("notes", event.target.value)}
                                            placeholder={t("notesPlaceholder")}
                                            className={`${inputBase} resize-y`}
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="bg-velvet-950/85 border border-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
                                <legend className={legendClass}>
                                    <span className={stepBadge}>3</span>
                                    {t("termsSectionTitle")}
                                </legend>

                                <div className="space-y-4">
                                    <label
                                        className="flex items-start gap-4 cursor-pointer p-3 rounded-xl hover:bg-velvet-900/40 transition-colors motion-reduce:transition-none"
                                        data-field="ageConfirmed"
                                    >
                                        <input
                                            type="checkbox"
                                            name="age_confirmed"
                                            checked={form.ageConfirmed}
                                            onChange={(event) =>
                                                updateField("ageConfirmed", event.target.checked)
                                            }
                                            required
                                            aria-required="true"
                                            className="mt-1 h-5 w-5 rounded border-silk/30 accent-gold bg-velvet-900 cursor-pointer"
                                        />
                                        <span className="flex-1">
                                            <span className="block text-sm font-semibold text-silk">
                                                {t("ageConfirmTitle")} *
                                            </span>
                                            <span className="block text-sm text-silk/80 mt-1">
                                                {t("ageConfirmDescription")}{" "}
                                                <a
                                                    href={localizedHref(locale, "/age-policy")}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gold-light underline underline-offset-4 hover:text-gold"
                                                >
                                                    {tFooter("ageLimit")} ↗
                                                </a>
                                            </span>
                                            {renderError("ageConfirmed")}
                                        </span>
                                    </label>

                                    <label
                                        className="flex items-start gap-4 cursor-pointer p-3 rounded-xl hover:bg-velvet-900/40 transition-colors motion-reduce:transition-none"
                                        data-field="privacyAccepted"
                                    >
                                        <input
                                            type="checkbox"
                                            name="privacy_accepted"
                                            checked={form.privacyAccepted}
                                            onChange={(event) =>
                                                updateField("privacyAccepted", event.target.checked)
                                            }
                                            required
                                            aria-required="true"
                                            className="mt-1 h-5 w-5 rounded border-silk/30 accent-gold bg-velvet-900 cursor-pointer"
                                        />
                                        <span className="flex-1">
                                            <span className="block text-sm font-semibold text-silk">
                                                {t("privacyConfirmTitle")} *
                                            </span>
                                            <span className="block text-sm text-silk/80 mt-1">
                                                {t("privacyConfirmDescription")}{" "}
                                                <a
                                                    href={localizedHref(locale, "/privacy")}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gold-light underline underline-offset-4 hover:text-gold"
                                                >
                                                    {tFooter("privacy")} ↗
                                                </a>
                                            </span>
                                            {renderError("privacyAccepted")}
                                        </span>
                                    </label>
                                </div>

                                <details className="mt-6 rounded-xl border border-velvet-700 bg-velvet-900/40">
                                    <summary className="cursor-pointer p-4 text-sm font-semibold text-gold uppercase tracking-wider">
                                        {t("orderTerms")}
                                    </summary>
                                    <p className="px-4 pb-4 text-sm text-silk/85 leading-relaxed whitespace-pre-line">
                                        {settings.order_terms?.trim() || t("orderTermsFallback")}
                                    </p>
                                </details>

                                <details className="mt-3 rounded-xl border border-velvet-700 bg-velvet-900/40">
                                    <summary className="cursor-pointer p-4 text-sm font-semibold text-gold uppercase tracking-wider">
                                        {t("privacyNote")}
                                    </summary>
                                    <p className="px-4 pb-4 text-sm text-silk/85 leading-relaxed whitespace-pre-line">
                                        {settings.privacy_note?.trim() || t("privacyNoteFallback")}
                                    </p>
                                </details>

                                <button
                                    type="submit"
                                    disabled={isPending || submitInvalid}
                                    className="w-full bg-gold hover:bg-gold-light disabled:bg-velvet-700 disabled:text-silk/50 disabled:cursor-not-allowed text-velvet-950 font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-8 flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silk focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                                >
                                    {isPending ? t("confirmSubmitting") : t("confirm")}
                                    {!isPending && (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                            <path d="M5 12h14M13 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>

                                <p className="text-center text-[11px] text-silk/75 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    {t("secureNotice")}
                                </p>
                            </fieldset>
                        </form>
                    </div>

                    <aside className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-32">
                            <div className="bg-velvet-900/70 backdrop-blur-md border border-gold/30 rounded-3xl overflow-hidden shadow-2xl">
                                <div className="relative h-48 sm:h-56 overflow-hidden bg-velvet-950">
                                    <Image
                                        src={getSupabaseImageUrl(doll.image, "card")}
                                        alt={doll.name}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover object-top opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-velvet-950 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-6 right-6">
                                        <span className="bg-velvet-950/85 text-gold px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-gold/30 backdrop-blur-md">
                                            {t("summaryConfiguredModel")}
                                        </span>
                                        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-2">
                                            {doll.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-velvet-700 gap-3">
                                        <span className="text-xs text-silk/85 uppercase tracking-widest">
                                            {t("summaryLabel")}
                                        </span>
                                        <span className="text-sm font-bold text-white bg-velvet-800 px-3 py-1 rounded-md">
                                            {summaryTypeLabel}
                                        </span>
                                    </div>

                                    <dl className="text-sm space-y-3 text-silk/90 mb-6">
                                        <div className="flex justify-between">
                                            <dt>{isRent ? t("deliveryReturnPeriod") : t("deliveryPeriod")}</dt>
                                            <dd className="font-medium text-white text-right">
                                                {`${formatDate(checkoutPeriod.startDate, locale, tCommon("noSelection"))} – ${formatDate(checkoutPeriod.endDate, locale, tCommon("noSelection"))}`}
                                            </dd>
                                        </div>

                                        {isRent && (
                                            <>
                                                <div className="flex justify-between">
                                                    <dt>{t("selectedDays")}</dt>
                                                    <dd className="font-medium text-white">
                                                        {liveRentalDays
                                                            ? tCommon("days", { count: liveRentalDays })
                                                            : "—"}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt>{t("pricePerDay")}</dt>
                                                    <dd className="font-medium text-white">
                                                        {doll.rentPricePerDay
                                                            ? formatPricePerDay(
                                                                  doll.rentPricePerDay,
                                                                  locale,
                                                                  currency,
                                                                  tCommon("perDay"),
                                                              )
                                                            : tCommon("unavailable")}
                                                    </dd>
                                                </div>
                                            </>
                                        )}

                                        {extrasTotal > 0 && (
                                            <div className="flex justify-between">
                                                <dt>{t("extras")}</dt>
                                                <dd className="font-medium text-gold">
                                                    {formatPrice(extrasTotal, locale, currency)}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>

                                    <div className="bg-velvet-950 p-4 rounded-2xl border border-velvet-700">
                                        {liveBaseTotal > 0 && (
                                            <div className="flex justify-between text-xs text-silk/80 mb-2">
                                                <span>{t("basePrice")}</span>
                                                <span>{formatPrice(liveBaseTotal, locale, currency)}</span>
                                            </div>
                                        )}
                                        {extrasTotal > 0 && (
                                            <div className="flex justify-between text-xs text-silk/80 mb-2">
                                                <span>{t("extras")}</span>
                                                <span>+{formatPrice(extrasTotal, locale, currency)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xs text-silk/65 mb-3 pb-3 border-b border-velvet-700">
                                            <span>{t("paymentLineLabel")}</span>
                                            <span className="text-right text-silk/80">
                                                {t("paymentLineValue")}
                                            </span>
                                        </div>
                                        {isRent ? (
                                            <div className="flex justify-between text-xs text-silk/65 mb-3 pb-3 border-b border-velvet-700">
                                                <span>{t("depositLineLabel")}</span>
                                                <span className="text-right text-silk/80">
                                                    {t("depositLineValue")}
                                                </span>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between items-end gap-3">
                                            <span className="text-[11px] uppercase tracking-[0.18em] text-gold font-semibold">
                                                {t("estimatedTotal")}
                                            </span>
                                            <span className="font-display italic font-medium text-3xl text-silk">
                                                {totalLabel}
                                            </span>
                                        </div>
                                        <p className="text-[0.72rem] text-silk/55 mt-2 text-right">
                                            {t("vatNote")}
                                        </p>
                                    </div>

                                    <p className="text-xs text-silk/70 mt-4 text-center italic leading-snug">
                                        {t("paymentDisclaimer")}
                                    </p>
                                </div>
                            </div>

                            <ul className="mt-6 grid grid-cols-3 gap-2 list-none p-0">
                                {[
                                    {
                                        label: t("trustAnon"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                                <circle cx="12" cy="8" r="3.5" />
                                                <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
                                                <path d="M3 3l18 18" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: t("trustBox"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                                <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" />
                                                <path d="M4 7.5 12 11l8-3.5" />
                                                <path d="M12 11v9" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: t("trustHygiene"),
                                        icon: (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                                <path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6l-8-3Z" />
                                                <path d="m9 12 2 2 4-4" />
                                            </svg>
                                        ),
                                    },
                                ].map((item) => (
                                    <li
                                        key={item.label}
                                        className="bg-velvet-900/60 border border-velvet-700 rounded-xl p-3 text-center flex flex-col items-center justify-center"
                                    >
                                        <span className="w-6 h-6 text-gold mb-2">
                                            {item.icon}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-[0.14em] text-silk/85 font-semibold leading-tight">
                                            {item.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>

                <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-velvet-950/95 backdrop-blur-md border-t border-gold/30 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-silk/80 font-semibold">
                            {t("estimatedTotal")}
                        </p>
                        <p className="text-lg font-bold text-white leading-none">{totalLabel}</p>
                    </div>
                    <button
                        type="submit"
                        form={formId}
                        disabled={isPending || submitInvalid}
                        className="flex-1 max-w-xs bg-gold hover:bg-gold-light text-velvet-950 disabled:bg-velvet-700 disabled:text-silk/50 disabled:cursor-not-allowed font-bold py-3 rounded-xl text-xs uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silk focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                    >
                        {isPending ? t("confirmSubmitting") : t("confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
