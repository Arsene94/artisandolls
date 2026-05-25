import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getDolls } from "@/lib/dolls";
import { formatPrice, formatPricePerDay } from "@/i18n/format";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { isVectorEnabled } from "@/lib/upstash/vector";
import { similarDolls } from "@/lib/upstash/vector-search";
import type { Doll, CatalogMode } from "@/lib/dolls";
import type { Locale } from "@/i18n/routing";

type SimilarDollsProps = {
    seed: Doll;
    mode: CatalogMode;
    locale: Locale;
    currency: string;
    /** Pre-fetched matches; when omitted the component fetches itself. */
    matches?: Doll[];
};

function buildSeedText(doll: Doll): string {
    return [doll.name, doll.collection, doll.description, doll.tags?.join(" ")]
        .filter(Boolean)
        .join(" . ");
}

/**
 * Run the semantic-similarity query and resolve the hits to live `Doll`
 * objects. Exposed so the parent page can pre-check whether anything will
 * render before laying out the surrounding wrapper.
 */
export async function getSimilarDolls(
    seed: Doll,
    locale: Locale,
): Promise<Doll[]> {
    if (!isVectorEnabled()) return [];
    const hits = await similarDolls(seed.id, buildSeedText(seed), locale, 6);
    if (hits.length === 0) return [];

    const allDolls = await getDolls();
    const indexBySlug = new Map<string, Doll>(
        allDolls.map((doll) => [doll.id, doll]),
    );
    return hits
        .map((hit) => indexBySlug.get(hit.slug))
        .filter((doll): doll is Doll => Boolean(doll))
        .slice(0, 4);
}

export default async function SimilarDolls({
    seed,
    mode,
    locale,
    currency,
    matches,
}: SimilarDollsProps) {
    const resolved = matches ?? (await getSimilarDolls(seed, locale));
    if (resolved.length === 0) return null;

    const t = await getTranslations({ locale, namespace: "details" });
    const tCommon = await getTranslations({ locale, namespace: "common" });

    return (
        <section
            aria-labelledby="similar-dolls-title"
            className="mt-16 pt-12 border-t border-velvet-800/40"
        >
            <div className="flex items-end justify-between gap-4 mb-8">
                <h2
                    id="similar-dolls-title"
                    className="font-display italic text-2xl sm:text-3xl text-silk"
                >
                    {t("similarTitle")}
                </h2>
                <Link
                    href="/catalog"
                    className="text-[0.78rem] tracking-[0.18em] uppercase text-gold hover:text-gold-light transition-colors"
                >
                    {t("similarSeeAll")}
                </Link>
            </div>

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
                {resolved.map((doll) => {
                    const priceLabel =
                        mode === "rent" && doll.rentPricePerDay
                            ? formatPricePerDay(
                                  doll.rentPricePerDay,
                                  locale,
                                  currency,
                                  tCommon("perDay"),
                              )
                            : mode === "buy" && doll.buyPrice
                              ? formatPrice(doll.buyPrice, locale, currency)
                              : null;

                    return (
                        <li key={doll.id}>
                            <Link
                                href={`/catalog/${doll.id}?mode=${mode}`}
                                className="group block bg-velvet-950 border border-velvet-800/50 hover:border-gold/40 rounded-2xl overflow-hidden transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {doll.image ? (
                                        <Image
                                            src={getSupabaseImageUrl(doll.image, "card")}
                                            alt={doll.name}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover object-[center_28%] group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                        />
                                    ) : null}
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-gradient-to-t from-velvet-950 via-velvet-950/30 to-transparent"
                                    />
                                </div>
                                <div className="p-4">
                                    <p className="font-display italic text-lg text-silk leading-snug">
                                        {doll.name}
                                    </p>
                                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-silk/55 mt-1">
                                        {doll.collection}
                                    </p>
                                    {priceLabel ? (
                                        <p className="mt-2 text-sm text-gold font-semibold">
                                            {priceLabel}
                                        </p>
                                    ) : null}
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
