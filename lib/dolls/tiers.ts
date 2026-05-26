// Pure helpers + types for per-doll rental tiers. Deliberately free of
// `server-only` so the public booking UI (a client component) can share the
// exact matching/pricing logic the server uses to validate an order.

export type RentalUnit = "hour" | "day";

export type RentalTier = {
    id: string;
    label: string | null;
    unit: RentalUnit;
    minQty: number;
    maxQty: number;
    price: number;
};

export type RentalTierRow = {
    id: string;
    doll_id: string;
    label: string | null;
    unit: RentalUnit;
    min_qty: number;
    max_qty: number;
    price: number;
    display_order: number;
};

export function mapRentalTierRow(row: RentalTierRow): RentalTier {
    return {
        id: row.id,
        label: row.label,
        unit: row.unit,
        minQty: row.min_qty,
        maxQty: row.max_qty,
        price: row.price,
    };
}

export function isRentalUnit(value: string): value is RentalUnit {
    return value === "hour" || value === "day";
}

/**
 * Find the tier whose [minQty, maxQty] band contains `qty` for the given unit.
 * Admins are expected to keep bands disjoint, but if they overlap we resolve
 * deterministically: cheapest wins, then the narrowest band. Returns null when
 * the requested duration falls outside every band (checkout is then blocked).
 */
export function matchRentalTier(
    tiers: RentalTier[] | undefined | null,
    unit: RentalUnit,
    qty: number,
): RentalTier | null {
    if (!tiers || tiers.length === 0) return null;
    if (!Number.isFinite(qty) || qty < 1) return null;
    const matches = tiers.filter(
        (tier) => tier.unit === unit && qty >= tier.minQty && qty <= tier.maxQty,
    );
    if (matches.length === 0) return null;
    return matches.sort(
        (a, b) =>
            a.price - b.price ||
            a.maxQty - a.minQty - (b.maxQty - b.minQty) ||
            a.minQty - b.minQty,
    )[0];
}

export type RentFromPrice = {
    price: number;
    unit: RentalUnit;
    minQty: number;
    maxQty: number;
    label: string | null;
};

/** Cheapest tier, for "from {price}" displays on cards / SEO offers. */
export function getRentFromPrice(
    tiers: RentalTier[] | undefined | null,
): RentFromPrice | null {
    if (!tiers || tiers.length === 0) return null;
    const cheapest = [...tiers].sort((a, b) => a.price - b.price)[0];
    return {
        price: cheapest.price,
        unit: cheapest.unit,
        minQty: cheapest.minQty,
        maxQty: cheapest.maxQty,
        label: cheapest.label,
    };
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function computeRentalEnd(start: Date, unit: RentalUnit, qty: number): Date {
    const ms = unit === "hour" ? qty * HOUR_MS : qty * DAY_MS;
    return new Date(start.getTime() + ms);
}

/** Legacy `rental_days` value kept in sync for old admin/email/workflow code. */
export function rentalDaysFromDuration(unit: RentalUnit, qty: number): number {
    if (unit === "day") return Math.max(1, Math.round(qty));
    return Math.max(1, Math.ceil(qty / 24));
}
