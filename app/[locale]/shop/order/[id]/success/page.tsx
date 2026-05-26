import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { ownsRecentOrder } from "@/lib/orders/recent-cookie";
import { formatMoney } from "@/lib/shop/format";
import PrintButton from "@/components/PrintButton";
import type { Locale } from "@/i18n/routing";

type Props = {
    params: Promise<{ locale: Locale; id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "shop" });
    return {
        title: t("successTitle"),
        robots: { index: false, follow: false },
    };
}

export default async function ShopOrderSuccessPage({ params }: Props) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    // Cookie-ul setat la createShopOrderAction leagă vizualizarea de browserul
    // care a plasat comanda — UUID-urile de ordine s-ar putea scurge prin
    // Referer / paste accidental și am expune detalii de livrare oricui.
    if (!(await ownsRecentOrder(id))) {
        notFound();
    }

    const supabase = createSupabaseServiceClient();
    const [{ data: order }, { data: items }] = await Promise.all([
        supabase
            .from("shop_orders")
            .select("*")
            .eq("id", id)
            .maybeSingle(),
        supabase
            .from("shop_order_items")
            .select("*")
            .eq("order_id", id),
    ]);

    if (!order) notFound();

    const t = await getTranslations("shop");

    const paymentMethod = order.payment_method as "cash" | "card_online" | null;
    const paymentStatus = order.payment_status as
        | "not_required"
        | "pending"
        | "authorised"
        | "paid"
        | "failed"
        | "refunded"
        | "voided"
        | null;

    const paymentTone: "success" | "pending" | "danger" | null =
        paymentMethod === "card_online"
            ? paymentStatus === "paid" || paymentStatus === "authorised"
                ? "success"
                : paymentStatus === "failed" || paymentStatus === "voided"
                  ? "danger"
                  : "pending"
            : null;

    const paymentTitle =
        paymentTone === "success"
            ? t("paymentPaidTitle")
            : paymentTone === "danger"
              ? t("paymentFailedTitle")
              : paymentTone === "pending"
                ? t("paymentPendingTitle")
                : null;

    const paymentDescription =
        paymentTone === "success"
            ? t("paymentPaidDescription")
            : paymentTone === "danger"
              ? t("paymentFailedDescription")
              : paymentTone === "pending"
                ? t("paymentPendingDescription")
                : null;

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-gold/30 bg-velvet-900/50 p-8 sm:p-10 text-center">
                    <span
                        aria-hidden="true"
                        className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gold text-velvet-950 mb-6"
                    >
                        <svg
                            className="w-8 h-8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            focusable="false"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </span>
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold-light">
                        {t("cart")} · {t("checkout")}
                    </p>
                    <h1 className="mt-3 font-display italic font-medium text-3xl sm:text-4xl">
                        {t("successTitle")}{" "}
                        <span className="text-gold not-italic">
                            {t("successEmphasis")}
                        </span>
                    </h1>
                    <p className="mt-4 text-silk/80 leading-relaxed">
                        {t("successDescription")}
                    </p>

                    {paymentTitle && paymentDescription ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className={[
                                "mt-6 rounded-2xl border px-5 py-4 text-left",
                                paymentTone === "success"
                                    ? "border-success/50 bg-success/10 text-silk"
                                    : paymentTone === "danger"
                                      ? "border-danger/50 bg-danger/10 text-silk"
                                      : "border-warning/50 bg-warning/10 text-silk",
                            ].join(" ")}
                        >
                            <p
                                className={[
                                    "font-semibold",
                                    paymentTone === "success"
                                        ? "text-success"
                                        : paymentTone === "danger"
                                          ? "text-danger"
                                          : "text-warning",
                                ].join(" ")}
                            >
                                {paymentTitle}
                            </p>
                            <p className="mt-1 text-sm text-silk/85">
                                {paymentDescription}
                            </p>
                        </div>
                    ) : null}

                    <dl className="mt-8 grid sm:grid-cols-2 gap-4 text-left">
                        <div className="rounded-2xl bg-velvet-950/70 border border-velvet-800 p-4">
                            <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-silk/55">
                                {t("successOrderNumber")}
                            </dt>
                            <dd className="font-mono text-gold mt-1 text-lg">
                                {order.order_number}
                            </dd>
                        </div>
                        <div className="rounded-2xl bg-velvet-950/70 border border-velvet-800 p-4">
                            <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-silk/55">
                                {t("cartTotal")}
                            </dt>
                            <dd className="font-display italic text-2xl text-silk mt-1">
                                {formatMoney(
                                    order.total_amount,
                                    locale,
                                    order.currency ?? "RON",
                                )}
                            </dd>
                        </div>
                    </dl>

                    {items && items.length > 0 ? (
                        <ul className="mt-8 text-left list-none p-0 divide-y divide-velvet-800 rounded-2xl border border-velvet-800 overflow-hidden">
                            {items.map((line) => (
                                <li
                                    key={line.id}
                                    className="flex items-center justify-between gap-3 px-4 py-3 bg-velvet-950/60"
                                >
                                    <span className="text-sm text-silk">
                                        {line.product_name}{" "}
                                        <span className="text-silk/55">
                                            × {line.quantity}
                                        </span>
                                    </span>
                                    <span className="text-sm text-silk/90">
                                        {formatMoney(
                                            line.line_total,
                                            locale,
                                            line.currency ?? "RON",
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    <div className="mt-10 flex flex-col sm:flex-row items-stretch gap-3 sm:justify-center">
                        <Link
                            href="/shop"
                            className="no-print w-full sm:w-auto inline-flex items-center justify-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3.5 px-6 rounded-xl uppercase tracking-[0.16em] text-[11px] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                        >
                            {t("successContinue")}
                        </Link>
                        <PrintButton />
                    </div>
                </div>
            </div>
        </main>
    );
}
