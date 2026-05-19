import { getOutfitRows } from "@/lib/outfits";
import AdminOutfitsTable from "@/components/admin/outfits/AdminOutfitsTable";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminOutfitsPage() {
    const outfits = await getOutfitRows(true);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Catalog</span>
                <h1>Ținute</h1>
                <p>
                    Administrează dropdown-ul de ținute cu poze, prețuri și disponibilitate
                    pentru închiriere sau cumpărare.
                </p>
            </section>

            <AdminOutfitsTable outfits={outfits} />
        </main>
    );
}
