"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import styles from "./OrderCheckout.module.css";

type OrderCheckoutProps = {
    doll: Doll;
    mode: CatalogMode;
    startDate: string;
    endDate: string;
    outfitId: string;
    options: string;
    total: string;
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

function getOrderId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getBackHref(dollId: string, mode: CatalogMode, startDate: string, endDate: string) {
    const params = new URLSearchParams({ mode });

    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);

    return `/catalog/${dollId}?${params.toString()}`;
}

export default function OrderCheckout({
                                          doll,
                                          mode,
                                          startDate,
                                          endDate,
                                          outfitId,
                                          options,
                                          total,
                                      }: OrderCheckoutProps) {
    const router = useRouter();
    const [checkoutPeriod, setCheckoutPeriod] = useState<RentalRangeValue>({
        startDate,
        endDate,
    });

    const [periodError, setPeriodError] = useState("");

    const [form, setForm] = useState<OrderFormState>({
        fullName: "",
        email: "",
        phone: "",
        deliveryAddress: "",
        deliveryTime: "",
        returnTime: "",
        notes: "",
    });

    const hasCompletePeriod = Boolean(checkoutPeriod.startDate && checkoutPeriod.endDate);

    const totalLabel = useMemo(() => {
        const parsedTotal = Number(total);

        if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
            return "Se confirmă după verificare";
        }

        return `${parsedTotal.toLocaleString("ro-RO")} lei`;
    }, [total]);

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

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!hasCompletePeriod) {
            setPeriodError("Alege data de început și data de sfârșit înainte de confirmare.");
            return;
        }

        const orderId = getOrderId();

        const orderPayload = {
            orderId,
            dollId: doll.id,
            dollName: doll.name,
            mode,
            startDate: checkoutPeriod.startDate,
            endDate: checkoutPeriod.endDate,
            outfitId,
            options,
            total,
            totalLabel,
            ...form,
            createdAt: new Date().toISOString(),
        };

        sessionStorage.setItem(`artisandolls-order-${orderId}`, JSON.stringify(orderPayload));

        const params = new URLSearchParams({
            mode,
            orderId,
        });

        if (checkoutPeriod.startDate) params.set("start", checkoutPeriod.startDate);
        if (checkoutPeriod.endDate) params.set("end", checkoutPeriod.endDate);

        router.push(`/catalog/${doll.id}/success?${params.toString()}`);
    }

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

                            <form className={styles.formCard} onSubmit={handleSubmit}>
                                <div className={styles.formHeader}>
                                    <span className="section-label">Date client</span>
                                    <h2>Unde și când livrăm?</h2>
                                </div>

                                <div className={styles.fieldsGrid}>
                                    <label className={styles.field}>
                                        Nume complet
                                        <input
                                            type="text"
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

                                        {periodError && <small className={styles.fieldError}>{periodError}</small>}
                                    </div>

                                    <label className={styles.field}>
                                        Ora de livrare
                                        <input
                                            type="time"
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
                                        onChange={(event) => updateField("deliveryAddress", event.target.value)}
                                        placeholder="Stradă, număr, bloc, scară, etaj, apartament, oraș"
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    Observații opționale
                                    <textarea
                                        value={form.notes}
                                        onChange={(event) => updateField("notes", event.target.value)}
                                        placeholder="Ex: reper pentru curier, instrucțiuni speciale"
                                    />
                                </label>

                                <button type="submit" className="btn btn-gold">
                                    Confirmă datele
                                </button>
                            </form>
                        </div>

                        <aside className={styles.summaryCard}>
                            <img src={doll.image} alt={doll.name} />

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
