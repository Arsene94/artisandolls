// Pure types + evaluation helpers for the automatic offers engine. Free of
// `server-only` so client components (badges, banner) can share the types and
// localized-label helpers, and so the cart/checkout code can run the exact same
// pricing math the server uses.

export type OfferType =
    | "threshold_percent"
    | "threshold_fixed"
    | "threshold_gift"
    | "buy_x_get_y"
    | "collection_percent"
    | "promo";

export type OfferScope = "shop" | "dolls" | "both";
export type OfferDollMode = "rent" | "buy";

export type OfferRow = {
    id: string;
    name: string;
    type: OfferType;
    is_active: boolean;
    priority: number;
    starts_at: string | null;
    expires_at: string | null;

    applies_to: OfferScope;
    doll_modes: OfferDollMode[];

    threshold_amount: number | null;

    reward_percent: number | null;
    reward_amount: number | null;
    reward_max_discount: number | null;
    gift_product_id: string | null;

    buy_quantity: number | null;
    get_quantity: number | null;
    get_percent: number | null;

    applies_to_categories: string[];
    applies_to_collections: string[];

    badge_label: string | null;
    badge_label_en: string | null;
    badge_label_nl: string | null;
    title: string | null;
    title_en: string | null;
    title_nl: string | null;
    subtitle: string | null;
    subtitle_en: string | null;
    subtitle_nl: string | null;
    accent: string | null;
    preset_key: string | null;
    show_on_homepage: boolean;
    show_badge: boolean;

    currency: string;
    created_at: string;
    updated_at: string;
};

export const OFFER_TYPES: OfferType[] = [
    "threshold_percent",
    "threshold_fixed",
    "threshold_gift",
    "buy_x_get_y",
    "collection_percent",
    "promo",
];

/** Types that produce an automatic discount (vs display-only `promo`). */
export function offerIsAutoDiscount(type: OfferType): boolean {
    return type !== "promo";
}

/** Types whose condition is a cart/order subtotal threshold. */
export function offerIsThreshold(type: OfferType): boolean {
    return (
        type === "threshold_percent" ||
        type === "threshold_fixed" ||
        type === "threshold_gift"
    );
}

function pick(
    locale: string,
    ro: string | null,
    en: string | null,
    nl: string | null,
): string | null {
    if (locale === "en") return en || ro || null;
    if (locale === "nl") return nl || ro || null;
    return ro || null;
}

export function offerBadgeLabel(offer: OfferRow, locale: string): string | null {
    return pick(locale, offer.badge_label, offer.badge_label_en, offer.badge_label_nl);
}
export function offerTitle(offer: OfferRow, locale: string): string | null {
    return pick(locale, offer.title, offer.title_en, offer.title_nl);
}
export function offerSubtitle(offer: OfferRow, locale: string): string | null {
    return pick(locale, offer.subtitle, offer.subtitle_en, offer.subtitle_nl);
}

export function offerIsLive(offer: OfferRow, now: Date = new Date()): boolean {
    if (!offer.is_active) return false;
    const t = now.getTime();
    if (offer.starts_at && new Date(offer.starts_at).getTime() > t) return false;
    if (offer.expires_at && new Date(offer.expires_at).getTime() < t) return false;
    return true;
}

function appliesToShop(offer: OfferRow): boolean {
    return offer.applies_to === "shop" || offer.applies_to === "both";
}
function appliesToDolls(offer: OfferRow): boolean {
    return offer.applies_to === "dolls" || offer.applies_to === "both";
}

function clampDiscount(
    raw: number,
    target: number,
    maxDiscount: number | null,
): number {
    let value = Math.max(0, Math.floor(raw));
    if (maxDiscount != null && value > maxDiscount) value = maxDiscount;
    return Math.min(value, Math.max(0, target));
}

// ───────────────────────────────────────────────────────────────────
// Shop cart evaluation
// ───────────────────────────────────────────────────────────────────

export type CartEvalLine = {
    categoryId: string | null;
    unitPrice: number;
    qty: number;
};

export type OfferProgress = {
    offerId: string;
    threshold: number;
    remaining: number;
};

export type CartOfferResult = {
    /** The offer that produced `discountAmount` (highest-priority applicable). */
    discountOffer: OfferRow | null;
    discountAmount: number;
    /** The gift offer whose threshold is met (independent of the discount one). */
    giftOffer: OfferRow | null;
    giftProductId: string | null;
    /** Nearest threshold offer not yet met, for the "spend X more" hint. */
    progress: OfferProgress | null;
};

function eligibleSubtotal(offer: OfferRow, lines: CartEvalLine[]): number {
    const cats = offer.applies_to_categories;
    if (!cats || cats.length === 0) {
        return lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
    }
    return lines
        .filter((l) => l.categoryId != null && cats.includes(l.categoryId))
        .reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
}

function cartOfferDiscount(
    offer: OfferRow,
    lines: CartEvalLine[],
    subtotal: number,
): number {
    switch (offer.type) {
        case "threshold_percent": {
            if (offer.threshold_amount == null || subtotal < offer.threshold_amount) {
                return 0;
            }
            const pct = offer.reward_percent ?? 0;
            return clampDiscount((subtotal * pct) / 100, subtotal, offer.reward_max_discount);
        }
        case "threshold_fixed": {
            if (offer.threshold_amount == null || subtotal < offer.threshold_amount) {
                return 0;
            }
            return clampDiscount(offer.reward_amount ?? 0, subtotal, offer.reward_max_discount);
        }
        case "threshold_gift": {
            // The gift is a line, not a subtotal discount — handled separately.
            return 0;
        }
        case "collection_percent": {
            const base = eligibleSubtotal(offer, lines);
            if (base <= 0) return 0;
            const pct = offer.reward_percent ?? 0;
            return clampDiscount((base * pct) / 100, base, offer.reward_max_discount);
        }
        case "buy_x_get_y": {
            const need = offer.buy_quantity ?? 0;
            const give = offer.get_quantity ?? 0;
            const pct = offer.get_percent ?? 0;
            if (need < 1 || give < 1 || pct <= 0) return 0;
            const cats = offer.applies_to_categories;
            const eligible = lines.filter(
                (l) =>
                    !cats ||
                    cats.length === 0 ||
                    (l.categoryId != null && cats.includes(l.categoryId)),
            );
            const units: number[] = [];
            for (const l of eligible) {
                for (let i = 0; i < l.qty; i++) units.push(l.unitPrice);
            }
            if (units.length < need) return 0;
            units.sort((a, b) => a - b);
            const discounted = units.slice(0, give);
            const raw = discounted.reduce((sum, price) => sum + (price * pct) / 100, 0);
            return clampDiscount(raw, subtotal, offer.reward_max_discount);
        }
        default:
            return 0;
    }
}

export function evaluateCartOffers(
    offers: OfferRow[],
    lines: CartEvalLine[],
    subtotal: number,
    now: Date = new Date(),
): CartOfferResult {
    const live = offers.filter((o) => offerIsLive(o, now) && appliesToShop(o));

    let best: { offer: OfferRow; discount: number } | null = null;
    let bestGift: { offer: OfferRow } | null = null;
    let progress: OfferProgress | null = null;

    for (const offer of live) {
        // Track nearest unmet threshold (any threshold type) for the hint.
        if (
            offerIsThreshold(offer.type) &&
            offer.threshold_amount != null &&
            subtotal < offer.threshold_amount
        ) {
            const remaining = offer.threshold_amount - subtotal;
            if (!progress || remaining < progress.remaining) {
                progress = {
                    offerId: offer.id,
                    threshold: offer.threshold_amount,
                    remaining,
                };
            }
        }

        if (
            offer.type === "threshold_gift" &&
            offer.gift_product_id &&
            offer.threshold_amount != null &&
            subtotal >= offer.threshold_amount
        ) {
            if (!bestGift || offer.priority > bestGift.offer.priority) {
                bestGift = { offer };
            }
            continue;
        }

        const discount = cartOfferDiscount(offer, lines, subtotal);
        if (discount <= 0) continue;
        if (
            !best ||
            offer.priority > best.offer.priority ||
            (offer.priority === best.offer.priority && discount > best.discount)
        ) {
            best = { offer, discount };
        }
    }

    return {
        discountOffer: best?.offer ?? null,
        discountAmount: best?.discount ?? 0,
        giftOffer: bestGift?.offer ?? null,
        giftProductId: bestGift?.offer.gift_product_id ?? null,
        progress,
    };
}

// ───────────────────────────────────────────────────────────────────
// Badge pickers — which offer's badge (if any) to show on a card
// ───────────────────────────────────────────────────────────────────

function hasBadge(offer: OfferRow, locale: string): boolean {
    return offer.show_badge && Boolean(offerBadgeLabel(offer, locale));
}

/** Highest-priority live shop offer whose badge should show on a product card. */
export function shopBadgeOffer(
    offers: OfferRow[],
    categoryId: string | null,
    locale: string,
    now: Date = new Date(),
): OfferRow | null {
    const matches = offers.filter((o) => {
        if (!offerIsLive(o, now) || !appliesToShop(o) || !hasBadge(o, locale)) {
            return false;
        }
        const cats = o.applies_to_categories;
        if (cats && cats.length > 0) {
            return categoryId != null && cats.includes(categoryId);
        }
        return true;
    });
    return matches[0] ?? null; // offers arrive priority-desc
}

/** Highest-priority live doll offer whose badge should show on a doll card. */
export function dollBadgeOffer(
    offers: OfferRow[],
    collectionId: string | null,
    locale: string,
    now: Date = new Date(),
): OfferRow | null {
    const matches = offers.filter((o) => {
        if (!offerIsLive(o, now) || !appliesToDolls(o) || !hasBadge(o, locale)) {
            return false;
        }
        if (o.type === "collection_percent" && o.applies_to_collections.length > 0) {
            return collectionId != null && o.applies_to_collections.includes(collectionId);
        }
        return true;
    });
    return matches[0] ?? null;
}

/** Live offers eligible for the homepage banner, highest priority first. */
export function homepageOffers(
    offers: OfferRow[],
    now: Date = new Date(),
): OfferRow[] {
    return offers.filter(
        (o) => offerIsLive(o, now) && o.show_on_homepage,
    );
}

// ───────────────────────────────────────────────────────────────────
// Doll order evaluation (single item, no cart)
// ───────────────────────────────────────────────────────────────────

export type DollOfferInput = {
    mode: OfferDollMode;
    base: number;
    extras: number;
    collectionId: string | null;
};

export type DollOfferResult = {
    offer: OfferRow | null;
    discountAmount: number;
    /** 'percent' | 'fixed' | null — to fill orders.discount_type. */
    discountType: "percent" | "fixed" | null;
    /** Raw reward value (percent or fixed) for orders.discount_value. */
    discountValue: number;
};

function dollOfferMatches(offer: OfferRow, input: DollOfferInput): boolean {
    if (!appliesToDolls(offer)) return false;
    if (offer.doll_modes.length > 0 && !offer.doll_modes.includes(input.mode)) {
        return false;
    }
    if (
        offer.type === "collection_percent" &&
        offer.applies_to_collections.length > 0
    ) {
        if (!input.collectionId) return false;
        if (!offer.applies_to_collections.includes(input.collectionId)) return false;
    }
    return true;
}

export function evaluateDollOffer(
    offers: OfferRow[],
    input: DollOfferInput,
    now: Date = new Date(),
): DollOfferResult {
    const total = Math.max(0, input.base) + Math.max(0, input.extras);
    const live = offers.filter(
        (o) =>
            offerIsLive(o, now) &&
            offerIsAutoDiscount(o.type) &&
            o.type !== "threshold_gift" &&
            o.type !== "buy_x_get_y" &&
            dollOfferMatches(o, input),
    );

    let best: DollOfferResult | null = null;

    for (const offer of live) {
        let discount = 0;
        let discountType: "percent" | "fixed" | null = null;
        let discountValue = 0;

        if (offer.type === "threshold_percent") {
            if (offer.threshold_amount == null || total < offer.threshold_amount) continue;
            const pct = offer.reward_percent ?? 0;
            discount = clampDiscount((total * pct) / 100, total, offer.reward_max_discount);
            discountType = "percent";
            discountValue = pct;
        } else if (offer.type === "threshold_fixed") {
            if (offer.threshold_amount == null || total < offer.threshold_amount) continue;
            discount = clampDiscount(offer.reward_amount ?? 0, total, offer.reward_max_discount);
            discountType = "fixed";
            discountValue = offer.reward_amount ?? 0;
        } else if (offer.type === "collection_percent") {
            const pct = offer.reward_percent ?? 0;
            discount = clampDiscount((total * pct) / 100, total, offer.reward_max_discount);
            discountType = "percent";
            discountValue = pct;
        } else {
            continue;
        }

        if (discount <= 0) continue;

        const candidate: DollOfferResult = {
            offer,
            discountAmount: discount,
            discountType,
            discountValue,
        };
        if (
            !best ||
            offer.priority > (best.offer?.priority ?? -Infinity) ||
            (offer.priority === best.offer?.priority && discount > best.discountAmount)
        ) {
            best = candidate;
        }
    }

    return (
        best ?? {
            offer: null,
            discountAmount: 0,
            discountType: null,
            discountValue: 0,
        }
    );
}
