import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCartSummary } from "@/lib/shop/cart";
import { formatMoney } from "@/lib/shop/format";
import { onlinePaymentAvailable } from "@/lib/payments";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import ShopCheckoutForm from "@/components/shop/ShopCheckoutForm";
import CartSummaryTotals from "@/components/shop/CartSummaryTotals";
import { createShopOrderAction } from "@/app/[locale]/shop/checkout/actions";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "shop" });
    return {
        title: t("checkoutTitle"),
        robots: { index: false, follow: false },
    };
}

export default async function ShopCheckoutPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [summary, t, paymentEnabled] = await Promise.all([
        getCartSummary(),
        getTranslations("shop"),
        onlinePaymentAvailable(),
    ]);

    if (summary.lines.length === 0) {
        const target = locale === "ro" ? "/shop/cart" : `/${locale}/shop/cart`;
        redirect(target);
    }

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-10">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {t("checkout")}
                    </p>
                    <h1 className="mt-3 font-display italic font-medium text-3xl sm:text-4xl">
                        {t("checkoutTitle")}
                    </h1>
                    <p className="mt-3 text-silk/75 max-w-2xl">
                        {t("checkoutSubtitle")}
                    </p>
                </header>

                <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
                    <ShopCheckoutForm
                        action={createShopOrderAction}
                        locale={locale}
                        onlinePaymentEnabled={paymentEnabled}
                    />

                    <aside className="bg-velvet-900/40 border border-gold/20 rounded-3xl p-6 sm:p-8 lg:sticky lg:top-32">
                        <h2 className="font-display italic text-xl mb-5">
                            {t("checkoutSummary")}
                        </h2>
                        <ul className="space-y-4 list-none p-0 max-h-80 overflow-y-auto pr-1">
                            {summary.lines.map((line) => (
                                <li
                                    key={line.slug}
                                    className="flex gap-3 items-start"
                                >
                                    <div className="relative w-12 h-14 shrink-0 overflow-hidden rounded-lg bg-velvet-950">
                                        {line.product.image ? (
                                            <Image
                                                src={getSupabaseImageUrl(
                                                    line.product.image,
                                                    "card",
                                                )}
                                                alt={line.product.name}
                                                fill
                                                sizes="48px"
                                                className="object-cover object-center"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-silk font-medium truncate">
                                            {line.product.name}
                                        </p>
                                        <p className="text-[0.78rem] text-silk/60">
                                            × {line.qty}
                                        </p>
                                    </div>
                                    <p className="text-sm text-silk whitespace-nowrap">
                                        {formatMoney(
                                            line.lineTotal,
                                            locale,
                                            line.product.currency,
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-6 border-t border-velvet-800">
                            <CartSummaryTotals summary={summary} locale={locale} />
                        </div>
                        <Link
                            href="/shop/cart"
                            className="mt-4 inline-flex w-full items-center justify-center text-[0.72rem] uppercase tracking-[0.18em] text-silk/65 hover:text-gold py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
                        >
                            ← {t("cartTitle")}
                        </Link>
                    </aside>
                </div>
            </div>
        </main>
    );
}
