import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FeaturedCarousel from "@/components/landing/FeaturedCarousel";

export type FeaturedCard = {
    id: string;
    name: string;
    imageUrl: string;
    tags: string[];
};

type FeaturedSectionProps = {
    cards: FeaturedCard[];
    rentEnabled: boolean;
    buyEnabled: boolean;
};

export default async function FeaturedSection({
    cards,
    rentEnabled,
    buyEnabled,
}: FeaturedSectionProps) {
    const t = await getTranslations("home.featured");

    if (cards.length === 0) return null;

    return (
        <section
            id="featured"
            aria-labelledby="featured-title"
            data-surface="dark"
            className="velvet-featured relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="font-heading text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                            {t("eyebrow")}
                        </p>
                        <h2
                            id="featured-title"
                            className="mt-5 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-silk"
                        >
                            {t("titleLine1")}{" "}
                            <span className="italic text-gold-light">
                                {t("titleEmphasis")}
                            </span>
                        </h2>
                        <span
                            aria-hidden="true"
                            className="mt-6 block h-px w-[60px] bg-gold/60"
                        />
                    </div>

                    <Link
                        href="/catalog"
                        className="group inline-flex w-fit items-center gap-3 rounded-full border border-gold/60 bg-gradient-to-r from-gold-light/15 to-gold/10 px-6 py-3 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-gold-light transition-all duration-300 hover:border-gold hover:from-gold hover:to-gold-dark hover:text-velvet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                    >
                        {t("cta")}
                        <span
                            aria-hidden="true"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 transition-transform duration-300 group-hover:translate-x-0.5"
                        >
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </Link>
                </div>

                <FeaturedCarousel
                    labels={{
                        rent: t("badgeRent"),
                        buy: t("badgeBuy"),
                        prev: t("prevAria"),
                        next: t("nextAria"),
                    }}
                    rentEnabled={rentEnabled}
                    buyEnabled={buyEnabled}
                >
                    {cards.map((card) => (
                        <article
                            key={card.id}
                            className="relative isolate flex w-[80vw] max-w-[560px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border border-velvet-800/50 bg-velvet-900/40 shadow-2xl shadow-velvet-950/40 sm:w-[60vw] lg:w-[540px]"
                        >
                            <div className="relative aspect-[3/4] w-full">
                                <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    fill
                                    sizes="(max-width: 768px) 80vw, 540px"
                                    className="object-cover object-[center_15%]"
                                    unoptimized={card.imageUrl.includes("placehold.co")}
                                />
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-velvet-950 via-velvet-950/70 to-transparent"
                                />
                                {card.tags[0] && (
                                    <span className="absolute right-4 top-4 rounded border border-velvet-700/70 bg-velvet-950/80 px-3 py-1 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-silk/85 backdrop-blur">
                                        {card.tags[0]}
                                    </span>
                                )}
                            </div>

                            <div className="relative -mt-24 flex flex-1 flex-col gap-4 px-6 pb-6">
                                {card.tags.length > 0 && (
                                    <p className="font-heading text-[0.62rem] uppercase tracking-[0.22em] text-silk/55">
                                        {card.tags.slice(0, 2).join(" · ")}
                                    </p>
                                )}
                                <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] italic text-silk">
                                    {card.name}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {rentEnabled && (
                                        <Link
                                            href={`/catalog/${card.id}?mode=rent`}
                                            className="rounded border border-gold/50 bg-velvet-950/40 px-3 py-1.5 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-silk/90 transition hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                                        >
                                            {t("badgeRent")}
                                        </Link>
                                    )}
                                    {buyEnabled && (
                                        <Link
                                            href={`/catalog/${card.id}?mode=buy`}
                                            className="rounded border border-gold/50 bg-velvet-950/40 px-3 py-1.5 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-silk/90 transition hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                                        >
                                            {t("badgeBuy")}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </FeaturedCarousel>
            </div>
        </section>
    );
}
