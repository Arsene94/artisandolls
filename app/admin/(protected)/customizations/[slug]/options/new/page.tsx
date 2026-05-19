import { notFound } from "next/navigation";
import { getCustomizationGroupBySlug } from "@/lib/customizations";
import CustomizationOptionForm from "@/components/admin/customizations/CustomizationOptionForm";
import { createCustomizationOptionAction } from "@/app/admin/(protected)/customizations/actions";
import styles from "../../../../page.module.css";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function NewCustomizationOptionPage({ params }: Props) {
    const { slug } = await params;
    const group = await getCustomizationGroupBySlug(slug);

    if (!group) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await createCustomizationOptionAction(group!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>{group.title}</span>
                <h1>Adaugă opțiune</h1>
                <p>Adaugă o valoare selectabilă pentru acest grup.</p>
            </section>

            <CustomizationOptionForm group={group} action={action} />
        </main>
    );
}
