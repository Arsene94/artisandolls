"use client";

import { useTransition } from "react";
import {
    customizationIconOptions,
} from "@/components/icons/CustomizationIcon";
import type {
    CustomizationGroupRow,
    CustomizationOptionRow,
} from "@/lib/customizations/shared";
import styles from "./AdminCustomizations.module.css";

type Props = {
    group: CustomizationGroupRow;
    option?: CustomizationOptionRow;
    action: (formData: FormData) => Promise<void>;
};

export default function CustomizationOptionForm({ group, option, action }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.inlineForm}>
            <input type="hidden" name="group_id" value={group.id} />
            <input
                type="hidden"
                name="redirect_to"
                value={`/admin/customizations/${group.slug}/edit`}
            />

            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Nume opțiune
                    <input name="label" defaultValue={option?.label ?? ""} required />
                </label>

                <label className={styles.field}>
                    Slug
                    <input name="slug" defaultValue={option?.slug ?? ""} />
                </label>

                <label className={styles.field}>
                    Preț
                    <input
                        name="price"
                        type="number"
                        min="0"
                        defaultValue={option?.price ?? 0}
                    />
                </label>

                <label className={styles.field}>
                    Icon opțiune
                    <select name="icon_name" defaultValue={option?.icon_name ?? group.icon_name}>
                        {customizationIconOptions.map((icon) => (
                            <option key={icon} value={icon}>
                                {icon}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    Culoare icon
                    <input
                        name="icon_color"
                        defaultValue={option?.icon_color ?? ""}
                        placeholder="#60a5fa"
                    />
                </label>

                <label className={styles.field}>
                    Culoare bulină
                    <input
                        name="swatch_color"
                        defaultValue={option?.swatch_color ?? ""}
                        placeholder="#60a5fa"
                    />
                </label>

                <label className={styles.field}>
                    Ordine
                    <input
                        name="display_order"
                        type="number"
                        defaultValue={option?.display_order ?? 0}
                    />
                </label>
            </div>

            <label className={styles.field}>
                Descriere
                <textarea name="description" defaultValue={option?.description ?? ""} />
            </label>

            <label className={styles.checkField}>
                <input
                    name="is_active"
                    type="checkbox"
                    defaultChecked={option?.is_active ?? true}
                />
                Activă
            </label>

            <button className={styles.primaryButton} disabled={isPending}>
                {isPending ? "Se salvează..." : "Salvează opțiunea"}
            </button>
        </form>
    );
}
