import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    allowedDevOrigins: ["127.0.0.1"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/**",
            },
            {
                protocol: "https",
                hostname: "vsdoll.net",
                pathname: "/wp-content/uploads/**",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
                pathname: "/**",
            },
        ],
        formats: ["image/avif", "image/webp"],
    },
};

export default withNextIntl(nextConfig);
