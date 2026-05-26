import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatMoney } from "@/lib/shop/format";
import AddToCartButton from "@/components/shop/AddToCartButton";
import type { ShopProduct } from "@/lib/shop/shared";
import { getActiveOffers } from "@/lib/offers/queries";
import { shopBadgeOffer, offerBadgeLabel } from "@/lib/offers/shared";

type Props = {
    product: ShopProduct;
    locale: string;
    variant?: "default" | "compact";
};

export default async function ShopProductCard({
    product,
    locale,
    variant = "default",
}: Props) {
    const t = await getTranslations({ locale, namespace: "shop" });
    const imageUrl = product.image
        ? getSupabaseImageUrl(product.image, "card")
        : null;

    // Alt text descriptiv: includem marca și categoria așa cum apar pe site;
    // pe nișa adult, Google Images aduce trafic disproporționat când alt-ul
    // are atribute concrete (material, tip, scop).
    const altParts = [product.name];
    if (product.brand) altParts.push(product.brand);
    if (product.shortDescription) {
        altParts.push(product.shortDescription.replace(/\s+/g, " ").slice(0, 120));
    }
    const altText = altParts.join(" — ");

    const onSale =
        product.compareAtPrice !== null && product.compareAtPrice > product.price;

    const liveStock = product.trackStock
        ? product.availableQuantity
        : Number.POSITIVE_INFINITY;
    const stockBadge = liveStock <= 0
        ? { label: t("outOfStock"), tone: "danger" as const }
        : product.trackStock && liveStock <= 5
          ? { label: t("lowStock"), tone: "warning" as const }
          : null;

    const compact = variant === "compact";
    const detailsHref = `/shop/p/${product.slug}`;

    const offers = await getActiveOffers().catch(() => []);
    const badgeOffer = shopBadgeOffer(offers, product.categoryId, locale);
    const offerBadgeText = badgeOffer ? offerBadgeLabel(badgeOffer, locale) : null;

    return (
        // `isolate` creates a new stacking context so the title link's
        // ::after overlay sits below the Add-to-cart button, which raises
        // itself with `relative z-10` to stay clickable.
        <article
            className="group relative isolate flex flex-col h-full bg-velvet-950 border border-gold/15 hover:border-gold/40 rounded-2xl overflow-hidden transition-colors motion-reduce:transition-none"
            data-surface="dark"
        >
            <div className="relative block aspect-[4/5] overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={altText}
                        fill
                        sizes={
                            compact
                                ? "(max-width: 768px) 50vw, 25vw"
                                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        }
                        className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-velvet-900 flex items-center justify-center text-silk/55 text-sm px-4 text-center"
                    >
                        {product.name}
                    </div>
                )}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-velvet-950/85 via-velvet-950/10 to-transparent"
                />
                {stockBadge ? (
                    <span
                        className={[
                            "absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]",
                            stockBadge.tone === "danger"
                                ? "bg-danger/85 text-silk"
                                : "bg-warning/90 text-velvet-950",
                        ].join(" ")}
                    >
                        {stockBadge.label}
                    </span>
                ) : null}
                {onSale ? (
                    <span className="absolute top-3 right-3 inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-gold text-velvet-950">
                        −
                        {Math.round(
                            (1 - product.price / (product.compareAtPrice ?? 1)) * 100,
                        )}
                        %
                    </span>
                ) : null}
                {offerBadgeText ? (
                    <span
                        style={
                            badgeOffer?.accent
                                ? { backgroundColor: badgeOffer.accent }
                                : undefined
                        }
                        className="absolute bottom-3 left-3 inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-gold/90 text-velvet-950"
                    >
                        {offerBadgeText}
                    </span>
                ) : null}
            </div>

            <div className="p-5 flex flex-col flex-1">
                {product.brand ? (
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold-light/75">
                        {product.brand}
                    </p>
                ) : null}
                <h3 className="font-display italic text-xl text-silk mt-1 leading-tight">
                    {/*
                     * One link, whole-card hit target via ::after overlay.
                     * Buttons inside the card raise themselves above the
                     * overlay with `relative z-10` so they remain clickable.
                     */}
                    <Link
                        href={detailsHref}
                        aria-label={`${product.name} — ${t("viewDetails")}`}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:underline"
                    >
                        {product.name}
                    </Link>
                </h3>
                {product.shortDescription && !compact ? (
                    <p className="mt-2 text-[0.88rem] text-silk/70 leading-relaxed line-clamp-2">
                        {product.shortDescription}
                    </p>
                ) : null}
                <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display font-medium text-2xl text-gold">
                        {formatMoney(product.price, locale, product.currency)}
                    </span>
                    {onSale ? (
                        <span className="text-sm text-silk/55 line-through">
                            {formatMoney(
                                product.compareAtPrice ?? 0,
                                locale,
                                product.currency,
                            )}
                        </span>
                    ) : null}
                </div>
                <div className="relative z-10 mt-auto pt-4">
                    <AddToCartButton
                        slug={product.slug}
                        disabled={liveStock <= 0}
                    />
                </div>
            </div>
        </article>
    );
}
