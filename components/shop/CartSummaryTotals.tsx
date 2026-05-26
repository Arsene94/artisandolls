import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/shop/format";
import type { CartSummary } from "@/lib/shop/cart";
import { offerBadgeLabel, offerTitle } from "@/lib/offers/shared";

type Props = {
    summary: CartSummary;
    locale: string;
};

/**
 * Shared totals block for the shop cart + checkout summaries: the "spend X more
 * to get Y" offer hint, subtotal, the (coupon- or offer-) discount line, the
 * free-gift line, shipping, and the grand total.
 */
export default async function CartSummaryTotals({ summary, locale }: Props) {
    const t = await getTranslations({ locale, namespace: "shop" });
    const currency = summary.currency;

    const progressReward = summary.offerProgress
        ? offerTitle(summary.offerProgress.offer, locale) ??
          offerBadgeLabel(summary.offerProgress.offer, locale) ??
          t("offerProgressGeneric")
        : null;

    const discountLabel =
        summary.discountSource === "offer" && summary.discountOffer
            ? offerBadgeLabel(summary.discountOffer, locale) ??
              offerTitle(summary.discountOffer, locale) ??
              t("offerSavings")
            : t("couponSavings");

    return (
        <>
            {summary.offerProgress ? (
                <div className="mb-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-[0.82rem] text-silk/90">
                    {t.rich("offerProgress", {
                        amount: formatMoney(
                            summary.offerProgress.remaining,
                            locale,
                            currency,
                        ),
                        reward: progressReward ?? "",
                        b: (chunks) => (
                            <span className="font-semibold text-gold">{chunks}</span>
                        ),
                    })}
                </div>
            ) : null}

            <dl className="space-y-3 text-sm">
                <div className="flex justify-between text-silk/80">
                    <dt>{t("cartSubtotal")}</dt>
                    <dd className="font-medium text-silk">
                        {formatMoney(summary.subtotal, locale, currency)}
                    </dd>
                </div>

                {summary.discountAmount > 0 ? (
                    <div className="flex justify-between text-silk/85">
                        <dt>
                            {discountLabel}
                            {summary.discountSource === "coupon" &&
                            summary.coupon?.code ? (
                                <span className="ml-2 font-mono text-[0.78rem] text-gold-light">
                                    {summary.coupon.code}
                                </span>
                            ) : null}
                        </dt>
                        <dd className="font-medium text-gold">
                            −{formatMoney(summary.discountAmount, locale, currency)}
                        </dd>
                    </div>
                ) : null}

                {summary.giftProduct ? (
                    <div className="flex justify-between text-silk/85">
                        <dt>
                            {t("offerGift")}
                            <span className="ml-2 text-[0.82rem] text-silk/70">
                                {summary.giftProduct.name}
                            </span>
                        </dt>
                        <dd className="font-medium text-gold uppercase text-[0.72rem] tracking-[0.14em]">
                            {t("offerGiftFree")}
                        </dd>
                    </div>
                ) : null}

                <div className="flex justify-between text-silk/60">
                    <dt>{t("cartShipping")}</dt>
                    <dd>{t("cartShippingEstimate")}</dd>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-velvet-800/60">
                    <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-gold">
                        {t("cartTotal")}
                    </dt>
                    <dd className="font-display italic text-2xl text-silk">
                        {formatMoney(summary.total, locale, currency)}
                    </dd>
                </div>
            </dl>
        </>
    );
}
