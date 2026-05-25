import "server-only";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site";
import { UCP_VERSION } from "@/lib/ucp/types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/**
 * Discovery profile for the Universal Commerce Protocol.
 * Spec: https://ucp.dev/latest/specification/checkout/#discovery
 *
 * An agent fetches `/.well-known/ucp`, learns where the REST endpoint lives
 * (`rest.endpoint`), and what UCP capabilities + payment handlers we support.
 */
export async function GET() {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const enabled =
        settings?.shop_checkout_mode === "ucp" && settings?.ucp_enabled === true;

    const profile = {
        ucp: {
            version: UCP_VERSION,
            status: enabled ? "ok" : "disabled",
        },
        capabilities: enabled
            ? {
                  "dev.ucp.shopping.checkout": [{ version: UCP_VERSION }],
              }
            : {},
        bindings: enabled
            ? {
                  rest: {
                      endpoint: `${siteUrl}/api/ucp/checkout-sessions`,
                      version: UCP_VERSION,
                      content_type: "application/json",
                      tls_minimum: "1.3",
                      auth: [
                          { type: "api_key", in: "header", name: "X-API-Key" },
                          { type: "bearer", in: "header", name: "Authorization" },
                      ],
                  },
              }
            : {},
        payment_handlers: enabled
            ? {
                  "com.velvetcompanions.checkout": [
                      {
                          id: "velvet_cash",
                          version: UCP_VERSION,
                          config: { method: "cash_on_delivery" },
                      },
                      {
                          id: "velvet_card_online",
                          version: UCP_VERSION,
                          config: { method: "card_online" },
                      },
                  ],
              }
            : {},
        operator: {
            name: settings?.business_name ?? "Velvet Companions",
            site: siteUrl,
            contact: settings?.contact_email ?? null,
        },
    };

    return new Response(JSON.stringify(profile), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": enabled ? "public, max-age=60" : "no-store",
        },
    });
}
