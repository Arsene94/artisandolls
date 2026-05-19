"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
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

function formatDate(value: string) {
    if (!value) return "Neselectată";

    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;

    return `${day}.${month}.${year}`;
}

function getModeLabel(mode: CatalogMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
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
            return "Se confirmă după verificare";
        }

        return `${liveTotalAmount.toLocaleString("ro-RO")} lei`;
    }, [liveTotalAmount]);

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
                        ← Înapoi la păpușă
                    </Link>

                    <div className={styles.heroGrid}>
                        <div>
                            <span className="section-label">Finalizare comandă</span>
                            <h1>
                                Date pentru <em>{getModeLabel(mode).toLowerCase()}</em>
                            </h1>
                            <p>
                                Completează datele de contact și detaliile de livrare. După trimitere, vei ajunge pe pagina de confirmare.
                            </p>

                            <form className={styles.formCard} action={action}>
                                <input type="hidden" name="mode" value={mode} />
                                <input type="hidden" name="doll_slug" value={doll.id} />
                                <input type="hidden" name="outfit_id" value={outfitId} />
                                <input type="hidden" name="options" value={options} />
                                <input type="hidden" name="total" value={String(liveTotalAmount)} />
                                <input type="hidden" name="start_date" value={checkoutPeriod.startDate} />
                                <input type="hidden" name="end_date" value={checkoutPeriod.endDate} />

                                <div className={styles.formHeader}>
                                    <span className="section-label">Date client</span>
                                    <h2>Unde și când livrăm?</h2>
                                </div>

                                <div className={styles.fieldsGrid}>
                                    <label className={styles.field}>
                                        Nume complet
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={form.fullName}
                                            onChange={(event) => updateField("fullName", event.target.value)}
                                            placeholder="Ex: Arsene Popescu"
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
                                        Număr de telefon
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
                                        <span>{mode === "rent" ? "Perioadă livrare / retur" : "Perioadă livrare"}</span>

                                        <RentalDateRangePicker
                                            initialStartDate={checkoutPeriod.startDate}
                                            initialEndDate={checkoutPeriod.endDate}
                                            onChange={updateCheckoutPeriod}
                                            placement="bottom"
                                        />

                                        {!hasCompletePeriod && (
                                            <small className={styles.fieldError}>
                                                Alege data de început și data de sfârșit înainte de confirmare.
                                            </small>
                                        )}

                                        {periodError && <small className={styles.fieldError}>{periodError}</small>}
                                    </div>

                                    <label className={styles.field}>
                                        Ora de livrare
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
                                            Ora de retur
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
                                    Adresa de livrare
                                    <textarea
                                        value={form.deliveryAddress}
                                        name="delivery_address"
                                        onChange={(event) => updateField("deliveryAddress", event.target.value)}
                                        placeholder="Stradă, număr, bloc, scară, etaj, apartament, oraș"
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    Observații opționale
                                    <textarea
                                        value={form.notes}
                                        name="notes"
                                        onChange={(event) => updateField("notes", event.target.value)}
                                        placeholder="Ex: reper pentru curier, instrucțiuni speciale"
                                    />
                                </label>

                                {settings.order_terms && (
                                    <div className={styles.noticeBox}>
                                        <strong>Termeni comandă</strong>
                                        <p>{settings.order_terms}</p>
                                    </div>
                                )}

                                {settings.privacy_note && (
                                    <div className={styles.noticeBox}>
                                        <strong>Notă confidențialitate</strong>
                                        <p>{settings.privacy_note}</p>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-gold" disabled={!hasCompletePeriod}>
                                    Confirmă datele
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
                                <p>{getModeLabel(mode)}</p>
                            </div>

                            <dl>
                                <div>
                                    <dt>{mode === "rent" ? "Perioadă livrare / retur" : "Perioadă livrare"}</dt>
                                    <dd>
                                        {`${formatDate(checkoutPeriod.startDate)} — ${formatDate(checkoutPeriod.endDate)}`}
                                    </dd>
                                </div>
                                {mode === "rent" && (
                                    <>
                                        <div>
                                            <dt>Zile selectate</dt>
                                            <dd>{liveRentalDays || "-"} zile</dd>
                                        </div>

                                        <div>
                                            <dt>Preț pe zi</dt>
                                            <dd>
                                                {doll.rentPricePerDay
                                                    ? `${doll.rentPricePerDay.toLocaleString("ro-RO")} lei / zi`
                                                    : "Indisponibil"}
                                            </dd>
                                        </div>
                                    </>
                                )}

                                {extrasTotal > 0 && (
                                    <div>
                                        <dt>Extra-uri</dt>
                                        <dd>{extrasTotal.toLocaleString("ro-RO")} lei</dd>
                                    </div>
                                )}
                                <div>
                                    <dt>Total estimat</dt>
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
