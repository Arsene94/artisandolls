import { getCustomizationGroupsWithOptionsForCatalog } from "@/lib/customizations";
import AdminCustomizationsManager from "@/components/admin/customizations/AdminCustomizationsManager";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCustomizationsPage() {
    const { rent, buy } = await getCustomizationGroupsWithOptionsForCatalog();

    const groups = [
        ...rent.filter((group) => group.mode !== "both"),
        ...buy,
    ];

    const uniqueGroups = Array.from(
        new Map(groups.map((group) => [group.id, group])).values()
    );

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Catalog</span>
                <h1>Customizări</h1>
                <p>
                    Administrează opțiuni extra pentru închiriere și cumpărare: aspect,
                    dimensiuni, culoare ochi, culoare piele, greutate, înălțime și servicii.
                </p>
            </section>

            <AdminCustomizationsManager groups={uniqueGroups} />
        </main>
    );
}
