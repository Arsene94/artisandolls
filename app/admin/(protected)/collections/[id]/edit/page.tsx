import { notFound } from "next/navigation";
import CollectionForm from "@/components/admin/collections/CollectionForm";
import { getCollectionRowBySlug } from "@/lib/collections";
import { updateCollectionAction } from "@/app/admin/(protected)/collections/actions";
import styles from "../../../page.module.css";

type EditCollectionPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditCollectionPage({
                                                     params,
                                                 }: EditCollectionPageProps) {
    const { id } = await params;
    const collection = await getCollectionRowBySlug(id);

    if (!collection) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await updateCollectionAction(collection!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Colecții</span>
                <h1>Editează colecția</h1>
                <p>Modifică numele, tipul, descrierea, badge-ul și ordinea de afișare.</p>
            </section>

            <CollectionForm mode="edit" collection={collection} action={action} />
        </main>
    );
}
