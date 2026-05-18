"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";

function buildCatalogHref(mode: "rent" | "buy", range: RentalRangeValue) {
    const params = new URLSearchParams({
        mode,
    });

    if (range.startDate) {
        params.set("start", range.startDate);
    }

    if (range.endDate) {
        params.set("end", range.endDate);
    }

    return `/catalog?${params.toString()}`;
}

export default function HeroRentalActions() {
    const [range, setRange] = useState<RentalRangeValue>({
        startDate: "",
        endDate: "",
    });

    const rentHref = useMemo(() => buildCatalogHref("rent", range), [range]);
    const buyHref = useMemo(() => buildCatalogHref("buy", range), [range]);

    return (
        <div className="hero-cta fade-in fade-in-delay-3">
            <RentalDateRangePicker onChange={setRange} />

            <Link href={rentHref} className="btn btn-gold">
                Închiriază
            </Link>

            <Link href={buyHref} className="btn btn-outline-light">
                Cumpără
            </Link>
        </div>
    );
}
