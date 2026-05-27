"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import {
    IconAdjustments,
    IconBuildingStore,
    IconCalendarEvent,
    IconChevronRight,
    IconGift,
    IconHanger,
    IconLayersIntersect,
    IconLayoutDashboard,
    IconPackage,
    IconReceiptOff,
    IconSettings,
    IconShieldCog,
    IconShoppingBag,
    IconShoppingCart,
    IconSpeakerphone,
    IconTool,
    IconUsers,
} from "@tabler/icons-react";
import styles from "./AdminShell.module.css";

type IconType = typeof IconLayoutDashboard;

type NavLeaf = {
    label: string;
    href: string;
    description: string;
    icon: IconType;
};

type NavGroup = {
    id: string;
    label: string;
    icon: IconType;
    items: NavLeaf[];
};

const dashboard: NavLeaf = {
    label: "Dashboard",
    href: "/admin",
    description: "Overview comenzi și activitate",
    icon: IconLayoutDashboard,
};

const groups: NavGroup[] = [
    {
        id: "rentals",
        label: "Închirieri",
        icon: IconCalendarEvent,
        items: [
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
        ],
    },
    {
        id: "shop",
        label: "Shop",
        icon: IconShoppingCart,
        items: [
            {
                label: "Produse",
                href: "/admin/shop/products",
                description: "Magazin accesorii & îngrijire",
                icon: IconPackage,
            },
            {
                label: "Categorii",
                href: "/admin/shop/categories",
                description: "Organizare magazin",
                icon: IconLayersIntersect,
            },
            {
                label: "Comenzi",
                href: "/admin/shop/orders",
                description: "Comenzi din magazin",
                icon: IconShoppingBag,
            },
        ],
    },
    {
        id: "marketing",
        label: "Marketing",
        icon: IconSpeakerphone,
        items: [
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
        ],
    },
    {
        id: "admin",
        label: "Administrare",
        icon: IconShieldCog,
        items: [
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
        ],
    },
];

const STORAGE_KEY = "adminNavCollapsed";

type CollapsedMap = Record<string, boolean>;

const SERVER_VALUE: CollapsedMap = {};
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: CollapsedMap = {};

function subscribeCollapsed(callback: () => void) {
    listeners.add(callback);
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) callback();
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", onStorage);
    };
}

function getCollapsedSnapshot(): CollapsedMap {
    let raw: string | null = null;
    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch {
        raw = null;
    }
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        try {
            cachedValue = raw ? (JSON.parse(raw) as CollapsedMap) : {};
        } catch {
            cachedValue = {};
        }
    }
    return cachedValue;
}

function getServerCollapsedSnapshot(): CollapsedMap {
    return SERVER_VALUE;
}

function writeCollapsed(next: CollapsedMap) {
    cachedValue = next;
    try {
        cachedRaw = JSON.stringify(next);
        localStorage.setItem(STORAGE_KEY, cachedRaw);
    } catch {
        // ignore quota / private mode
    }
    listeners.forEach((listener) => listener());
}

function isActive(pathname: string, href: string) {
    if (href === "/admin") {
        return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
    const pathname = usePathname();
    const collapsed = useSyncExternalStore(
        subscribeCollapsed,
        getCollapsedSnapshot,
        getServerCollapsedSnapshot,
    );

    const toggle = useCallback((id: string) => {
        const current = getCollapsedSnapshot();
        writeCollapsed({ ...current, [id]: !current[id] });
    }, []);

    const DashboardIcon = dashboard.icon;

    return (
        <nav className={styles.nav}>
            <Link
                href={dashboard.href}
                className={`${styles.navItem} ${
                    isActive(pathname, dashboard.href) ? styles.navItemActive : ""
                }`}
            >
                <span className={styles.navLabel}>
                    <DashboardIcon
                        size={18}
                        stroke={1.7}
                        className={styles.navIcon}
                        aria-hidden="true"
                    />
                    {dashboard.label}
                </span>
                <small>{dashboard.description}</small>
            </Link>

            {groups.map((group) => {
                const GroupIcon = group.icon;
                const groupActive = group.items.some((item) => isActive(pathname, item.href));
                const open = !collapsed[group.id];

                return (
                    <div key={group.id} className={styles.group}>
                        <button
                            type="button"
                            className={`${styles.groupHeader} ${
                                groupActive ? styles.groupHeaderActive : ""
                            }`}
                            onClick={() => toggle(group.id)}
                            aria-expanded={open}
                        >
                            <span className={styles.navLabel}>
                                <GroupIcon
                                    size={18}
                                    stroke={1.7}
                                    className={styles.navIcon}
                                    aria-hidden="true"
                                />
                                {group.label}
                            </span>
                            <IconChevronRight
                                size={16}
                                stroke={2}
                                className={`${styles.groupChevron} ${
                                    open ? styles.groupChevronOpen : ""
                                }`}
                                aria-hidden="true"
                            />
                        </button>

                        {open && (
                            <div className={styles.groupItems}>
                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`${styles.navItem} ${styles.subItem} ${
                                                isActive(pathname, item.href)
                                                    ? styles.navItemActive
                                                    : ""
                                            }`}
                                        >
                                            <span className={styles.navLabel}>
                                                <Icon
                                                    size={16}
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
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
