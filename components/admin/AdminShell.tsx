import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import styles from "./AdminShell.module.css";

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin",
        description: "Overview comenzi și activitate",
    },
    {
        label: "Comenzi",
        href: "/admin/orders",
        description: "Închirieri și cumpărări",
    },
    {
        label: "Păpuși",
        href: "/admin/dolls",
        description: "Catalog produse",
    },
    {
        label: "Colecții",
        href: "/admin/collections",
        description: "Categorii și serii",
    },
    {
        label: "Customizări",
        href: "/admin/customizations",
        description: "Opțiuni extra",
    },
    {
        label: "Ținute",
        href: "/admin/outfits",
        description: "Dropdown poze și prețuri",
    },
    {
        label: "Clienți",
        href: "/admin/customers",
        description: "Date contact și istoric",
    },
    {
        label: "Setări",
        href: "/admin/settings",
        description: "Configurare platformă",
    },
];

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

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className={styles.navItem}>
                            <span>{item.label}</span>
                            <small>{item.description}</small>
                        </Link>
                    ))}
                </nav>

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
        </div>
    );
}
