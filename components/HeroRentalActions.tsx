"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            {rentEnabled && (
                <Link
                    href="/catalog?mode=rent"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-dark px-8 text-sm font-bold tracking-wide text-velvet-950 shadow-xl shadow-gold/10 transition-transform duration-300 hover:-translate-y-0.5 hover:from-silk hover:to-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silk focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900 motion-reduce:transition-none motion-reduce:hover:translate-y-0 whitespace-nowrap"
                >
                    {t("rentLabel")}
                </Link>
            )}

            {buyEnabled && (
                <Link
                    href="/catalog?mode=buy"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-silk/40 bg-white/5 px-8 text-sm font-semibold tracking-wide text-silk backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900 motion-reduce:transition-none whitespace-nowrap"
                >
                    {t("buyLabel")}
                </Link>
            )}
        </div>
    );
}
