import Link from "next/link";
import { notFound } from "next/navigation";
import {
    formatDateRo,
    formatOrderMode,
    formatOrderStatus,
    formatRentalDurationRo,
    getOrderStatusOptions,
} from "@/lib/orders/shared";
import { getAdminOrderById } from "@/lib/orders";
import {
    deleteOrderAction,
    updateOrderStatusFromFormAction,
} from "@/app/admin/(protected)/orders/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { getPublicPlatformSettings } from "@/lib/settings";
import ReviewInvitationCard from "@/components/admin/reviews/ReviewInvitationCard";
import styles from "../../page.module.css";

type AdminOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function formatMoney(value: number | null | undefined) {
    if (!value || value <= 0) {
        return "-";
    }

    return `${value.toLocaleString("ro-RO")} lei`;
}

function getPricePerDay(order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>) {
    // Only meaningful for whole-day rentals; hour-based / tier prices are flat.
    if (
        order.mode !== "rent" ||
        order.rental_unit === "hour" ||
        !order.rental_days ||
        order.rental_days <= 0
    ) {
        return null;
    }

    const subtotal = order.subtotal_amount || order.total_amount || 0;

    if (subtotal <= 0) {
        return null;
    }

    return Math.round(subtotal / order.rental_days);
}

function getDiscountTypeLabel(order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>) {
    if (order.discount_type === "fixed") {
        return "Reducere fixă";
    }

    if (order.discount_type === "percent") {
        return "Reducere procentuală";
    }

    return "Fără discount";
}

function getDiscountBasisLabel(order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>) {
    if (order.discount_type === "fixed") {
        return `Reducere fixă din total: ${Number(order.discount_value ?? 0).toLocaleString("ro-RO")} lei`;
    }

    if (order.discount_type === "percent") {
        return `Reducere procentuală din total: ${Number(order.discount_value ?? 0).toLocaleString("ro-RO")}%`;
    }

    return "Nu există discount aplicat";
}

function formatDiscount(order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>) {
    if (order.discount_type === "none") {
        return "-";
    }

    if (order.discount_type === "fixed") {
        return `${Number(order.discount_value ?? 0).toLocaleString("ro-RO")} lei`;
    }

    return `${Number(order.discount_value ?? 0).toLocaleString("ro-RO")}%`;
}

function getDiscountDisplayType(
    order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>
) {
    if (order.custom_price_amount && order.custom_price_amount > 0) {
        return "Preț custom";
    }

    if (order.discount_type === "fixed") {
        return "Reducere fixă";
    }

    if (order.discount_type === "percent") {
        return "Reducere procentuală";
    }

    return "Fără discount";
}

function getDiscountDetailLabel(
    order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>,
    pricePerDay: number | null
) {
    if (order.custom_price_amount && order.custom_price_amount > 0) {
        return `Preț custom setat manual: ${order.custom_price_amount.toLocaleString("ro-RO")} lei`;
    }

    if (order.discount_type === "fixed") {
        return `Reducere din total: ${Number(order.discount_value ?? 0).toLocaleString("ro-RO")} lei`;
    }

    if (order.discount_type === "percent") {
        return `Reducere din total: ${Number(order.discount_value ?? 0).toLocaleString("ro-RO")}%`;
    }

    if (pricePerDay) {
        return `Preț pe zi: ${pricePerDay.toLocaleString("ro-RO")} lei / zi`;
    }

    return "Nu există discount aplicat";
}

function getAppliedDiscountLabel(
    order: NonNullable<Awaited<ReturnType<typeof getAdminOrderById>>>
) {
    const subtotal = order.subtotal_amount || order.total_amount || 0;

    if (order.custom_price_amount && order.custom_price_amount > 0) {
        const difference = subtotal - order.custom_price_amount;

        if (difference > 0) {
            return `${difference.toLocaleString("ro-RO")} lei`;
        }

        if (difference < 0) {
            return `+${Math.abs(difference).toLocaleString("ro-RO")} lei față de subtotal`;
        }

        return "0 lei";
    }

    return formatMoney(order.discount_amount);
}

function getWhatsappHref(phone: string) {
    const cleanPhone = phone.replace(/[^\d]/g, "");

    return `https://wa.me/${cleanPhone}`;
}

async function getExistingReviewToken(
    orderId: string,
    targetId: string,
): Promise<string | null> {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from("reviews")
        .select("review_token, status")
        .eq("order_id", orderId)
        .eq("target_id", targetId)
        .in("status", ["invited", "pending", "approved"])
        .maybeSingle();
    return data && typeof data.review_token === "string" ? data.review_token : null;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
    const { id } = await params;
    const order = await getAdminOrderById(id);

    if (!order) {
        notFound();
    }

    const statusOptions = getOrderStatusOptions(order.mode);
    const isRent = order.mode === "rent";
    const pricePerDay = getPricePerDay(order);
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const existingReviewToken = order.doll_id
        ? await getExistingReviewToken(order.id, order.doll_id)
        : null;

    return (
        <main className={styles.page}>
            <section className={styles.orderDetailHero}>
                <div className={styles.orderDetailHeroContent}>
                    <span>Cod rezervare: {order.order_number}</span>
                    <h1>{order.customer_name}</h1>
                    <p>
                        {formatOrderMode(order.mode)} pentru păpușa{" "}
                        <strong>{order.doll_name}</strong>
                    </p>
                </div>

                <div className={styles.orderStatusBadge}>
                    {formatOrderStatus(order.status)}
                </div>
            </section>

            <section className={styles.orderDetailGrid}>
                <div className={styles.orderDetailsColumn}>
                    <div className={styles.orderCardsGrid}>
                        <article className={styles.orderPanel}>
                            <div className={styles.orderPanelHeader}>
                                <span>Date client</span>
                                <h2>Date contact client</h2>
                            </div>

                            <div className={styles.orderDataList}>
                                <div className={styles.orderDataItem}>
                                    <span>Nume complet</span>
                                    <strong>{order.customer_name}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Telefon</span>
                                    <strong>{order.customer_phone}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Email</span>
                                    <strong>{order.customer_email ?? "-"}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Adresă de livrare</span>
                                    <strong>{order.delivery_address}</strong>
                                </div>
                            </div>
                        </article>

                        <article className={styles.orderPanel}>
                            <div className={styles.orderPanelHeader}>
                                <span>Rezervare</span>
                                <h2>Perioadă & livrare</h2>
                            </div>

                            <div className={styles.orderDataList}>
                                <div className={`${styles.orderDataItem} ${styles.orderDataHighlight}`}>
                                    <span>Produs rezervat</span>
                                    <strong>{order.doll_name}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Interval perioadă</span>
                                    <strong>
                                        {formatDateRo(order.start_date)} — {formatDateRo(order.end_date)}
                                    </strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Durată</span>
                                    <strong>
                                        {isRent
                                            ? formatRentalDurationRo(
                                                  order.rental_unit,
                                                  order.rental_quantity,
                                              ) || `${order.rental_days ?? "-"} zile`
                                            : "Cumpărare"}
                                    </strong>
                                </div>

                                {isRent && order.rental_tier_label && (
                                    <div className={styles.orderDataItem}>
                                        <span>Treaptă tarifară</span>
                                        <strong>{order.rental_tier_label}</strong>
                                    </div>
                                )}

                                <div className={styles.orderDataItem}>
                                    <span>{isRent ? "Oră început" : "Oră livrare solicitată"}</span>
                                    <strong>{order.delivery_time}</strong>
                                </div>

                                <div className={styles.orderDataItem}>
                                    <span>Oră retur solicitată</span>
                                    <strong>{isRent ? order.return_time ?? "-" : "Nu se aplică"}</strong>
                                </div>
                            </div>
                        </article>

                        {order.notes && (
                            <article className={`${styles.orderPanel} ${styles.orderPanelWide}`}>
                                <div className={styles.orderPanelHeader}>
                                    <span>Observații</span>
                                    <h2>Note client / admin</h2>
                                </div>

                                <p className={styles.orderNotes}>{order.notes}</p>
                            </article>
                        )}
                    </div>
                </div>

                <aside className={styles.orderRightColumn}>
                    <article className={styles.orderActionsPanel}>
                        <div className={styles.orderPanelHeader}>
                            <span>Financiar</span>
                            <h2>Sumar financiar</h2>
                        </div>

                        <div className={styles.orderSummaryBox}>
                            <div className={styles.orderSummaryRow}>
                <span>
                    Subtotal{" "}
                    {isRent
                        ? (() => {
                              const dur = formatRentalDurationRo(
                                  order.rental_unit,
                                  order.rental_quantity,
                              );
                              if (dur) return `(${dur})`;
                              return order.rental_days ? `(${order.rental_days} zile)` : "";
                          })()
                        : ""}
                </span>
                                <strong>{formatMoney(order.subtotal_amount || order.total_amount)}</strong>
                            </div>

                            <div className={styles.orderSummaryRow}>
                                <span>Preț pe zi</span>
                                <strong>{pricePerDay ? `${pricePerDay.toLocaleString("ro-RO")} lei / zi` : "-"}</strong>
                            </div>

                            <div className={styles.orderDiscountInfo}>
                                <span>Informații discount</span>

                                <div>
                                    <small>Tip discount</small>
                                    <strong>{getDiscountDisplayType(order)}</strong>
                                </div>

                                <div>
                                    <small>
                                        {order.custom_price_amount && order.custom_price_amount > 0
                                            ? "Preț custom"
                                            : order.discount_type === "none"
                                                ? "Preț pe zi"
                                                : "Reducere din total"}
                                    </small>
                                    <strong>{getDiscountDetailLabel(order, pricePerDay)}</strong>
                                </div>

                                <div>
                                    <small>Discount aplicat</small>
                                    <strong>{getAppliedDiscountLabel(order)}</strong>
                                </div>

                                {order.coupon_code ? (
                                    <div>
                                        <small>Cod promoțional</small>
                                        <strong>{order.coupon_code}</strong>
                                    </div>
                                ) : null}

                                {order.offer_label ? (
                                    <div>
                                        <small>Ofertă aplicată</small>
                                        <strong>{order.offer_label}</strong>
                                    </div>
                                ) : null}
                            </div>

                            <div className={`${styles.orderSummaryRow} ${styles.orderSummaryTotal}`}>
                                <span>Total final de plată</span>
                                <strong>{order.total_label}</strong>
                            </div>
                        </div>
                    </article>

                    <article className={styles.orderActionsPanel}>
                        <div className={styles.orderPanelHeader}>
                            <span>Management</span>
                            <h2>Gestionează comanda</h2>
                        </div>

                        <form
                            className={styles.orderStatusForm}
                            action={async (formData) => {
                                "use server";
                                await updateOrderStatusFromFormAction(order.id, formData);
                            }}
                        >
                            <label>
                                Status curent
                                <select name="status" defaultValue={order.status}>
                                    {statusOptions.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button className="btn btn-gold">Salvează statusul</button>
                        </form>

                        <div className={styles.orderActionsStack}>
                            <Link href={`/admin/orders/${order.id}/edit`} className="btn btn-outline-light">
                                Editează rezervarea
                            </Link>

                            <a href={`tel:${order.customer_phone}`} className="btn btn-outline-light">
                                Sună clientul
                            </a>

                            <a
                                href={getWhatsappHref(order.customer_phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-light"
                            >
                                Mesaj WhatsApp
                            </a>
                        </div>

                        <form
                            className={styles.orderDeleteForm}
                            action={async () => {
                                "use server";
                                await deleteOrderAction(order.id);
                            }}
                        >
                            <button className={styles.orderDangerButton}>Șterge comanda</button>
                        </form>
                    </article>
                </aside>
            </section>

            {order.doll_id ? (
                <section className="max-w-4xl mx-auto px-6 py-8">
                    <ReviewInvitationCard
                        productLabel={order.doll_name}
                        targetType="doll"
                        targetId={order.doll_id}
                        orderType={order.mode === "buy" ? "doll_purchase" : "doll_rental"}
                        orderId={order.id}
                        customerName={order.customer_name}
                        customerPhone={order.customer_phone}
                        siteUrl={siteUrl}
                        customerLocale="ro"
                        existingToken={existingReviewToken}
                        revalidatePath={`/admin/orders/${order.id}`}
                    />
                </section>
            ) : null}
        </main>
    );
}
