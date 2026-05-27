import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import { SHOP_ORDER_STATUS_OPTIONS } from "@/lib/shop/shared";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

function statusLabel(value: string): string {
    return (
        SHOP_ORDER_STATUS_OPTIONS.find((opt) => opt.value === value)?.label ??
        value
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function AdminShopOrdersPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("shop_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
    if (error) throw new Error(error.message);

    const orders = data ?? [];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-7xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Shop</span>
                        <h2>Comenzi magazin</h2>
                        <p>Cele mai recente 200 de comenzi.</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.emptyState}>Nu există comenzi încă.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Comandă</th>
                                    <th>Client</th>
                                    <th>Status</th>
                                    <th className={styles.right}>Total</th>
                                    <th>Creată</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link
                                                href={`/admin/shop/orders/${order.id}`}
                                                className={`${styles.nameLink} ${styles.mono}`}
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td>
                                            <strong>{order.customer_name}</strong>
                                            <small className={styles.sub}>
                                                {order.customer_phone}
                                            </small>
                                        </td>
                                        <td>{statusLabel(order.status)}</td>
                                        <td className={styles.right}>
                                            <strong>
                                                {formatPrice(
                                                    order.total_amount,
                                                    "ro",
                                                    order.currency ?? "RON",
                                                )}
                                            </strong>
                                        </td>
                                        <td>{formatDateTime(order.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
