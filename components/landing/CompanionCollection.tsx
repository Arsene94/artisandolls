import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ModelInquiryButton from "@/components/landing/ModelInquiryButton";
import type { Doll } from "@/lib/dolls";

export type CompanionCard = Doll & {
    imageUrl: string;
};

type CompanionCollectionProps = {
    dolls: CompanionCard[];
};

const BADGES = [
    {
        label: "badgeBestseller",
        className:
            "bg-gradient-to-r from-velvet-500 to-velvet-700 text-white border border-gold/40",
    },
    {
        label: "badgeNew",
        className:
            "bg-gradient-to-r from-gold to-gold-dark text-velvet-950 border border-gold/40",
    },
    {
        label: "badgeLimited",
        className:
            "bg-velvet-950/90 text-gold border border-gold/30",
    },
];

const UPGRADES = ["badgeHeat", "badgeSilk", "badgeVoice"] as const;

function getModeLabel(doll: CompanionCard, t: (key: string) => string) {
    if (doll.availableForRent && doll.availableForBuy) return t("rentBuy");
    if (doll.availableForBuy) return t("buyOnly");
    if (doll.availableForRent) return t("rentOnly");
    return t("unavailable");
}

export default async function CompanionCollection({ dolls }: CompanionCollectionProps) {
    const t = await getTranslations("home.collection");

    const visible = dolls.slice(0, 3);

    return (
        <section id="galerie" className="py-24 bg-velvet-900 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-velvet-900 via-velvet-950 to-velvet-900 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
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

                <div className="bg-velvet-900/50 p-6 sm:p-10 rounded-3xl border border-gold/10 backdrop-blur-sm">
                    {visible.length === 0 ? (
                        <div className="rounded-3xl border border-velvet-800 p-12 text-center text-silk/60">
                            {t("empty")}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {visible.map((doll, idx) => {
                                const topBadge = BADGES[idx % BADGES.length];
                                const upgradeBadgeKey = UPGRADES[idx % UPGRADES.length];
                                const heightTag = doll.tags?.find((tag) =>
                                    /\d+\s*cm/i.test(tag),
                                ) ?? null;
                                return (
                                    <article
                                        key={doll.id}
                                        className="bg-gradient-to-br from-velvet-950 to-velvet-900 rounded-2xl overflow-hidden shadow-2xl shadow-velvet-950/40 border border-gold/15 hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                                    >
                                        <div className="relative h-96 overflow-hidden bg-velvet-950">
                                            <Image
                                                src={doll.imageUrl}
                                                alt={t("imageAlt", { name: doll.name })}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                                unoptimized={doll.imageUrl.includes("placehold.co")}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-velvet-950/80 via-transparent to-transparent" />
                                            <div
                                                className={`absolute top-4 left-4 z-10 px-3.5 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full ${topBadge.className}`}
                                            >
                                                {t(topBadge.label)}
                                            </div>
                                            <div className="absolute bottom-4 right-4 z-10 bg-velvet-950/80 backdrop-blur-sm text-gold px-3 py-1 rounded-full text-[10px] font-semibold border border-gold/20">
                                                {t(upgradeBadgeKey)}
                                            </div>
                                        </div>
                                        <div className="p-7 flex flex-col flex-1 relative">
                                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-xl pointer-events-none" />
                                            <div className="flex justify-between items-baseline mb-4 gap-3 relative">
                                                <h3 className="text-2xl font-bold font-serif text-white">
                                                    {doll.name}
                                                </h3>
                                                {heightTag && (
                                                    <span className="text-xs font-semibold text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full whitespace-nowrap">
                                                        {heightTag}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-silk/65 text-sm font-light leading-relaxed mb-6 line-clamp-3 flex-1">
                                                {doll.description}
                                            </p>
                                            <div className="flex justify-between items-center pt-5 border-t border-velvet-800">
                                                <span className="text-[11px] font-bold text-gold/80 tracking-widest uppercase">
                                                    {getModeLabel(doll, t)}
                                                </span>
                                                <ModelInquiryButton
                                                    modelName={doll.name}
                                                    label={t("viewDetails")}
                                                />
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-semibold uppercase tracking-wider text-xs border border-gold/40 hover:border-gold rounded-full px-6 py-3 transition duration-200"
                    >
                        <span>{t("viewCatalog")}</span>
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
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
