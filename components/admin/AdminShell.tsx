import Link from "next/link";
import { redirect } from "next/navigation";
import {
    IconAdjustments,
    IconBuildingStore,
    IconGift,
    IconHanger,
    IconLayoutDashboard,
    IconLayersIntersect,
    IconPackage,
    IconReceiptOff,
    IconSettings,
    IconShoppingBag,
    IconShoppingCart,
    IconTool,
    IconUsers,
} from "@tabler/icons-react";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import LiveOrdersBanner from "@/components/admin/LiveOrdersBanner";
import { RealtimeProvider } from "@/lib/upstash/realtime-client";
import styles from "./AdminShell.module.css";

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin",
        description: "Overview comenzi și activitate",
        icon: IconLayoutDashboard,
    },
    {
        label: "Comenzi",
        href: "/admin/orders",
        description: "Închirieri și cumpărări",
        icon: IconShoppingBag,
    },
    {
        label: "Păpuși",
        href: "/admin/dolls",
        description: "Catalog produse",
        icon: IconBuildingStore,
    },
    {
        label: "Colecții",
        href: "/admin/collections",
        description: "Categorii și serii",
        icon: IconLayersIntersect,
    },
    {
        label: "Customizări",
        href: "/admin/customizations",
        description: "Opțiuni extra",
        icon: IconAdjustments,
    },
    {
        label: "Ținute",
        href: "/admin/outfits",
        description: "Dropdown poze și prețuri",
        icon: IconHanger,
    },
    {
        label: "Shop · Produse",
        href: "/admin/shop/products",
        description: "Magazin accesorii & îngrijire",
        icon: IconPackage,
    },
    {
        label: "Shop · Categorii",
        href: "/admin/shop/categories",
        description: "Organizare magazin",
        icon: IconLayersIntersect,
    },
    {
        label: "Coduri reducere",
        href: "/admin/shop/coupons",
        description: "Coduri promoționale shop + păpuși",
        icon: IconReceiptOff,
    },
    {
        label: "Oferte",
        href: "/admin/offers",
        description: "Promoții automate shop + păpuși",
        icon: IconGift,
    },
    {
        label: "Shop · Comenzi",
        href: "/admin/shop/orders",
        description: "Comenzi din magazin",
        icon: IconShoppingCart,
    },
    {
        label: "Clienți",
        href: "/admin/customers",
        description: "Date contact și istoric",
        icon: IconUsers,
    },
    {
        label: "Operațiuni",
        href: "/admin/operations",
        description: "Traduceri & job-uri bulk",
        icon: IconTool,
    },
    {
        label: "Setări",
        href: "/admin/settings",
        description: "Configurare platformă",
        icon: IconSettings,
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
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link key={item.href} href={item.href} className={styles.navItem}>
                                <span className={styles.navLabel}>
                                    <Icon
                                        size={18}
                                        stroke={1.7}
                                        className={styles.navIcon}
                                        aria-hidden="true"
                                    />
                                    {item.label}
                                </span>
                                <small>{item.description}</small>
                            </Link>
                        );
                    })}
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
            <RealtimeProvider>
                <LiveOrdersBanner />
            </RealtimeProvider>
        </div>
    );
}
