import { getDollRows, type CatalogMode } from "@/lib/dolls";
import { getAdminOrderRows } from "@/lib/orders";
import styles from "./page.module.css";
import {IconBrandWhatsapp, IconEye, IconPhone} from "@tabler/icons-react";

export const dynamic = "force-dynamic";

const recommendedActions = [
    "Verifică comenzile noi și confirmă disponibilitatea.",
    "Actualizează păpușile indisponibile sau sold out.",
    "Adaugă poze reale pentru ținute și customizări.",
    "Configurează tabelele Supabase pentru comenzi reale.",
];

function getCleanPhone(phone: string) {
    return phone.replace(/[^\d+]/g, "");
}

function getWhatsappHref(phone: string, orderId: string, customerName: string) {
    const cleanPhone = getCleanPhone(phone).replace("+", "");
    const message = encodeURIComponent(
        `Bună, ${customerName}! Te contactăm pentru rezervarea Artisan Dolls ${orderId}.`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
}

function getModeLabel(mode: CatalogMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
}

function formatDate(value: string|null) {
    if (!value) {
        return "";
    }

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
        return value;
    }

    return `${day}.${month}.${year}`;
}

function formatCreatedAt(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ro-RO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default async function AdminDashboardPage() {
    const dolls = await getDollRows(true);
    const orders = await getAdminOrderRows(100);
    const latestOrders = orders.slice(0, 5);

    const newOrders = orders.filter((order) => order.status === "new").length;
    const activeRentals = orders.filter(
        (order) =>
            order.mode === "rent" &&
            ["new", "in_review", "confirmed"].includes(order.status)
    ).length;

    const estimatedRevenue = orders.reduce((total, order) => {
        return total + (order.total_amount ?? 0);
    }, 0);

    const availableForRent = dolls.filter((doll) => doll.available_for_rent).length;
    const availableForBuy = dolls.filter((doll) => doll.available_for_buy).length;
    const soldOut = dolls.filter((doll) => doll.availability === "sold_out").length;
    const activeDolls = dolls.filter((doll) => doll.is_active).length;

    const dashboardStats = [
        {
            label: "Comenzi noi",
            value: String(newOrders),
            hint: "Status nou",
        },
        {
            label: "Închirieri active",
            value: String(activeRentals),
            hint: "Noi / verificare / confirmate",
        },
        {
            label: "Venit estimat",
            value: `${estimatedRevenue.toLocaleString("ro-RO")} lei`,
            hint: "Din cereri",
        },
        {
            label: "Păpuși în catalog",
            value: String(activeDolls),
            hint: "Active în Supabase",
        },
    ];

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Dashboard</span>
                <h1>Overview administrare</h1>
                <p>
                    Dashboard pentru comenzi, închirieri, cumpărări, catalog, customizări și starea inventarului.
                </p>
            </section>

            <section className={styles.statsGrid}>
                {dashboardStats.map((stat) => (
                    <article key={stat.label} className={styles.statCard}>
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                        <small>{stat.hint}</small>
                    </article>
                ))}
            </section>

            <section className={styles.dashboardGrid}>
                <article className={styles.panelWide}>
                    <div className={styles.panelHeader}>
                        <span>Comenzi</span>
                        <h2>Ultimele comenzi</h2>
                    </div>

                    <div className={styles.ordersList}>
                        {latestOrders.map((order) => (
                            <div key={order.order_number} className={styles.orderItem}>
                                <div>
                                    <span className={styles.orderId}>{order.order_number}</span>
                                    <strong>{order.customer_name}</strong>
                                    <small>{order.doll_name}</small>
                                </div>

                                <div>
                                    <span>Rezervare</span>
                                    <strong>{getModeLabel(order.mode)}</strong>
                                    <small>
                                        {formatDate(order?.start_date)} — {formatDate(order?.end_date)}
                                    </small>
                                </div>

                                <div>
                                    <span>Livrare</span>
                                    <strong>{order.delivery_time}</strong>
                                    <small>
                                        {order.mode === "rent" && order.return_time
                                            ? `Retur ${order.return_time}`
                                            : "Fără retur"}
                                    </small>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>{order.status}</strong>
                                    <small>{formatCreatedAt(order.created_at)}</small>
                                </div>

                                <div>
                                    <span>Total</span>
                                    <strong>{order.total_label}</strong>
                                    <small>{order.customer_phone}</small>
                                </div>

                                <div className={styles.orderActions}>
                                    <a href={`/admin/orders/${order.id}`} className={styles.viewButton}>
                                        <IconEye />
                                    </a>

                                    <a href={`tel:${getCleanPhone(order.customer_phone)}`} className={styles.callButton}>
                                        <IconPhone />
                                    </a>

                                    <a
                                        href={getWhatsappHref(order.customer_phone, order.order_number, order.customer_name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.whatsappButton}
                                    >
                                        <IconBrandWhatsapp />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span>Inventar</span>
                        <h2>Status catalog</h2>
                    </div>

                    <div className={styles.inventoryList}>
                        <div>
                            <span>Disponibile pentru închiriere</span>
                            <strong>{availableForRent}</strong>
                        </div>
                        <div>
                            <span>Disponibile pentru cumpărare</span>
                            <strong>{availableForBuy}</strong>
                        </div>
                        <div>
                            <span>Sold out</span>
                            <strong>{soldOut}</strong>
                        </div>
                    </div>
                </article>

                <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span>Recomandat</span>
                        <h2>Acțiuni rapide</h2>
                    </div>

                    <ul className={styles.actionList}>
                        {recommendedActions.map((action) => (
                            <li key={action}>{action}</li>
                        ))}
                    </ul>
                </article>

                <article className={styles.panelWide}>
                    <div className={styles.panelHeader}>
                        <span>Produse</span>
                        <h2>Păpuși din catalog</h2>
                    </div>

                    <div className={styles.table}>
                        <div className={styles.tableHead}>
                            <span>Nume</span>
                            <span>Colecție</span>
                            <span>Închiriere</span>
                            <span>Cumpărare</span>
                            <span>Status</span>
                        </div>

                        {dolls.map((doll) => (
                            <div key={doll.id} className={styles.tableRow}>
                                <span>{doll.name}</span>
                                <span>{doll.collection}</span>
                                <span>{doll.available_for_rent ? "Da" : "Nu"}</span>
                                <span>{doll.available_for_buy ? "Da" : "Nu"}</span>
                                <span>{doll.badge}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </main>
    );
}
