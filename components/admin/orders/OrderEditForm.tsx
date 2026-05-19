"use client";

import { useMemo, useState } from "react";
import type { DollRow } from "@/lib/dolls";
import type { OrderRow } from "@/lib/orders/shared";
import styles from "./AdminOrders.module.css";

type OrderEditFormProps = {
    order: OrderRow;
    dolls: DollRow[];
    action: (formData: FormData) => Promise<void>;
};

type DiscountType = "none" | "fixed" | "percent";

function parseDiscountType(value: string): DiscountType {
    if (value === "fixed" || value === "percent") {
        return value;
    }

    return "none";
}

function getNumberValue(value: number | null | undefined) {
    return value && value > 0 ? String(value) : "";
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

function getTodayInputValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function calculatePreviewTotal(
    subtotal: number,
    customPrice: number | null,
    discountType: DiscountType,
    discountValue: number
) {
    const base = customPrice ?? subtotal;

    if (discountType === "fixed") {
        return Math.max(0, base - discountValue);
    }

    if (discountType === "percent") {
        const percent = Math.min(100, Math.max(0, discountValue));
        return Math.max(0, base - Math.round((base * percent) / 100));
    }

    return base;
}

export default function OrderEditForm({ order, dolls, action }: OrderEditFormProps) {
    const [selectedDollId, setSelectedDollId] = useState(order.doll_id ?? "");
    const [startDate, setStartDate] = useState(order.start_date ?? "");
    const [endDate, setEndDate] = useState(order.end_date ?? "");

    const [subtotalAmount, setSubtotalAmount] = useState(order.subtotal_amount || order.total_amount || 0);
    const [customPriceAmount, setCustomPriceAmount] = useState<number | null>(order.custom_price_amount);
    const [discountType, setDiscountType] = useState<DiscountType>(
        parseDiscountType(order.discount_type ?? "none")
    );
    const [discountValue, setDiscountValue] = useState(Number(order.discount_value ?? 0));

    const selectedDoll = dolls.find((doll) => doll.id === selectedDollId);

    const selectedRentalDays =
        order.mode === "rent" && startDate && endDate
            ? getRentalDays(startDate, endDate)
            : 0;

    const recalculatedSubtotal =
        order.mode === "rent" &&
        selectedDoll?.rent_price_per_day &&
        selectedRentalDays > 0
            ? selectedDoll.rent_price_per_day * selectedRentalDays
            : subtotalAmount;
    const todayInputValue = getTodayInputValue();

    const previewTotal = useMemo(() => {
        return calculatePreviewTotal(
            recalculatedSubtotal,
            customPriceAmount,
            discountType,
            discountValue
        );
    }, [recalculatedSubtotal, customPriceAmount, discountType, discountValue]);

    return (
        <form action={action} className={styles.panel}>
            <input type="hidden" name="mode" value={order.mode} />

            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Păpușă
                    <select
                        name="doll_id"
                        value={selectedDollId}
                        onChange={(event) => setSelectedDollId(event.target.value)}
                        required
                    >
                        {dolls.map((doll) => (
                            <option key={doll.id} value={doll.id}>
                                {doll.name} — {doll.collection}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    Nume client
                    <input
                        name="customer_name"
                        defaultValue={order.customer_name}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Email
                    <input
                        type="email"
                        name="customer_email"
                        defaultValue={order.customer_email}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Telefon
                    <input
                        name="customer_phone"
                        defaultValue={order.customer_phone}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Data început
                    <input
                        type="date"
                        name="start_date"
                        min={todayInputValue}
                        value={startDate}
                        onChange={(event) => {
                            const nextStartDate = event.target.value;

                            setStartDate(nextStartDate);

                            if (endDate && nextStartDate && endDate < nextStartDate) {
                                setEndDate(nextStartDate);
                            }
                        }}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Data sfârșit
                    <input
                        type="date"
                        name="end_date"
                        min={startDate || todayInputValue}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Ora livrare
                    <input
                        type="time"
                        name="delivery_time"
                        defaultValue={order.delivery_time}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Ora retur
                    <input
                        type="time"
                        name="return_time"
                        defaultValue={order.return_time ?? ""}
                        disabled={order.mode === "buy"}
                    />
                </label>

                <label className={styles.field}>
                    Subtotal calculat
                    <input
                        type="number"
                        name="subtotal_amount"
                        min="0"
                        value={recalculatedSubtotal}
                        readOnly={order.mode === "rent"}
                        onChange={(event) => setSubtotalAmount(Number(event.target.value))}
                    />
                </label>

                <label className={styles.field}>
                    Preț custom
                    <input
                        type="number"
                        name="custom_price_amount"
                        min="0"
                        value={customPriceAmount ?? ""}
                        onChange={(event) => {
                            const value = event.target.value;
                            setCustomPriceAmount(value ? Number(value) : null);
                        }}
                        placeholder={getNumberValue(order.custom_price_amount)}
                    />
                </label>

                <label className={styles.field}>
                    Tip discount
                    <select
                        name="discount_type"
                        value={discountType}
                        onChange={(event) => setDiscountType(parseDiscountType(event.target.value))}
                    >
                        <option value="none">Fără discount</option>
                        <option value="fixed">Reducere fixă</option>
                        <option value="percent">Reducere procentuală</option>
                    </select>
                </label>

                <label className={styles.field}>
                    Valoare discount
                    <input
                        type="number"
                        name="discount_value"
                        min="0"
                        step="0.01"
                        value={discountValue}
                        onChange={(event) => setDiscountValue(Number(event.target.value))}
                    />
                </label>
            </div>

            <label className={styles.field}>
                Adresă livrare
                <textarea
                    name="delivery_address"
                    defaultValue={order.delivery_address}
                    required
                />
            </label>

            <label className={styles.field}>
                Observații
                <textarea
                    name="notes"
                    defaultValue={order.notes ?? ""}
                />
            </label>

            <div className={styles.summaryBox}>
                <span>
                    Total estimat după editare
                    {order.mode === "rent" && selectedRentalDays > 0
                        ? ` · ${selectedRentalDays} zile`
                        : ""}
                </span>
                <strong>{previewTotal.toLocaleString("ro-RO")} lei</strong>
            </div>

            <div className={styles.actions}>
                <a href={`/admin/orders/${order.id}`} className={styles.viewButton}>
                    Renunță
                </a>

                <button type="submit" className={styles.dangerButton}>
                    Salvează modificările
                </button>
            </div>
        </form>
    );
}
