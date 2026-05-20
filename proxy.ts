import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null) {
    return user?.app_metadata?.role === "admin";
}

async function handleAdminAuth(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

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

                    response = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
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
        const redirectResponse = NextResponse.redirect(new URL("/admin/login?error=not_admin", request.url));

        redirectResponse.cookies.delete("sb-access-token");
        redirectResponse.cookies.delete("sb-refresh-token");

        return redirectResponse;
    }

    return response;
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/admin")) {
        return handleAdminAuth(request);
    }

    return handleI18nRouting(request);
}

export const config = {
    matcher: ["/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
