"use client";

import { useState, useTransition } from "react";
import AdminImageUploadField from "@/components/admin/shared/AdminImageUploadField";
import AdminImageGalleryField from "@/components/admin/shared/AdminImageGalleryField";
import type { ShopCategoryRow, ShopProductRow } from "@/lib/shop/shared";

type Props = {
    action: (formData: FormData) => Promise<void>;
    categories: ShopCategoryRow[];
    initial?: Partial<ShopProductRow>;
    submitLabel: string;
};

export default function ShopProductForm({
    action,
    categories,
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
        <form action={submit} className="space-y-8 max-w-3xl">
            {error ? (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk">
                    {error}
                </div>
            ) : null}

            <section className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className={label} htmlFor="p-name">Nume</label>
                        <input id="p-name" name="name" required defaultValue={initial?.name ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-slug">Slug (opțional)</label>
                        <input id="p-slug" name="slug" defaultValue={initial?.slug ?? ""} className={input} placeholder="auto-generat" />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-sku">SKU</label>
                        <input id="p-sku" name="sku" defaultValue={initial?.sku ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-brand">Brand</label>
                        <input id="p-brand" name="brand" defaultValue={initial?.brand ?? ""} className={input} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="p-cat">Categorie</label>
                        <select id="p-cat" name="category_id" defaultValue={initial?.category_id ?? ""} className={input}>
                            <option value="">— Fără categorie —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="p-short">Descriere scurtă</label>
                        <textarea id="p-short" name="short_description" rows={2} defaultValue={initial?.short_description ?? ""} className={`${input} resize-y`} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="p-desc">Descriere completă</label>
                        <textarea id="p-desc" name="description" rows={5} defaultValue={initial?.description ?? ""} className={`${input} resize-y`} />
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <AdminImageUploadField
                    name="main_image_path"
                    label="Imagine principală"
                    helperText="Apare pe card și ca primă imagine pe pagina produsului."
                    folder="shop"
                    initialValue={initial?.main_image_path ?? ""}
                    allowExternalUrl
                />

                <AdminImageGalleryField
                    name="image_paths_json"
                    label="Galerie imagini"
                    helperText="Maxim 8 imagini suplimentare; ordinea contează."
                    folder="shop"
                    initial={initial?.image_paths ?? []}
                />
            </section>

            <section className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className={label} htmlFor="p-price">Preț (minor units)</label>
                        <input id="p-price" name="price" type="number" min={0} required defaultValue={initial?.price ?? 0} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-compare">Preț comparat</label>
                        <input id="p-compare" name="compare_at_price" type="number" min={0} defaultValue={initial?.compare_at_price ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-currency">Valută</label>
                        <input id="p-currency" name="currency" defaultValue={initial?.currency ?? "RON"} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-stock">Stoc</label>
                        <input id="p-stock" name="stock_quantity" type="number" min={0} defaultValue={initial?.stock_quantity ?? 0} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-lowstock">Prag stoc redus</label>
                        <input id="p-lowstock" name="low_stock_threshold" type="number" min={0} defaultValue={initial?.low_stock_threshold ?? 5} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-weight">Greutate (g)</label>
                        <input id="p-weight" name="weight_grams" type="number" min={0} defaultValue={initial?.weight_grams ?? ""} className={input} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className={label} htmlFor="p-tags">Tags (CSV)</label>
                        <input id="p-tags" name="tags" defaultValue={(initial?.tags ?? []).join(", ")} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-modes">Doll modes (CSV: rent,buy)</label>
                        <input id="p-modes" name="doll_modes" defaultValue={(initial?.doll_modes ?? ["rent", "buy"]).join(", ")} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-order">Ordine afișare</label>
                        <input id="p-order" name="display_order" type="number" defaultValue={initial?.display_order ?? 0} className={input} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3 text-sm text-silk/85 pt-2">
                    <label className="flex items-center gap-2"><input type="checkbox" name="track_stock" defaultChecked={initial?.track_stock ?? true} className="accent-gold" /> Track stock</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="age_restricted" defaultChecked={initial?.age_restricted ?? true} className="accent-gold" /> 18+</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false} className="accent-gold" /> Featured</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={initial?.is_active ?? true} className="accent-gold" /> Activ</label>
                </div>
            </section>

            <details className="rounded-2xl border border-velvet-800 p-5 bg-velvet-900/40">
                <summary className="cursor-pointer font-display italic text-lg text-silk">
                    Variante de produs — opțional
                </summary>
                <p className="mt-3 text-xs text-silk/65 leading-relaxed max-w-prose">
                    Pentru produse cu mărimi sau culori multiple: setează același{" "}
                    <code className="text-gold-light">variant_group_id</code> (UUID) pe
                    toate variantele. Axele se exprimă ca JSON, ex.{" "}
                    <code className="text-gold-light">{`{"size":"L","color":"Red"}`}</code>.
                    Sau, mai simplu, ca <code className="text-gold-light">size: L; color: Red</code>.
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    <div>
                        <label className={label} htmlFor="p-variant-group">Variant group ID (UUID)</label>
                        <input
                            id="p-variant-group"
                            name="variant_group_id"
                            defaultValue={initial?.variant_group_id ?? ""}
                            className={input}
                            placeholder="ex. 11111111-2222-…"
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-variant-label">Variant label</label>
                        <input
                            id="p-variant-label"
                            name="variant_label"
                            defaultValue={initial?.variant_label ?? ""}
                            className={input}
                            placeholder="Mărimea L"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className={label} htmlFor="p-variant-axes">Axe variantă (JSON sau pairs)</label>
                        <textarea
                            id="p-variant-axes"
                            name="variant_axes"
                            rows={2}
                            defaultValue={
                                initial?.variant_axes
                                    ? JSON.stringify(initial.variant_axes)
                                    : ""
                            }
                            className={`${input} resize-y font-mono text-[0.8rem]`}
                            placeholder='{"size":"L","color":"Red"}'
                        />
                    </div>
                </div>
            </details>

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
