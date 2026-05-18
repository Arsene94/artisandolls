import { notFound } from "next/navigation";
import {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
    getOrderStatusOptions,
    getOrderBaseAmount,
} from "@/lib/orders/shared";
import {getAdminOrderById} from "@/lib/orders";
import { deleteOrderAction, updateOrderStatusAction, updateOrderStatusFromFormAction } from "@/app/admin/(protected)/orders/actions";
import styles from "../../page.module.css";
import Link from "next/link";

type AdminOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
    const { id } = await params;
    const order = await getAdminOrderById(id);

    if (!order) {
        notFound();
    }

    const statusOptions = getOrderStatusOptions(order.mode);
    const baseAmount = getOrderBaseAmount(order);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>{order.order_number}</span>
                <h1>{order.customer_name}</h1>
                <p>
                    {formatOrderMode(order.mode)} pentru {order.doll_name} ·{" "}
                    {formatOrderStatus(order.status)}
                </p>
            </section>

            <section className={styles.panelWide}>
                <div className={styles.inventoryList}>
                    <div>
                        <span>Păpușă</span>
                        <strong>{order.doll_name}</strong>
                    </div>
                    <div>
                        <span>Perioadă</span>
                        <strong>
                            {formatDateRo(order.start_date)} — {formatDateRo(order.end_date)}
                        </strong>
                    </div>
                    <div>
                        <span>Zile</span>
                        <strong>{order.rental_days ?? "-"}</strong>
                    </div>
                    <div>
                        <span>Ora livrare</span>
                        <strong>{order.delivery_time}</strong>
                    </div>
                    <div>
                        <span>Ora retur</span>
                        <strong>{order.return_time ?? "-"}</strong>
                    </div>
                    <div>
                        <span>Telefon</span>
                        <strong>{order.customer_phone}</strong>
                    </div>
                    <div>
                        <span>Email</span>
                        <strong>{order.customer_email}</strong>
                    </div>
                    <div>
                        <span>Adresă</span>
                        <strong>{order.delivery_address}</strong>
                    </div>
                    <div>
                        <span>Subtotal</span>
                        <strong>{order.subtotal_amount.toLocaleString("ro-RO")} lei</strong>
                    </div>

                    <div>
                        <span>Preț custom</span>
                        <strong>
                            {order.custom_price_amount
                                ? `${order.custom_price_amount.toLocaleString("ro-RO")} lei`
                                : "-"}
                        </strong>
                    </div>

                    <div>
                        <span>Discount</span>
                        <strong>
                            {order.discount_type === "none"
                                ? "-"
                                : order.discount_type === "fixed"
                                    ? `${order.discount_value.toLocaleString("ro-RO")} lei`
                                    : `${order.discount_value}%`}
                        </strong>
                    </div>

                    <div>
                        <span>Reducere calculată</span>
                        <strong>{order.discount_amount.toLocaleString("ro-RO")} lei</strong>
                    </div>

                    <div>
                        <span>Total final</span>
                        <strong>{order.total_label}</strong>
                    </div>
                </div>

                <div className={styles.panelWide}>
                    <h2>Status comandă</h2>

                    <form
                        action={async (formData) => {
                            "use server";
                            await updateOrderStatusFromFormAction(order.id, formData);
                        }}
                    >
                        <label>
                            Status
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

                    <Link href={`/admin/orders/${order.id}/edit`} className="btn btn-outline-light">
                        Editează rezervarea
                    </Link>
                </div>

                <form
                    action={async () => {
                        "use server";
                        await deleteOrderAction(order.id);
                    }}
                >
                    <button className="btn btn-outline-light">Șterge comanda</button>
                </form>
            </section>
        </main>
    );
}
