import { notFound } from "next/navigation";
import { getOutfitBySlug } from "@/lib/outfits";
import OutfitForm from "@/components/admin/outfits/OutfitForm";
import { updateOutfitAction } from "@/app/admin/(protected)/outfits/actions";
import styles from "../../../page.module.css";

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function EditOutfitPage({ params }: Props) {
    const { slug } = await params;
    const outfit = await getOutfitBySlug(slug);

    if (!outfit) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await updateOutfitAction(outfit!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Ținute</span>
                <h1>Editează ținuta</h1>
                <p>Modifică numele, poza, prețul, modul și ordinea de afișare.</p>
            </section>

            <OutfitForm outfit={outfit} action={action} />
        </main>
    );
}
