"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FeaturedCarouselProps = {
    children: React.ReactNode;
    labels: {
        rent: string;
        buy: string;
        prev: string;
        next: string;
    };
    rentEnabled: boolean;
    buyEnabled: boolean;
};

export default function FeaturedCarousel({
    children,
    labels,
}: FeaturedCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const update = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        update();
        el.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            el.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [update]);

    const scrollBy = (dir: 1 | -1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const card = el.querySelector("article");
        const step = card ? (card as HTMLElement).offsetWidth + 24 : 380;
        el.scrollBy({ left: dir * step, behavior: "smooth" });
    };

    return (
        <div className="mt-14">
            <div
                ref={scrollerRef}
                className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:-mx-16 lg:px-16 lg:[&::-webkit-scrollbar]:hidden"
            >
                {children}
            </div>

            <div className="mt-2 flex items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={() => scrollBy(-1)}
                    disabled={!canScrollLeft}
                    aria-label={labels.prev}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-velvet-950/40 text-silk/85 transition disabled:cursor-not-allowed disabled:border-velvet-800 disabled:bg-transparent disabled:text-silk/30 hover:enabled:border-gold hover:enabled:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                            d="M11.5 7H2.5M2.5 7L6.5 3M2.5 7L6.5 11"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => scrollBy(1)}
                    disabled={!canScrollRight}
                    aria-label={labels.next}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-velvet-950/40 text-silk/85 transition disabled:cursor-not-allowed disabled:border-velvet-800 disabled:bg-transparent disabled:text-silk/30 hover:enabled:border-gold hover:enabled:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                            d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
