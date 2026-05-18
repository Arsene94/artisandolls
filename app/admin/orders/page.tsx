import { getAdminOrderRows } from "@/lib/orders";
import AdminOrdersTable from "@/components/admin/orders/AdminOrdersTable";
import styles from "../page.module.css";

export default async function AdminOrdersPage() {
    const orders = await getAdminOrderRows(100);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Comenzi</span>
                <h1>Cereri rent / buy</h1>
                <p>Administrează cererile de închiriere și cumpărare primite de la clienți.</p>
            </section>

            <AdminOrdersTable orders={orders} />
        </main>
    );
}
