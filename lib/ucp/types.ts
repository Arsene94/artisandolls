/**
 * Minimal TypeScript model of the Universal Commerce Protocol (UCP) Checkout
 * Session, version `2026-04-08`. Fields we do not yet support are still typed
 * to make round-trips with strict agents safe.
 *
 * Spec: https://ucp.dev/latest/specification/checkout/
 * REST binding: https://ucp.dev/specification/checkout-rest/
 */

export const UCP_VERSION = "2026-04-08";

export type UcpSessionStatus =
    | "incomplete"
    | "requires_escalation"
    | "ready_for_complete"
    | "complete_in_progress"
    | "completed"
    | "canceled";

export type UcpTotalType =
    | "subtotal"
    | "discount"
    | "items_discount"
    | "fulfillment"
    | "tax"
    | "fee"
    | "total"
    // operator-defined types are valid as well; UCP only standardises the above
    | string;

export type UcpTotal = {
    type: UcpTotalType;
    /** Signed integer in minor units of the session currency. */
    amount: number;
    display_text?: string;
    lines?: UcpTotal[];
};

export type UcpItem = {
    id: string;
    title?: string;
    description?: string;
    price?: number; // minor units, per spec
    image_url?: string;
    handle?: string;
    sku?: string;
};

export type UcpLineItem = {
    id: string;
    item: UcpItem;
    quantity: number;
    totals?: UcpTotal[];
};

export type UcpBuyer = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
};

export type UcpContext = {
    address_country?: string;
    address_region?: string;
    postal_code?: string;
    language?: string;
    currency?: string;
    intent?: string;
};

export type UcpSignals = Record<string, string | number | boolean | null>;

export type UcpAddress = {
    id?: string;
    street_address?: string;
    address_locality?: string;
    address_region?: string;
    postal_code?: string;
    address_country?: string;
};

export type UcpFulfillmentMethod = {
    id?: string;
    type: "shipping" | "pickup" | "digital" | string;
    line_item_ids?: string[];
    destinations?: UcpAddress[];
    selected_destination_id?: string;
    groups?: Array<{
        id: string;
        line_item_ids?: string[];
        selected_option_id?: string;
        options: Array<{
            id: string;
            title: string;
            description?: string;
            totals: UcpTotal[];
        }>;
    }>;
};

export type UcpFulfillment = {
    methods: UcpFulfillmentMethod[];
};

export type UcpPaymentInstrument = {
    id: string;
    handler_id: string;
    type: string;
    selected?: boolean;
    billing_address?: UcpAddress;
    credential?: {
        type: string;
        token?: string;
        [k: string]: unknown;
    };
    display?: {
        brand?: string;
        last_digits?: string;
        description?: string;
        rich_text_description?: string;
        email?: string;
    };
};

export type UcpPayment = {
    instruments?: UcpPaymentInstrument[];
};

export type UcpLink = {
    type:
        | "privacy_policy"
        | "terms_of_service"
        | "refund_policy"
        | "shipping_policy"
        | "faq"
        | string;
    url: string;
};

export type UcpMessage = {
    type: "error" | "warning" | "info";
    code: string;
    content: string;
    severity?: "recoverable" | "requires_buyer_input" | "requires_buyer_review" | "unrecoverable";
    path?: string;
    presentation?: "notice" | "disclosure";
};

export type UcpOrderConfirmation = {
    id: string;
    label?: string;
    permalink_url?: string;
};

export type UcpMeta = {
    version: string;
    capabilities: Record<string, Array<{ version: string }>>;
    payment_handlers?: Record<string, Array<{
        id: string;
        version: string;
        config?: Record<string, unknown>;
    }>>;
    status?: "ok" | "error";
};

export type UcpCheckoutSession = {
    ucp: UcpMeta;
    id: string;
    status: UcpSessionStatus;
    currency: string;
    line_items: UcpLineItem[];
    totals: UcpTotal[];
    links?: UcpLink[];
    buyer?: UcpBuyer;
    context?: UcpContext;
    signals?: UcpSignals;
    payment?: UcpPayment;
    fulfillment?: UcpFulfillment;
    messages?: UcpMessage[];
    expires_at?: string;
    continue_url?: string;
    order?: UcpOrderConfirmation;
};

/** Request body for POST /checkout-sessions. */
export type UcpCreateSessionRequest = Partial<
    Pick<UcpCheckoutSession, "line_items" | "buyer" | "context" | "signals" | "payment">
>;

/** Request body for PUT /checkout-sessions/{id}. */
export type UcpUpdateSessionRequest = Partial<
    Pick<
        UcpCheckoutSession,
        "line_items" | "buyer" | "context" | "signals" | "payment" | "fulfillment"
    >
>;

/** Request body for POST /checkout-sessions/{id}/complete. */
export type UcpCompleteSessionRequest = Partial<
    Pick<UcpCheckoutSession, "payment" | "signals">
>;
