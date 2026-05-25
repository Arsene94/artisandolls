"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { optimizeImageBeforeUpload } from "@/lib/images/optimize-upload";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import styles from "./AdminImageGalleryField.module.css";

type Item = {
    id: string;
    url: string;
};

type Props = {
    /** Hidden input name that receives the JSON-encoded array of paths. */
    name: string;
    label: string;
    helperText?: string;
    folder: string;
    initial?: readonly string[];
    /** Max distinct images allowed. Default 8. */
    maxItems?: number;
};

function makeItem(url = ""): Item {
    return { id: globalThis.crypto.randomUUID(), url };
}

function dedupe(items: Item[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of items) {
        const trimmed = item.url.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        out.push(trimmed);
    }
    return out;
}

export default function AdminImageGalleryField({
    name,
    label,
    helperText,
    folder,
    initial = [],
    maxItems = 8,
}: Props) {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const reactId = useId();
    const [items, setItems] = useState<Item[]>(() =>
        initial.length > 0 ? initial.map((url) => makeItem(url)) : [makeItem()],
    );
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const urls = dedupe(items);
    const payload = JSON.stringify(urls);

    function updateUrl(id: string, url: string) {
        setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, url } : item)),
        );
    }

    function addRow() {
        setItems((current) => {
            if (current.length >= maxItems) return current;
            return [...current, makeItem()];
        });
    }

    function removeRow(id: string) {
        setItems((current) => {
            if (current.length === 1) return [makeItem()];
            return current.filter((item) => item.id !== id);
        });
    }

    function moveRow(id: string, direction: -1 | 1) {
        setItems((current) => {
            const index = current.findIndex((item) => item.id === id);
            if (index === -1) return current;
            const next = index + direction;
            if (next < 0 || next >= current.length) return current;
            const copy = [...current];
            [copy[index], copy[next]] = [copy[next], copy[index]];
            return copy;
        });
    }

    async function uploadImage(id: string, file: File) {
        try {
            setUploadingId(id);
            const optimized = await optimizeImageBeforeUpload(file);
            const cleanFolder = folder.replace(/^\/|\/$/g, "");
            const filePath = `${cleanFolder}/${globalThis.crypto.randomUUID()}.webp`;

            const { error } = await supabase.storage
                .from("doll-images")
                .upload(filePath, optimized, {
                    contentType: "image/webp",
                    cacheControl: "31536000",
                    upsert: false,
                });
            if (error) throw error;
            updateUrl(id, filePath);
        } catch (err) {
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Imaginea nu a putut fi încărcată.",
            );
        } finally {
            setUploadingId(null);
        }
    }

    return (
        <div className={styles.field}>
            <input type="hidden" name={name} value={payload} />

            <div className={styles.header}>
                <div>
                    <span>{label}</span>
                    {helperText ? <p>{helperText}</p> : null}
                </div>
                <p className={styles.count}>
                    {urls.length}/{maxItems}
                </p>
            </div>

            <ul className={styles.list}>
                {items.map((item, index) => (
                    <li key={item.id} className={styles.row}>
                        <div className={styles.preview}>
                            {item.url ? (
                                <Image
                                    src={
                                        item.url.startsWith("http")
                                            ? item.url
                                            : getSupabaseImageUrl(item.url, "thumb")
                                    }
                                    alt={`${label} ${index + 1}`}
                                    width={160}
                                    height={120}
                                />
                            ) : (
                                <span>Slot {index + 1}</span>
                            )}
                        </div>

                        <div className={styles.controls}>
                            <label className={styles.uploadButton}>
                                {uploadingId === item.id
                                    ? "Se încarcă…"
                                    : item.url
                                      ? "Schimbă"
                                      : "Încarcă"}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    disabled={uploadingId === item.id}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) void uploadImage(item.id, file);
                                        event.currentTarget.value = "";
                                    }}
                                />
                            </label>

                            <div className={styles.reorder}>
                                <button
                                    type="button"
                                    onClick={() => moveRow(item.id, -1)}
                                    disabled={index === 0}
                                    aria-label="Mută sus"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveRow(item.id, 1)}
                                    disabled={index === items.length - 1}
                                    aria-label="Mută jos"
                                >
                                    ↓
                                </button>
                            </div>

                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => removeRow(item.id)}
                            >
                                Șterge
                            </button>

                            <label className={styles.pathField}>
                                <span className="sr-only">{`Path ${index + 1}`}</span>
                                <input
                                    id={`${reactId}-${item.id}`}
                                    value={item.url}
                                    onChange={(e) => updateUrl(item.id, e.target.value)}
                                    placeholder="Se completează automat după upload"
                                />
                            </label>
                        </div>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                onClick={addRow}
                disabled={items.length >= maxItems}
                className={styles.addBtn}
            >
                + Adaugă slot
            </button>
        </div>
    );
}
