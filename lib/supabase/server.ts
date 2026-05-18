import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Server Components nu pot seta cookies direct mereu.
                        // Middleware-ul va face refresh-ul sesiunii.
                    }
                },
            },
        }
    );
}

export function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null) {
    return user?.app_metadata?.role === "admin";
}
