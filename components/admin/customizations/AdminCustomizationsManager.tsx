"use client";

import Link from "next/link";
import { useTransition } from "react";
import CustomizationIcon from "@/components/icons/CustomizationIcon";
import type { CustomizationGroupWithOptions } from "@/lib/customizations/shared";
import {
    formatCustomizationMode,
    formatSelectionType,
} from "@/lib/customizations/shared";
import {
    deleteCustomizationGroupAction,
    deleteCustomizationOptionAction,
} from "@/app/admin/(protected)/customizations/actions";
import styles from "./AdminCustomizations.module.css";

type Props = {
    groups: CustomizationGroupWithOptions[];
};

export default function AdminCustomizationsManager({ groups }: Props) {
    const [isPending, startTransition] = useTransition();

    return (
        <section className={styles.panel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Customizări</span>
                    <h2>Opțiuni extra pentru păpuși</h2>
                    <p>
                        Administrează grupuri și valori pentru culoare ochi, culoare piele,
                        dimensiuni, greutate, înălțime și servicii extra.
                    </p>
                </div>

                <Link href="/admin/customizations/new" className={styles.primaryButton}>
                    Adaugă grup
                </Link>
            </div>

            <div className={styles.optionGrid}>
                {groups.map((group) => (
                    <article key={group.id} className={styles.optionCard}>
                        <span className={styles.iconPreview}>
                            <CustomizationIcon name={group.icon_name} />
                        </span>

                        <div>
                            <strong>{group.title}</strong>
                            <small>
                                {formatCustomizationMode(group.mode)} ·{" "}
                                {formatSelectionType(group.selection_type)} ·{" "}
                                {group.options.length} opțiuni ·{" "}
                                {group.is_active ? "Activ" : "Inactiv"}
                            </small>
                        </div>

                        <div className={styles.rowActions}>
                            <Link href={`/admin/customizations/${group.slug}/edit`}>
                                Editează
                            </Link>

                            <Link href={`/admin/customizations/${group.slug}/options/new`}>
                                Adaugă opțiune
                            </Link>

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

                        <div className={styles.panelWide}>
                            {group.options.length > 0 ? (
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
                                                    +{option.price.toLocaleString("ro-RO")} lei ·{" "}
                                                    {option.is_active ? "Activă" : "Inactivă"} ·{" "}
                                                    {option.slug}
                                                </small>
                                            </div>

                                            {option.swatch_color && (
                                                <span
                                                    className={styles.swatch}
                                                    style={{ background: option.swatch_color }}
                                                />
                                            )}

                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/customizations/${group.slug}/options/${option.id}/edit`}
                                                >
                                                    Editează
                                                </Link>

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
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    Nu există opțiuni în acest grup.
                                </div>
                            )}
                        </div>
                    </article>
                ))}

                {groups.length === 0 && (
                    <div className={styles.emptyState}>
                        Nu există încă grupuri de customizări.
                    </div>
                )}
            </div>
        </section>
    );
}
