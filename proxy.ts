import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const AGE_COOKIE = "ad_age_verified";
const LOCALE_SEGMENT = /^\/(ro|en|nl)(?=\/|$)/;
const AGE_GATE_EXEMPT = [
    /^\/age-gate(\/.*)?$/,
    /^\/(terms|privacy|cookies|age-policy)(\/.*)?$/,
];

// Crawler-uri legitime care nu pot rezolva interstitial-ul de vârstă. Le lăsăm
// să indexeze direct conținutul — pagina e oricum 18+ (eticheta `rating=adult`
// + RTA label), iar fără bypass site-ul devine practic invizibil în Google/Bing
// și nereferențiat de motoarele AI. Lista e o uniune între bot-urile clasice
// de search, social previewers și bot-urile AI majore în 2026.
const BOT_USER_AGENT_PATTERN =
    /(googlebot|google-extended|google-inspectiontool|google-cloudvertexbot|storebot-google|adsbot-google|bingbot|microsoftpreview|msnbot|slurp|duckduckbot|yandex|baiduspider|sogou|seznambot|qwant|naverbot|petalbot|applebot|applebot-extended|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexitybot|perplexity-user|youbot|ccbot|amazonbot|cohere-ai|mistralai-user|diffbot|ia_archiver|archive\.org_bot|facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterestbot|tumblr|redditbot|skypeuripreview|embedly)/i;

function isLegitimateBot(userAgent: string | null) {
    if (!userAgent) return false;
    return BOT_USER_AGENT_PATTERN.test(userAgent);
}

function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null) {
    return user?.app_metadata?.role === "admin";
}

async function handleAdminAuth(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    response = NextResponse.next({ request });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAdminPath = pathname.startsWith("/admin");
    const isLoginPath = pathname === "/admin/login";

    if (!isAdminPath) {
        return response;
    }

    if (isLoginPath) {
        if (user && isAdminUser(user)) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return response;
    }

    if (!user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!isAdminUser(user)) {
        const redirectResponse = NextResponse.redirect(
            new URL("/admin/login?error=not_admin", request.url),
        );
        redirectResponse.cookies.delete("sb-access-token");
        redirectResponse.cookies.delete("sb-refresh-token");
        return redirectResponse;
    }

    return response;
}

function stripLocale(pathname: string) {
    const match = pathname.match(LOCALE_SEGMENT);
    if (!match) return { locale: null as string | null, rest: pathname || "/" };
    const rest = pathname.slice(match[0].length) || "/";
    return { locale: match[1], rest };
}

function isAgeGateExempt(pathnameWithoutLocale: string) {
    return AGE_GATE_EXEMPT.some((rx) => rx.test(pathnameWithoutLocale));
}

function buildAgeGateUrl(request: NextRequest, locale: string | null) {
    const next = request.nextUrl.pathname + request.nextUrl.search;
    const prefix = locale && locale !== routing.defaultLocale ? `/${locale}` : "";
    const url = new URL(`${prefix}/age-gate`, request.url);
    url.searchParams.set("next", next);
    return url;
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/admin")) {
        return handleAdminAuth(request);
    }

    const ageVerified = request.cookies.get(AGE_COOKIE)?.value === "1";
    const userAgent = request.headers.get("user-agent");
    const isBot = isLegitimateBot(userAgent);

    if (!ageVerified && !isBot) {
        const { locale, rest } = stripLocale(pathname);
        if (!isAgeGateExempt(rest)) {
            return NextResponse.redirect(buildAgeGateUrl(request, locale));
        }
    }

    const response = handleI18nRouting(request);

    if (isBot) {
        // Semnal explicit pentru index-uire: previzualizare bogată, dar marcat
        // adult ca SafeSearch să nu ne penalizeze. `noyaca` previne Google să
        // aleagă singur descrieri din directoare externe (ex. DMOZ legacy).
        response.headers.set(
            "X-Robots-Tag",
            "index, follow, max-image-preview:large, max-snippet:-1, noyaca",
        );
    }

    return response;
}

export const config = {
    matcher: ["/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
