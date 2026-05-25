import type { MetadataRoute } from "next";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/admin/", "/api/"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
