"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { confirmAge } from "@/app/age-gate/actions";

type Props = {
    next: string;
};

export default function AgeGateForm({ next }: Props) {
    const t = useTranslations("ageGate");
    const searchParams = useSearchParams();
    const errorText = searchParams.get("error") === "rate" ? t("errorRate") : null;

    return (
        <main
            data-surface="dark"
            className="min-h-screen flex items-center justify-center bg-velvet-950 text-silk px-4 py-16"
        >
            <div className="w-full max-w-lg bg-velvet-900 border border-gold/25 rounded-3xl p-7 sm:p-9 shadow-2xl">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light mb-3">
                    {t("eyebrow")}
                </p>
                <h1 className="font-display italic text-3xl sm:text-4xl text-silk leading-tight mb-3">
                    {t("title")}
                </h1>
                <p className="text-silk/80 text-[0.95rem] leading-relaxed mb-7">
                    {t("description")}
                </p>

                {errorText ? (
                    <p
                        role="alert"
                        className="text-danger text-[0.85rem] leading-snug bg-velvet-950/60 border border-danger/30 rounded-lg px-3 py-2 mb-5"
                    >
                        {errorText}
                    </p>
                ) : null}

                <div className="space-y-3">
                    <form action={confirmAge}>
                        <input type="hidden" name="next" value={next} />
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3.5 rounded-xl text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                        >
                            {t("confirm")}
                        </button>
                    </form>

                    <a
                        href="https://www.google.com"
                        rel="noopener noreferrer nofollow"
                        className="w-full inline-flex items-center justify-center border border-silk/30 text-silk/75 hover:text-silk hover:border-silk/55 font-semibold py-3.5 rounded-xl text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                    >
                        {t("leave")}
                    </a>
                </div>

                <p className="text-[0.72rem] text-silk/55 leading-snug text-center mt-6">
                    {t.rich("termsHint", {
                        terms: (chunks) => (
                            <Link
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-light underline underline-offset-4 hover:text-gold"
                            >
                                {chunks}
                            </Link>
                        ),
                        privacy: (chunks) => (
                            <Link
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-light underline underline-offset-4 hover:text-gold"
                            >
                                {chunks}
                            </Link>
                        ),
                    })}
                </p>
            </div>
        </main>
    );
}
