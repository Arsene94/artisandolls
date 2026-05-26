import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Conexiuni externe permise de pagină. Le păstrăm într-un singur loc ca să nu
// divergem între `connect-src` (CSP) și `images.remotePatterns`.
const SUPABASE_HOST = "https://*.supabase.co";
const UPSTASH_HOST = "https://*.upstash.io";
const VECTOR_HOST = "https://*.upstash.io";

// CSP-ul ține JSON-LD-ul inline (avem ~35 de injecții `<script type=ld+json>`
// generate la SSR pentru SEO), deci `script-src 'unsafe-inline'` rămâne până
// migrăm pe nonce. Restul directivelor sunt cât se poate de restrictive — în
// special `frame-ancestors 'none'` taie click-jacking complet și `base-uri`
// previne base-tag hijacking în XSS-ul ipotetic.
//
// În dev, React/Next au nevoie de `'unsafe-eval'` (HMR, reconstrucția
// callstack-urilor). Îl adăugăm DOAR în development — în producție React nu
// folosește niciodată eval, deci CSP-ul rămâne strict.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`;

const CSP_DIRECTIVES = [
    "default-src 'self'",
    `img-src 'self' data: blob: ${SUPABASE_HOST} https://placehold.co https://images.unsplash.com https://vsdoll.net`,
    `connect-src 'self' ${SUPABASE_HOST} wss://*.supabase.co ${UPSTASH_HOST} ${VECTOR_HOST}`,
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
].join("; ");

const PERMISSIONS_POLICY = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "browsing-topics=()",
    "payment=(self)",
    "usb=()",
    "serial=()",
    "midi=()",
    "magnetometer=()",
    "accelerometer=()",
    "gyroscope=()",
].join(", ");

// Headerele de securitate sunt aplicate la nivel de Next ca să ajungă inclusiv
// pe assets statice. `X-Frame-Options` este suprascris la `DENY` pe rutele
// `/admin/*` mai jos — `frame-ancestors 'none'` din CSP face deja același
// lucru, dar dublarea acoperă și browserele vechi care nu cunosc CSP.
const SECURITY_HEADERS = [
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    // Marker pentru filtre familiale + SafeSearch — completează tag-urile meta.
    { key: "Rating", value: "RTA-5042-1996-1400-1577-RTA" },
];

// Origini permise pentru server actions. Fără asta, un atacator de pe alt
// domeniu poate POST-a către `?Next-Action=...` (CSRF pe acțiunile publice:
// age-gate, create order anonim, submit review). Origin-ul canonic e dedus
// din `NEXT_PUBLIC_SITE_URL` la build; adăugăm Vercel preview deployments
// (`*.vercel.app`) ca să nu rupem preview-urile.
function siteHost(): string | null {
    const raw =
        process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? null;
    if (!raw) return null;
    try {
        return new URL(raw).host;
    } catch {
        return null;
    }
}

const canonicalHost = siteHost();
const SERVER_ACTION_ORIGINS = [
    canonicalHost,
    canonicalHost ? `*.${canonicalHost.replace(/^www\./, "")}` : null,
    "*.vercel.app",
].filter((v): v is string => Boolean(v));

const nextConfig: NextConfig = {
    allowedDevOrigins: ["127.0.0.1"],
    experimental: {
        serverActions: {
            allowedOrigins: SERVER_ACTION_ORIGINS,
        },
    },
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
                // Admin-ul nu trebuie embed-at niciodată; suprascriem XFO la DENY
                // și suprimăm indexarea / cache-ul intermediarilor.
                source: "/admin/:path*",
                headers: [
                    ...SECURITY_HEADERS.filter(
                        (h) => h.key !== "X-Frame-Options",
                    ),
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "Cache-Control", value: "private, no-store" },
                    { key: "X-Robots-Tag", value: "noindex, nofollow" },
                ],
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
