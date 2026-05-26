import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCartSummary } from "@/lib/shop/cart";
import CartCouponForm from "@/components/shop/CartCouponForm";
import CartLineRow from "@/components/shop/CartLineRow";
import CartSummaryTotals from "@/components/shop/CartSummaryTotals";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "shop" });
    return {
        title: t("cartTitle"),
        robots: { index: false, follow: false },
    };
}

export default async function CartPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [summary, t] = await Promise.all([
        getCartSummary(),
        getTranslations("shop"),
    ]);

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-10">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {t("cart")}
                    </p>
                    <h1 className="mt-3 font-display italic font-medium text-3xl sm:text-4xl">
                        {t("cartTitle")}
                    </h1>
                </header>

                {summary.lines.length === 0 ? (
                    <div className="py-20 text-center border border-velvet-800 rounded-3xl">
                        <p className="font-display italic text-2xl">{t("cartEmpty")}</p>
                        <div className="mt-6">
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-full bg-gold hover:bg-gold-light text-velvet-950 px-6 py-3 text-[0.72rem] uppercase tracking-[0.16em] font-semibold transition-colors motion-reduce:transition-none"
                            >
                                {t("cartEmptyAction")}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
                        <ul className="bg-velvet-900/40 border border-velvet-800/50 rounded-3xl p-6 sm:p-8 list-none m-0">
                            {summary.lines.map((line) => (
                                <CartLineRow
                                    key={line.slug}
                                    slug={line.slug}
                                    product={line.product}
                                    qty={line.qty}
                                    lineTotal={line.lineTotal}
                                    locale={locale}
                                />
                            ))}
                        </ul>

                        <aside className="bg-velvet-900/40 border border-gold/20 rounded-3xl p-6 sm:p-8 sticky top-32">
                            <h2 className="font-display italic text-xl mb-5">
                                {t("checkoutSummary")}
                            </h2>
                            <div className="mb-5">
                                <CartCouponForm
                                    coupon={summary.coupon}
                                    currency={summary.currency}
                                    locale={locale}
                                />
                            </div>

                            <CartSummaryTotals summary={summary} locale={locale} />
                            <Link
                                href="/shop/checkout"
                                className="mt-6 w-full inline-flex items-center justify-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3.5 rounded-xl text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                            >
                                {t("checkout")}
                            </Link>
                            <Link
                                href="/shop"
                                className="mt-3 w-full inline-flex items-center justify-center border border-silk/30 hover:border-silk text-silk font-semibold py-3 rounded-xl text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                            >
                                {t("continueShopping")}
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}
