import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Headerele de securitate sunt aplicate la nivel de Next ca să ajungă inclusiv
// pe assets statice. CSP-ul rămâne deliberat permisiv pe `script-src` (avem
// JSON-LD inline pe fiecare pagină) și pe `img-src` (Supabase + Unsplash);
// strângem cureaua când vom muta JSON-LD-ul pe nonce.
const SECURITY_HEADERS = [
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    // Marker pentru filtre familiale + SafeSearch — completează tag-urile meta.
    { key: "Rating", value: "RTA-5042-1996-1400-1577-RTA" },
];

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
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
        ],
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: SECURITY_HEADERS,
            },
            {
                // Resursele de checkout / cart nu trebuie cache-uite intermediar.
                source: "/:locale(ro|en|nl)?/shop/(cart|checkout)/:path*",
                headers: [
                    ...SECURITY_HEADERS,
                    { key: "Cache-Control", value: "private, no-store" },
                    { key: "X-Robots-Tag", value: "noindex, nofollow" },
                ],
            },
            {
                source: "/age-gate",
                headers: [
                    ...SECURITY_HEADERS,
                    { key: "X-Robots-Tag", value: "noindex, follow" },
                    { key: "Cache-Control", value: "private, no-store" },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
