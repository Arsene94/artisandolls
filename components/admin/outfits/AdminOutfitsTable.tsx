"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import CustomizationIcon from "@/components/icons/CustomizationIcon";
import {
    formatOutfitMode,
    getOutfitImage,
    type OutfitRow,
} from "@/lib/outfits/shared";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import {
    bulkDeleteOutfitsAction,
    deleteOutfitAction,
} from "@/app/admin/(protected)/outfits/actions";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import styles from "./AdminOutfits.module.css";

type Props = {
    outfits: OutfitRow[];
};

export default function AdminOutfitsTable({ outfits }: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const allSelected = outfits.length > 0 && selectedIds.length === outfits.length;

    function toggleOne(id: string) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : outfits.map((outfit) => outfit.id));
    }

    function deleteOne(id: string) {
        if (!confirm("Sigur vrei să ștergi această ținută?")) return;

        startTransition(async () => {
            await deleteOutfitAction(id);
        });
    }

    function deleteSelected() {
        if (selectedIds.length === 0) return;
        if (!confirm(`Sigur vrei să ștergi ${selectedIds.length} ținute?`)) return;

        startTransition(async () => {
            await bulkDeleteOutfitsAction(selectedIds);
            setSelectedIds([]);
        });
    }

    return (
        <section className={styles.panel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Ținute</span>
                    <h2>{outfits.length} ținute</h2>
                    <p>Administrează dropdown-ul cu poze și prețuri din pagina păpușii.</p>
                </div>

                <div className={styles.toolbarActions}>
                    <button
                        type="button"
                        className={styles.dangerButton}
                        disabled={selectedIds.length === 0 || isPending}
                        onClick={deleteSelected}
                    >
                        Șterge selectate
                    </button>

                    <Link href="/admin/outfits/new" className={styles.primaryButton}>
                        Adaugă ținută
                    </Link>
                </div>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHead}>
                    <label>
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </label>
                    <span>Imagine</span>
                    <span>Ținută</span>
                    <span>Mod</span>
                    <span>Preț</span>
                    <span>Status</span>
                    <span>Acțiuni</span>
                </div>

                {outfits.map((outfit) => {
                    const image = getOutfitImage(outfit);

                    return (
                        <div key={outfit.id} className={styles.tableRow}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(outfit.id)}
                                    onChange={() => toggleOne(outfit.id)}
                                />
                            </label>

                            <div className={styles.imageCell}>
                                {image ? (
                                    <Image
                                        src={getSupabaseImageUrl(image, "thumb")}
                                        alt={outfit.label}
                                        width={96}
                                        height={120}
                                    />
                                ) : (
                                    <span>Fără imagine</span>
                                )}
                            </div>

                            <div>
                                <strong>
                                    <CustomizationIcon name={outfit.icon_name} size={17} />
                                    {outfit.label}
                                </strong>
                                <small>/{outfit.slug}</small>
                            </div>

                            <span>{formatOutfitMode(outfit.mode)}</span>
                            <span>{outfit.price.toLocaleString("ro-RO")} lei</span>
                            <span>{outfit.is_active ? "Activă" : "Inactivă"}</span>

                            <div className={styles.rowActions}>
                                <Link
                                    href={`/admin/outfits/${outfit.slug}/edit`}
                                    aria-label="Editează"
                                    title="Editează"
                                >
                                    <IconPencil size={18} />
                                </Link>

                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => deleteOne(outfit.id)}
                                    aria-label="Șterge"
                                    title="Șterge"
                                >
                                    <IconTrash size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {outfits.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>Nu există ținute.</h3>
                        <p>Adaugă prima ținută pentru dropdown-ul de pe pagina păpușii.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
