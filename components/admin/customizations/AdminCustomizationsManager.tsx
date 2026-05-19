"use client";

import { useState, useTransition } from "react";
import CustomizationIcon, {
    customizationIconOptions,
} from "@/components/icons/CustomizationIcon";
import type { CustomizationGroupWithOptions } from "@/lib/customizations/shared";
import {
    createCustomizationGroupAction,
    createCustomizationOptionAction,
    deleteCustomizationGroupAction,
    deleteCustomizationOptionAction,
} from "@/app/admin/(protected)/customizations/actions";
import styles from "./AdminCustomizations.module.css";

type Props = {
    groups: CustomizationGroupWithOptions[];
};

export default function AdminCustomizationsManager({ groups }: Props) {
    const [isPending, startTransition] = useTransition();
    const [openGroupId, setOpenGroupId] = useState<string | null>(groups[0]?.id ?? null);

    return (
        <section className={styles.panel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Customizări</span>
                    <h2>Opțiuni extra pentru păpuși</h2>
                    <p>Administrează categorii precum ochi, piele, dimensiuni, greutate, înălțime și servicii extra.</p>
                </div>
            </div>

            <form action={createCustomizationGroupAction} className={styles.inlineForm}>
                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        Titlu grup
                        <input name="title" placeholder="Culoare ochi" required />
                    </label>

                    <label className={styles.field}>
                        Slug
                        <input name="slug" placeholder="se generează automat" />
                    </label>

                    <label className={styles.field}>
                        Mod
                        <select name="mode" defaultValue="buy">
                            <option value="both">Ambele</option>
                            <option value="rent">Închiriere</option>
                            <option value="buy">Cumpărare</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Tip selecție
                        <select name="selection_type" defaultValue="single">
                            <option value="single">Single</option>
                            <option value="multiple">Multiple</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Icon grup
                        <select name="icon_name" defaultValue="sparkles">
                            {customizationIconOptions.map((icon) => (
                                <option key={icon} value={icon}>
                                    {icon}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.field}>
                        Ordine
                        <input name="display_order" type="number" defaultValue={0} />
                    </label>
                </div>

                <label className={styles.field}>
                    Descriere
                    <textarea name="description" />
                </label>

                <label className={styles.checkField}>
                    <input name="is_active" type="checkbox" defaultChecked />
                    Activ
                </label>

                <button className={styles.primaryButton}>Adaugă grup</button>
            </form>

            <div className={styles.optionGrid}>
                {groups.map((group) => (
                    <article key={group.id} className={styles.optionCard}>
                        <span className={styles.iconPreview}>
                            <CustomizationIcon name={group.icon_name} />
                        </span>

                        <div>
                            <strong>{group.title}</strong>
                            <small>
                                {group.mode} · {group.selection_type} · {group.options.length} opțiuni
                            </small>
                        </div>

                        <div className={styles.rowActions}>
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenGroupId(openGroupId === group.id ? null : group.id)
                                }
                            >
                                Opțiuni
                            </button>

                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                    if (!confirm("Ștergi grupul și toate opțiunile lui?")) return;

                                    startTransition(async () => {
                                        await deleteCustomizationGroupAction(group.id);
                                    });
                                }}
                            >
                                Șterge
                            </button>
                        </div>

                        {openGroupId === group.id && (
                            <div className={styles.panelWide}>
                                <form
                                    action={async (formData) => {
                                        await createCustomizationOptionAction(group.id, formData);
                                    }}
                                    className={styles.inlineForm}
                                >
                                    <div className={styles.formGrid}>
                                        <label className={styles.field}>
                                            Nume opțiune
                                            <input name="label" placeholder="Albastru" required />
                                        </label>

                                        <label className={styles.field}>
                                            Slug
                                            <input name="slug" />
                                        </label>

                                        <label className={styles.field}>
                                            Preț
                                            <input name="price" type="number" min="0" defaultValue={0} />
                                        </label>

                                        <label className={styles.field}>
                                            Icon opțiune
                                            <select name="icon_name" defaultValue={group.icon_name}>
                                                {customizationIconOptions.map((icon) => (
                                                    <option key={icon} value={icon}>
                                                        {icon}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className={styles.field}>
                                            Culoare icon
                                            <input name="icon_color" placeholder="#60a5fa" />
                                        </label>

                                        <label className={styles.field}>
                                            Culoare bulină
                                            <input name="swatch_color" placeholder="#60a5fa" />
                                        </label>

                                        <label className={styles.field}>
                                            Ordine
                                            <input name="display_order" type="number" defaultValue={0} />
                                        </label>
                                    </div>

                                    <label className={styles.field}>
                                        Descriere
                                        <textarea name="description" />
                                    </label>

                                    <label className={styles.checkField}>
                                        <input name="is_active" type="checkbox" defaultChecked />
                                        Activ
                                    </label>

                                    <button className={styles.primaryButton}>Adaugă opțiune</button>
                                </form>

                                <div className={styles.optionGrid}>
                                    {group.options.map((option) => (
                                        <div key={option.id} className={styles.optionCard}>
                                            <span className={styles.iconPreview}>
                                                <CustomizationIcon
                                                    name={option.icon_name}
                                                    color={option.icon_color}
                                                />
                                            </span>

                                            <div>
                                                <strong>{option.label}</strong>
                                                <small>
                                                    +{option.price.toLocaleString("ro-RO")} lei · {option.slug}
                                                </small>
                                            </div>

                                            {option.swatch_color && (
                                                <span
                                                    className={styles.swatch}
                                                    style={{ background: option.swatch_color }}
                                                />
                                            )}

                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={() => {
                                                    if (!confirm("Ștergi această opțiune?")) return;

                                                    startTransition(async () => {
                                                        await deleteCustomizationOptionAction(option.id);
                                                    });
                                                }}
                                            >
                                                Șterge
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
