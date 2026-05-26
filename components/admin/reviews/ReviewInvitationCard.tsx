"use client";

import { useState, useTransition } from "react";
import { generateReviewTokenAction } from "@/app/admin/(protected)/orders/[id]/review-actions";
import {
    composeReviewMessage,
    whatsappDeepLink,
} from "@/lib/reviews/wa-helpers";
import type {
    ReviewOrderType,
    ReviewTargetType,
} from "@/lib/reviews/shared";

type Props = {
    /** Numele afișat ca etichetă: numele păpușii sau al produsului. */
    productLabel: string;
    targetType: ReviewTargetType;
    targetId: string;
    orderType: ReviewOrderType;
    orderId: string;
    customerName: string | null;
    customerPhone: string | null;
    /** URL absolut al site-ului (cu schemă https) — folosit pentru a construi link-ul de review. */
    siteUrl: string;
    /** Locale-ul clientului pentru mesajul pre-completat WhatsApp. */
    customerLocale: "ro" | "en" | "nl";
    /** Token existent (dacă invitația a fost deja creată) — afișăm direct fără să mai apăsăm. */
    existingToken?: string | null;
    /** Path-ul de revalidat după generare (admin order detail). */
    revalidatePath?: string;
};

export default function ReviewInvitationCard({
    productLabel,
    targetType,
    targetId,
    orderType,
    orderId,
    customerName,
    customerPhone,
    siteUrl,
    customerLocale,
    existingToken = null,
    revalidatePath,
}: Props) {
    const [token, setToken] = useState<string | null>(existingToken);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const reviewUrl = token ? `${siteUrl}/review/${token}` : null;
    const waMessage = reviewUrl
        ? composeReviewMessage(customerLocale, productLabel, reviewUrl)
        : "";
    const waLink = reviewUrl ? whatsappDeepLink(customerPhone, waMessage) : null;

    const onGenerate = () => {
        setError(null);
        startTransition(async () => {
            try {
                const res = await generateReviewTokenAction({
                    targetType,
                    targetId,
                    orderType,
                    orderId,
                    customerName,
                    revalidatePathArg: revalidatePath,
                });
                setToken(res.token);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Eroare la generare.",
                );
            }
        });
    };

    const onCopy = async () => {
        if (!reviewUrl) return;
        try {
            await navigator.clipboard.writeText(reviewUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setError("Browserul nu permite copy. Selectează manual link-ul.");
        }
    };

    return (
        <section
            aria-labelledby={`review-invite-${targetId}`}
            className="mt-4 p-5 border border-velvet-800 rounded-2xl bg-velvet-900/40"
        >
            <h3
                id={`review-invite-${targetId}`}
                className="font-display italic text-lg text-silk"
            >
                Recenzie — {productLabel}
            </h3>
            <p className="mt-2 text-sm text-silk/65 leading-relaxed">
                Generează un link privat pe care îl trimiți clientului prin WhatsApp.
                Tokenul rămâne valabil 60 de zile sau până la prima trimitere.
            </p>

            {error ? (
                <p
                    role="alert"
                    className="mt-3 rounded-lg border border-danger/40 bg-danger/10 p-2 text-sm text-silk"
                >
                    {error}
                </p>
            ) : null}

            {!token ? (
                <button
                    type="button"
                    onClick={onGenerate}
                    disabled={pending}
                    className="mt-4 inline-flex items-center bg-gold hover:bg-gold-light disabled:bg-velvet-700 text-velvet-950 disabled:text-silk/55 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    {pending ? "Se generează…" : "Generează review token"}
                </button>
            ) : (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <code className="flex-1 min-w-0 break-all rounded-lg border border-velvet-700 bg-velvet-950 px-3 py-2 text-[0.78rem] text-silk/85">
                            {reviewUrl}
                        </code>
                        <button
                            type="button"
                            onClick={onCopy}
                            className="inline-flex items-center bg-velvet-700 hover:bg-velvet-600 text-silk px-4 py-2 rounded-full text-[0.7rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                        >
                            {copied ? "Copiat" : "Copiază"}
                        </button>
                    </div>
                    {waLink ? (
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-success/90 hover:bg-success text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                        >
                            Deschide WhatsApp
                            <span aria-hidden="true">→</span>
                        </a>
                    ) : null}
                </div>
            )}
        </section>
    );
}
