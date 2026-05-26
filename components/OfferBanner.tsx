"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
    offerBadgeLabel,
    offerSubtitle,
    offerTitle,
    type OfferRow,
} from "@/lib/offers/shared";

type Props = {
    offers: OfferRow[];
    locale: string;
};

const DISMISS_EVENT = "ad-offer-dismiss";

function dismissKey(id: string) {
    return `ad_offer_dismissed_${id}`;
}

/**
 * Homepage promo strip for the highest-priority live offer flagged
 * show_on_homepage. Dismissible per-offer (remembered in localStorage). The
 * dismissed flag is read via useSyncExternalStore so it stays hydration-safe.
 */
export default function OfferBanner({ offers, locale }: Props) {
    const offer = offers[0] ?? null;

    const subscribe = useCallback((onChange: () => void) => {
        window.addEventListener(DISMISS_EVENT, onChange);
        window.addEventListener("storage", onChange);
        return () => {
            window.removeEventListener(DISMISS_EVENT, onChange);
            window.removeEventListener("storage", onChange);
        };
    }, []);

    const dismissed = useSyncExternalStore(
        subscribe,
        () =>
            offer
                ? window.localStorage.getItem(dismissKey(offer.id)) === "1"
                : true,
        () => true, // server / pre-hydration: render nothing
    );

    if (!offer || dismissed) return null;

    const badge = offerBadgeLabel(offer, locale);
    const title = offerTitle(offer, locale);
    const subtitle = offerSubtitle(offer, locale);
    if (!title && !badge) return null;

    const dismiss = () => {
        window.localStorage.setItem(dismissKey(offer.id), "1");
        window.dispatchEvent(new Event(DISMISS_EVENT));
    };

    const accentStyle = offer.accent
        ? { borderColor: offer.accent, boxShadow: `0 0 40px -28px ${offer.accent}` }
        : undefined;

    return (
        <section
            aria-label={title ?? badge ?? "Ofertă"}
            className="bg-velvet-950 px-4 sm:px-6 lg:px-8"
        >
            <div
                style={accentStyle}
                className="max-w-7xl mx-auto -mt-px relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-velvet-900 via-velvet-900/80 to-velvet-950 px-5 py-4 sm:px-8 sm:py-5 flex items-center gap-4 flex-wrap"
            >
                {badge ? (
                    <span className="inline-flex items-center rounded-full bg-gold text-velvet-950 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] shrink-0">
                        {badge}
                    </span>
                ) : null}
                <div className="flex-1 min-w-[12rem]">
                    {title ? (
                        <p className="font-display italic text-lg sm:text-xl text-silk leading-tight">
                            {title}
                        </p>
                    ) : null}
                    {subtitle ? (
                        <p className="mt-0.5 text-[0.85rem] text-silk/70">{subtitle}</p>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Închide oferta"
                    className="shrink-0 text-silk/55 hover:text-silk text-xl leading-none px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                    ×
                </button>
            </div>
        </section>
    );
}
