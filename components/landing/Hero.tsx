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

function buildAltText(name: string, height: string | undefined, description: string) {
    const parts = [name];
    if (height) parts.push(height);
    const short = description.replace(/\s+/g, " ").trim();
    if (short) parts.push(short.slice(0, 120));
    return parts.join(" — ");
}

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
    const altText = buildAltText(displayName, heightLabel, description);

    return (
        <section
            id="hero"
            aria-labelledby="hero-title"
            data-surface="dark"
            className="velvet-hero relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden min-h-screen flex items-center bg-velvet-950 text-silk isolate"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-velvet-950 via-velvet-900 to-velvet-800/50 pointer-events-none"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/4 left-[10%] w-80 h-80 bg-velvet-500/18 rounded-full blur-[120px] motion-safe:animate-pulse-slow"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1/4 right-[10%] w-[450px] h-[450px] bg-gold/10 rounded-full blur-[140px] motion-safe:animate-pulse-slow"
                style={{ animationDelay: "4s" }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <div className="inline-flex items-center gap-3 px-3.5 py-2 bg-velvet-900/80 border border-gold/40 rounded-full mb-7 backdrop-blur-sm">
                            <span
                                aria-hidden="true"
                                className="w-1.5 h-1.5 rounded-full bg-gold motion-safe:animate-ping"
                            />
                            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold-light">
                                {t("tag")}
                            </span>
                        </div>

                        <h1
                            id="hero-title"
                            className="mb-7 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] font-display font-medium text-silk"
                        >
                            {t("titleLine1")}
                            <span className="block italic text-gold-light mt-1">
                                {t("titleEmphasis")}
                            </span>
                        </h1>

                        <p className="mb-9 text-base sm:text-lg text-silk/75 font-light leading-relaxed max-w-xl">
                            {t("description")}
                        </p>

                        <HeroRentalActions
                            catalogEnabled={catalogEnabled}
                            rentEnabled={rentEnabled}
                            buyEnabled={buyEnabled}
                        />

                        <dl className="mt-12 pt-8 border-t border-velvet-700 grid grid-cols-3 gap-4 text-center sm:text-left">
                            <div>
                                <dt className="sr-only">{t("trust1Label")}</dt>
                                <dd>
                                    <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-gold tabular-nums">
                                        {t("trust1Value")}
                                    </p>
                                    <p className="mt-1.5 text-[0.7rem] sm:text-xs text-silk/70 font-medium tracking-[0.14em] uppercase leading-snug">
                                        {t("trust1Label")}
                                    </p>
                                </dd>
                            </div>
                            <div>
                                <dt className="sr-only">{t("trust2Label")}</dt>
                                <dd>
                                    <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-gold tabular-nums">
                                        {t("trust2Value")}
                                    </p>
                                    <p className="mt-1.5 text-[0.7rem] sm:text-xs text-silk/70 font-medium tracking-[0.14em] uppercase leading-snug">
                                        {t("trust2Label")}
                                    </p>
                                </dd>
                            </div>
                            <div>
                                <dt className="sr-only">{t("trust3Label")}</dt>
                                <dd>
                                    <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-gold">
                                        {t("trust3Value")}
                                    </p>
                                    <p className="mt-1.5 text-[0.7rem] sm:text-xs text-silk/70 font-medium tracking-[0.14em] uppercase leading-snug">
                                        {t("trust3Label")}
                                    </p>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[460px] aspect-[4/5]">
                            <div
                                aria-hidden="true"
                                className="absolute -top-5 -right-5 w-[70%] h-[70%] border border-gold/30 z-0"
                            />
                            <div
                                aria-hidden="true"
                                className="absolute -bottom-5 -left-5 w-[50%] h-[50%] border border-velvet-500/30 z-0"
                            />

                            <div className="relative w-full h-full overflow-hidden border border-gold/25 shadow-2xl z-10">
                                <Image
                                    src={image}
                                    alt={altText}
                                    fill
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 460px"
                                    className="object-cover object-[center_25%]"
                                    unoptimized={image.includes("placehold.co")}
                                />

                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-gradient-to-t from-velvet-950 via-velvet-950/10 to-transparent"
                                />

                                <figcaption className="absolute bottom-5 left-5 right-5 z-10">
                                    <p className="text-[0.7rem] text-gold tracking-[0.22em] uppercase mb-1">
                                        {t("badgeBottom")}
                                    </p>
                                    <p className="font-display italic text-2xl text-silk leading-tight">
                                        {displayName}
                                        {heightLabel ? (
                                            <span className="text-silk/75 font-normal not-italic">
                                                {" "}— {heightLabel}
                                            </span>
                                        ) : null}
                                    </p>
                                    <p className="mt-1 text-[0.78rem] text-silk/80 line-clamp-2 leading-snug">
                                        {description}
                                    </p>
                                </figcaption>
                            </div>
                        </div>
                    </div>
                </div>

                <a
                    href="#galerie"
                    aria-label={t("btnModels")}
                    className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-silk/55 hover:text-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-2"
                >
                    <span className="text-[0.7rem] tracking-[0.22em] uppercase">
                        Scroll
                    </span>
                    <span aria-hidden="true" className="scroll-line" />
                </a>
            </div>
        </section>
    );
}
