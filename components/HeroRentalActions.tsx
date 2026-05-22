"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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

type HeroRentalActionsProps = {
    catalogEnabled: boolean;
    rentEnabled: boolean;
    buyEnabled: boolean;
};

export default function HeroRentalActions({
    catalogEnabled,
    rentEnabled,
    buyEnabled,
}: HeroRentalActionsProps) {
    const t = useTranslations("heroActions");
    const tCommon = useTranslations("common");
    const [range, setRange] = useState<RentalRangeValue>({
        startDate: "",
        endDate: "",
    });

    const rentHref = useMemo(() => buildCatalogHref("rent", range), [range]);
    const buyHref = useMemo(() => buildCatalogHref("buy", range), [range]);

    if (!catalogEnabled || (!rentEnabled && !buyEnabled)) {
        return (
            <div className="mt-8 inline-flex rounded-full border border-silk/30 bg-white/5 px-6 py-4 text-sm font-semibold text-silk/80 backdrop-blur-sm">
                {t("catalogUnavailable")}
            </div>
        );
    }

    return (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-[320px]">
                <RentalDateRangePicker onChange={setRange} />
            </div>

            {rentEnabled && (
                <Link
                    href={rentHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-dark px-8 text-sm font-bold tracking-wide text-velvet-950 shadow-xl shadow-gold/10 transition-all duration-300 hover:-translate-y-1 hover:from-white hover:to-silk"
                >
                    {tCommon("rent")}
                </Link>
            )}

            {buyEnabled && (
                <Link
                    href={buyHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-silk/30 bg-white/5 px-8 text-sm font-semibold tracking-wide text-silk backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:text-gold"
                >
                    {tCommon("buy")}
                </Link>
            )}
        </div>
    );
}
