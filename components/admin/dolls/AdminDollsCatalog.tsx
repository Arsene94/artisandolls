"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { DollRow } from "@/lib/dolls";
import type { RentFromPrice } from "@/lib/dolls/tiers";
import { bulkDeleteDollsAction, deleteDollAction } from "@/app/admin/(protected)/dolls/actions";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { IconExternalLink, IconPencil, IconTrash } from "@tabler/icons-react";
import styles from "./AdminDolls.module.css";

type AdminDoll = DollRow & { rentFrom: RentFromPrice | null };

type AdminDollsCatalogProps = {
    dolls: AdminDoll[];
};

export default function AdminDollsCatalog({ dolls }: AdminDollsCatalogProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const allSelected = dolls.length > 0 && selectedIds.length === dolls.length;

    const selectedCountLabel = useMemo(() => {
        if (selectedIds.length === 0) {
            return "Nicio păpușă selectată";
        }

        return `${selectedIds.length} selectate`;
    }, [selectedIds.length]);

    function toggleOne(id: string) {
        setSelectedIds((currentIds) =>
            currentIds.includes(id)
                ? currentIds.filter((item) => item !== id)
                : [...currentIds, id]
        );
    }

    function toggleAll() {
        setSelectedIds(allSelected ? [] : dolls.map((doll) => doll.id));
    }

    function deleteOne(id: string) {
        if (!confirm("Sigur vrei să ștergi această păpușă?")) {
            return;
        }

        startTransition(async () => {
            await deleteDollAction(id);
        });
    }

    function deleteSelected() {
        if (selectedIds.length === 0) {
            return;
        }

        if (!confirm(`Sigur vrei să ștergi ${selectedIds.length} păpuși?`)) {
            return;
        }

        startTransition(async () => {
            await bulkDeleteDollsAction(selectedIds);
            setSelectedIds([]);
        });
    }

    return (
        <section className={styles.catalogPanel}>
            <div className={styles.toolbar}>
                <div>
                    <span>Catalog</span>
                    <h2>Păpuși administrabile</h2>
                    <p>{selectedCountLabel}</p>
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

                    <Link href="/admin/dolls/new" className={styles.primaryLink}>
                        Adaugă păpușă
                    </Link>
                </div>
            </div>

            <div className={styles.table}>
                <div className={styles.tableHead}>
                    <label>
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </label>
                    <span>Imagine</span>
                    <span>Nume</span>
                    <span>Colecție</span>
                    <span>Status</span>
                    <span>Prețuri</span>
                    <span>Acțiuni</span>
                </div>

                {dolls.map((doll) => (
                    <div key={doll.id} className={styles.tableRow}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(doll.id)}
                                onChange={() => toggleOne(doll.id)}
                            />
                        </label>

                        <Image
                            src={getSupabaseImageUrl(doll.main_image_path ?? doll.main_image_url, "thumb")}
                            alt={doll.name}
                            width={160}
                            height={180}
                        />

                        <div>
                            <strong>{doll.name}</strong>
                            <small>/{doll.slug}</small>
                        </div>

                        <span>{doll.collection}</span>

                        <div>
                            <strong>{doll.badge}</strong>
                            <small>
                                {doll.is_active ? "Activă" : "Inactivă"}
                                {doll.show_on_home_hero ? " · Hero homepage" : ""}
                            </small>
                        </div>

                        <div>
                            <span>
                                {doll.rentFrom
                                    ? `de la ${doll.rentFrom.price} lei / ${doll.rentFrom.unit === "hour" ? "oră" : "zi"}`
                                    : "Fără chirie"}
                            </span>
                            <small>{doll.buy_price ? `${doll.buy_price} lei cumpărare` : "Fără vânzare"}</small>
                        </div>

                        <div className={styles.rowActions}>
                            <Link
                                href={`/catalog/${doll.slug}`}
                                target="_blank"
                                aria-label="Vezi în site"
                                title="Vezi în site"
                            >
                                <IconExternalLink size={18} />
                            </Link>
                            <Link
                                href={`/admin/dolls/${doll.slug}/edit`}
                                aria-label="Editează"
                                title="Editează"
                            >
                                <IconPencil size={18} />
                            </Link>
                            <button
                                type="button"
                                onClick={() => deleteOne(doll.id)}
                                disabled={isPending}
                                aria-label="Șterge"
                                title="Șterge"
                            >
                                <IconTrash size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {dolls.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>Nu există păpuși în catalog.</h3>
                        <p>Adaugă prima păpușă din admin panel.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
