import { getDollRows, getRentalTiersByDoll } from "@/lib/dolls";
import { getRentFromPrice } from "@/lib/dolls/tiers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminDollsCatalog from "@/components/admin/dolls/AdminDollsCatalog";
import styles from "../page.module.css";

export default async function AdminDollsPage() {
    const rows = await getDollRows(true);
    const supabase = await createSupabaseServerClient();
    const tiersByDoll = await getRentalTiersByDoll(
        supabase,
        rows.map((row) => row.id),
    );

    const dolls = rows.map((row) => ({
        ...row,
        rentFrom: getRentFromPrice(tiersByDoll.get(row.id) ?? []),
    }));

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
