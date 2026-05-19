import { getCollectionRows } from "@/lib/collections";
import AdminCollectionsTable from "@/components/admin/collections/AdminCollectionsTable";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
    const collections = await getCollectionRows(true);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Catalog</span>
                <h1>Colecții</h1>
                <p>
                    Administrează categoriile și seriile folosite pentru gruparea păpușilor.
                </p>
            </section>

            <AdminCollectionsTable collections={collections} />
        </main>
    );
}
