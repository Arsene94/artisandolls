import Link from "next/link";
import { notFound } from "next/navigation";
import {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
    getOrderStatusOptions,
} from "@/lib/orders/shared";
import { getAdminOrderById } from "@/lib/orders";
import {
    deleteOrderAction,
    updateOrderStatusFromFormAction,
} from "@/app/admin/(protected)/orders/actions";
import styles from "../../page.module.css";

type AdminOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function formatMoney(value: number | null | undefined) {
    if (!value || value <= 0) {
        return "-";
    }

    return `${value.toLocaleString("ro-RO")} lei`;
}

function formatDiscount(order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>) {
    if (order.discount_type === "none") {
        return "-";
    }

    if (order.discount_type === "fixed") {
        return `${Number(order.discount_value ?? 0).toLocaleString("ro-RO")} lei`;
    }

    return `${Number(order.discount_value ?? 0).toLocaleString("ro-RO")}%`;
}

function getWhatsappHref(phone: string) {
    const cleanPhone = phone.replace(/[^\d]/g, "");

    return `https://wa.me/${cleanPhone}`;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
    const { id } = await params;
    const order = await getAdminOrderById(id);

    if (!order) {
        notFound();
    }

    const statusOptions = getOrderStatusOptions(order.mode);
    const isRent = order.mode === "rent";

    return (
        <main className={styles.page}>
            <section className={styles.orderDetailHero}>
                <div className={styles.orderDetailHeroContent}>
                    <span>Cod rezervare: {order.order_number}</span>
                    <h1>{order.customer_name}</h1>
                    <p>
                        {formatOrderMode(order.mode)} pentru păpușa{" "}
                        <strong>{order.doll_name}</strong>
                    </p>
                </div>

                <div className={styles.orderStatusBadge}>
                    {formatOrderStatus(order.status)}
                </div>
            </section>

            <section className={styles.orderDetailGrid}>
                <div className={styles.orderDetailsColumn}>
                    <div className={styles.orderCardsGrid}>
                        <article className={styles.orderPanel}>
                            <div className={styles.orderPanelHeader}>
                                <span>Date client</span>
                                <h2>Date contact client</h2>
                            </div>

                            <div className={styles.orderDataList}>
                                <div className={styles.orderDataItem}>
                                    <span>Nume complet</span>
                                    <strong>{order.customer_name}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Telefon</span>
                                    <strong>{order.customer_phone}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Email</span>
                                    <strong>{order.customer_email}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Adresă de livrare</span>
                                    <strong>{order.delivery_address}</strong>
                                </div>
                            </div>
                        </article>

                        <article className={styles.orderPanel}>
                            <div className={styles.orderPanelHeader}>
                                <span>Rezervare</span>
                                <h2>Perioadă & livrare</h2>
                            </div>

                            <div className={styles.orderDataList}>
                                <div className={`${styles.orderDataItem} ${styles.orderDataHighlight}`}>
                                    <span>Produs rezervat</span>
                                    <strong>{order.doll_name}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Interval perioadă</span>
                                    <strong>
                                        {formatDateRo(order.start_date)} — {formatDateRo(order.end_date)}
                                    </strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Număr zile</span>
                                    <strong>
                                        {isRent ? `${order.rental_days ?? "-"} zile` : "Cumpărare"}
                                    </strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Oră livrare solicitată</span>
                                    <strong>{order.delivery_time}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Oră retur solicitată</span>
                                    <strong>{isRent ? order.return_time ?? "-" : "Nu se aplică"}</strong>
                                </div>
                            </div>
                        </article>

                        <article className={`${styles.orderPanel} ${styles.orderPanelWide}`}>
                            <div className={styles.orderPanelHeader}>
                                <span>Financiar</span>
                                <h2>Sumar financiar</h2>
                            </div>

                            <div className={styles.orderSummaryBox}>
                                <div className={styles.orderSummaryRow}>
                                    <span>
                                        Subtotal {isRent && order.rental_days ? `(${order.rental_days} zile)` : ""}
                                    </span>
                                    <strong>{formatMoney(order.subtotal_amount || order.total_amount)}</strong>
                                </div>

                                <div className={styles.orderSummaryRow}>
                                    <span>Preț custom</span>
                                    <strong>{formatMoney(order.custom_price_amount)}</strong>
                                </div>

                                <div className={styles.orderSummaryRow}>
                                    <span>Discount aplicat</span>
                                    <strong>{formatDiscount(order)}</strong>
                                </div>

                                <div className={styles.orderSummaryRow}>
                                    <span>Reducere calculată</span>
                                    <strong>{formatMoney(order.discount_amount)}</strong>
                                </div>

                                <div className={`${styles.orderSummaryRow} ${styles.orderSummaryTotal}`}>
                                    <span>Total final de plată</span>
                                    <strong>{order.total_label}</strong>
                                </div>
                            </div>
                        </article>

                        {order.notes && (
                            <article className={`${styles.orderPanel} ${styles.orderPanelWide}`}>
                                <div className={styles.orderPanelHeader}>
                                    <span>Observații</span>
                                    <h2>Note client / admin</h2>
                                </div>

                                <p className={styles.orderNotes}>{order.notes}</p>
                            </article>
                        )}
                    </div>
                </div>

                <aside className={styles.orderActionsPanel}>
                    <div className={styles.orderPanelHeader}>
                        <span>Management</span>
                        <h2>Gestionează comanda</h2>
                    </div>

                    <form
                        className={styles.orderStatusForm}
                        action={async (formData) => {
                            "use server";
                            await updateOrderStatusFromFormAction(order.id, formData);
                        }}
                    >
                        <label>
                            Status curent
                            <select name="status" defaultValue={order.status}>
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button className="btn btn-gold">Salvează statusul</button>
                    </form>

                    <div className={styles.orderActionsStack}>
                        <Link href={`/admin/orders/${order.id}/edit`} className="btn btn-outline-light">
                            Editează rezervarea
                        </Link>

                        <a href={`tel:${order.customer_phone}`} className="btn btn-outline-light">
                            Sună clientul
                        </a>

                        <a
                            href={getWhatsappHref(order.customer_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-light"
                        >
                            Mesaj WhatsApp
                        </a>
                    </div>

                    <form
                        className={styles.orderDeleteForm}
                        action={async () => {
                            "use server";
                            await deleteOrderAction(order.id);
                        }}
                    >
                        <button className={styles.orderDangerButton}>Șterge comanda</button>
                    </form>
                </aside>
            </section>
        </main>
    );
}
