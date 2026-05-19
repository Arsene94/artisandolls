import { notFound } from "next/navigation";
import DollForm from "@/components/admin/dolls/DollForm";
import { updateDollAction } from "@/app/admin/(protected)/dolls/actions";
import { getCollectionRows } from "@/lib/collections";
import { getDollRowBySlug } from "@/lib/dolls";
import styles from "../../../page.module.css";

type EditDollPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditDollPage({ params }: EditDollPageProps) {
    const { id } = await params;
    const [doll, collections] = await Promise.all([
        getDollRowBySlug(id),
        getCollectionRows(true),
    ]);

    if (!doll) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await updateDollAction(doll!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Catalog</span>
                <h1>Editează păpușa</h1>
                <p>Modifică informațiile, imaginile, disponibilitatea și prețurile.</p>
            </section>

            <DollForm
                mode="edit"
                doll={doll}
                collections={collections}
                action={action}
            />
        </main>
    );
}
