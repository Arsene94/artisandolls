import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatPricePerDay } from "@/i18n/format";
import ModelInquiryButton from "@/components/landing/ModelInquiryButton";
import type { Locale } from "@/i18n/routing";
import type { Doll } from "@/lib/dolls";

export type CompanionCard = Doll & {
    imageUrl: string;
};

type CompanionCollectionProps = {
    dolls: CompanionCard[];
    currency?: string;
    whatsappPhone?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
};

const BADGES = [
    {
        label: "badgeBestseller",
        className: "bg-gold text-velvet-950",
    },
    {
        label: "badgeNew",
        className: "bg-velvet-500 text-silk",
    },
    {
        label: "badgeLimited",
        className: "bg-velvet-950 text-gold border border-gold/40",
    },
];

const UPGRADES = ["badgeHeat", "badgeSilk", "badgeVoice"] as const;

function getModeLabel(doll: CompanionCard, t: (key: string) => string) {
    if (doll.availableForRent && doll.availableForBuy) return t("rentBuy");
    if (doll.availableForBuy) return t("buyOnly");
    if (doll.availableForRent) return t("rentOnly");
    return t("unavailable");
}

function buildAltText(doll: CompanionCard) {
    return `${doll.name} — ${doll.collection}`;
}

export default async function CompanionCollection({
    dolls,
    currency = "RON",
    whatsappPhone = null,
    contactPhone = null,
    contactEmail = null,
}: CompanionCollectionProps) {
    const t = await getTranslations("home.collection");
    const tCommon = await getTranslations("common");
    const locale = (await getLocale()) as Locale;

    const visible = dolls.slice(0, 3);

    return (
        <section
            id="galerie"
            data-surface="dark"
            aria-labelledby="collection-title"
            className="py-24 bg-velvet-900 text-silk relative isolate"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-velvet-950 via-velvet-900 to-velvet-950 pointer-events-none"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-velvet-500/15 blur-[120px] motion-safe:animate-pulse-slow"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
                    <span className="inline-block text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold bg-velvet-800 px-4 py-2 rounded-full border border-gold/30">
                        {t("badge")}
                    </span>
                    <h2
                        id="collection-title"
                        className="font-display italic font-medium text-3xl sm:text-4xl lg:text-5xl mt-5 mb-4 leading-[1.1]"
                    >
                        {t("title")}
                    </h2>
                    <p className="text-silk/80 leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                {visible.length === 0 ? (
                    <div className="rounded-3xl border border-velvet-700 p-12 text-center text-silk/85 max-w-2xl mx-auto">
                        <p className="font-display italic text-lg">{t("empty")}</p>
                        <div className="mt-6">
                            <Link
                                href="/#contact"
                                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gold hover:text-velvet-950 hover:bg-gold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                            >
                                {tCommon("contactUs")}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {visible.map((doll, idx) => {
                            const topBadge = BADGES[idx % BADGES.length];
                            const upgradeBadgeKey = UPGRADES[idx % UPGRADES.length];
                            const heightTag =
                                doll.tags?.find((tag) => /\d+\s*cm/i.test(tag)) ?? null;

                            const rentLabel =
                                doll.availableForRent && doll.rentPricePerDay
                                    ? formatPricePerDay(
                                          doll.rentPricePerDay,
                                          locale,
                                          currency,
                                          tCommon("perDay"),
                                      )
                                    : null;
                            const buyLabel =
                                doll.availableForBuy && doll.buyPrice
                                    ? formatPrice(doll.buyPrice, locale, currency)
                                    : null;

                            return (
                                <li key={doll.id}>
                                    <article
                                        className="group bg-velvet-950 rounded-2xl overflow-hidden border border-gold/15 hover:border-gold/45 transition-colors duration-300 motion-reduce:transition-none flex flex-col h-full shadow-xl shadow-velvet-950/40"
                                        aria-labelledby={`doll-${doll.id}-name`}
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            <Image
                                                src={doll.imageUrl}
                                                alt={buildAltText(doll)}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 420px"
                                                className="object-cover object-[center_28%] group-hover:scale-[1.04] transition-transform duration-700 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                                unoptimized={doll.imageUrl.includes("placehold.co")}
                                            />
                                            <div
                                                aria-hidden="true"
                                                className="absolute inset-0 bg-gradient-to-t from-velvet-950 via-velvet-950/20 to-transparent"
                                            />
                                            <div
                                                className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] uppercase rounded-full ${topBadge.className}`}
                                            >
                                                {t(topBadge.label)}
                                            </div>
                                            {heightTag ? (
                                                <span className="absolute top-4 right-4 z-10 px-3 py-1.5 text-[10px] font-semibold rounded-full bg-velvet-950/85 backdrop-blur text-silk border border-silk/15">
                                                    {heightTag}
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="p-6 sm:p-7 flex flex-col flex-1">
                                            <h3
                                                id={`doll-${doll.id}-name`}
                                                className="font-display italic text-2xl text-silk mb-2"
                                            >
                                                {doll.name}
                                            </h3>
                                            <p className="text-silk/75 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                                                {doll.description}
                                            </p>

                                            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-gold-light/80 mb-4">
                                                {t(upgradeBadgeKey)}
                                            </p>

                                            {(rentLabel || buyLabel) && (
                                                <dl className="mb-5 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                                    {rentLabel ? (
                                                        <div>
                                                            <dt className="text-silk/55 text-[0.7rem] uppercase tracking-wider">
                                                                {tCommon("rent")}
                                                            </dt>
                                                            <dd className="text-silk font-semibold">
                                                                {rentLabel}
                                                            </dd>
                                                        </div>
                                                    ) : null}
                                                    {buyLabel ? (
                                                        <div>
                                                            <dt className="text-silk/55 text-[0.7rem] uppercase tracking-wider">
                                                                {tCommon("buy")}
                                                            </dt>
                                                            <dd className="text-silk font-semibold">
                                                                {buyLabel}
                                                            </dd>
                                                        </div>
                                                    ) : null}
                                                </dl>
                                            )}

                                            <div className="flex justify-between items-center pt-4 border-t border-velvet-800 gap-3 mt-auto">
                                                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-silk/70">
                                                    <span
                                                        aria-hidden="true"
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            doll.availableForRent || doll.availableForBuy
                                                                ? "bg-success"
                                                                : "bg-silk/30"
                                                        }`}
                                                    />
                                                    {getModeLabel(doll, t)}
                                                </span>
                                                <ModelInquiryButton
                                                    modelName={doll.name}
                                                    label={t("viewDetails")}
                                                    whatsappPhone={whatsappPhone}
                                                    contactPhone={contactPhone}
                                                    contactEmail={contactEmail}
                                                />
                                            </div>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="mt-12 text-center">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-velvet-950 font-semibold uppercase tracking-[0.16em] text-xs rounded-full px-8 py-4 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-900"
                    >
                        <span>{t("viewCatalog")}</span>
                        <svg
                            aria-hidden="true"
                            focusable="false"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
