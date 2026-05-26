import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSiteUrl } from "@/lib/site";
import { getPublicPlatformSettings } from "@/lib/settings";
import { constantTimeEqual } from "@/lib/secrets/compare";

export const dynamic = "force-dynamic";

// IndexNow este un protocol semnat pus la dispoziție de Bing, Yandex, Naver
// și Seznam care permite notificare push despre URL-uri noi sau modificate.
// Google nu îl suportă, dar Bing îl distribuie mai departe; e gratuit, fără
// rate limit semnificativ și e cea mai rapidă cale de indexare după Google
// pentru un site nou cu rotație de catalog.

const ENDPOINTS = [
    "https://api.indexnow.org/IndexNow",
    "https://www.bing.com/IndexNow",
    "https://yandex.com/indexnow",
];

const PayloadSchema = z.object({
    urls: z.array(z.string().url()).min(1).max(10_000),
});

function authoriseFromHeader(request: NextRequest) {
    const expected = process.env.INDEXNOW_INTERNAL_SECRET;
    if (!expected) return false;
    const got = request.headers.get("x-indexnow-secret") ?? "";
    return constantTimeEqual(got, expected);
}

export async function POST(request: NextRequest) {
    if (!authoriseFromHeader(request)) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const key = process.env.INDEXNOW_KEY;
    if (!key) {
        return NextResponse.json(
            { error: "indexnow_not_configured" },
            { status: 503 },
        );
    }

    let parsed;
    try {
        parsed = PayloadSchema.parse(await request.json());
    } catch {
        return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const host = new URL(siteUrl).host;

    const body = JSON.stringify({
        host,
        key,
        keyLocation: `${siteUrl}/indexnow/${key}.txt`,
        urlList: parsed.urls,
    });

    // Trimitem în paralel; nu blocăm răspunsul pe niciun endpoint individual.
    const results = await Promise.allSettled(
        ENDPOINTS.map((endpoint) =>
            fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body,
                cache: "no-store",
            }).then(async (res) => ({
                endpoint,
                status: res.status,
                ok: res.ok,
            })),
        ),
    );

    return NextResponse.json({
        host,
        notified: parsed.urls.length,
        results: results.map((r) =>
            r.status === "fulfilled"
                ? r.value
                : { endpoint: "?", error: String(r.reason) },
        ),
    });
}
