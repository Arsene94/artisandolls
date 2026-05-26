import { getTranslations } from "next-intl/server";
import type { Review, ReviewAggregate } from "@/lib/reviews/shared";
import type { Locale } from "@/i18n/routing";

type Props = {
    locale: Locale;
    reviews: Review[];
    aggregate: ReviewAggregate | null;
};

function formatRating(value: number, locale: Locale): string {
    return value.toLocaleString(
        locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    );
}

function formatDate(iso: string, locale: Locale): string {
    return new Date(iso).toLocaleDateString(
        locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" },
    );
}

function Stars({ value }: { value: number }) {
    return (
        <span aria-label={`${value} / 5`} className="text-gold">
            {"★".repeat(value)}
            <span aria-hidden="true" className="text-silk/25">
                {"★".repeat(Math.max(0, 5 - value))}
            </span>
        </span>
    );
}

export default async function ReviewsSection({ locale, reviews, aggregate }: Props) {
    const t = await getTranslations({ locale, namespace: "reviews" });

    if (!aggregate || reviews.length === 0) return null;

    return (
        <section
            aria-labelledby="reviews-heading"
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        >
            <header className="mb-8 flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                    <h2
                        id="reviews-heading"
                        className="font-display italic text-2xl sm:text-3xl text-silk"
                    >
                        {t("sectionHeading")}
                    </h2>
                    <p className="mt-2 text-sm text-silk/65">
                        {t("sectionLede", { count: aggregate.count })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-display italic text-3xl text-gold">
                        {formatRating(aggregate.averageRating, locale)} / 5
                    </p>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/55 mt-1">
                        {t("aggregateLabel", { count: aggregate.count })}
                    </p>
                </div>
            </header>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                {reviews.slice(0, 8).map((r) => (
                    <li
                        key={r.id}
                        className="p-5 border border-velvet-800 rounded-2xl bg-velvet-900/30"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <Stars value={r.rating} />
                            <span className="text-[0.7rem] uppercase tracking-[0.16em] text-silk/55">
                                {formatDate(r.submittedAt, locale)}
                            </span>
                        </div>
                        {r.title ? (
                            <p className="mt-3 font-display italic text-lg text-silk">
                                {r.title}
                            </p>
                        ) : null}
                        <p className="mt-2 text-sm text-silk/85 leading-relaxed whitespace-pre-line">
                            {r.body}
                        </p>
                        <p className="mt-3 text-[0.72rem] tracking-[0.18em] uppercase text-silk/55">
                            {r.customerLabel}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
