import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type BuySectionProps = {
    doll: {
        name: string;
        imageUrl: string;
        description: string;
        badge?: string;
    } | null;
    buyEnabled: boolean;
};

const BULLET_KEYS = ["custom", "prepared", "delivery", "support"] as const;

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
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1" />
            <path
                d="M6 10.5 L9 13.5 L14.5 7.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default async function BuySection({ doll, buyEnabled }: BuySectionProps) {
    const t = await getTranslations("home.buy");
    const tCommon = await getTranslations("home.modelCard");

    return (
        <section
            id="buy"
            aria-labelledby="buy-title"
            data-surface="dark"
            className="velvet-buy relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-6 py-24 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
                <div className="order-1">
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
                                    <span className="absolute left-5 top-5 rounded-full border border-gold/60 bg-velvet-950/70 px-4 py-1.5 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold-light backdrop-blur">
                                        {doll.badge}
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10 -mt-10 px-8 pb-8 text-center">
                                <h3 className="font-display text-[clamp(2rem,3.4vw,3rem)] italic leading-none text-silk">
                                    {doll.name}
                                </h3>
                                <p className="mt-5 mx-auto max-w-[28ch] text-sm leading-relaxed text-silk/70">
                                    {doll.description}
                                </p>

                                <div
                                    aria-hidden="true"
                                    className="mx-auto my-6 h-px w-12 bg-gold/40"
                                />

                                <p className="font-heading text-[0.7rem] uppercase tracking-[0.22em] text-gold/80">
                                    {tCommon("voiceModule")}
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

                <div className="order-2 flex flex-col justify-center">
                    <p className="font-heading text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h2
                        id="buy-title"
                        className="mt-5 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-silk"
                    >
                        <span className="block">{t("titleLine1")}</span>
                        <span className="block">
                            {t("titleLine2")}{" "}
                            <span className="italic text-gold-light">
                                {t("titleEmphasis")}
                            </span>
                        </span>
                    </h2>
                    <span
                        aria-hidden="true"
                        className="mt-6 block h-px w-[60px] bg-gold/60"
                    />
                    <p className="mt-7 max-w-[36rem] text-sm leading-relaxed text-silk/70">
                        {t("intro")}
                    </p>

                    <h3 className="mt-12 font-display text-[clamp(1.75rem,3vw,2.75rem)] italic leading-tight text-gold-light">
                        {t("buyTitle")}
                    </h3>

                    <ul className="mt-7 space-y-4">
                        {BULLET_KEYS.map((k) => (
                            <li
                                key={k}
                                className="flex items-start gap-3 text-sm leading-relaxed text-silk/85"
                            >
                                <Check />
                                <span>{t(`bullets.${k}`)}</span>
                            </li>
                        ))}
                    </ul>

                    {buyEnabled && (
                        <div className="mt-10">
                            <Link
                                href="/catalog?mode=buy"
                                className="group inline-flex items-center gap-3 rounded-full border border-gold/60 bg-gradient-to-r from-gold-light/15 to-gold/10 px-7 py-3.5 font-heading text-sm font-semibold tracking-wide text-gold-light transition-all duration-300 hover:border-gold hover:from-gold hover:to-gold-dark hover:text-velvet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                            >
                                {t("ctaBuy")}
                                <span
                                    aria-hidden="true"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 transition-transform duration-300 group-hover:translate-x-0.5"
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                    >
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
                    )}
                </div>
            </div>
        </section>
    );
}
