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
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import table from "@/components/admin/shared/AdminTable.module.css";
import styles from "./AdminCustomizations.module.css";

type Props = {
    groups: CustomizationGroupWithOptions[];
};

export default function AdminCustomizationsManager({ groups }: Props) {
    const [isPending, startTransition] = useTransition();

    return (
        <section className={table.panel}>
            <div className={table.toolbar}>
                <div>
                    <span>Customizări</span>
                    <h2>Opțiuni extra pentru păpuși</h2>
                    <p>
                        Administrează grupuri și valori pentru culoare ochi, culoare
                        piele, dimensiuni, greutate, înălțime și servicii extra.
                    </p>
                </div>

                <Link href="/admin/customizations/new" className={table.primaryLink}>
                    Adaugă grup
                </Link>
            </div>

            {groups.length === 0 ? (
                <div className={table.emptyState}>
                    Nu există încă grupuri de customizări.
                </div>
            ) : (
                groups.map((group) => (
                    <div key={group.id} className={styles.group}>
                        <div className={styles.groupHeader}>
                            <div className={styles.groupTitle}>
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
                            </div>

                            <div className={table.rowActions}>
                                <Link
                                    href={`/admin/customizations/${group.slug}/edit`}
                                    aria-label="Editează grupul"
                                    title="Editează grupul"
                                    className={table.actionBtn}
                                >
                                    <IconPencil size={18} />
                                </Link>
                                <Link
                                    href={`/admin/customizations/${group.slug}/options/new`}
                                    aria-label="Adaugă opțiune"
                                    title="Adaugă opțiune"
                                    className={table.actionBtn}
                                >
                                    <IconPlus size={18} />
                                </Link>
                                <button
                                    type="button"
                                    disabled={isPending}
                                    aria-label="Șterge grupul"
                                    title="Șterge grupul"
                                    className={table.actionBtnDanger}
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                "Ștergi grupul și toate opțiunile lui?",
                                            )
                                        )
                                            return;

                                        startTransition(async () => {
                                            await deleteCustomizationGroupAction(
                                                group.id,
                                            );
                                        });
                                    }}
                                >
                                    <IconTrash size={18} />
                                </button>
                            </div>
                        </div>

                        {group.options.length > 0 ? (
                            <div className={table.tableWrap}>
                                <table className={table.table}>
                                    <thead>
                                        <tr>
                                            <th aria-hidden="true" />
                                            <th>Opțiune</th>
                                            <th className={table.right}>Preț</th>
                                            <th className={table.center}>Status</th>
                                            <th>Slug</th>
                                            <th className={table.right}>Acțiuni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.options.map((option) => (
                                            <tr key={option.id}>
                                                <td>
                                                    <span className={styles.iconPreview}>
                                                        <CustomizationIcon
                                                            name={option.icon_name}
                                                            color={option.icon_color}
                                                        />
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.optLabel}>
                                                        <strong>{option.label}</strong>
                                                        {option.swatch_color ? (
                                                            <span
                                                                className={styles.swatch}
                                                                style={{
                                                                    background:
                                                                        option.swatch_color,
                                                                }}
                                                            />
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className={table.right}>
                                                    +{option.price.toLocaleString("ro-RO")}{" "}
                                                    lei
                                                </td>
                                                <td className={table.center}>
                                                    <span className={table.status}>
                                                        <span
                                                            className={`${table.dot} ${option.is_active ? table.dotOn : table.dotOff}`}
                                                        />
                                                        {option.is_active
                                                            ? "Activă"
                                                            : "Inactivă"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={table.mono}>
                                                        {option.slug}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={table.rowActions}>
                                                        <Link
                                                            href={`/admin/customizations/${group.slug}/options/${option.id}/edit`}
                                                            aria-label="Editează"
                                                            title="Editează"
                                                            className={table.actionBtn}
                                                        >
                                                            <IconPencil size={18} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            disabled={isPending}
                                                            aria-label="Șterge"
                                                            title="Șterge"
                                                            className={table.actionBtnDanger}
                                                            onClick={() => {
                                                                if (
                                                                    !confirm(
                                                                        "Ștergi această opțiune?",
                                                                    )
                                                                )
                                                                    return;

                                                                startTransition(
                                                                    async () => {
                                                                        await deleteCustomizationOptionAction(
                                                                            option.id,
                                                                        );
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            <IconTrash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={table.emptyState}>
                                Nu există opțiuni în acest grup.
                            </div>
                        )}
                    </div>
                ))
            )}
        </section>
    );
}
