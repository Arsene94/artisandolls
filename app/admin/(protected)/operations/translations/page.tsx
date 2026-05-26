import { getOperationsSnapshot } from "@/lib/translations/operations";
import TranslationOpsClient from "./TranslationOpsClient";
import styles from "../../page.module.css";

export const dynamic = "force-dynamic";

export default async function TranslationOperationsPage() {
    const snapshot = await getOperationsSnapshot();

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Operațiuni</span>
                <h1>Traduceri automate</h1>
                <p>
                    Coadă centralizată pentru auto-traducerea conținutului RO către
                    EN/NL. Pune câmpurile lipsă la coadă sau retradu tot. Job-urile
                    rulează în background prin QStash — poți închide pagina, nu se
                    oprește. Reîntoarce-te oricând să vezi progresul live.
                </p>
            </section>

            <TranslationOpsClient initialSnapshot={snapshot} />
        </main>
    );
}
