"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RentalDateRangePicker, {
    type RentalRangeValue,
} from "@/components/RentalDateRangePicker";

function buildCatalogHref(mode: "rent" | "buy", range: RentalRangeValue) {
    const params = new URLSearchParams({ mode });
    if (range.startDate) params.set("start", range.startDate);
    if (range.endDate) params.set("end", range.endDate);
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
    const [range, setRange] = useState<RentalRangeValue>({
        startDate: "",
        endDate: "",
    });

    const rentHref = useMemo(() => buildCatalogHref("rent", range), [range]);
    const buyHref = useMemo(() => buildCatalogHref("buy", range), [range]);
    const hasRange = Boolean(range.startDate && range.endDate);

    if (!catalogEnabled || (!rentEnabled && !buyEnabled)) {
        return (
            <div
                role="status"
                className="mt-8 inline-flex rounded-full border border-silk/30 bg-white/5 px-6 py-4 text-sm font-semibold text-silk/90 backdrop-blur-sm"
            >
                {t("catalogUnavailable")}
            </div>
        );
    }

    return (
        <div className="mt-8 flex flex-col gap-4">
            {rentEnabled && (
                <div className="w-full sm:w-72 lg:w-80">
                    <RentalDateRangePicker onChange={setRange} placement="bottom" />
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                {rentEnabled &&
                    (hasRange ? (
                        <Link
                            href={rentHref}
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-dark px-8 text-sm font-bold tracking-wide text-velvet-950 shadow-xl shadow-gold/10 transition-transform duration-300 hover:-translate-y-0.5 hover:from-silk hover:to-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silk focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900 motion-reduce:transition-none motion-reduce:hover:translate-y-0 whitespace-nowrap"
                        >
                            {t("rentLabel")}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            disabled
                            aria-disabled="true"
                            title={t("pickDates")}
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-velvet-800 border border-velvet-700 px-8 text-sm font-semibold tracking-wide text-silk/80 cursor-not-allowed whitespace-nowrap"
                        >
                            {t("pickDates")}
                        </button>
                    ))}

                {buyEnabled && (
                    <Link
                        href={buyHref}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-silk/40 bg-white/5 px-8 text-sm font-semibold tracking-wide text-silk backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900 motion-reduce:transition-none whitespace-nowrap"
                    >
                        {t("buyLabel")}
                    </Link>
                )}
            </div>
        </div>
    );
}
