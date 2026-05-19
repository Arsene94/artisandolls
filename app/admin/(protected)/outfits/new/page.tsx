import OutfitForm from "@/components/admin/outfits/OutfitForm";
import { createOutfitAction } from "@/app/admin/(protected)/outfits/actions";
import styles from "../../page.module.css";

export default function NewOutfitPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Ținute</span>
                <h1>Adaugă ținută</h1>
                <p>Adaugă o ținută nouă pentru dropdown-ul din pagina păpușii.</p>
            </section>

            <OutfitForm action={createOutfitAction} />
        </main>
    );
}
