import "server-only";
import type { OrderRow } from "@/lib/orders/shared";
import { formatDateRo } from "@/lib/orders/shared";

type WhatsappSendResult = {
    to: string;
    ok: boolean;
    status?: number;
    templateName?: string;
    error?: string;
    response?: unknown;
};

function getRequiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing env variable: ${name}`);
    }

    return value;
}

function getAdminPhoneNumbers() {
    return getRequiredEnv("WHATSAPP_ADMIN_PHONE_NUMBERS")
        .split(",")
        .map((phone) => phone.trim().replace(/[^\d]/g, ""))
        .filter(Boolean)
        .slice(0, 3);
}

function getRentPeriod(order: OrderRow) {
    return `${formatDateRo(order.start_date)} — ${formatDateRo(order.end_date)}`;
}

function getTemplateName(order: OrderRow) {
    return order.mode === "buy"
        ? "artisandolls_new_buy"
        : "artisandolls_new_rent";
}

function getBodyVariables(order: OrderRow) {
    if (order.mode === "buy") {
        return [
            order.doll_name,
            order.customer_name,
            order.delivery_address,
            order.customer_phone,
            order.total_label,
        ];
    }

    return [
        order.doll_name,
        getRentPeriod(order),
        String(order.rental_days ?? ""),
        order.delivery_time,
        order.return_time ?? "",
        order.customer_name,
        order.delivery_address,
        order.customer_phone,
        order.total_label,
    ];
}

async function parseMetaResponse(response: Response) {
    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function sendWhatsappTemplateMessage(to: string, order: OrderRow): Promise<WhatsappSendResult> {
    const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v21.0";
    const token = getRequiredEnv("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
    const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "ro";
    const templateName = getTemplateName(order);

    const bodyVariables = getBodyVariables(order).map((value) => ({
        type: "text",
        text: value || "-",
    }));

    /**
     * IMPORTANT:
     * În Meta template, butonul URL ar trebui să fie configurat ca:
     * https://domeniul-tau.ro/admin/orders/{{1}}
     *
     * De aceea trimitem doar order.id ca parametru, NU URL-ul complet.
     */
    const buttonParameter = order.id;

    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode,
            },
            components: [
                {
                    type: "body",
                    parameters: bodyVariables,
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                        {
                            type: "text",
                            text: buttonParameter,
                        },
                    ],
                },
            ],
        },
    };

    try {
        const response = await fetch(
            `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const metaResponse = await parseMetaResponse(response);

        if (!response.ok) {
            return {
                to,
                ok: false,
                status: response.status,
                templateName,
                error: typeof metaResponse === "string" ? metaResponse : JSON.stringify(metaResponse),
                response: metaResponse,
            };
        }

        return {
            to,
            ok: true,
            status: response.status,
            templateName,
            response: metaResponse,
        };
    } catch (error) {
        return {
            to,
            ok: false,
            templateName,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function notifyAdminsAboutOrder(order: OrderRow) {
    const phones = getAdminPhoneNumbers();

    const results = await Promise.all(
        phones.map((phone) => sendWhatsappTemplateMessage(phone, order))
    );

    const errors = results
        .filter((result) => !result.ok)
        .map((result) => `WhatsApp failed for ${result.to}: ${result.error ?? "Unknown error"}`);

    return {
        success: errors.length === 0,
        error: errors.join("\n") || null,
        debug: {
            phones,
            results,
            templateName: getTemplateName(order),
            language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "ro",
            phoneNumberIdPresent: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
            tokenPresent: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
        },
    };
}
