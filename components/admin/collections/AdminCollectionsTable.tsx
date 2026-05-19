"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { CollectionRow } from "@/lib/collections";
import { formatCollectionType } from "@/lib/collections";
import {
    bulkDeleteCollectionsAction,
    deleteCollectionAction,
} from "@/app/admin/(protected)/collections/actions";
import styles from "./AdminCollections.module.css";

type AdminCollectionsTableProps = {
    collections: CollectionRow[];
};

export default function AdminCollectionsTable({
                                                  collections,
                                              }: AdminCollectionsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const allSelected =
        collections.length > 0 && selectedIds.length === collections.length;

    function toggleOne(id: string) {
        setSelectedIds((currentIds) =>
            currentIds.includes(id)
                ? currentIds.filter((item) => item !== id)
                : [...currentIds, id]
        );
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : collections.map((collection) => collection.id));
    }

    function deleteOne(id: string) {
        if (!confirm("Sigur vrei să ștergi această colecție?")) {
            return;
        }

        startTransition(async () => {
            await deleteCollectionAction(id);
        });
    }

    function deleteSelected() {
        if (selectedIds.length === 0) {
            return;
        }

        if (!confirm(`Sigur vrei să ștergi ${selectedIds.length} colecții?`)) {
            return;
        }

        startTransition(async () => {
            await bulkDeleteCollectionsAction(selectedIds);
            setSelectedIds([]);
        });
    }

    return (
        <section className={styles.panel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Colecții</span>
                    <h2>{collections.length} categorii și serii</h2>
                    <p>Administrează gruparea păpușilor din catalog.</p>
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

                    <Link href="/admin/collections/new" className={styles.primaryLink}>
                        Adaugă colecție
                    </Link>
                </div>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHead}>
                    <label>
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </label>
                    <span>Nume</span>
                    <span>Tip</span>
                    <span>Badge</span>
                    <span>Status</span>
                    <span>Ordine</span>
                    <span>Acțiuni</span>
                </div>

                {collections.map((collection) => (
                    <div key={collection.id} className={styles.tableRow}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(collection.id)}
                                onChange={() => toggleOne(collection.id)}
                            />
                        </label>

                        <div>
                            <strong>{collection.name}</strong>
                            <small>/{collection.slug}</small>
                        </div>

                        <span>{formatCollectionType(collection.type)}</span>
                        <span>{collection.badge || "-"}</span>
                        <span>{collection.is_active ? "Activă" : "Inactivă"}</span>
                        <span>{collection.display_order}</span>

                        <div className={styles.rowActions}>
                            <Link href={`/admin/collections/${collection.slug}/edit`}>
                                Editează
                            </Link>

                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => deleteOne(collection.id)}
                            >
                                Șterge
                            </button>
                        </div>
                    </div>
                ))}

                {collections.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>Nu există colecții.</h3>
                        <p>Adaugă prima categorie sau serie pentru catalog.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
