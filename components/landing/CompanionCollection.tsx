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
    { label: "badgeBestseller", className: "bg-gradient-to-r from-velvet-600 to-velvet-800 text-white border border-gold/30" },
    { label: "badgeNew", className: "bg-gradient-to-r from-gold to-gold-dark text-velvet-900" },
    { label: "badgeLimited", className: "bg-velvet-900/90 text-white border border-silk/20" },
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
        <section id="galerie" className="py-24 bg-silk text-velvet-900 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-velvet-500">
                            {t("badge")}
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 font-serif">
                            {t("title")}
                        </h2>
                        <p className="text-gray-600 font-light mt-2">{t("description")}</p>
                    </div>
                    <Link
                        href="/catalog"
                        className="hidden md:inline-flex items-center gap-2 text-velvet-500 hover:text-velvet-700 font-semibold border-b-2 border-velvet-300 hover:border-velvet-500 pb-1 transition duration-200"
                    >
                        <span>{t("viewCatalog")}</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                </div>

                {visible.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500">
                        {t("empty")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {visible.map((doll, idx) => {
                            const topBadge = BADGES[idx % BADGES.length];
                            const upgradeBadgeKey = UPGRADES[idx % UPGRADES.length];
                            const heightTag = doll.tags?.find((tag) => /\d+\s*cm/i.test(tag)) ?? null;
                            return (
                                <article
                                    key={doll.id}
                                    className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-velvet-950/5 hover:shadow-velvet-500/20 border border-gray-100 transition-all duration-300 group flex flex-col"
                                >
                                    <div className="relative h-96 overflow-hidden bg-velvet-900">
                                        <Image
                                            src={doll.imageUrl}
                                            alt={t("imageAlt", { name: doll.name })}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
                                            unoptimized={doll.imageUrl.includes("placehold.co")}
                                        />
                                        <div
                                            className={`absolute top-4 left-4 z-10 px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full ${topBadge.className}`}
                                        >
                                            {t(topBadge.label)}
                                        </div>
                                        <div className="absolute bottom-4 right-4 z-10 bg-velvet-900/80 backdrop-blur-sm text-gold px-3 py-1 rounded-full text-xs font-semibold">
                                            {t(upgradeBadgeKey)}
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex justify-between items-baseline mb-4 gap-3">
                                            <h3 className="text-2xl font-bold font-serif text-velvet-900">
                                                {doll.name}
                                            </h3>
                                            {heightTag && (
                                                <span className="text-sm font-semibold text-velvet-500 bg-velvet-50 px-3 py-1 rounded-full whitespace-nowrap">
                                                    {heightTag}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm font-light leading-relaxed mb-6 line-clamp-3 flex-1">
                                            {doll.description}
                                        </p>
                                        <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                                            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                                                {getModeLabel(doll, t)}
                                            </span>
                                            <ModelInquiryButton modelName={doll.name} label={t("viewDetails")} />
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="md:hidden mt-8 text-center">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 text-velvet-500 font-semibold border-b-2 border-velvet-300 pb-1"
                    >
                        {t("viewCatalog")}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
