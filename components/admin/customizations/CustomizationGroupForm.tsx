"use client";

import { useTransition } from "react";
import {
    customizationIconOptions,
} from "@/components/icons/CustomizationIcon";
import type { CustomizationGroupRow } from "@/lib/customizations/shared";
import styles from "./AdminCustomizations.module.css";

type Props = {
    group?: CustomizationGroupRow;
    action: (formData: FormData) => Promise<void>;
};

export default function CustomizationGroupForm({ group, action }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.inlineForm}>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Titlu grup
                    <input name="title" defaultValue={group?.title ?? ""} required />
                </label>

                <label className={styles.field}>
                    Slug
                    <input name="slug" defaultValue={group?.slug ?? ""} />
                </label>

                <label className={styles.field}>
                    Mod
                    <select name="mode" defaultValue={group?.mode ?? "buy"}>
                        <option value="both">Ambele</option>
                        <option value="rent">Închiriere</option>
                        <option value="buy">Cumpărare</option>
                    </select>
                </label>

                <label className={styles.field}>
                    Tip selecție
                    <select name="selection_type" defaultValue={group?.selection_type ?? "single"}>
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                    </select>
                </label>

                <label className={styles.field}>
                    Icon grup
                    <select name="icon_name" defaultValue={group?.icon_name ?? "sparkles"}>
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
                        defaultValue={group?.display_order ?? 0}
                    />
                </label>
            </div>

            <label className={styles.field}>
                Descriere
                <textarea name="description" defaultValue={group?.description ?? ""} />
            </label>

            <label className={styles.checkField}>
                <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={group?.is_active ?? true}
                />
                Activ
            </label>

            <button className={styles.primaryButton} disabled={isPending}>
                {isPending ? "Se salvează..." : "Salvează grupul"}
            </button>
        </form>
    );
}
