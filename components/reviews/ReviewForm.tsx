"use client";

import { useActionState, useState } from "react";
import {
    submitReviewAction,
    type SubmitReviewState,
} from "@/app/[locale]/review/[token]/actions";

type Props = {
    token: string;
    targetLabel: string;
    initialName?: string | null;
    copy: {
        introHeading: string;
        introHelp: string;
        ratingLegend: string;
        ratingLabels: [string, string, string, string, string];
        titleLabel: string;
        bodyLabel: string;
        bodyHelp: string;
        nameLabel: string;
        nameHelp: string;
        publicName: string;
        submit: string;
        sending: string;
        thanksHeading: string;
        thanksBody: string;
    };
};

export default function ReviewForm({ token, targetLabel, initialName, copy }: Props) {
    const action = submitReviewAction.bind(null, token);
    const [state, dispatch, pending] = useActionState<SubmitReviewState, FormData>(
        action,
        { status: "idle", message: null },
    );
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    if (state.status === "ok") {
        return (
            <div className="rounded-3xl border border-gold/30 bg-velvet-900/40 p-8 text-center">
                <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                    ✓
                </p>
                <h2 className="mt-3 font-display italic text-3xl text-silk">
                    {copy.thanksHeading}
                </h2>
                <p className="mt-4 text-base text-silk/80 leading-relaxed">
                    {copy.thanksBody}
                </p>
            </div>
        );
    }

    const displayedRating = hoverRating ?? rating;
    const ratingLabel = displayedRating > 0
        ? copy.ratingLabels[displayedRating - 1]
        : "";

    const input =
        "w-full bg-velvet-950 border border-velvet-700 rounded-lg px-3 py-2.5 text-silk focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold text-sm";
    const label =
        "block text-[0.72rem] uppercase tracking-[0.18em] text-silk/70 mb-2";

    return (
        <form action={dispatch} className="space-y-8">
            <input type="hidden" name="rating" value={rating} />

            <header>
                <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold-light/85">
                    {targetLabel}
                </p>
                <h1 className="mt-3 font-display italic text-3xl sm:text-4xl text-silk leading-tight">
                    {copy.introHeading}
                </h1>
                <p className="mt-4 text-base text-silk/80 leading-relaxed">
                    {copy.introHelp}
                </p>
            </header>

            {state.message ? (
                <div
                    role="alert"
                    className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk"
                >
                    {state.message}
                </div>
            ) : null}

            <fieldset>
                <legend className={label}>{copy.ratingLegend}</legend>
                <div
                    className="flex gap-2 items-center"
                    onMouseLeave={() => setHoverRating(null)}
                >
                    {[1, 2, 3, 4, 5].map((value) => {
                        const active = value <= displayedRating;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHoverRating(value)}
                                onFocus={() => setHoverRating(value)}
                                onBlur={() => setHoverRating(null)}
                                aria-label={copy.ratingLabels[value - 1]}
                                aria-pressed={rating === value}
                                className={`text-3xl w-11 h-11 rounded-md transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                                    active ? "text-gold" : "text-silk/30 hover:text-gold/70"
                                }`}
                            >
                                ★
                            </button>
                        );
                    })}
                    <span aria-live="polite" className="ml-3 text-sm text-silk/75 min-h-[1.25rem]">
                        {ratingLabel}
                    </span>
                </div>
            </fieldset>

            <div>
                <label className={label} htmlFor="r-title">
                    {copy.titleLabel}
                </label>
                <input
                    id="r-title"
                    name="title"
                    maxLength={120}
                    className={input}
                    placeholder="Ex. „Discreție impecabilă"
                />
            </div>

            <div>
                <label className={label} htmlFor="r-body">
                    {copy.bodyLabel}
                </label>
                <textarea
                    id="r-body"
                    name="body"
                    required
                    minLength={30}
                    maxLength={4000}
                    rows={7}
                    className={`${input} resize-y`}
                    placeholder="—"
                />
                <p className="mt-2 text-xs text-silk/55">{copy.bodyHelp}</p>
            </div>

            <div>
                <label className={label} htmlFor="r-name">
                    {copy.nameLabel}
                </label>
                <input
                    id="r-name"
                    name="customer_name"
                    defaultValue={initialName ?? ""}
                    maxLength={80}
                    className={input}
                />
                <p className="mt-2 text-xs text-silk/55">{copy.nameHelp}</p>
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-silk/85">
                    <input type="checkbox" name="public_name" className="accent-gold" />
                    {copy.publicName}
                </label>
            </div>

            <button
                type="submit"
                disabled={pending || rating === 0}
                className="inline-flex items-center bg-gold hover:bg-gold-light disabled:bg-velvet-700 text-velvet-950 disabled:text-silk/55 font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
            >
                {pending ? copy.sending : copy.submit}
            </button>
        </form>
    );
}
