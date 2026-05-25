"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatLei, formatLeiPerDay, getIntlLocale } from "@/i18n/format";
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

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function getRentalDays(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
        return 0;
    }

    const diff = end.getTime() - start.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    return Math.max(1, Math.ceil(diff / dayMs));
}

const fieldLabel =
    "block text-[11px] font-bold text-silk/70 uppercase tracking-wider mb-2";
const inputBase =
    "w-full bg-velvet-950 border border-velvet-800 rounded-xl px-4 py-3.5 text-white placeholder-silk/30 focus:outline-none focus:border-gold transition text-sm";
const inputWithIcon =
    "w-full bg-velvet-950 border border-velvet-800 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-silk/30 focus:outline-none focus:border-gold transition text-sm";
const sectionCard =
    "bg-velvet-900/40 border border-velvet-800/80 rounded-3xl p-6 sm:p-8 shadow-xl";
const sectionTitle =
    "text-xl font-bold font-serif text-gold mb-6 flex items-center gap-3 border-b border-velvet-800 pb-4";
const stepBadge =
    "w-8 h-8 rounded-full bg-velvet-950 border border-gold/30 flex items-center justify-center text-sm text-gold";

function IconLeft({ children }: { children: React.ReactNode }) {
    return (
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-silk/40 pointer-events-none">
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

    const [checkoutPeriod, setCheckoutPeriod] = useState<RentalRangeValue>({
        startDate,
        endDate,
    });
    const [periodError, setPeriodError] = useState("");

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

    function updateField<K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    const updateCheckoutPeriod = useCallback((value: RentalRangeValue) => {
        setCheckoutPeriod((current) => {
            if (current.startDate === value.startDate && current.endDate === value.endDate) {
                return current;
            }
            return value;
        });

        if (value.startDate && value.endDate) {
            setPeriodError("");
        }
    }, []);

    const totalLabel = useMemo(() => {
        if (!Number.isFinite(liveTotalAmount) || liveTotalAmount <= 0) {
            return t("pendingTotal");
        }
        return formatLei(liveTotalAmount, locale);
    }, [liveTotalAmount, locale, t]);

    const modeLabel = mode === "rent" ? tCommon("rent") : tCommon("buy");
    const summaryTypeLabel = mode === "rent" ? t("serviceTypeRent") : t("serviceTypeBuy");
    const isRent = mode === "rent";

    const canSubmit =
        form.ageConfirmed &&
        form.privacyAccepted &&
        (!isRent || hasCompletePeriod);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        if (isRent && !hasCompletePeriod) {
            event.preventDefault();
            setPeriodError(t("periodError"));
        }
    }

    return (
        <main className="bg-velvet-950 text-silk min-h-screen relative overflow-hidden">
            <div className="absolute top-40 left-0 w-96 h-96 bg-velvet-500/10 rounded-full filter blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-[100px] pointer-events-none" />

            <div className="pt-28 pb-20 lg:pt-36 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

            <nav className="text-xs font-medium text-silk/50 mb-6 flex items-center gap-2 relative z-10">
                <Link href="/" className="hover:text-gold transition">
                    {t("breadcrumbHome")}
                </Link>
                <span>/</span>
                <Link
                    href={`/catalog?mode=${mode}`}
                    className="hover:text-gold transition"
                >
                    {t("breadcrumbCatalog")}
                </Link>
                <span>/</span>
                <Link
                    href={getBackHref(doll.id, mode, startDate, endDate)}
                    className="hover:text-gold transition"
                >
                    {doll.name}
                </Link>
                <span>/</span>
                <span className="text-gold">{t("breadcrumbSecure")}</span>
            </nav>

            <div className="mb-10 relative z-10">
                <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white mb-3">
                    {t.rich("title", {
                        mode: modeLabel.toLowerCase(),
                        em: (chunks) => <em className="text-gold not-italic">{chunks}</em>,
                    })}
                </h1>
                <p className="text-silk/70 font-light text-sm sm:text-base">{t("subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10">
                <div className="lg:col-span-7">
                    <form
                        id="checkout-form"
                        action={action}
                        onSubmit={handleSubmit}
                        className="space-y-10"
                    >
                        <input type="hidden" name="_locale" value={locale} />
                        <input type="hidden" name="mode" value={mode} />
                        <input type="hidden" name="doll_slug" value={doll.id} />
                        <input type="hidden" name="outfit_id" value={outfitId} />
                        <input type="hidden" name="options" value={options} />
                        <input type="hidden" name="total" value={String(liveTotalAmount)} />
                        <input type="hidden" name="start_date" value={checkoutPeriod.startDate} />
                        <input type="hidden" name="end_date" value={checkoutPeriod.endDate} />

                        <section className={sectionCard}>
                            <h2 className={sectionTitle}>
                                <span className={stepBadge}>1</span>
                                {t("contactSectionTitle")}
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className={fieldLabel}>{t("fullName")} *</label>
                                    <div className="relative">
                                        <IconLeft>
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                                            </svg>
                                        </IconLeft>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={form.fullName}
                                            onChange={(event) => updateField("fullName", event.target.value)}
                                            required
                                            placeholder={t("fullNamePlaceholder")}
                                            className={inputWithIcon}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={fieldLabel}>{t("phone")} *</label>
                                        <div className="relative">
                                            <IconLeft>
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                            </IconLeft>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={(event) => updateField("phone", event.target.value)}
                                                required
                                                placeholder={t("phonePlaceholder")}
                                                className={inputWithIcon}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={fieldLabel}>{t("emailLabel")}</label>
                                        <div className="relative">
                                            <IconLeft>
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                                    <path d="M3 7l9 6 9-6" />
                                                </svg>
                                            </IconLeft>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={(event) => updateField("email", event.target.value)}
                                                placeholder={t("emailPlaceholder")}
                                                className={inputWithIcon}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={fieldLabel}>{t("contactMethod")}</label>
                                        <select
                                            name="contact_method"
                                            value={form.contactMethod}
                                            onChange={(event) =>
                                                updateField("contactMethod", event.target.value as ContactMethod)
                                            }
                                            className={`${inputBase} appearance-none cursor-pointer`}
                                        >
                                            <option value="whatsapp">{t("contactMethodWhatsapp")}</option>
                                            <option value="telegram">{t("contactMethodTelegram")}</option>
                                            <option value="call">{t("contactMethodCall")}</option>
                                            <option value="email">{t("contactMethodEmail")}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={fieldLabel}>{t("contactWindow")}</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="time"
                                                name="contact_window_start"
                                                value={form.contactWindowStart}
                                                onChange={(event) =>
                                                    updateField("contactWindowStart", event.target.value)
                                                }
                                                title={t("contactWindowFrom")}
                                                className={`${inputBase} cursor-pointer`}
                                                style={{ colorScheme: "dark" }}
                                            />
                                            <span className="text-silk/50 font-bold">-</span>
                                            <input
                                                type="time"
                                                name="contact_window_end"
                                                value={form.contactWindowEnd}
                                                onChange={(event) =>
                                                    updateField("contactWindowEnd", event.target.value)
                                                }
                                                title={t("contactWindowTo")}
                                                className={`${inputBase} cursor-pointer`}
                                                style={{ colorScheme: "dark" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={sectionCard}>
                            <h2 className={sectionTitle}>
                                <span className={stepBadge}>2</span>
                                {t("deliverySectionTitle")}
                            </h2>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={fieldLabel}>{t("county")} *</label>
                                        <select
                                            name="delivery_county"
                                            value={form.county}
                                            onChange={(event) => {
                                                const next = event.target.value as
                                                    | ""
                                                    | RomanianCountyCode;
                                                setForm((current) => ({
                                                    ...current,
                                                    county: next,
                                                    city: "",
                                                }));
                                            }}
                                            required
                                            className={`${inputBase} appearance-none cursor-pointer`}
                                        >
                                            <option value="" disabled>
                                                {t("countyPlaceholder")}
                                            </option>
                                            {romanianCounties.map((county) => (
                                                <option key={county.code} value={county.code}>
                                                    {county.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={fieldLabel}>{t("city")} *</label>
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
                                        />
                                    </div>
                                </div>

                                <div className="bg-velvet-900/60 p-4 rounded-xl border border-velvet-800">
                                    <label className="block text-[11px] font-bold text-gold uppercase tracking-wider mb-2">
                                        {t("serviceType")}
                                    </label>
                                    <div className="px-4 py-3 text-white text-sm">
                                        {summaryTypeLabel}
                                    </div>
                                </div>

                                {isRent && (
                                    <div className="space-y-5 pt-2">
                                        <div>
                                            <label className={fieldLabel}>{t("rentPeriod")} *</label>
                                            <RentalDateRangePicker
                                                initialStartDate={checkoutPeriod.startDate}
                                                initialEndDate={checkoutPeriod.endDate}
                                                onChange={updateCheckoutPeriod}
                                                placement="bottom"
                                            />
                                            {!hasCompletePeriod && (
                                                <small className="block mt-2 text-velvet-300 text-[11px]">
                                                    {t("periodError")}
                                                </small>
                                            )}
                                            {periodError && (
                                                <small className="block mt-2 text-velvet-300 text-[11px]">
                                                    {periodError}
                                                </small>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className={fieldLabel}>{t("deliveryTime")} *</label>
                                                <div className="relative">
                                                    <IconLeft>
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 6v6l4 2" />
                                                        </svg>
                                                    </IconLeft>
                                                    <input
                                                        type="time"
                                                        name="delivery_time"
                                                        value={form.deliveryTime}
                                                        onChange={(event) =>
                                                            updateField("deliveryTime", event.target.value)
                                                        }
                                                        required
                                                        className={`${inputWithIcon} cursor-pointer`}
                                                        style={{ colorScheme: "dark" }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={fieldLabel}>{t("returnTime")} *</label>
                                                <div className="relative">
                                                    <IconLeft>
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                                                            <path d="M3 3v5h5" />
                                                        </svg>
                                                    </IconLeft>
                                                    <input
                                                        type="time"
                                                        name="return_time"
                                                        value={form.returnTime}
                                                        onChange={(event) =>
                                                            updateField("returnTime", event.target.value)
                                                        }
                                                        required
                                                        className={`${inputWithIcon} cursor-pointer`}
                                                        style={{ colorScheme: "dark" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isRent && (
                                    <div>
                                        <label className={fieldLabel}>{t("deliveryTime")}</label>
                                        <input
                                            type="time"
                                            name="delivery_time"
                                            value={form.deliveryTime}
                                            onChange={(event) => updateField("deliveryTime", event.target.value)}
                                            className={`${inputBase} cursor-pointer`}
                                            style={{ colorScheme: "dark" }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className={fieldLabel}>{t("deliveryAddress")}</label>
                                    <textarea
                                        name="delivery_address"
                                        rows={2}
                                        value={form.deliveryAddress}
                                        onChange={(event) =>
                                            updateField("deliveryAddress", event.target.value)
                                        }
                                        required
                                        placeholder={t("deliveryAddressPlaceholder")}
                                        className={`${inputBase} resize-none`}
                                    />
                                </div>

                                <div>
                                    <label className={fieldLabel}>{t("notes")}</label>
                                    <textarea
                                        name="notes"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(event) => updateField("notes", event.target.value)}
                                        placeholder={t("notesPlaceholder")}
                                        className={`${inputBase} resize-none`}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-velvet-950/80 border border-gold/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
                            <div className="space-y-4">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="age_confirmed"
                                        checked={form.ageConfirmed}
                                        onChange={(event) =>
                                            updateField("ageConfirmed", event.target.checked)
                                        }
                                        required
                                        className="peer sr-only"
                                    />
                                    <span className="w-6 h-6 shrink-0 mt-0.5 rounded border border-velvet-700 bg-velvet-900 flex items-center justify-center transition-colors group-hover:border-gold/50 peer-checked:bg-gold peer-checked:border-gold">
                                        {form.ageConfirmed && (
                                            <svg className="w-3.5 h-3.5 text-velvet-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="block">
                                        <span className="text-sm text-white font-medium">
                                            {t("ageConfirmTitle")} *
                                        </span>
                                        <span className="block text-xs text-silk/50 mt-1 font-light">
                                            {t("ageConfirmDescription")}
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="privacy_accepted"
                                        checked={form.privacyAccepted}
                                        onChange={(event) =>
                                            updateField("privacyAccepted", event.target.checked)
                                        }
                                        required
                                        className="peer sr-only"
                                    />
                                    <span className="w-6 h-6 shrink-0 mt-0.5 rounded border border-velvet-700 bg-velvet-900 flex items-center justify-center transition-colors group-hover:border-gold/50 peer-checked:bg-gold peer-checked:border-gold">
                                        {form.privacyAccepted && (
                                            <svg className="w-3.5 h-3.5 text-velvet-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="block">
                                        <span className="text-sm text-white font-medium">
                                            {t("privacyConfirmTitle")} *
                                        </span>
                                        <span className="block text-xs text-silk/50 mt-1 font-light">
                                            {t("privacyConfirmDescription")}
                                        </span>
                                    </span>
                                </label>
                            </div>

                            {settings.order_terms && (
                                <div className="mt-6 p-4 rounded-xl border border-velvet-800 bg-velvet-900/40">
                                    <strong className="block text-[11px] font-bold text-gold uppercase tracking-widest mb-2">
                                        {t("orderTerms")}
                                    </strong>
                                    <p className="text-xs text-silk/70 leading-relaxed">
                                        {settings.order_terms}
                                    </p>
                                </div>
                            )}

                            {settings.privacy_note && (
                                <div className="mt-4 p-4 rounded-xl border border-velvet-800 bg-velvet-900/40">
                                    <strong className="block text-[11px] font-bold text-gold uppercase tracking-widest mb-2">
                                        {t("privacyNote")}
                                    </strong>
                                    <p className="text-xs text-silk/70 leading-relaxed">
                                        {settings.privacy_note}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-white hover:to-white hover:text-velvet-950 text-velvet-950 font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-8 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("confirm")}
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M13 5l7 7-7 7" />
                                </svg>
                            </button>

                            <p className="text-center text-[10px] text-silk/40 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                {t("secureNotice")}
                            </p>
                        </section>
                    </form>
                </div>

                <aside className="lg:col-span-5 relative">
                    <div className="lg:sticky lg:top-32">
                        <div className="bg-velvet-900/60 backdrop-blur-md border border-gold/20 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="relative h-48 sm:h-56 overflow-hidden bg-velvet-950">
                                <Image
                                    src={getSupabaseImageUrl(doll.image, "card")}
                                    alt={doll.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover opacity-80 object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-velvet-900 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-6 right-6">
                                    <span className="bg-velvet-950/80 text-gold px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-gold/20 backdrop-blur-md">
                                        {t("summaryConfiguredModel")}
                                    </span>
                                    <h3 className="text-3xl font-bold font-serif text-white mt-2">
                                        {doll.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-velvet-800">
                                    <span className="text-xs text-silk/60 uppercase tracking-widest">
                                        {t("summaryLabel")}
                                    </span>
                                    <span className="text-sm font-bold text-white bg-velvet-800 px-3 py-1 rounded-md">
                                        {summaryTypeLabel}
                                    </span>
                                </div>

                                <dl className="text-sm space-y-3 font-light text-silk/80 mb-6">
                                    <div className="flex justify-between">
                                        <dt>
                                            {isRent ? t("deliveryReturnPeriod") : t("deliveryPeriod")}
                                        </dt>
                                        <dd className="font-medium text-white text-right">
                                            {`${formatDate(checkoutPeriod.startDate, locale, tCommon("noSelection"))} - ${formatDate(checkoutPeriod.endDate, locale, tCommon("noSelection"))}`}
                                        </dd>
                                    </div>

                                    {isRent && (
                                        <>
                                            <div className="flex justify-between">
                                                <dt>{t("selectedDays")}</dt>
                                                <dd className="font-medium text-white">
                                                    {liveRentalDays
                                                        ? tCommon("days", { count: liveRentalDays })
                                                        : "-"}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt>{t("pricePerDay")}</dt>
                                                <dd className="font-medium text-white">
                                                    {doll.rentPricePerDay
                                                        ? formatLeiPerDay(
                                                              doll.rentPricePerDay,
                                                              locale,
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
                                                {formatLei(extrasTotal, locale)}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="bg-velvet-950 p-4 rounded-2xl border border-velvet-800">
                                    {liveBaseTotal > 0 && (
                                        <div className="flex justify-between text-xs text-silk/50 mb-2">
                                            <span>{t("basePrice")}</span>
                                            <span>{formatLei(liveBaseTotal, locale)}</span>
                                        </div>
                                    )}
                                    {extrasTotal > 0 && (
                                        <div className="flex justify-between text-xs text-silk/50 mb-3 pb-3 border-b border-velvet-800/60">
                                            <span>{t("extras")}</span>
                                            <span>+{formatLei(extrasTotal, locale)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] uppercase tracking-widest text-gold font-bold">
                                            {t("estimatedTotal")}
                                        </span>
                                        <span className="text-2xl font-bold text-white">
                                            {totalLabel}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-silk/40 mt-4 text-center italic">
                                    * {t("paymentDisclaimer")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <div className="bg-velvet-900/30 border border-silk/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                                <svg className="w-6 h-6 text-gold mb-2 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zM4 22c0-4 4-7 8-7s8 3 8 7" />
                                </svg>
                                <span className="text-[9px] uppercase tracking-widest text-silk/60 font-bold leading-tight">
                                    {t("trustAnon")}
                                </span>
                            </div>
                            <div className="bg-velvet-900/30 border border-silk/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                                <svg className="w-6 h-6 text-gold mb-2 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                                <span className="text-[9px] uppercase tracking-widest text-silk/60 font-bold leading-tight">
                                    {t("trustBox")}
                                </span>
                            </div>
                            <div className="bg-velvet-900/30 border border-silk/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                                <svg className="w-6 h-6 text-gold mb-2 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span className="text-[9px] uppercase tracking-widest text-silk/60 font-bold leading-tight">
                                    {t("trustHygiene")}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            </div>
        </main>
    );
}
