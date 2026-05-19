import CollectionForm from "@/components/admin/collections/CollectionForm";
import { createCollectionAction } from "@/app/admin/(protected)/collections/actions";
import styles from "../../page.module.css";

export default function NewCollectionPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Colecții</span>
                <h1>Adaugă colecție</h1>
                <p>Creează o categorie sau o serie nouă pentru catalog.</p>
            </section>

            <CollectionForm mode="create" action={createCollectionAction} />
        </main>
    );
}
