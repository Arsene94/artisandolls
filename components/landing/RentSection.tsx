import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Eyebrow from "@/components/landing/Eyebrow";
import PrimaryButton from "@/components/landing/PrimaryButton";

type RentSectionProps = {
    doll: {
        name: string;
        imageUrl: string;
        description: string;
        badge?: string;
    } | null;
    rentEnabled: boolean;
};

const BULLET_KEYS = ["duration", "hygiene", "delivery", "experience"] as const;

function Check() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-gold mt-0.5"
        >
            <path
                d="M4 10.5 L8.5 15 L16 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default async function RentSection({ doll, rentEnabled }: RentSectionProps) {
    const t = await getTranslations("home.rent");
    const tCommon = await getTranslations("home.modelCard");

    return (
        <section
            id="rent"
            aria-labelledby="rent-title"
            data-surface="dark"
            className="velvet-rent relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16 lg:py-24">
                {/* Text column — on mobile `display:contents` hoists the header/details
                    into the grid so the model card can sit between them (Figma order:
                    header → card → details). On lg it is the left flex column. */}
                <div className="contents lg:order-1 lg:flex lg:flex-col lg:justify-center">
                    <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
                        <Eyebrow>{t("eyebrow")}</Eyebrow>
                        <h2
                            id="rent-title"
                            className="mt-5 font-display text-[28px] leading-[1.3] tracking-tight text-silk lg:text-[clamp(2.25rem,4.5vw,4rem)] lg:leading-[1.05]"
                        >
                            {t("titleLine1")}{" "}
                            <span className="italic text-gold">
                                {t("titleEmphasis")}
                            </span>
                        </h2>
                        <span
                            aria-hidden="true"
                            className="mt-6 block h-px w-[60px] bg-[#6a5330]"
                        />
                        <p className="mt-7 max-w-[36rem] text-[12px] leading-relaxed text-[#b9b2aa] lg:text-[18px]">
                            {t("intro")}
                        </p>
                    </div>

                    <div className="order-3 flex flex-col items-start text-left">
                        <h3 className="mt-2 font-display text-[26px] italic leading-tight text-gold lg:mt-12 lg:text-[clamp(1.75rem,3vw,2.75rem)]">
                            {t("rentTitle")}
                        </h3>

                        <ul className="mt-7 w-full space-y-4">
                            {BULLET_KEYS.map((k) => (
                                <li
                                    key={k}
                                    className="flex items-start gap-3 text-[12px] leading-relaxed text-[#b9b2aa] lg:text-[18px]"
                                >
                                    <Check />
                                    <span>{t(`bullets.${k}`)}</span>
                                </li>
                            ))}
                        </ul>

                        {rentEnabled && (
                            <PrimaryButton
                                href="/catalog?mode=rent"
                                variant="solid"
                                ariaLabel={t("ctaRent")}
                                className="mt-10 self-start"
                            >
                                {t("ctaRent")}
                            </PrimaryButton>
                        )}
                    </div>
                </div>

                <div className="order-2 lg:order-2">
                    {doll ? (
                        <article className="relative isolate overflow-hidden rounded-[28px] border border-velvet-800/60 bg-gradient-to-b from-velvet-900/60 to-velvet-950/90 shadow-2xl shadow-velvet-950/60">
                            <div className="relative aspect-[3/4] w-full">
                                <Image
                                    src={doll.imageUrl}
                                    alt={doll.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 630px"
                                    className="object-cover object-[center_15%]"
                                    unoptimized={doll.imageUrl.includes("placehold.co")}
                                />
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-velvet-950 via-velvet-950/70 to-transparent"
                                />
                                {doll.badge && (
                                    <span className="absolute right-5 top-5 rounded-full border border-gold/60 bg-velvet-950/70 px-4 py-1.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold-light backdrop-blur">
                                        {doll.badge}
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10 -mt-10 px-8 pb-8 text-center">
                                <h3 className="font-display text-[26px] italic leading-none text-silk lg:text-[clamp(2rem,3.4vw,3rem)]">
                                    {doll.name}
                                </h3>
                                <p className="mt-5 mx-auto max-w-[28ch] text-[12px] leading-relaxed text-silk/70 lg:text-sm">
                                    {doll.description}
                                </p>

                                <div
                                    aria-hidden="true"
                                    className="mx-auto my-6 h-px w-12 bg-gold/40"
                                />

                                <p className="font-heading text-[0.7rem] uppercase tracking-[0.22em] text-gold/80">
                                    {tCommon("heatingIncluded")}
                                </p>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <span className="flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-velvet-950/40 px-4 py-2.5 text-[0.78rem] font-medium text-silk/80">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                            className="text-gold"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                            <path
                                                d="M12 7v5l3 2"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        {tCommon("rent")}
                                    </span>
                                    <span className="flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-velvet-950/40 px-4 py-2.5 text-[0.78rem] font-medium text-silk/80">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                            className="text-gold"
                                        >
                                            <path
                                                d="M3 7h18l-2 12H5L3 7z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M8 7V5a4 4 0 1 1 8 0v2"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                        {tCommon("buy")}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
