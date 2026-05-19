import CustomizationGroupForm from "@/components/admin/customizations/CustomizationGroupForm";
import { createCustomizationGroupAction } from "@/app/admin/(protected)/customizations/actions";
import styles from "../../page.module.css";

export default function NewCustomizationGroupPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Customizări</span>
                <h1>Adaugă grup de customizări</h1>
                <p>Creează un grup precum culoare ochi, culoare piele, înălțime sau greutate.</p>
            </section>

            <CustomizationGroupForm action={createCustomizationGroupAction} />
        </main>
    );
}
