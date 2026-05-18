"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
    type OrderRow,
} from "@/lib/orders/shared";
import { bulkDeleteOrdersAction } from "@/app/admin/(protected)/orders/actions";
import styles from "./AdminOrders.module.css";
import {IconBrandWhatsapp, IconEye, IconPhone} from "@tabler/icons-react";

type AdminOrdersTableProps = {
    orders: OrderRow[];
};

function getCleanPhone(phone: string) {
    return phone.replace(/[^\d+]/g, "");
}

function getWhatsappHref(phone: string, orderNumber: string, customerName: string) {
    const cleanPhone = getCleanPhone(phone).replace("+", "");
    const message = encodeURIComponent(
        `Bună, ${customerName}! Te contactăm pentru cererea Artisan Dolls ${orderNumber}.`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
}

export default function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const allSelected = orders.length > 0 && selectedIds.length === orders.length;

    function toggleOne(id: string) {
        setSelectedIds((currentIds) =>
            currentIds.includes(id)
                ? currentIds.filter((item) => item !== id)
                : [...currentIds, id]
        );
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : orders.map((order) => order.id));
    }

    function deleteSelected() {
        if (selectedIds.length === 0) {
            return;
        }

        if (!confirm(`Sigur vrei să ștergi ${selectedIds.length} cereri?`)) {
            return;
        }

        startTransition(async () => {
            await bulkDeleteOrdersAction(selectedIds);
            setSelectedIds([]);
        });
    }

    return (
        <section className={styles.panel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Listă comenzi</span>
                    <h2>{orders.length} cereri</h2>
                </div>

                <button
                    type="button"
                    className={styles.dangerButton}
                    disabled={selectedIds.length === 0 || isPending}
                    onClick={deleteSelected}
                >
                    Șterge selectate
                </button>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHead}>
                    <label>
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </label>
                    <span>Client</span>
                    <span>Păpușă</span>
                    <span>Perioadă</span>
                    <span>Status</span>
                    <span>Total</span>
                    <span>Acțiuni</span>
                </div>

                {orders.map((order) => (
                    <div key={order.id} className={styles.tableRow}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(order.id)}
                                onChange={() => toggleOne(order.id)}
                            />
                        </label>

                        <div>
                            <strong>{order.customer_name}</strong>
                            <small>{order.customer_phone}</small>
                        </div>

                        <div>
                            <strong>{order.doll_name}</strong>
                            <small>{formatOrderMode(order.mode)}</small>
                        </div>

                        <div>
                            <strong>
                                {formatDateRo(order.start_date)} — {formatDateRo(order.end_date)}
                            </strong>
                            <small>
                                {order.mode === "rent"
                                    ? `${order.rental_days ?? "-"} zile`
                                    : "Cumpărare"}
                            </small>
                        </div>

                        <div>
                            <strong>{formatOrderStatus(order.status)}</strong>
                            <small>{order.order_number}</small>
                        </div>

                        <strong>{order.total_label}</strong>

                        <div className={styles.actions}>
                            <Link href={`/app/admin/(protected)/orders/${order.id}`} className={styles.viewButton}><IconEye /></Link>
                            <a href={`tel:${getCleanPhone(order.customer_phone)}`} className={styles.callButton}><IconPhone /></a>
                            <a
                                href={getWhatsappHref(
                                    order.customer_phone,
                                    order.order_number,
                                    order.customer_name
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappButton}
                            >
                                <IconBrandWhatsapp />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
