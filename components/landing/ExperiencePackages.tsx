import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type ExperiencePackagesProps = {
    rentEnabled: boolean;
    buyEnabled: boolean;
    catalogEnabled: boolean;
};

function CheckIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
    );
}

export default async function ExperiencePackages({
    rentEnabled: _rentEnabled,
    buyEnabled: _buyEnabled,
    catalogEnabled: _catalogEnabled,
}: ExperiencePackagesProps) {
    const t = await getTranslations("home.experiences");
    void _rentEnabled;
    void _buyEnabled;
    void _catalogEnabled;

    return (
        <section id="servicii" className="velvet-experience py-24 bg-velvet-900 text-white relative">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(86,18,30,0.4)_0%,transparent_70%)]"
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold bg-velvet-800 px-4 py-2 rounded-full border border-gold/20">
                        {t("badge")}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4 font-serif">
                        {t("title")}
                    </h2>
                    <p className="text-silk/70 font-light text-sm sm:text-base">
                        {t("description")}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center items-stretch">
                    <div className="flex-1 bg-gradient-to-b from-velvet-800/80 to-velvet-900 border border-silk/10 p-8 sm:p-10 rounded-3xl hover:border-gold/30 transition-all duration-300 relative flex flex-col justify-between shadow-xl">
                        <div>
                            <div className="flex justify-between items-start mb-6 gap-3">
                                <div>
                                    <span className="text-xs font-bold tracking-widest text-gold uppercase">
                                        {t("rentSub")}
                                    </span>
                                    <h3 className="text-3xl font-bold mt-1 font-serif">
                                        {t("rentTitle")}
                                    </h3>
                                </div>
                                <div className="bg-velvet-700 text-silk text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-gold/10 whitespace-nowrap">
                                    {t("rentBadge")}
                                </div>
                            </div>
                            <p className="text-silk/80 font-light mb-8 text-sm sm:text-base">
                                {t("rentDescription")}
                            </p>
                            <ul className="space-y-4 mb-10 text-sm font-light text-silk/90 border-t border-velvet-700/50 pt-6">
                                {(["rentItem1", "rentItem2", "rentItem3", "rentItem4"] as const).map((k) => (
                                    <li key={k} className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                                        <span>{t(k)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link
                            href="#contact"
                            className="block w-full text-center bg-velvet-900 border border-gold hover:bg-gold hover:text-velvet-900 text-gold font-bold py-4 rounded-xl transition duration-300 tracking-wider uppercase text-xs"
                        >
                            {t("rentCta")}
                        </Link>
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-velvet-500 via-velvet-700 to-velvet-800 border-2 border-gold p-8 sm:p-10 rounded-3xl relative flex flex-col justify-between shadow-2xl shadow-velvet-500/20 lg:-translate-y-4">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-velvet-900 text-xs font-bold tracking-widest uppercase px-6 py-1.5 rounded-full shadow-md whitespace-nowrap">
                            {t("buyBadge")}
                        </div>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-xs font-bold tracking-widest text-gold-light uppercase">
                                        {t("buySub")}
                                    </span>
                                    <h3 className="text-3xl font-bold mt-1 font-serif text-white">
                                        {t("buyTitle")}
                                    </h3>
                                </div>
                            </div>
                            <p className="text-silk/90 font-light mb-8 text-sm sm:text-base">
                                {t("buyDescription")}
                            </p>
                            <ul className="space-y-4 mb-10 text-sm font-light text-silk border-t border-white/20 pt-6">
                                {(["buyItem1", "buyItem2", "buyItem3", "buyItem4"] as const).map((k) => (
                                    <li key={k} className="flex items-start gap-3">
                                        <CheckIcon className="w-5 h-5 text-gold-light mt-0.5 shrink-0" />
                                        <span>{t(k)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link
                            href="/catalog?mode=buy"
                            className="block w-full text-center bg-gold hover:bg-white hover:text-velvet-900 text-velvet-900 font-extrabold py-4 rounded-xl transition duration-300 tracking-wider uppercase text-xs shadow-lg shadow-velvet-950/40"
                        >
                            {t("buyCta")}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
