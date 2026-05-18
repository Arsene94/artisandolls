import styles from "../page.module.css";

export default function AdminSectionPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Admin</span>
                <h1>Secțiune în lucru</h1>
                <p>
                    Această pagină este pregătită pentru managementul datelor din Supabase.
                </p>
            </section>
        </main>
    );
}
