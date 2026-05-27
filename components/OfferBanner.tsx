"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
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
 * Site-wide promotional strip for the highest-priority live offer flagged for
 * the banner. A thin, full-width bar pinned directly beneath the fixed navbar
 * (z-40, below the navbar's z-50). Dismissible per-offer for the current visit
 * only — the dismissed flag lives in sessionStorage, so closing it hides the
 * strip while the visitor browses but it reappears on their next visit. The
 * flag is read via useSyncExternalStore so it stays hydration-safe. Copy
 * resolves from preset/auto-translation upstream in `localizeOffers`, so the
 * shared label pickers already hold the localized text.
 */
export default function OfferBanner({ offers, locale }: Props) {
    const t = useTranslations("offers");
    const offer = offers[0] ?? null;

    const subscribe = useCallback((onChange: () => void) => {
        window.addEventListener(DISMISS_EVENT, onChange);
        return () => {
            window.removeEventListener(DISMISS_EVENT, onChange);
        };
    }, []);

    const dismissed = useSyncExternalStore(
        subscribe,
        () =>
            offer
                ? window.sessionStorage.getItem(dismissKey(offer.id)) === "1"
                : true,
        () => true, // server / pre-hydration: render nothing
    );

    if (!offer || dismissed) return null;

    const badge = offerBadgeLabel(offer, locale);
    const title = offerTitle(offer, locale);
    const subtitle = offerSubtitle(offer, locale);
    if (!title && !badge) return null;

    const dismiss = () => {
        window.sessionStorage.setItem(dismissKey(offer.id), "1");
        window.dispatchEvent(new Event(DISMISS_EVENT));
    };

    const accentStyle = offer.accent ? { backgroundColor: offer.accent } : undefined;

    return (
        <div
            className="fixed inset-x-0 top-16 sm:top-20 lg:top-24 z-40"
            role="region"
            aria-label={title ?? badge ?? undefined}
        >
            <div
                style={accentStyle}
                className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-velvet-950 shadow-md shadow-velvet-950/30"
            >
                <div className="max-w-7xl mx-auto h-8 px-4 sm:px-6 lg:px-8 flex items-center gap-2.5">
                    {badge ? (
                        <span className="inline-flex items-center rounded-full bg-velvet-950 text-gold px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] shrink-0">
                            {badge}
                        </span>
                    ) : null}
                    {title || subtitle ? (
                        <p className="flex-1 min-w-0 truncate text-[0.72rem] sm:text-xs leading-none">
                            {title ? (
                                <span className="font-semibold">{title}</span>
                            ) : null}
                            {subtitle ? (
                                <span className="hidden sm:inline opacity-80">
                                    {title ? " — " : ""}
                                    {subtitle}
                                </span>
                            ) : null}
                        </p>
                    ) : null}
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label={t("dismiss")}
                        className="shrink-0 -mr-1 text-velvet-950/70 hover:text-velvet-950 text-base leading-none px-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velvet-950"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}
