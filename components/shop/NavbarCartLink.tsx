"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const COUNT_COOKIE = "ad_cart_count";

function readCartCount(): number {
    if (typeof document === "undefined") return 0;
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${COUNT_COOKIE}=(\\d+)`),
    );
    return match ? Number(match[1]) : 0;
}

function subscribe(callback: () => void): () => void {
    if (typeof window === "undefined") return () => undefined;
    const interval = window.setInterval(callback, 5000);
    const onFocus = () => callback();
    const onVisibility = () => {
        if (!document.hidden) callback();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
        window.clearInterval(interval);
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onVisibility);
    };
}

export default function NavbarCartLink() {
    const t = useTranslations("shop");
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // Hydration boundary: render zero on the server, the real count after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const count = useSyncExternalStore(
        subscribe,
        () => readCartCount(),
        () => 0,
    );
    const displayCount = mounted ? count : 0;

    return (
        <Link
            href="/shop/cart"
            aria-label={t("cart")}
            className="relative inline-flex items-center justify-center w-11 h-11 rounded-full text-silk/85 hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
        >
            <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M3 4h2l2.4 12.1a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.8L20 8H6" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
            </svg>
            {displayCount > 0 ? (
                <span
                    aria-label={`${displayCount}`}
                    className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 inline-flex items-center justify-center rounded-full bg-gold text-velvet-950 text-[0.65rem] font-bold leading-none"
                >
                    {displayCount > 99 ? "99+" : displayCount}
                </span>
            ) : null}
        </Link>
    );
}
