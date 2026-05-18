export type OrderMode = "rent" | "buy";

export type OrderStatus =
    | "new"
    | "in_review"
    | "confirmed"
    | "completed"
    | "cancelled";

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

    created_at: string;
    updated_at: string;
};

export function formatOrderMode(mode: OrderMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
}

export function formatOrderStatus(status: OrderStatus) {
    const labels: Record<OrderStatus, string> = {
        new: "Nouă",
        in_review: "În verificare",
        confirmed: "Confirmată",
        completed: "Finalizată",
        cancelled: "Anulată",
    };

    return labels[status];
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
