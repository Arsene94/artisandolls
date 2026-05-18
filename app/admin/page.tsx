import { dolls } from "@/lib/dolls";
import styles from "./page.module.css";
import {IconBrandWhatsapp, IconEye, IconPhone} from "@tabler/icons-react";

const dashboardStats = [
    {
        label: "Comenzi noi",
        value: "0",
        hint: "Azi",
    },
    {
        label: "Închirieri active",
        value: "0",
        hint: "În desfășurare",
    },
    {
        label: "Venit estimat",
        value: "0 lei",
        hint: "Luna curentă",
    },
    {
        label: "Păpuși în catalog",
        value: String(dolls.length),
        hint: "Din lib/dolls.ts",
    },
];

const recommendedActions = [
    "Verifică comenzile noi și confirmă disponibilitatea.",
    "Actualizează păpușile indisponibile sau sold out.",
    "Adaugă poze reale pentru ținute și customizări.",
    "Configurează tabelele Supabase pentru comenzi reale.",
];

const latestOrders = [
    {
        id: "AD-1007",
        customer: "Maria Ionescu",
        doll: "Aurora",
        type: "Închiriere",
        status: "Nouă",
        total: "620 lei",
        date: "18.05.2026",
        phone: "+40722111222",
    },
    {
        id: "AD-1006",
        customer: "Elena Popa",
        doll: "Séraphine",
        type: "Cumpărare",
        status: "În verificare",
        total: "3.250 lei",
        date: "17.05.2026",
        phone: "+40733111333",
    },
    {
        id: "AD-1005",
        customer: "Andreea Marin",
        doll: "Céleste",
        type: "Închiriere",
        status: "Confirmată",
        total: "840 lei",
        date: "16.05.2026",
        phone: "+40744111444",
    },
];

function getCleanPhone(phone: string) {
    return phone.replace(/[^\d+]/g, "");
}

function getWhatsappHref(phone: string, orderId: string) {
    const cleanPhone = getCleanPhone(phone).replace("+", "");
    const message = encodeURIComponent(
        `Bună! Te contactăm pentru comanda ta Artisan Dolls ${orderId}.`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
}

export default function AdminDashboardPage() {
    const availableForRent = dolls.filter((doll) => doll.availableForRent).length;
    const availableForBuy = dolls.filter((doll) => doll.availableForBuy).length;
    const soldOut = dolls.filter((doll) => doll.availability === "sold_out").length;

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
                            <div key={order.id} className={styles.orderItem}>
                                <div>
                                    <span className={styles.orderId}>{order.id}</span>
                                    <strong>{order.customer}</strong>
                                    <small>{order.doll}</small>
                                </div>

                                <div>
                                    <span>Tip</span>
                                    <strong>{order.type}</strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>{order.status}</strong>
                                </div>

                                <div>
                                    <span>Total</span>
                                    <strong>{order.total}</strong>
                                </div>

                                <div>
                                    <span>Dată</span>
                                    <strong>{order.date}</strong>
                                </div>

                                <div className={styles.orderActions}>
                                    <a href={`/admin/orders/${order.id}`} className={styles.viewButton}>
                                        <IconEye />
                                    </a>

                                    <a href={`tel:${getCleanPhone(order.phone)}`} className={styles.callButton}>
                                        <IconPhone />
                                    </a>

                                    <a
                                        href={getWhatsappHref(order.phone, order.id)}
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
                                <span>{doll.availableForRent ? "Da" : "Nu"}</span>
                                <span>{doll.availableForBuy ? "Da" : "Nu"}</span>
                                <span>{doll.badge}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </main>
    );
}
