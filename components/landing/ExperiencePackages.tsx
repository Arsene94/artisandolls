import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type ExperiencePackagesProps = {
    rentEnabled: boolean;
    buyEnabled: boolean;
    catalogEnabled: boolean;
};

function CheckIcon() {
    return (
        <svg
            className="w-5 h-5 mt-0.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export default async function ExperiencePackages({
    rentEnabled,
    buyEnabled,
    catalogEnabled,
}: ExperiencePackagesProps) {
    const t = await getTranslations("home.experiences");

    if (!rentEnabled && !buyEnabled) return null;

    const rentHref = catalogEnabled ? "/catalog?mode=rent" : "/#contact?interest=rent";
    const buyHref = catalogEnabled ? "/catalog?mode=buy" : "/#contact?interest=buy";

    return (
        <section
            id="servicii"
            aria-labelledby="experiences-title"
            data-surface="dark"
            className="py-24 bg-velvet-900 text-silk relative"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,50,78,0.25)_0%,transparent_70%)] pointer-events-none"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
                    <span className="inline-block text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold bg-velvet-800 px-4 py-2 rounded-full border border-gold/30">
                        {t("badge")}
                    </span>
                    <h2
                        id="experiences-title"
                        className="font-display italic font-medium text-3xl sm:text-4xl lg:text-5xl mt-5 mb-5 leading-[1.1]"
                    >
                        {t("title")}
                    </h2>
                    <p className="text-silk/80 leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 md:gap-8 items-stretch">
                    {rentEnabled ? (
                        <article className="relative bg-gradient-to-b from-velvet-800/60 to-velvet-950 border-2 border-gold rounded-3xl p-8 sm:p-10 shadow-2xl shadow-velvet-950/40 flex flex-col">
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-velvet-950 text-[0.7rem] font-semibold tracking-[0.18em] uppercase px-5 py-1.5 rounded-full whitespace-nowrap">
                                {t("rentBadge")}
                            </span>
                            <header className="mb-6">
                                <p className="text-[0.72rem] tracking-[0.18em] uppercase text-gold-light">
                                    {t("rentSub")}
                                </p>
                                <h3 className="font-display italic font-medium text-2xl sm:text-3xl mt-2 text-silk">
                                    {t("rentTitle")}
                                </h3>
                            </header>
                            <p className="text-silk/85 mb-8 text-[0.95rem] leading-relaxed">
                                {t("rentDescription")}
                            </p>
                            <ul className="space-y-3 mb-10 text-[0.92rem] text-silk/95 border-t border-gold/15 pt-6">
                                {(["rentItem1", "rentItem2", "rentItem3", "rentItem4"] as const).map((k) => (
                                    <li key={k} className="flex items-start gap-3 text-gold-light">
                                        <CheckIcon />
                                        <span className="text-silk/95">{t(k)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={rentHref}
                                className="mt-auto block w-full text-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-4 rounded-xl tracking-[0.16em] uppercase text-xs transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                            >
                                {t("rentCta")}
                            </Link>
                        </article>
                    ) : null}

                    {buyEnabled ? (
                        <article
                            className={`relative bg-velvet-950 border border-gold/25 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col ${
                                rentEnabled ? "" : "md:col-span-2 md:max-w-2xl md:mx-auto"
                            }`}
                        >
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-velvet-700 text-silk text-[0.7rem] font-semibold tracking-[0.18em] uppercase px-5 py-1.5 rounded-full border border-gold/30 whitespace-nowrap">
                                {t("buyBadge")}
                            </span>
                            <header className="mb-6">
                                <p className="text-[0.72rem] tracking-[0.18em] uppercase text-gold-light/70">
                                    {t("buySub")}
                                </p>
                                <h3 className="font-display italic font-medium text-2xl sm:text-3xl mt-2 text-silk">
                                    {t("buyTitle")}
                                </h3>
                            </header>
                            <p className="text-silk/80 mb-8 text-[0.95rem] leading-relaxed">
                                {t("buyDescription")}
                            </p>
                            <ul className="space-y-3 mb-10 text-[0.92rem] text-silk/90 border-t border-velvet-800 pt-6">
                                {(["buyItem1", "buyItem2", "buyItem3", "buyItem4"] as const).map((k) => (
                                    <li key={k} className="flex items-start gap-3 text-gold">
                                        <CheckIcon />
                                        <span className="text-silk/90">{t(k)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={buyHref}
                                className="mt-auto block w-full text-center bg-velvet-950 border border-gold/50 hover:bg-velvet-900 hover:border-gold text-silk font-semibold py-4 rounded-xl tracking-[0.16em] uppercase text-xs transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                            >
                                {t("buyCta")}
                            </Link>
                        </article>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
