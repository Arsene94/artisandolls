"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { optimizeImageBeforeUpload } from "@/lib/images/optimize-upload";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import styles from "./AdminImageUploadField.module.css";

type AdminImageUploadFieldProps = {
    name: string;
    label: string;
    initialValue?: string | null;
    folder: string;
    helperText?: string;
    required?: boolean;
    allowExternalUrl?: boolean;
};

export default function AdminImageUploadField({
                                                  name,
                                                  label,
                                                  initialValue = "",
                                                  folder,
                                                  helperText,
                                                  required = false,
                                                  allowExternalUrl = false,
                                              }: AdminImageUploadFieldProps) {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [value, setValue] = useState(initialValue ?? "");
    const [isUploading, setIsUploading] = useState(false);

    async function uploadImage(file: File) {
        try {
            setIsUploading(true);

            const optimizedFile = await optimizeImageBeforeUpload(file);
            const cleanFolder = folder.replace(/^\/|\/$/g, "");
            const filePath = `${cleanFolder}/${crypto.randomUUID()}.webp`;

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

            setValue(filePath);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Imaginea nu a putut fi încărcată.");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className={styles.field}>
            <input type="hidden" name={name} value={value} required={required} />

            <div className={styles.header}>
                <div>
                    <span>{label}</span>
                    {helperText && <p>{helperText}</p>}
                </div>

                {value && (
                    <button type="button" onClick={() => setValue("")}>
                        Șterge
                    </button>
                )}
            </div>

            <div className={styles.uploadBox}>
                <div className={styles.preview}>
                    {value ? (
                        <Image
                            src={getSupabaseImageUrl(value, "thumb")}
                            alt={label}
                            width={320}
                            height={240}
                        />
                    ) : (
                        <span>Fără imagine</span>
                    )}
                </div>

                <label className={styles.uploadButton}>
                    {isUploading ? "Se încarcă..." : "Încarcă imagine"}
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        disabled={isUploading}
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                                void uploadImage(file);
                            }

                            event.currentTarget.value = "";
                        }}
                    />
                </label>
            </div>

            {allowExternalUrl && (
                <label className={styles.externalField}>
                    URL extern opțional
                    <input
                        value={value.startsWith("http") ? value : ""}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder="https://..."
                    />
                </label>
            )}

            {value && !value.startsWith("http") && (
                <small className={styles.pathPreview}>Path salvat: {value}</small>
            )}
        </div>
    );
}
