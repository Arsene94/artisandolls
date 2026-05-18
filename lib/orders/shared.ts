export type OrderMode = "rent" | "buy";

export type RentOrderStatus =
    | "rent_new"
    | "rent_in_review"
    | "rent_confirmed"
    | "rent_preparing"
    | "rent_out_for_delivery"
    | "rent_delivered"
    | "rent_active"
    | "rent_return_scheduled"
    | "rent_returned"
    | "rent_completed"
    | "rent_cancelled";

export type BuyOrderStatus =
    | "buy_new"
    | "buy_in_review"
    | "buy_confirmed"
    | "buy_preparing"
    | "buy_out_for_delivery"
    | "buy_delivered"
    | "buy_completed"
    | "buy_cancelled"
    | "buy_refunded";

export type OrderStatus = RentOrderStatus | BuyOrderStatus;

export type OrderStatusOption = {
    value: OrderStatus;
    label: string;
    description: string;
};

export const rentOrderStatusOptions = [
    {
        value: "rent_new",
        label: "Cerere nouă",
        description: "Cererea de închiriere a intrat și trebuie verificată.",
    },
    {
        value: "rent_in_review",
        label: "În verificare",
        description: "Verifici disponibilitatea, perioada și detaliile clientului.",
    },
    {
        value: "rent_confirmed",
        label: "Confirmată",
        description: "Închirierea este confirmată cu clientul.",
    },
    {
        value: "rent_preparing",
        label: "În pregătire",
        description: "Păpușa, ținutele și customizările sunt pregătite pentru livrare.",
    },
    {
        value: "rent_out_for_delivery",
        label: "În livrare",
        description: "Comanda este pe drum către client.",
    },
    {
        value: "rent_delivered",
        label: "Livrată",
        description: "Păpușa a fost livrată la client.",
    },
    {
        value: "rent_active",
        label: "Închiriere activă",
        description: "Perioada de închiriere este în desfășurare.",
    },
    {
        value: "rent_return_scheduled",
        label: "Retur programat",
        description: "Returul este programat și urmează preluarea.",
    },
    {
        value: "rent_returned",
        label: "Returnată",
        description: "Păpușa a fost returnată și urmează verificarea.",
    },
    {
        value: "rent_completed",
        label: "Finalizată",
        description: "Închirierea este complet închisă.",
    },
    {
        value: "rent_cancelled",
        label: "Anulată",
        description: "Cererea de închiriere a fost anulată.",
    },
] satisfies OrderStatusOption[];

export const buyOrderStatusOptions = [
    {
        value: "buy_new",
        label: "Cerere nouă",
        description: "Cererea de cumpărare a intrat și trebuie verificată.",
    },
    {
        value: "buy_in_review",
        label: "În verificare",
        description: "Verifici stocul, customizările și detaliile clientului.",
    },
    {
        value: "buy_confirmed",
        label: "Confirmată",
        description: "Cumpărarea este confirmată cu clientul.",
    },
    {
        value: "buy_preparing",
        label: "În pregătire",
        description: "Păpușa, ținuta și ambalarea sunt în pregătire.",
    },
    {
        value: "buy_out_for_delivery",
        label: "În livrare",
        description: "Comanda este pe drum către client.",
    },
    {
        value: "buy_delivered",
        label: "Livrată",
        description: "Păpușa a fost livrată clientului.",
    },
    {
        value: "buy_completed",
        label: "Finalizată",
        description: "Cumpărarea este complet închisă.",
    },
    {
        value: "buy_cancelled",
        label: "Anulată",
        description: "Cererea de cumpărare a fost anulată.",
    },
    {
        value: "buy_refunded",
        label: "Rambursată",
        description: "Comanda a fost rambursată.",
    },
] satisfies OrderStatusOption[];

const orderStatusLabels = Object.fromEntries(
    [...rentOrderStatusOptions, ...buyOrderStatusOptions].map((status) => [
        status.value,
        status.label,
    ])
) as Record<OrderStatus, string>;

export type OrderRow = {
    id: string;
    order_number: string;
    mode: OrderMode;
    status: OrderStatus;

    doll_id: string | null;
    doll_slug: string;
    doll_name: string;

    start_date: string | null;
    end_date: string | null;
    rental_days: number | null;

    outfit_id: string | null;
    selected_options: string[];

    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    delivery_time: string;
    return_time: string | null;
    notes: string | null;

    total_amount: number;
    total_label: string;

    whatsapp_notified: boolean;
    whatsapp_error: string | null;
    whatsapp_debug?: unknown;

    created_at: string;
    updated_at: string;
};

export function getInitialOrderStatus(mode: OrderMode): OrderStatus {
    return mode === "rent" ? "rent_new" : "buy_new";
}

export function getOrderStatusOptions(mode: OrderMode) {
    return mode === "rent" ? rentOrderStatusOptions : buyOrderStatusOptions;
}

export function isRentOrderStatus(status: OrderStatus): status is RentOrderStatus {
    return status.startsWith("rent_");
}

export function isBuyOrderStatus(status: OrderStatus): status is BuyOrderStatus {
    return status.startsWith("buy_");
}

export function isValidOrderStatusForMode(status: OrderStatus, mode: OrderMode) {
    return mode === "rent" ? isRentOrderStatus(status) : isBuyOrderStatus(status);
}

export function formatOrderMode(mode: OrderMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
}

export function formatOrderStatus(status: OrderStatus) {
    return orderStatusLabels[status] ?? status;
}

export function formatDateRo(value: string | null) {
    if (!value) {
        return "Neselectată";
    }

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
        return value;
    }

    return `${day}.${month}.${year}`;
}

export function getRentalDays(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    const diff = end.getTime() - start.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    return Math.max(1, Math.ceil(diff / dayMs));
}
