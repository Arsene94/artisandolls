import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import LiveOrdersBanner from "@/components/admin/LiveOrdersBanner";
import { RealtimeProvider } from "@/lib/upstash/realtime-client";
import styles from "./AdminShell.module.css";

export default async function AdminShell({ children }: { children: React.ReactNode }) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
        redirect("/admin/login");
    }

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <Link href="/admin" className={styles.brand}>
                    <span>Artisan</span>
                    <strong>Dolls Admin</strong>
                </Link>

                <AdminNav />

                <div className={styles.userBox}>
                    <span>Conectat ca</span>
                    <strong>{user.email}</strong>
                    <AdminSignOutButton />
                </div>
            </aside>

            <div className={styles.main}>
                <header className={styles.topbar}>
                    <div>
                        <span>Admin Panel</span>
                        <strong>Management Artisan Dolls</strong>
                    </div>
                </header>

                {children}
            </div>
            <RealtimeProvider>
                <LiveOrdersBanner />
            </RealtimeProvider>
        </div>
    );
}
