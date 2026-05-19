"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";
import { optimizeImageBeforeUpload } from "@/lib/images/optimize-upload";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import type { CollectionRow } from "@/lib/collections/shared";
import type { DollRow } from "@/lib/dolls";
import styles from "./AdminDolls.module.css";

type DollFormProps = {
    mode: "create" | "edit";
    doll?: DollRow;
    collections: CollectionRow[];
    action: (formData: FormData) => Promise<void>;
};

type ImageItem = {
    id: string;
    url: string;
};

function createImageItem(url = ""): ImageItem {
    return {
        id: crypto.randomUUID(),
        url,
    };
}

function normalizeImageUrls(images: ImageItem[]) {
    return Array.from(
        new Set(
            images
                .map((image) => image.url.trim())
                .filter(Boolean)
        )
    );
}

export default function DollForm({ mode, doll, collections, action }: DollFormProps) {
    const router = useRouter();
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [isPending, startTransition] = useTransition();

    const initialImages = [
        doll?.main_image_path ?? doll?.main_image_url ?? "",
        ...((doll?.image_paths ?? doll?.image_urls ?? []) as string[]),
    ].filter(Boolean);

    const [images, setImages] = useState<ImageItem[]>(
        initialImages.length > 0
            ? initialImages.map((url) => createImageItem(url))
            : [createImageItem()]
    );

    const [tagsInput, setTagsInput] = useState((doll?.tags ?? []).join(", "));
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const defaultCollectionId =
        doll?.collection_id ??
        collections.find((collection) => collection.name === doll?.collection)?.id ??
        "";

    const imageUrls = normalizeImageUrls(images);
    const mainImageUrl = imageUrls[0] ?? "";
    const secondaryImageUrls = imageUrls.slice(1);

    function updateImageUrl(id: string, url: string) {
        setImages((currentImages) =>
            currentImages.map((image) =>
                image.id === id ? { ...image, url } : image
            )
        );
    }

    function addImageField() {
        setImages((currentImages) => [...currentImages, createImageItem()]);
    }

    function removeImageField(id: string) {
        setImages((currentImages) => {
            if (currentImages.length === 1) {
                return [createImageItem()];
            }

            return currentImages.filter((image) => image.id !== id);
        });
    }

    async function uploadImage(id: string, file: File) {
        try {
            setUploadingId(id);

            const optimizedFile = await optimizeImageBeforeUpload(file);
            const filePath = `dolls/${crypto.randomUUID()}.webp`;

            const { error } = await supabase.storage
                .from("doll-images")
                .upload(filePath, optimizedFile, {
                    contentType: "image/webp",
                    cacheControl: "31536000",
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            updateImageUrl(id, filePath);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Imaginea nu a putut fi încărcată.");
        } finally {
            setUploadingId(null);
        }
    }

    function handleSubmit(formData: FormData) {
        formData.set("main_image_path", mainImageUrl);
        formData.set("image_paths", JSON.stringify(secondaryImageUrls));

        const tags = tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        formData.set("tags", JSON.stringify(tags));

        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Nume
                    <input name="name" defaultValue={doll?.name ?? ""} required />
                </label>

                <label className={styles.field}>
                    Slug URL
                    <input
                        name="slug"
                        defaultValue={doll?.slug ?? ""}
                        placeholder="se generează din nume dacă îl lași gol"
                    />
                </label>

                <label className={styles.field}>
                    Colecție / Serie
                    <select name="collection_id" defaultValue={defaultCollectionId} required>
                        <option value="" disabled>
                            Alege colecția
                        </option>

                        {collections.map((collection) => (
                            <option key={collection.id} value={collection.id}>
                                {collection.name} — {collection.type === "series" ? "Serie" : "Categorie"}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    Badge
                    <input name="badge" defaultValue={doll?.badge ?? "Disponibil"} required />
                </label>

                <label className={styles.field}>
                    Disponibilitate
                    <select name="availability" defaultValue={doll?.availability ?? "available"}>
                        <option value="available">Disponibil</option>
                        <option value="custom">Personalizabil</option>
                        <option value="limited">Ediție limitată</option>
                        <option value="sold_out">Sold out</option>
                    </select>
                </label>

                <label className={styles.field}>
                    Ordine afișare
                    <input
                        name="display_order"
                        type="number"
                        defaultValue={doll?.display_order ?? 0}
                    />
                </label>

                <label className={styles.field}>
                    Preț / zi
                    <input
                        name="rent_price_per_day"
                        type="number"
                        min="0"
                        defaultValue={doll?.rent_price_per_day ?? ""}
                    />
                </label>

                <label className={styles.field}>
                    Preț cumpărare
                    <input
                        name="buy_price"
                        type="number"
                        min="0"
                        defaultValue={doll?.buy_price ?? ""}
                    />
                </label>
            </div>

            <label className={styles.field}>
                Descriere
                <textarea name="description" defaultValue={doll?.description ?? ""} required />
            </label>

            <label className={styles.field}>
                Tag-uri, separate prin virgulă
                <input
                    value={tagsInput}
                    onChange={(event) => setTagsInput(event.target.value)}
                    placeholder="Premium, Disponibilă, Colecție"
                />
            </label>

            <div className={styles.checksGrid}>
                <label className={styles.checkField}>
                    <input
                        name="available_for_rent"
                        type="checkbox"
                        defaultChecked={doll?.available_for_rent ?? true}
                    />
                    Disponibilă pentru închiriere
                </label>

                <label className={styles.checkField}>
                    <input
                        name="available_for_buy"
                        type="checkbox"
                        defaultChecked={doll?.available_for_buy ?? true}
                    />
                    Disponibilă pentru cumpărare
                </label>

                <label className={styles.checkField}>
                    <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={doll?.is_active ?? true}
                    />
                    Activă în catalog
                </label>
            </div>

            <section className={styles.imagesPanel}>
                <div className={styles.panelHeader}>
                    <span>Imagini</span>
                    <h2>Upload sau link pentru fiecare imagine</h2>
                    <p>Prima imagine din listă devine imaginea principală. Restul intră în galerie.</p>
                </div>

                <div className={styles.imagesList}>
                    {images.map((image, index) => (
                        <div key={image.id} className={styles.imageRow}>
                            <div className={styles.imagePreview}>
                                {image.url ? (
                                    <Image
                                        src={getSupabaseImageUrl(image.url, "thumb")}
                                        alt={`Imagine ${index + 1}`}
                                        width={320}
                                        height={240}
                                    />
                                ) : (
                                    <span>Imagine {index + 1}</span>
                                )}
                            </div>

                            <div className={styles.imageControls}>
                                <label className={styles.field}>
                                    {index === 0 ? "Imagine principală" : `Imagine galerie ${index}`}
                                    <input
                                        value={image.url}
                                        readOnly
                                        onChange={(event) => updateImageUrl(image.id, event.target.value)}
                                        placeholder="Se completează automat după upload"
                                    />
                                </label>

                                <div className={styles.imageButtons}>
                                    <label className={styles.uploadButton}>
                                        {uploadingId === image.id ? "Se încarcă..." : "Upload"}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (file) {
                                                    void uploadImage(image.id, file);
                                                }
                                            }}
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => removeImageField(image.id)}
                                    >
                                        Șterge
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button type="button" className={styles.secondaryButton} onClick={addImageField}>
                    Adaugă imagine
                </button>
            </section>

            <div className={styles.formActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => router.back()}>
                    Anulează
                </button>

                <button type="submit" className={styles.primaryButton} disabled={isPending || !mainImageUrl}>
                    {isPending
                        ? "Se salvează..."
                        : mode === "create"
                            ? "Adaugă păpușa"
                            : "Salvează modificările"}
                </button>
            </div>
        </form>
    );
}
