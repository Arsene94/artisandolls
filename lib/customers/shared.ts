export type CustomerRow = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    normalized_phone: string | null;
    last_delivery_address: string | null;
    notes: string | null;
    total_orders: number;
    rent_orders: number;
    buy_orders: number;
    total_spent: number;
    last_order_at: string | null;
    is_blocked: boolean;
    created_at: string;
    updated_at: string;
};

export function formatCustomerStatus(customer: CustomerRow) {
    return customer.is_blocked ? "Blocat" : "Activ";
}

export function formatMoneyRo(value: number) {
    return `${value.toLocaleString("ro-RO")} lei`;
}
