import DollForm from "@/components/admin/dolls/DollForm";
import { createDollAction } from "@/app/admin/(protected)/dolls/actions";
import styles from "../../page.module.css";

export default function NewDollPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Catalog</span>
                <h1>Adaugă păpușă</h1>
                <p>Completează informațiile, prețurile și imaginile pentru noua păpușă.</p>
            </section>

            <DollForm mode="create" action={createDollAction} />
        </main>
    );
}
