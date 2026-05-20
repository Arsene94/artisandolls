import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { OrderRow } from "@/lib/orders";
import { getIntlLocale } from "@/i18n/format";
import styles from "./OrderSuccess.module.css";

type OrderSuccessProps = {
    order: OrderRow;
};

function formatDate(value: string | null, locale: string) {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export default async function OrderSuccess({ order }: OrderSuccessProps) {
    const locale = await getLocale();
    const t = await getTranslations("success");
    const tCommon = await getTranslations("common");
    const modeLabel = order.mode === "rent" ? tCommon("rent") : tCommon("buy");

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern} />

                <div className={styles.card}>
                    <span className={styles.successIcon}>✓</span>
                    <span className="section-label">{t("label")}</span>

                    <h1>
                        {t("title")} <em>{t("titleEmphasis")}</em>
                    </h1>

                    <p>
                        {t("description", { mode: modeLabel.toLowerCase() })}
                    </p>

                    <div className={styles.summary}>
                        <div>
                            <span>{t("orderNumber")}</span>
                            <strong>{order.order_number}</strong>
                        </div>

                        <div>
                            <span>{t("doll")}</span>
                            <strong>{order.doll_name}</strong>
                        </div>

                        <div>
                            <span>{t("mode")}</span>
                            <strong>{modeLabel}</strong>
                        </div>

                        <div>
                            <span>{t("period")}</span>
                            <strong>
                                {formatDate(order.start_date, locale)} - {formatDate(order.end_date, locale)}
                            </strong>
                        </div>

                        <div>
                            <span>{t("estimatedTotal")}</span>
                            <strong>{order.total_label}</strong>
                        </div>

                        <div>
                            <span>{t("client")}</span>
                            <strong>{order.customer_name}</strong>
                        </div>

                        <div>
                            <span>{t("contact")}</span>
                            <strong>{order.customer_phone}</strong>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/" className="btn btn-gold">
                            {tCommon("backHome")}
                        </Link>

                        <Link href="/catalog" className="btn btn-outline-light">
                            {t("viewCatalog")}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
