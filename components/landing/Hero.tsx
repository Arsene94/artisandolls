import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HeroRentalActions from "@/components/HeroRentalActions";

export type HeroDoll = {
    name: string;
    image: string;
    height?: string;
    description?: string;
};

type HeroProps = {
    heroDoll: HeroDoll | null;
    fallbackImage: string;
    catalogEnabled: boolean;
    rentEnabled: boolean;
    buyEnabled: boolean;
};

export default async function Hero({
    heroDoll,
    fallbackImage,
    catalogEnabled,
    rentEnabled,
    buyEnabled,
}: HeroProps) {
    const t = await getTranslations("home.hero");

    const image = heroDoll?.image ?? fallbackImage;
    const displayName = heroDoll?.name ?? t("fallbackName");
    const heightLabel = heroDoll?.height ?? t("fallbackHeight");
    const description = heroDoll?.description ?? t("cardDescription");

    return (
        <section
            id="hero"
            className="velvet-hero relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-screen flex items-center bg-velvet-900 text-white"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute top-1/4 left-[10%] w-80 h-80 bg-velvet-500/20 rounded-full blur-[100px] animate-pulse-slow"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-1/4 right-[10%] w-[450px] h-[450px] bg-gold/10 rounded-full blur-[120px] animate-pulse-slow"
                style={{ animationDelay: "4s" }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="flex flex-wrap items-center -mx-4">
                    <div className="w-full lg:w-6/12 px-4 mb-12 lg:mb-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-velvet-800/80 border border-gold/30 rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                                {t("tag")}
                            </span>
                        </div>

                        <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-serif">
                            {t("titleLine1")}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-velvet-300 to-gold italic font-normal">
                                {t("titleEmphasis")}
                            </span>
                        </h1>

                        <p className="mb-8 text-base sm:text-lg text-silk/80 font-light leading-relaxed">
                            {t("description")}
                        </p>

                        <HeroRentalActions
                            catalogEnabled={catalogEnabled}
                            rentEnabled={rentEnabled}
                            buyEnabled={buyEnabled}
                        />

                        <div className="mt-12 pt-8 border-t border-velvet-800/80 grid grid-cols-3 gap-4 text-center sm:text-left">
                            <div>
                                <p className="text-2xl sm:text-3xl font-bold text-gold font-serif">
                                    {t("trust1Value")}
                                </p>
                                <p className="text-xs text-silk/60 font-medium tracking-wider uppercase">
                                    {t("trust1Label")}
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-bold text-gold font-serif">
                                    {t("trust2Value")}
                                </p>
                                <p className="text-xs text-silk/60 font-medium tracking-wider uppercase">
                                    {t("trust2Label")}
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-bold text-gold font-serif">
                                    {t("trust3Value")}
                                </p>
                                <p className="text-xs text-silk/60 font-medium tracking-wider uppercase">
                                    {t("trust3Label")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-6/12 px-4 relative flex justify-center">
                        <div className="relative w-full max-w-[480px] h-[520px] sm:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gold/20 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-velvet-900 via-transparent to-transparent z-10" />

                            <Image
                                src={image}
                                alt={displayName}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 480px"
                                className="object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out brightness-90 contrast-105"
                                unoptimized={image.includes("placehold.co")}
                            />

                            <div className="absolute top-4 left-4 z-20 bg-velvet-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-gold/30 text-xs font-semibold text-gold tracking-widest uppercase">
                                {t("badgeTop")}
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <p className="text-xs text-gold font-bold tracking-widest uppercase mb-1">
                                    {t("badgeBottom")}
                                </p>
                                <h3 className="text-2xl font-bold text-white font-serif mb-2">
                                    {displayName}
                                    {heightLabel ? ` — ${heightLabel}` : ""}
                                </h3>
                                <p className="text-xs text-silk/70 font-light line-clamp-2">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
