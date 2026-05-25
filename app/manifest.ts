import type { MetadataRoute } from "next";
import { getPublicPlatformSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const name = settings?.business_name ?? "Artisan Dolls";

    return {
        name,
        short_name: name.split(" ")[0] ?? name,
        description:
            "Luxury, intimacy and hyper-realism. Discreet rental and purchase of personalised companions.",
        start_url: "/",
        display: "standalone",
        background_color: "#0F0406",
        theme_color: "#0F0406",
        orientation: "portrait-primary",
        icons: [
            { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
        ],
    };
}
