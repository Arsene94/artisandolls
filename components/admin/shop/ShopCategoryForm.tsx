"use client";

import { useState, useTransition } from "react";
import AdminImageUploadField from "@/components/admin/shared/AdminImageUploadField";
import type { ShopCategoryRow } from "@/lib/shop/shared";

type Props = {
    action: (formData: FormData) => Promise<void>;
    initial?: Partial<ShopCategoryRow>;
    submitLabel: string;
};

export default function ShopCategoryForm({
    action,
    initial,
    submitLabel,
}: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const submit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            try {
                await action(formData);
            } catch (err) {
                if (
                    err instanceof Error &&
                    !err.message.includes("NEXT_REDIRECT")
                ) {
                    setError(err.message);
                }
            }
        });
    };

    const input =
        "w-full bg-velvet-950 border border-velvet-700 rounded-lg px-3 py-2 text-silk focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold text-sm";
    const label =
        "block text-[0.7rem] uppercase tracking-[0.16em] text-silk/70 mb-1.5";

    return (
        <form action={submit} className="space-y-6 max-w-2xl">
            {error ? (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk">
                    {error}
                </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className={label} htmlFor="c-name">Nume (RO)</label>
                    <input id="c-name" name="name" required defaultValue={initial?.name ?? ""} className={input} />
                </div>
                <div>
                    <label className={label} htmlFor="c-name-en">Nume (EN)</label>
                    <input id="c-name-en" name="name_en" defaultValue={initial?.name_en ?? ""} className={input} />
                </div>
                <div>
                    <label className={label} htmlFor="c-name-nl">Nume (NL)</label>
                    <input id="c-name-nl" name="name_nl" defaultValue={initial?.name_nl ?? ""} className={input} />
                </div>
                <div>
                    <label className={label} htmlFor="c-slug">Slug</label>
                    <input id="c-slug" name="slug" defaultValue={initial?.slug ?? ""} className={input} placeholder="auto-generat" />
                </div>
                <div>
                    <label className={label} htmlFor="c-badge">Badge</label>
                    <input id="c-badge" name="badge" defaultValue={initial?.badge ?? ""} className={input} />
                </div>
                <div className="sm:col-span-2">
                    <label className={label} htmlFor="c-desc">Descriere (RO)</label>
                    <textarea id="c-desc" name="description" rows={3} defaultValue={initial?.description ?? ""} className={`${input} resize-y`} />
                </div>
                <div>
                    <label className={label} htmlFor="c-desc-en">Descriere (EN)</label>
                    <textarea id="c-desc-en" name="description_en" rows={3} defaultValue={initial?.description_en ?? ""} className={`${input} resize-y`} />
                </div>
                <div>
                    <label className={label} htmlFor="c-desc-nl">Descriere (NL)</label>
                    <textarea id="c-desc-nl" name="description_nl" rows={3} defaultValue={initial?.description_nl ?? ""} className={`${input} resize-y`} />
                </div>
                <div>
                    <label className={label} htmlFor="c-order">Ordine</label>
                    <input id="c-order" name="display_order" type="number" defaultValue={initial?.display_order ?? 0} className={input} />
                </div>
            </div>

            <AdminImageUploadField
                name="image_path"
                label="Imagine reprezentativă"
                helperText="Apare pe gridul de categorii din /shop."
                folder="shop/categories"
                initialValue={initial?.image_path ?? ""}
                allowExternalUrl
            />

            <label className="flex items-center gap-2 text-sm text-silk/85">
                <input type="checkbox" name="is_active" defaultChecked={initial?.is_active ?? true} className="accent-gold" /> Activă
            </label>

            <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center bg-gold hover:bg-gold-light disabled:bg-velvet-700 text-velvet-950 disabled:text-silk/55 font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
            >
                {pending ? "Se salvează…" : submitLabel}
            </button>
        </form>
    );
}
