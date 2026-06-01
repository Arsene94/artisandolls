import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FeaturedCarousel from "@/components/landing/FeaturedCarousel";
import Eyebrow from "@/components/landing/Eyebrow";
import PrimaryButton from "@/components/landing/PrimaryButton";

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
            <div className="mx-auto w-full max-w-[1440px] px-4 py-24 sm:px-10 lg:px-16">
                <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
                    <div>
                        <Eyebrow>{t("eyebrow")}</Eyebrow>
                        <h2
                            id="featured-title"
                            className="mt-5 font-display text-[28px] leading-[1.35] tracking-tight text-silk lg:text-[clamp(2.25rem,4.5vw,4rem)] lg:leading-[1.05]"
                        >
                            {t("titleLine1")}{" "}
                            <span className="italic text-gold-light">
                                {t("titleEmphasis")}
                            </span>
                        </h2>
                        <span
                            aria-hidden="true"
                            className="mx-auto mt-6 block h-px w-[60px] bg-gold/60 lg:mx-0"
                        />
                    </div>

                    <div className="hidden lg:block">
                        <PrimaryButton
                            href="/catalog"
                            variant="solid"
                            ariaLabel={t("cta")}
                        >
                            {t("cta")}
                        </PrimaryButton>
                    </div>
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
                            className="relative isolate flex w-[252px] max-w-[560px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border border-velvet-800/50 bg-velvet-900/40 shadow-2xl shadow-velvet-950/40 sm:w-[60vw] lg:w-[540px]"
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
                                    <p className="font-sans text-[15px] font-medium uppercase tracking-[0.067em] text-silk/55">
                                        {card.tags.slice(0, 2).join(" · ")}
                                    </p>
                                )}
                                <h3 className="font-display text-[clamp(1.75rem,3vw,3rem)] font-semibold text-silk">
                                    {card.name}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {rentEnabled && (
                                        <Link
                                            href={`/catalog/${card.id}?mode=rent`}
                                            className="rounded border border-gold/60 bg-transparent px-3 py-1.5 font-sans text-[13px] font-medium uppercase tracking-[0.067em] text-ivory transition hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                                        >
                                            {t("badgeRent")}
                                        </Link>
                                    )}
                                    {buyEnabled && (
                                        <Link
                                            href={`/catalog/${card.id}?mode=buy`}
                                            className="rounded border border-transparent px-3 py-1.5 font-sans text-[13px] font-medium uppercase tracking-[0.067em] text-velvet-950 shadow-[0_8px_24px_rgba(201,161,90,0.35)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold motion-reduce:hover:scale-100"
                                            style={{
                                                backgroundImage:
                                                    "linear-gradient(108.19deg, #c9a15a 0.59%, #daffed 103.75%)",
                                            }}
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
