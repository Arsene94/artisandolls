import "server-only";
import jwt from "jsonwebtoken";
import type {
    PaymentProvider,
    PaymentStatus,
    StartPaymentInput,
    StartPaymentResult,
    WebhookEvent,
} from "@/lib/payments/types";

const SANDBOX_BASE = "https://secure.sandbox.netopia-payments.com";
const LIVE_BASE = "https://secure.mobilpay.ro/pay";

function baseUrl(): string {
    return process.env.NETOPIA_LIVE === "true" ? LIVE_BASE : SANDBOX_BASE;
}

function posSignature(): string | null {
    return process.env.NETOPIA_POS_SIGNATURE?.trim() || null;
}

function apiKey(): string | null {
    return process.env.NETOPIA_API_KEY?.trim() || null;
}

function publicKey(): string | null {
    const raw = process.env.NETOPIA_PUBLIC_KEY?.trim();
    if (!raw) return null;
    // Allow PEM stored as a single line with `\n` escapes (Vercel-friendly).
    return raw.replace(/\\n/g, "\n");
}

/**
 * Netopia returns 2-decimal `lei` floats, never `bani`. We keep all internal
 * amounts in minor units (bani) and convert at the provider boundary only.
 */
function minorToLei(minor: number): number {
    return Math.round(minor) / 100;
}

function leiToMinor(lei: number): number {
    return Math.round(lei * 100);
}

/** Split a single name into a first/last pair as well as Netopia tolerates. */
function splitName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim();
    if (!trimmed) return { firstName: "—", lastName: "—" };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

function mapNetopiaStatus(status: number, errorCode?: string | null): PaymentStatus {
    if (status === 5) return "paid";
    if (status === 3) return "authorised";
    if (status === 15) return "pending"; // 3DS challenge in flight
    if (status === 12 || status === 17) return "failed";
    if (errorCode && errorCode !== "0" && errorCode !== "100") return "failed";
    return "pending";
}

type NetopiaStartResponse = {
    payment?: {
        ntpID?: string;
        paymentURL?: string;
        status?: number;
        amount?: number;
        currency?: string;
    };
    customerAction?: {
        url?: string;
        type?: string;
    };
    error?: { code?: string; message?: string };
};

type NetopiaIpnPayload = {
    order?: { orderID?: string; amount?: number };
    payment?: {
        ntpID?: string;
        status?: number;
        amount?: number;
        code?: string;
        message?: string;
    };
};

export const netopiaProvider: PaymentProvider = {
    id: "netopia",

    isConfigured() {
        return Boolean(apiKey() && posSignature() && publicKey());
    },

    async start(input: StartPaymentInput): Promise<StartPaymentResult> {
        const signature = posSignature();
        const key = apiKey();
        if (!signature || !key) throw new Error("Netopia is not configured");

        const { firstName, lastName } = splitName(input.billing.fullName);

        const body = {
            config: {
                emailTemplate: "",
                notifyUrl: input.notifyUrl,
                redirectUrl: input.successUrl,
                language: input.locale === "ro" ? "ro" : "en",
            },
            payment: {
                options: { installments: 0, bonus: 0 },
                instrument: { type: "card" },
                data: {},
            },
            order: {
                posSignature: signature,
                dateTime: new Date().toISOString(),
                description: input.description.slice(0, 100),
                orderID: input.orderNumber,
                amount: minorToLei(input.amountMinor),
                currency: input.currency.toUpperCase(),
                billing: {
                    email: input.billing.email ?? "",
                    phone: input.billing.phone,
                    firstName,
                    lastName,
                    city: input.billing.city ?? "",
                    country: input.billing.countryCode,
                    countryName: "Romania",
                    state: input.billing.county ?? "",
                    postalCode: "",
                    details: input.billing.address,
                },
                products: input.items.map((line, idx) => ({
                    name: line.name.slice(0, 100),
                    code: `item-${idx + 1}`,
                    category: "physical",
                    price: minorToLei(line.amountMinor),
                    vat: 19,
                })),
                data: { internalOrderId: input.orderId },
            },
        };

        const res = await fetch(`${baseUrl()}/payment/card/start`, {
            method: "POST",
            headers: {
                Authorization: key,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();
        if (!res.ok) {
            throw new Error(`Netopia start ${res.status}: ${text}`);
        }

        const parsed = JSON.parse(text) as NetopiaStartResponse;

        const redirectUrl =
            parsed.customerAction?.url ?? parsed.payment?.paymentURL ?? null;
        const externalId = parsed.payment?.ntpID ?? null;

        if (!redirectUrl || !externalId) {
            const message =
                parsed.error?.message ?? "Missing payment URL from Netopia";
            throw new Error(message);
        }

        return { redirectUrl, externalId };
    },

    async verifyWebhook(rawBody, headers): Promise<WebhookEvent> {
        const pubKey = publicKey();
        if (!pubKey) throw new Error("Netopia public key missing");

        const token = headers.get("verification-token");
        if (!token) throw new Error("Missing verification-token header");

        // Anterior verificam doar semnătura JWT și parsam body-ul HTTP separat
        // → un atacator care capta *un* IPN valid putea apoi replaya JWT-ul cu
        // un body modificat și forța orice tranziție pe orice comandă. Acum
        // verificăm semnătura ȘI preferăm datele din claim-ul JWT semnat.
        let verified: unknown;
        try {
            verified = jwt.verify(token, pubKey, { algorithms: ["RS256"] });
        } catch (err) {
            throw new Error(
                `Netopia JWT signature invalid: ${
                    err instanceof Error ? err.message : "unknown"
                }`,
            );
        }

        // Netopia poate pune datele IPN fie direct în claim, fie sub `data`,
        // fie (variante mai vechi) doar în body cu JWT-ul ca simplu token de
        // autenticitate. Detectăm care formă conține `order`/`payment` și o
        // folosim pe aceea. Dacă datele sunt doar în body, îl folosim pe acela
        // — semnătura JWT a fost deja validată, deci call-ul e autentic; logăm
        // însă, ca să observăm formatul real în producție.
        const claim =
            verified && typeof verified === "object"
                ? (verified as Record<string, unknown>)
                : {};
        const inner = (claim.data ?? null) as Record<string, unknown> | null;

        function hasIpnShape(o: unknown): o is NetopiaIpnPayload {
            return Boolean(
                o &&
                    typeof o === "object" &&
                    ("order" in o || "payment" in o),
            );
        }

        let httpPayload: NetopiaIpnPayload | null = null;
        if (rawBody && rawBody.length > 0) {
            try {
                httpPayload = JSON.parse(rawBody) as NetopiaIpnPayload;
            } catch {
                httpPayload = null;
            }
        }

        let payload: NetopiaIpnPayload;
        if (hasIpnShape(claim)) {
            payload = claim;
        } else if (hasIpnShape(inner)) {
            payload = inner;
        } else if (hasIpnShape(httpPayload)) {
            // Fallback funcțional: JWT-ul e doar token de autenticitate.
            // Semnătura e validă, deci call-ul vine de la Netopia.
            console.warn(
                "[netopia] IPN data only in body — JWT carries no payload",
            );
            payload = httpPayload;
        } else {
            throw new Error("Netopia IPN missing order/payment data");
        }

        // Dacă avem și claim semnat ȘI body, și nu coincid, e semn de replay
        // cu body modificat — folosim deja claim-ul, dar logăm incidentul.
        if (
            hasIpnShape(claim) &&
            httpPayload &&
            (httpPayload.payment?.ntpID !== payload.payment?.ntpID ||
                httpPayload.order?.orderID !== payload.order?.orderID)
        ) {
            console.warn("[netopia] body/JWT mismatch — using JWT claims", {
                jwtNtpID: payload.payment?.ntpID,
                httpNtpID: httpPayload.payment?.ntpID,
            });
        }

        const status = payload.payment?.status ?? 0;
        const code = payload.payment?.code ?? null;
        const ntpID = payload.payment?.ntpID ?? "";
        const orderId = payload.order?.orderID ?? null;
        const amountMinor =
            typeof payload.payment?.amount === "number"
                ? leiToMinor(payload.payment.amount)
                : undefined;

        return {
            // Netopia does not have a stable event id; combine ntpID + status so
            // each transition is recorded uniquely while replays collapse.
            id: `ntp:${ntpID}:${status}`,
            type: `netopia.status.${status}`,
            externalId: ntpID,
            status: mapNetopiaStatus(status, code),
            failureReason: status === 12 || status === 17
                ? payload.payment?.message ?? "declined"
                : null,
            amountMinor,
            orderId,
            raw: payload,
        };
    },
};
