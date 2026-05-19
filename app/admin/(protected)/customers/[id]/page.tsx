import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getCustomerById,
    getCustomerOrders,
    formatMoneyRo,
} from "@/lib/customers";
import {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
} from "@/lib/orders/shared";
import styles from "../../page.module.css";
import customerStyles from "@/components/admin/customers/AdminCustomers.module.css";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
    const { id } = await params;

    const [customer, orders] = await Promise.all([
        getCustomerById(id),
        getCustomerOrders(id),
    ]);

    if (!customer) {
        notFound();
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Client</span>
                <h1>{customer.full_name}</h1>
                <p>{customer.email} · {customer.phone}</p>
            </section>

            <section className={customerStyles.statsGrid}>
                <div className={customerStyles.statCard}>
                    <span>Comenzi totale</span>
                    <strong>{customer.total_orders}</strong>
                </div>
                <div className={customerStyles.statCard}>
                    <span>Închirieri</span>
                    <strong>{customer.rent_orders}</strong>
                </div>
                <div className={customerStyles.statCard}>
                    <span>Cumpărări</span>
                    <strong>{customer.buy_orders}</strong>
                </div>
                <div className={customerStyles.statCard}>
                    <span>Total cheltuit</span>
                    <strong>{formatMoneyRo(customer.total_spent)}</strong>
                </div>
            </section>

            <section className={customerStyles.panel}>
                <div className={customerStyles.toolbar}>
                    <div>
                        <span>Contact</span>
                        <h2>Date client</h2>
                        <p>{customer.last_delivery_address ?? "Fără adresă salvată"}</p>
                    </div>

                    <div className={customerStyles.rowActions}>
                        <Link href={`/admin/customers/${customer.id}/edit`}>
                            Editează
                        </Link>
                        <a href={`tel:${customer.phone}`}>Sună</a>
                        <a
                            href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>

                {customer.notes && <p>{customer.notes}</p>}
            </section>

            <section className={customerStyles.panel}>
                <div className={customerStyles.toolbar}>
                    <div>
                        <span>Istoric</span>
                        <h2>Comenzi client</h2>
                        <p>Toate rezervările și cumpărările acestui client.</p>
                    </div>
                </div>

                <div className={customerStyles.table}>
                    <div className={customerStyles.tableHead}>
                        <span>Comandă</span>
                        <span>Tip</span>
                        <span>Status</span>
                        <span>Păpușă</span>
                        <span>Perioadă</span>
                        <span>Total</span>
                        <span>Acțiuni</span>
                    </div>

                    {orders.map((order) => (
                        <div key={order.id} className={customerStyles.tableRow}>
                            <strong>{order.order_number}</strong>
                            <span>{formatOrderMode(order.mode)}</span>
                            <span>{formatOrderStatus(order.status)}</span>
                            <span>{order.doll_name}</span>
                            <span>
                                {formatDateRo(order.start_date)} — {formatDateRo(order.end_date)}
                            </span>
                            <span>{order.total_label}</span>
                            <div className={customerStyles.rowActions}>
                                <Link href={`/admin/orders/${order.id}`}>Vezi</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
