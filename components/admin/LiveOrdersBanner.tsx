"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtime } from "@/lib/upstash/realtime-client";

type Toast = {
    id: string;
    orderNumber: string;
    dollName: string;
    customerName: string;
    total: number;
    mode: "rent" | "buy";
};

const TOAST_TTL_MS = 12_000;

export default function LiveOrdersBanner() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, number>>(new Map());

    const dismiss = useCallback((id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            window.clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    useRealtime({
        events: ["new-order"],
        onData({ data }) {
            setToasts((current) => [
                ...current,
                {
                    id: data.orderId,
                    orderNumber: data.orderNumber,
                    dollName: data.dollName,
                    customerName: data.customerName,
                    total: data.total,
                    mode: data.mode,
                },
            ]);
            const timer = window.setTimeout(
                () => dismiss(data.orderId),
                TOAST_TTL_MS,
            );
            timersRef.current.set(data.orderId, timer);
        },
    });

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
            timers.clear();
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <ol
            aria-live="polite"
            aria-label="Live orders"
            className="fixed bottom-6 right-6 z-[80] flex flex-col gap-2 max-w-sm list-none p-0 m-0"
        >
            {toasts.map((toast) => (
                <li
                    key={toast.id}
                    className="rounded-2xl bg-velvet-950/95 border border-gold/40 px-5 py-4 shadow-2xl text-silk"
                >
                    <div className="flex items-start gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-1 w-2 h-2 rounded-full bg-gold animate-pulse"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/80">
                                {toast.mode === "rent" ? "Închiriere nouă" : "Achiziție nouă"}{" "}
                                · {toast.orderNumber}
                            </p>
                            <p className="font-display italic text-lg leading-tight mt-1">
                                {toast.dollName}
                            </p>
                            <p className="text-sm text-silk/75 mt-0.5">
                                {toast.customerName}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Închide notificarea"
                            className="text-silk/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1"
                        >
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </li>
            ))}
        </ol>
    );
}
