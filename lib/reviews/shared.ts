export type ReviewStatus = "invited" | "pending" | "approved" | "rejected";
export type ReviewTargetType = "doll" | "shop_product";
export type ReviewOrderType = "doll_rental" | "doll_purchase" | "shop_order";

export type ReviewRow = {
    id: string;
    target_type: ReviewTargetType;
    target_id: string;
    review_token: string;
    order_type: ReviewOrderType | null;
    order_id: string | null;
    rating: number | null;
    title: string | null;
    body: string | null;
    customer_name: string | null;
    customer_initials: string | null;
    locale: "ro" | "en" | "nl" | "de" | null;
    status: ReviewStatus;
    admin_note: string | null;
    invited_at: string;
    submitted_at: string | null;
    moderated_at: string | null;
    moderated_by: string | null;
    expires_at: string;
    created_at: string;
    updated_at: string;
};

/** Forma livrată în UI public pentru un review aprobat. */
export type Review = {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    customerLabel: string;
    locale: "ro" | "en" | "nl" | "de" | null;
    submittedAt: string;
};

export type ReviewAggregate = {
    count: number;
    averageRating: number;
};

/** Convertește rândul brut la forma publică, omițând câmpurile cu PII reală. */
export function mapReviewRowToPublic(row: ReviewRow): Review | null {
    if (row.status !== "approved" || row.rating === null || !row.body) return null;
    // Folosim inițiale dacă există, altfel prima parte din nume. Nu publicăm
    // niciodată numele complet fără consimțământ explicit.
    const label =
        row.customer_initials?.trim() ||
        row.customer_name?.trim().split(/\s+/)[0] ||
        "Client verificat";
    return {
        id: row.id,
        rating: row.rating,
        title: row.title,
        body: row.body,
        customerLabel: label,
        locale: row.locale,
        submittedAt: row.submitted_at ?? row.created_at,
    };
}

export function computeAggregate(reviews: Review[]): ReviewAggregate | null {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
        count: reviews.length,
        // 1 zecimală — atât cere Google pentru AggregateRating și atât e util
        // pentru a discrimina între produse.
        averageRating: Math.round((sum / reviews.length) * 10) / 10,
    };
}
