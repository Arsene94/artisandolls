export type PaymentProviderId = "stripe" | "netopia";

export type PaymentMethod = "cash" | "card_online";

export type PaymentStatus =
    | "not_required"
    | "pending"
    | "authorised"
    | "paid"
    | "failed"
    | "refunded"
    | "voided";

export type PaymentLineItem = {
    name: string;
    description?: string | null;
    /** Minor units (bani). Internal canonical representation across providers. */
    amountMinor: number;
    quantity: number;
};

export type PaymentBilling = {
    fullName: string;
    email: string | null;
    phone: string;
    address: string;
    city: string | null;
    county: string | null;
    /** ISO 3166 numeric (RO = 642). */
    countryCode: number;
};

export type StartPaymentInput = {
    orderId: string;
    orderNumber: string;
    /** Subtotal − discount, in minor units. */
    amountMinor: number;
    currency: string;
    description: string;
    items: PaymentLineItem[];
    billing: PaymentBilling;
    locale: "ro" | "en" | "nl";
    successUrl: string;
    cancelUrl: string;
    notifyUrl: string;
};

export type StartPaymentResult = {
    /** Where to send the browser. Always a hosted page on the provider. */
    redirectUrl: string;
    /** Provider-side identifier we persist for reconciliation. */
    externalId: string;
};

export type WebhookEvent = {
    /** Provider-side event id used for idempotency. */
    id: string;
    type: string;
    /** External transaction id (Stripe `pi_…` / Netopia `ntpID`). */
    externalId: string;
    status: PaymentStatus;
    /** Optional friendly failure description (when status === 'failed'). */
    failureReason?: string | null;
    /** Provider-reported amount in minor units, for sanity-checking. */
    amountMinor?: number;
    /** orderId echoed back via metadata / orderID. */
    orderId?: string | null;
    raw: unknown;
};

export interface PaymentProvider {
    readonly id: PaymentProviderId;
    /** Is the provider configured with the env it needs? Drives the admin warning. */
    isConfigured(): boolean;
    start(input: StartPaymentInput): Promise<StartPaymentResult>;
    verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent>;
}
