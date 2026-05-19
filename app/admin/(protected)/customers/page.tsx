import { getCustomerRows } from "@/lib/customers";
import AdminCustomersTable from "@/components/admin/customers/AdminCustomersTable";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
    const customers = await getCustomerRows();

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>CRM</span>
                <h1>Clienți</h1>
                <p>
                    Date contact, istoric comenzi, valoare totală și comunicare rapidă.
                </p>
            </section>

            <AdminCustomersTable customers={customers} />
        </main>
    );
}
