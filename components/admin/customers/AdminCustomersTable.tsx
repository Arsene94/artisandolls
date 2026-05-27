"use client";

import Link from "next/link";
import { IconBrandWhatsapp, IconEye, IconPhone } from "@tabler/icons-react";
import type { CustomerRow } from "@/lib/customers/shared";
import {
    formatCustomerStatus,
    formatMoneyRo,
} from "@/lib/customers/shared";
import styles from "./AdminCustomers.module.css";

type Props = {
    customers: CustomerRow[];
};

function formatDate(value: string | null) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("ro-RO", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function AdminCustomersTable({ customers }: Props) {
    return (
        <section className={styles.panel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Clienți</span>
                    <h2>{customers.length} clienți</h2>
                    <p>Date contact, istoric comenzi și valoare totală.</p>
                </div>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHead}>
                    <span>Client</span>
                    <span>Telefon</span>
                    <span>Comenzi</span>
                    <span>Total</span>
                    <span>Ultima comandă</span>
                    <span>Status</span>
                    <span>Acțiuni</span>
                </div>

                {customers.map((customer) => (
                    <div key={customer.id} className={styles.tableRow}>
                        <div>
                            <strong>{customer.full_name}</strong>
                            <small>{customer.email}</small>
                        </div>

                        <span>{customer.phone}</span>

                        <span>
                            {customer.total_orders} total · {customer.rent_orders} rent ·{" "}
                            {customer.buy_orders} buy
                        </span>

                        <span>{formatMoneyRo(customer.total_spent)}</span>

                        <span>{formatDate(customer.last_order_at)}</span>

                        <span>{formatCustomerStatus(customer)}</span>

                        <div className={styles.rowActions}>
                            <Link
                                href={`/admin/customers/${customer.id}`}
                                aria-label="Vezi"
                                title="Vezi"
                            >
                                <IconEye size={18} />
                            </Link>

                            <a
                                href={`tel:${customer.phone}`}
                                aria-label="Sună"
                                title="Sună"
                            >
                                <IconPhone size={18} />
                            </a>

                            <a
                                href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                title="WhatsApp"
                            >
                                <IconBrandWhatsapp size={18} />
                            </a>
                        </div>
                    </div>
                ))}

                {customers.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>Nu există clienți încă.</h3>
                        <p>Clienții apar automat după prima comandă.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
