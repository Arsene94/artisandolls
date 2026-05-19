import { notFound } from "next/navigation";
import {
    getCustomizationGroupBySlug,
    getCustomizationOptionById,
} from "@/lib/customizations";
import CustomizationOptionForm from "@/components/admin/customizations/CustomizationOptionForm";
import { updateCustomizationOptionAction } from "@/app/admin/(protected)/customizations/actions";
import styles from "../../../../../page.module.css";

type Props = {
    params: Promise<{
        slug: string;
        optionId: string;
    }>;
};

export default async function EditCustomizationOptionPage({ params }: Props) {
    const { slug, optionId } = await params;

    const [group, option] = await Promise.all([
        getCustomizationGroupBySlug(slug),
        getCustomizationOptionById(optionId),
    ]);

    if (!group || !option || option.group_id !== group.id) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await updateCustomizationOptionAction(option!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>{group.title}</span>
                <h1>Editează opțiunea</h1>
                <p>Modifică valoarea, prețul, iconul și culoarea opțiunii.</p>
            </section>

            <CustomizationOptionForm group={group} option={option} action={action} />
        </main>
    );
}
