import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCrossSellForDoll } from "@/lib/shop/cross-sell";
import ShopProductCard from "@/components/shop/ShopProductCard";
import type { Doll, CatalogMode } from "@/lib/dolls";
import type { Locale } from "@/i18n/routing";
import type { ShopProduct } from "@/lib/shop/shared";

type Props = {
    doll: Doll;
    mode: CatalogMode;
    locale: Locale;
    /** Pre-fetched products; component fetches itself when omitted. */
    products?: ShopProduct[];
};

export default async function CrossSellShop({
    doll,
    mode,
    locale,
    products,
}: Props) {
    const resolved =
        products ??
        (await getCrossSellForDoll(doll, mode, locale, 4).catch(() => []));
    if (resolved.length === 0) return null;
    const t = await getTranslations({ locale, namespace: "shop" });

    return (
        <section
            aria-labelledby="cross-sell-shop"
            className="mt-12 pt-12 border-t border-velvet-800/40"
        >
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
                <div>
                    <h2
                        id="cross-sell-shop"
                        className="font-display italic text-2xl sm:text-3xl text-silk"
                    >
                        {t("crossSellTitle")}
                    </h2>
                    <p className="mt-2 text-silk/70 max-w-xl">
                        {t("crossSellSubtitle")}
                    </p>
                </div>
                <Link
                    href="/shop"
                    className="text-[0.78rem] uppercase tracking-[0.18em] text-gold hover:text-gold-light transition-colors"
                >
                    {t("shopAll")}
                </Link>
            </div>

            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
                {resolved.map((product) => (
                    <li key={product.id}>
                        <ShopProductCard
                            product={product}
                            locale={locale}
                            variant="compact"
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}
