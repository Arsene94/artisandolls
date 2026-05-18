import "server-only";
import type { OrderRow } from "@/lib/orders/shared";
import { formatDateRo } from "@/lib/orders/shared";

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

function getAdminOrderUrl(orderId: string) {
    const siteUrl = getRequiredEnv("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "");

    return `${siteUrl}/admin/orders/${orderId}`;
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

async function sendWhatsappTemplateMessage(to: string, order: OrderRow) {
    const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v21.0";
    const token = getRequiredEnv("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
    const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "ro";
    const templateName = getTemplateName(order);
    const adminOrderUrl = getAdminOrderUrl(order.id);

    const bodyVariables = getBodyVariables(order).map((value) => ({
        type: "text",
        text: value || "-",
    }));

    const response = await fetch(
        `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
                                    text: adminOrderUrl,
                                },
                            ],
                        },
                    ],
                },
            }),
        }
    );

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`WhatsApp failed for ${to}: ${body}`);
    }
}

export async function notifyAdminsAboutOrder(order: OrderRow) {
    const phones = getAdminPhoneNumbers();

    const results = await Promise.allSettled(
        phones.map((phone) => sendWhatsappTemplateMessage(phone, order))
    );

    const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

    return {
        success: errors.length === 0,
        error: errors.join("\n") || null,
    };
}
