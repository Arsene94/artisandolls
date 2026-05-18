import { getDollRows } from "@/lib/dolls";
import AdminDollsCatalog from "@/components/admin/dolls/AdminDollsCatalog";
import styles from "../page.module.css";

export default async function AdminDollsPage() {
    const dolls = await getDollRows(true);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Catalog</span>
                <h1>Păpuși</h1>
                <p>Administrează păpușile din catalog, imaginile, prețurile și disponibilitatea.</p>
            </section>

            <AdminDollsCatalog dolls={dolls} />
        </main>
    );
}
