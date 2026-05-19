"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
    CollectionRow,
    CollectionType,
} from "@/lib/collections/shared";
import styles from "./AdminCollections.module.css";

type CollectionFormProps = {
    mode: "create" | "edit";
    collection?: CollectionRow;
    action: (formData: FormData) => Promise<void>;
};

export default function CollectionForm({
                                           mode,
                                           collection,
                                           action,
                                       }: CollectionFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<CollectionType>(collection?.type ?? "category");

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Nume
                    <input name="name" defaultValue={collection?.name ?? ""} required />
                </label>

                <label className={styles.field}>
                    Slug URL
                    <input
                        name="slug"
                        defaultValue={collection?.slug ?? ""}
                        placeholder="se generează automat dacă îl lași gol"
                    />
                </label>

                <label className={styles.field}>
                    Tip
                    <select
                        name="type"
                        value={type}
                        onChange={(event) =>
                            setType(event.target.value === "series" ? "series" : "category")
                        }
                    >
                        <option value="category">Categorie</option>
                        <option value="series">Serie</option>
                    </select>
                </label>

                <label className={styles.field}>
                    Badge
                    <input
                        name="badge"
                        defaultValue={collection?.badge ?? ""}
                        placeholder="Premium, Serie, Noir..."
                    />
                </label>

                <label className={styles.field}>
                    Ordine afișare
                    <input
                        name="display_order"
                        type="number"
                        defaultValue={collection?.display_order ?? 0}
                    />
                </label>

                <label className={styles.checkField}>
                    <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={collection?.is_active ?? true}
                    />
                    Activă
                </label>
            </div>

            <label className={styles.field}>
                Descriere
                <textarea
                    name="description"
                    defaultValue={collection?.description ?? ""}
                    placeholder="Descriere scurtă pentru admin/catalog"
                />
            </label>

            <label className={styles.field}>
                Imagine path Supabase
                <input
                    name="image_path"
                    defaultValue={collection?.image_path ?? ""}
                    placeholder="collections/abc.webp"
                />
            </label>

            <label className={styles.field}>
                Sau imagine URL extern
                <input
                    name="image_url"
                    defaultValue={collection?.image_url ?? ""}
                    placeholder="https://..."
                />
            </label>

            <div className={styles.formActions}>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => router.back()}
                >
                    Anulează
                </button>

                <button type="submit" className={styles.primaryButton} disabled={isPending}>
                    {isPending
                        ? "Se salvează..."
                        : mode === "create"
                            ? "Adaugă colecția"
                            : "Salvează modificările"}
                </button>
            </div>
        </form>
    );
}
