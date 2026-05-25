import "server-only";
import { UCP_VERSION, type UcpMessage } from "@/lib/ucp/types";

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            ...extraHeaders,
        },
    });
}

export function ucpJson(body: unknown, status = 200): Response {
    return jsonResponse(body, status);
}

export function ucpError(
    status: 400 | 401 | 403 | 404 | 409 | 415 | 422 | 429 | 500 | 503,
    code: string,
    content: string,
    severity: UcpMessage["severity"] = "unrecoverable",
): Response {
    const body = {
        ucp: {
            version: UCP_VERSION,
            capabilities: {
                "dev.ucp.shopping.checkout": [{ version: UCP_VERSION }],
            },
            status: "error",
        },
        messages: [
            {
                type: "error",
                code,
                content,
                severity,
            } satisfies UcpMessage,
        ],
    };
    return jsonResponse(body, status);
}
