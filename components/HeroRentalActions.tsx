"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
            <div className="hero-cta fade-in fade-in-delay-3">
            <span className="btn btn-outline-light">
                {t("catalogUnavailable")}
            </span>
            </div>
        );
    }

    return (
        <div className="hero-cta fade-in fade-in-delay-3">
            <RentalDateRangePicker onChange={setRange} />

            {rentEnabled && (
                <Link href={rentHref} className="btn btn-gold">
                    {tCommon("rentVerb")}
                </Link>
            )}

            {buyEnabled && (
                <Link href={buyHref} className="btn btn-outline-light">
                    {tCommon("buyVerb")}
                </Link>
            )}
        </div>
    );
}
