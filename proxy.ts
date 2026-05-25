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
    if (!ageVerified) {
        const { locale, rest } = stripLocale(pathname);
        if (!isAgeGateExempt(rest)) {
            return NextResponse.redirect(buildAgeGateUrl(request, locale));
        }
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ["/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
