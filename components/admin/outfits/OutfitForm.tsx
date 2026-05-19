"use client";

import { useTransition } from "react";
import {
    customizationIconOptions,
} from "@/components/icons/CustomizationIcon";
import type { OutfitRow } from "@/lib/outfits/shared";
import AdminImageUploadField from "@/components/admin/shared/AdminImageUploadField";
import styles from "./AdminOutfits.module.css";

type Props = {
    outfit?: OutfitRow;
    action: (formData: FormData) => Promise<void>;
};

export default function OutfitForm({ outfit, action }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Nume ținută
                    <input
                        name="label"
                        defaultValue={outfit?.label ?? ""}
                        placeholder="Ținută elegantă clasică"
                        required
                    />
                </label>

                <label className={styles.field}>
                    Slug
                    <input
                        name="slug"
                        defaultValue={outfit?.slug ?? ""}
                        placeholder="se generează automat"
                    />
                </label>

                <label className={styles.field}>
                    Mod
                    <select name="mode" defaultValue={outfit?.mode ?? "both"}>
                        <option value="both">Ambele</option>
                        <option value="rent">Închiriere</option>
                        <option value="buy">Cumpărare</option>
                    </select>
                </label>

                <label className={styles.field}>
                    Preț
                    <input
                        name="price"
                        type="number"
                        min="0"
                        defaultValue={outfit?.price ?? 0}
                    />
                </label>

                <label className={styles.field}>
                    Icon
                    <select name="icon_name" defaultValue={outfit?.icon_name ?? "hanger"}>
                        {customizationIconOptions.map((icon) => (
                            <option key={icon} value={icon}>
                                {icon}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    Ordine
                    <input
                        name="display_order"
                        type="number"
                        defaultValue={outfit?.display_order ?? 0}
                    />
                </label>
            </div>

            <label className={styles.field}>
                Descriere
                <textarea
                    name="description"
                    defaultValue={outfit?.description ?? ""}
                    placeholder="Descriere scurtă pentru dropdown-ul din pagina păpușii"
                />
            </label>

            <div className={styles.formGrid}>
                <AdminImageUploadField
                    name="image_path"
                    label="Imagine ținută"
                    folder="outfits"
                    initialValue={outfit?.image_path ?? outfit?.image_url ?? ""}
                    helperText="Imaginea apare în dropdown-ul de ținute de pe pagina păpușii."
                    allowExternalUrl
                />
            </div>

            <label className={styles.checkField}>
                <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={outfit?.is_active ?? true}
                />
                Activă
            </label>

            <button className={styles.primaryButton} disabled={isPending}>
                {isPending ? "Se salvează..." : "Salvează ținuta"}
            </button>
        </form>
    );
}
