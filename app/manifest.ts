import type { MetadataRoute } from "next";
import { getPublicPlatformSettings } from "@/lib/settings";
import { CANONICAL_BRAND } from "@/lib/site";

// `force-dynamic` because the manifest reflects `business_name` from the
// platform settings, which the operator can rename at any time from /admin.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const name = settings?.business_name?.trim() || CANONICAL_BRAND;
    const shortName = name.split(/\s+/)[0] || name;

    return {
        name,
        short_name: shortName,
        description:
            "Lux, intimitate și hiper-realism. Închiriere și achiziție discretă de companioni realiști, livrare neutră.",
        start_url: "/",
        scope: "/",
        id: "/",
        display: "standalone",
        background_color: "#0F0406",
        theme_color: "#0F0406",
        orientation: "portrait-primary",
        lang: "ro-RO",
        dir: "ltr",
        categories: ["shopping", "lifestyle"],
        icons: [
            { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
            { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
        ],
    };
}
