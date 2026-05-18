import { notFound } from "next/navigation";
import {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
    getAdminOrderById,
} from "@/lib/orders";
import { deleteOrderAction, updateOrderStatusAction } from "@/app/admin/(protected)/orders/actions";
import styles from "../../page.module.css";

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
                        <span>Total</span>
                        <strong>{order.total_label}</strong>
                    </div>
                    <div>
                        <span>WhatsApp notificat</span>
                        <strong>{order.whatsapp_notified ? "Da" : "Nu"}</strong>
                    </div>
                </div>

                <form
                    action={async () => {
                        "use server";
                        await updateOrderStatusAction(order.id, "confirmed");
                    }}
                >
                    <button className="btn btn-gold">Confirmă comanda</button>
                </form>

                <form
                    action={async () => {
                        "use server";
                        await updateOrderStatusAction(order.id, "cancelled");
                    }}
                >
                    <button className="btn btn-outline-light">Anulează comanda</button>
                </form>

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
