"use client";

import { useState, useTransition } from "react";
import type { FaqItemRow } from "@/lib/faq/shared";
import { FAQ_CATEGORIES } from "@/lib/faq/shared";

type Props = {
    action: (formData: FormData) => Promise<void>;
    initial?: Partial<FaqItemRow>;
    submitLabel: string;
};

export default function FaqItemForm({ action, initial, submitLabel }: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const submit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            try {
                await action(formData);
            } catch (err) {
                if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
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
        <form action={submit} className="space-y-6 max-w-3xl">
            {error ? (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk">
                    {error}
                </div>
            ) : null}

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                    <label className={label} htmlFor="f-slug">Slug</label>
                    <input
                        id="f-slug"
                        name="slug"
                        defaultValue={initial?.slug ?? ""}
                        className={input}
                        placeholder="auto din întrebare"
                    />
                </div>
                <div>
                    <label className={label} htmlFor="f-category">Categorie</label>
                    <select
                        id="f-category"
                        name="category"
                        defaultValue={initial?.category ?? "general"}
                        className={input}
                    >
                        {FAQ_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={label} htmlFor="f-order">Ordine</label>
                    <input
                        id="f-order"
                        name="display_order"
                        type="number"
                        defaultValue={initial?.display_order ?? 0}
                        className={input}
                    />
                </div>
            </div>

            <section className="space-y-3">
                <div>
                    <label className={label} htmlFor="f-q">Întrebare (RO)</label>
                    <input
                        id="f-q"
                        name="question"
                        required
                        maxLength={240}
                        defaultValue={initial?.question ?? ""}
                        className={input}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="f-a">Răspuns (RO)</label>
                    <textarea
                        id="f-a"
                        name="answer"
                        required
                        rows={6}
                        defaultValue={initial?.answer ?? ""}
                        className={`${input} resize-y`}
                    />
                </div>
            </section>

            <details className="rounded-2xl border border-velvet-800 p-5 bg-velvet-900/40">
                <summary className="cursor-pointer font-display italic text-lg text-silk">
                    Versiunea EN — opțional
                </summary>
                <div className="mt-4 space-y-3">
                    <div>
                        <label className={label} htmlFor="f-q-en">Question (EN)</label>
                        <input
                            id="f-q-en"
                            name="question_en"
                            maxLength={240}
                            defaultValue={initial?.question_en ?? ""}
                            className={input}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="f-a-en">Answer (EN)</label>
                        <textarea
                            id="f-a-en"
                            name="answer_en"
                            rows={6}
                            defaultValue={initial?.answer_en ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                </div>
            </details>

            <details className="rounded-2xl border border-velvet-800 p-5 bg-velvet-900/40">
                <summary className="cursor-pointer font-display italic text-lg text-silk">
                    Versiunea NL — opțional
                </summary>
                <div className="mt-4 space-y-3">
                    <div>
                        <label className={label} htmlFor="f-q-nl">Vraag (NL)</label>
                        <input
                            id="f-q-nl"
                            name="question_nl"
                            maxLength={240}
                            defaultValue={initial?.question_nl ?? ""}
                            className={input}
                        />
                    </div>
                    <div>
                        <label className={label} htmlFor="f-a-nl">Antwoord (NL)</label>
                        <textarea
                            id="f-a-nl"
                            name="answer_nl"
                            rows={6}
                            defaultValue={initial?.answer_nl ?? ""}
                            className={`${input} resize-y`}
                        />
                    </div>
                </div>
            </details>

            <div className="flex items-center gap-6 text-sm text-silk/85">
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="show_on_home"
                        defaultChecked={initial?.show_on_home ?? true}
                        className="accent-gold"
                    />
                    Afișează și pe home
                </label>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={initial?.is_active ?? true}
                        className="accent-gold"
                    />
                    Activ
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
