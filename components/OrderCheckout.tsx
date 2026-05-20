"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatLei, formatLeiPerDay, getIntlLocale } from "@/i18n/format";
import styles from "./OrderCheckout.module.css";
import type { PublicPlatformSettings } from "@/lib/settings/shared";

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

type OrderFormState = {
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    deliveryTime: string;
    returnTime: string;
    notes: string;
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

function getModeLabel(mode: CatalogMode, rentLabel: string, buyLabel: string) {
    return mode === "rent" ? rentLabel : buyLabel;
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

    const hasCompletePeriod = Boolean(checkoutPeriod.startDate && checkoutPeriod.endDate);

    const initialRentalDays =
        mode === "rent" ? getRentalDays(startDate, endDate) : 0;

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

    const [periodError, setPeriodError] = useState("");

    const [form, setForm] = useState<OrderFormState>({
        fullName: "",
        email: "",
        phone: "",
        deliveryAddress: "",
        deliveryTime: settings.default_delivery_start_time ?? "",
        returnTime: settings.default_return_start_time ?? "",
        notes: "",
    });

    const totalLabel = useMemo(() => {
        if (!Number.isFinite(liveTotalAmount) || liveTotalAmount <= 0) {
            return t("pendingTotal");
        }

        return formatLei(liveTotalAmount, locale);
    }, [liveTotalAmount, locale, t]);
    const modeLabel = getModeLabel(mode, tCommon("rent"), tCommon("buy"));

    function updateField(field: keyof OrderFormState, value: string) {
        setForm((currentForm) => ({
            ...currentForm,
            [field]: value,
        }));
    }

    const updateCheckoutPeriod = useCallback((value: RentalRangeValue) => {
        setCheckoutPeriod((currentPeriod) => {
            if (
                currentPeriod.startDate === value.startDate &&
                currentPeriod.endDate === value.endDate
            ) {
                return currentPeriod;
            }

            return value;
        });

        if (value.startDate && value.endDate) {
            setPeriodError("");
        }
    }, []);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern} />

                <div className={styles.heroInner}>
                    <Link href={getBackHref(doll.id, mode, startDate, endDate)} className={styles.backLink}>
                        {"<-"} {t("back")}
                    </Link>

                    <div className={styles.heroGrid}>
                        <div>
                            <span className="section-label">{t("label")}</span>
                            <h1>
                                {t.rich("title", {
                                    mode: modeLabel.toLowerCase(),
                                    em: (chunks) => <em>{chunks}</em>,
                                })}
                            </h1>
                            <p>
                                {t("subtitle")}
                            </p>

                            <form className={styles.formCard} action={action}>
                                <input type="hidden" name="_locale" value={locale} />
                                <input type="hidden" name="mode" value={mode} />
                                <input type="hidden" name="doll_slug" value={doll.id} />
                                <input type="hidden" name="outfit_id" value={outfitId} />
                                <input type="hidden" name="options" value={options} />
                                <input type="hidden" name="total" value={String(liveTotalAmount)} />
                                <input type="hidden" name="start_date" value={checkoutPeriod.startDate} />
                                <input type="hidden" name="end_date" value={checkoutPeriod.endDate} />

                                <div className={styles.formHeader}>
                                    <span className="section-label">{t("clientLabel")}</span>
                                    <h2>{t("formTitle")}</h2>
                                </div>

                                <div className={styles.fieldsGrid}>
                                    <label className={styles.field}>
                                        {t("fullName")}
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={form.fullName}
                                            onChange={(event) => updateField("fullName", event.target.value)}
                                            placeholder={t("fullNamePlaceholder")}
                                            required
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        Email
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={(event) => updateField("email", event.target.value)}
                                            placeholder="exemplu@email.com"
                                            required
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        {t("phone")}
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={(event) => updateField("phone", event.target.value)}
                                            placeholder="+40 7xx xxx xxx"
                                            required
                                        />
                                    </label>

                                    <div className={`${styles.field} ${styles.rangeField}`}>
                                        <span>{mode === "rent" ? t("deliveryReturnPeriod") : t("deliveryPeriod")}</span>

                                        <RentalDateRangePicker
                                            initialStartDate={checkoutPeriod.startDate}
                                            initialEndDate={checkoutPeriod.endDate}
                                            onChange={updateCheckoutPeriod}
                                            placement="bottom"
                                        />

                                        {!hasCompletePeriod && (
                                            <small className={styles.fieldError}>
                                                {t("periodError")}
                                            </small>
                                        )}

                                        {periodError && <small className={styles.fieldError}>{periodError}</small>}
                                    </div>

                                    <label className={styles.field}>
                                        {t("deliveryTime")}
                                        <input
                                            type="time"
                                            name="delivery_time"
                                            value={form.deliveryTime}
                                            onChange={(event) => updateField("deliveryTime", event.target.value)}
                                            required
                                        />
                                    </label>

                                    {mode === "rent" && (
                                        <label className={styles.field}>
                                            {t("returnTime")}
                                            <input
                                                type="time"
                                                name="return_time"
                                                value={form.returnTime}
                                                onChange={(event) => updateField("returnTime", event.target.value)}
                                                required
                                            />
                                        </label>
                                    )}
                                </div>

                                <label className={styles.field}>
                                    {t("deliveryAddress")}
                                    <textarea
                                        value={form.deliveryAddress}
                                        name="delivery_address"
                                        onChange={(event) => updateField("deliveryAddress", event.target.value)}
                                        placeholder={t("deliveryAddressPlaceholder")}
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    {t("notes")}
                                    <textarea
                                        value={form.notes}
                                        name="notes"
                                        onChange={(event) => updateField("notes", event.target.value)}
                                        placeholder={t("notesPlaceholder")}
                                    />
                                </label>

                                {settings.order_terms && (
                                    <div className={styles.noticeBox}>
                                        <strong>{t("orderTerms")}</strong>
                                        <p>{settings.order_terms}</p>
                                    </div>
                                )}

                                {settings.privacy_note && (
                                    <div className={styles.noticeBox}>
                                        <strong>{t("privacyNote")}</strong>
                                        <p>{settings.privacy_note}</p>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-gold" disabled={!hasCompletePeriod}>
                                    {t("confirm")}
                                </button>
                            </form>
                        </div>

                        <aside className={styles.summaryCard}>
                            <Image
                                src={getSupabaseImageUrl(doll.image, "card")}
                                alt={doll.name}
                                width={600}
                                height={400}
                                sizes="(max-width: 760px) 100vw, 50vw"
                            />

                            <div>
                                <span>{doll.collection}</span>
                                <h2>{doll.name}</h2>
                                <p>{modeLabel}</p>
                            </div>

                            <dl>
                                <div>
                                    <dt>{mode === "rent" ? t("deliveryReturnPeriod") : t("deliveryPeriod")}</dt>
                                    <dd>
                                        {`${formatDate(checkoutPeriod.startDate, locale, tCommon("noSelection"))} - ${formatDate(checkoutPeriod.endDate, locale, tCommon("noSelection"))}`}
                                    </dd>
                                </div>
                                {mode === "rent" && (
                                    <>
                                        <div>
                                            <dt>{t("selectedDays")}</dt>
                                            <dd>{liveRentalDays ? tCommon("days", { count: liveRentalDays }) : "-"}</dd>
                                        </div>

                                        <div>
                                            <dt>{t("pricePerDay")}</dt>
                                            <dd>
                                                {doll.rentPricePerDay
                                                    ? formatLeiPerDay(doll.rentPricePerDay, locale, tCommon("perDay"))
                                                    : tCommon("unavailable")}
                                            </dd>
                                        </div>
                                    </>
                                )}

                                {extrasTotal > 0 && (
                                    <div>
                                        <dt>{t("extras")}</dt>
                                        <dd>{formatLei(extrasTotal, locale)}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt>{t("estimatedTotal")}</dt>
                                    <dd>{totalLabel}</dd>
                                </div>
                            </dl>
                        </aside>
                    </div>
                </div>


            </section>
        </main>
    );
}
