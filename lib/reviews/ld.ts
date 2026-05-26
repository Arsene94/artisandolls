import type { Review, ReviewAggregate } from "@/lib/reviews/shared";

/** Generează blocul JSON-LD pentru `aggregateRating` + `review[]` care se
 *  adaugă într-un Product / LocalBusiness / Service existent. Returnează
 *  obiectul rezultat, sau `null` dacă nu există recenzii. */
export function buildReviewsLd(
    reviews: Review[],
    aggregate: ReviewAggregate | null,
): {
    aggregateRating?: Record<string, unknown>;
    review?: Record<string, unknown>[];
} | null {
    if (!aggregate || reviews.length === 0) return null;
    return {
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregate.averageRating,
            reviewCount: aggregate.count,
            bestRating: 5,
            worstRating: 1,
        },
        review: reviews.slice(0, 8).map((r) => ({
            "@type": "Review",
            reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
            },
            author: { "@type": "Person", name: r.customerLabel },
            datePublished: r.submittedAt,
            name: r.title ?? undefined,
            reviewBody: r.body,
            inLanguage: r.locale ?? undefined,
        })),
    };
}
