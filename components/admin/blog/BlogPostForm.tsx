"use client";

import { useState, useTransition } from "react";
import AdminImageUploadField from "@/components/admin/shared/AdminImageUploadField";
import type { BlogPostRow } from "@/lib/blog/shared";
import { BLOG_CATEGORIES } from "@/lib/blog/shared";

type Props = {
    action: (formData: FormData) => Promise<void>;
    initial?: Partial<BlogPostRow>;
    submitLabel: string;
};

export default function BlogPostForm({ action, initial, submitLabel }: Props) {
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

    const publishDefault = initial?.publish_at
        ? new Date(initial.publish_at).toISOString().slice(0, 16)
        : "";

    return (
        <form action={submit} className="space-y-8 max-w-4xl">
            {error ? (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk">
                    {error}
                </div>
            ) : null}

            <section className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className={label} htmlFor="p-slug">Slug</label>
                        <input
                            id="p-slug"
                            name="slug"
                            defaultValue={initial?.slug ?? ""}
                            className={input}
                            placeholder="auto din titlu"
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-category">Categorie</label>
                        <select
                            id="p-category"
                            name="category"
                            defaultValue={initial?.category ?? "guide"}
                            className={input}
                        >
                            {BLOG_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={label} htmlFor="p-author">Autor</label>
                        <input
                            id="p-author"
                            name="author_name"
                            defaultValue={initial?.author_name ?? "Velvet Companions"}
                            className={input}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-role">Rol autor</label>
                        <input
                            id="p-role"
                            name="author_role"
                            defaultValue={initial?.author_role ?? ""}
                            className={input}
                            placeholder="ex. Studio Velvet Companions"
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-reading">Minute citire</label>
                        <input
                            id="p-reading"
                            name="reading_minutes"
                            type="number"
                            min={1}
                            defaultValue={initial?.reading_minutes ?? 5}
                            className={input}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-order">Ordine afișare</label>
                        <input
                            id="p-order"
                            name="display_order"
                            type="number"
                            defaultValue={initial?.display_order ?? 0}
                            className={input}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="p-publish">Publish at (datetime local)</label>
                        <input
                            id="p-publish"
                            name="publish_at"
                            type="datetime-local"
                            defaultValue={publishDefault}
                            className={input}
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="font-display italic text-xl text-silk">Conținut (RO)</h2>
                <div>
                    <label className={label} htmlFor="p-title">Titlu</label>
                    <input id="p-title" name="title" required defaultValue={initial?.title ?? ""} className={input} />
                </div>
                <div>
                    <label className={label} htmlFor="p-excerpt">Excerpt (≤ 200 caractere)</label>
                    <textarea
                        id="p-excerpt"
                        name="excerpt"
                        required
                        rows={3}
                        maxLength={240}
                        defaultValue={initial?.excerpt ?? ""}
                        className={`${input} resize-y`}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="p-body">
                        Body (markdown minimal — paragrafe, ## h2, ### h3, listele cu „- ", **bold**, [text](url))
                    </label>
                    <textarea
                        id="p-body"
                        name="body"
                        required
                        rows={18}
                        defaultValue={initial?.body ?? ""}
                        className={`${input} resize-y font-mono text-[0.8rem] leading-relaxed`}
                    />
                </div>
            </section>

            <details className="rounded-2xl border border-velvet-800 p-5 bg-velvet-900/40">
                <summary className="cursor-pointer font-display italic text-lg text-silk">
                    Conținut (EN) — opțional
                </summary>
                <div className="mt-5 space-y-4">
                    <div>
                        <label className={label} htmlFor="p-title-en">Titlu (EN)</label>
                        <input id="p-title-en" name="title_en" defaultValue={initial?.title_en ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-excerpt-en">Excerpt (EN)</label>
                        <textarea
                            id="p-excerpt-en"
                            name="excerpt_en"
                            rows={3}
                            maxLength={240}
                            defaultValue={initial?.excerpt_en ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-body-en">Body (EN)</label>
                        <textarea
                            id="p-body-en"
                            name="body_en"
                            rows={14}
                            defaultValue={initial?.body_en ?? ""}
                            className={`${input} resize-y font-mono text-[0.8rem] leading-relaxed`}
                        />
                    </div>
                </div>
            </details>

            <details className="rounded-2xl border border-velvet-800 p-5 bg-velvet-900/40">
                <summary className="cursor-pointer font-display italic text-lg text-silk">
                    Conținut (NL) — opțional
                </summary>
                <div className="mt-5 space-y-4">
                    <div>
                        <label className={label} htmlFor="p-title-nl">Titlu (NL)</label>
                        <input id="p-title-nl" name="title_nl" defaultValue={initial?.title_nl ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-excerpt-nl">Excerpt (NL)</label>
                        <textarea
                            id="p-excerpt-nl"
                            name="excerpt_nl"
                            rows={3}
                            maxLength={240}
                            defaultValue={initial?.excerpt_nl ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-body-nl">Body (NL)</label>
                        <textarea
                            id="p-body-nl"
                            name="body_nl"
                            rows={14}
                            defaultValue={initial?.body_nl ?? ""}
                            className={`${input} resize-y font-mono text-[0.8rem] leading-relaxed`}
                        />
                    </div>
                </div>
            </details>

            <details className="rounded-2xl border border-velvet-800 p-5 bg-velvet-900/40">
                <summary className="cursor-pointer font-display italic text-lg text-silk">
                    SEO overrides — opțional
                </summary>
                <div className="mt-5 grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className={label} htmlFor="p-seo-title">SEO title (RO)</label>
                        <input id="p-seo-title" name="seo_title" defaultValue={initial?.seo_title ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-seo-title-en">SEO title (EN)</label>
                        <input id="p-seo-title-en" name="seo_title_en" defaultValue={initial?.seo_title_en ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-seo-title-nl">SEO title (NL)</label>
                        <input id="p-seo-title-nl" name="seo_title_nl" defaultValue={initial?.seo_title_nl ?? ""} className={input} />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-seo-desc">SEO description (RO)</label>
                        <textarea
                            id="p-seo-desc"
                            name="seo_description"
                            rows={2}
                            defaultValue={initial?.seo_description ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-seo-desc-en">SEO description (EN)</label>
                        <textarea
                            id="p-seo-desc-en"
                            name="seo_description_en"
                            rows={2}
                            defaultValue={initial?.seo_description_en ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="p-seo-desc-nl">SEO description (NL)</label>
                        <textarea
                            id="p-seo-desc-nl"
                            name="seo_description_nl"
                            rows={2}
                            defaultValue={initial?.seo_description_nl ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                </div>
            </details>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className={label} htmlFor="p-tags">Tag-uri (CSV)</label>
                    <input
                        id="p-tags"
                        name="tags"
                        defaultValue={(initial?.tags ?? []).join(", ")}
                        className={input}
                        placeholder="tpe, igienă, ghid"
                    />
                </div>
                <div>
                    <label className={label} htmlFor="p-related">Slug-uri articole înrudite (CSV)</label>
                    <input
                        id="p-related"
                        name="related_slugs"
                        defaultValue={(initial?.related_slugs ?? []).join(", ")}
                        className={input}
                        placeholder="protocol-igiena-clinic, tpe-vs-silicon"
                    />
                </div>
            </div>

            <AdminImageUploadField
                name="cover_image_path"
                label="Imagine cover (16:9 recomandat)"
                helperText="Apare pe cardul de articol + hero pe pagina de detaliu."
                folder="blog"
                initialValue={initial?.cover_image_path ?? ""}
                allowExternalUrl
            />

            <div className="flex items-center gap-6 text-sm text-silk/85">
                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" name="is_active" defaultChecked={initial?.is_active ?? true} className="accent-gold" />
                    Activ
                </label>
                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false} className="accent-gold" />
                    Featured
                </label>
            </div>

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
