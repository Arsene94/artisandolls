import { getDollRows, type CatalogMode } from "@/lib/dolls";
import styles from "./page.module.css";

const recommendedActions = [
    "Verifică comenzile noi și confirmă disponibilitatea.",
    "Actualizează păpușile indisponibile sau sold out.",
    "Adaugă poze reale pentru ținute și customizări.",
    "Configurează tabelele Supabase pentru comenzi reale.",
];

const latestOrders = [
    {
        orderId: "AD-1007",
        dollId: "aurora",
        dollName: "Aurora",
        mode: "rent",
        startDate: "2026-05-20",
        endDate: "2026-05-24",
        outfitId: "rent-outfit-photo",
        options: "rent-premium-cleaning,rent-photo-ready",
        total: "620",
        totalLabel: "620 lei",
        fullName: "Maria Ionescu",
        email: "maria@example.com",
        phone: "+40722111222",
        deliveryAddress: "Str. Exemplu 10, București",
        deliveryTime: "10:30",
        returnTime: "18:00",
        notes: "Preferă livrare dimineața.",
        createdAt: "2026-05-18T10:30:00.000Z",
        status: "Nouă",
    },
    {
        orderId: "AD-1006",
        dollId: "seraphine",
        dollName: "Séraphine",
        mode: "buy",
        startDate: "2026-05-21",
        endDate: "2026-05-21",
        outfitId: "buy-outfit-couture",
        options: "buy-face-detailing,buy-display-box",
        total: "3250",
        totalLabel: "3.250 lei",
        fullName: "Elena Popa",
        email: "elena@example.com",
        phone: "+40733111333",
        deliveryAddress: "Bd. Exemplu 22, București",
        deliveryTime: "14:00",
        returnTime: "",
        notes: "Dorește ambalare premium.",
        createdAt: "2026-05-17T13:10:00.000Z",
        status: "În verificare",
    },
    {
        orderId: "AD-1005",
        dollId: "celeste",
        dollName: "Céleste",
        mode: "rent",
        startDate: "2026-05-22",
        endDate: "2026-05-26",
        outfitId: "rent-outfit-evening",
        options: "rent-protective-case",
        total: "840",
        totalLabel: "840 lei",
        fullName: "Andreea Marin",
        email: "andreea@example.com",
        phone: "+40744111444",
        deliveryAddress: "Calea Exemplu 5, Ilfov",
        deliveryTime: "09:00",
        returnTime: "17:30",
        notes: "",
        createdAt: "2026-05-16T08:40:00.000Z",
        status: "Confirmată",
    },
] satisfies Array<{
    orderId: string;
    dollId: string;
    dollName: string;
    mode: CatalogMode;
    startDate: string;
    endDate: string;
    outfitId: string;
    options: string;
    total: string;
    totalLabel: string;
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    deliveryTime: string;
    returnTime: string;
    notes: string;
    createdAt: string;
    status: string;
}>;

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

function formatDate(value: string) {
    if (!value) {
        return "Neselectată";
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

    const availableForRent = dolls.filter((doll) => doll.available_for_rent).length;
    const availableForBuy = dolls.filter((doll) => doll.available_for_buy).length;
    const soldOut = dolls.filter((doll) => doll.availability === "sold_out").length;
    const activeDolls = dolls.filter((doll) => doll.is_active).length;

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
                            <div key={order.orderId} className={styles.orderItem}>
                                <div>
                                    <span className={styles.orderId}>{order.orderId}</span>
                                    <strong>{order.fullName}</strong>
                                    <small>{order.dollName}</small>
                                </div>

                                <div>
                                    <span>Rezervare</span>
                                    <strong>{getModeLabel(order.mode)}</strong>
                                    <small>
                                        {formatDate(order.startDate)} — {formatDate(order.endDate)}
                                    </small>
                                </div>

                                <div>
                                    <span>Livrare</span>
                                    <strong>{order.deliveryTime}</strong>
                                    <small>
                                        {order.mode === "rent" && order.returnTime
                                            ? `Retur ${order.returnTime}`
                                            : "Fără retur"}
                                    </small>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>{order.status}</strong>
                                    <small>{formatCreatedAt(order.createdAt)}</small>
                                </div>

                                <div>
                                    <span>Total</span>
                                    <strong>{order.totalLabel}</strong>
                                    <small>{order.phone}</small>
                                </div>

                                <div className={styles.orderActions}>
                                    <a href={`/admin/orders/${order.orderId}`} className={styles.viewButton}>
                                        Vezi
                                    </a>

                                    <a href={`tel:${getCleanPhone(order.phone)}`} className={styles.callButton}>
                                        Sună
                                    </a>

                                    <a
                                        href={getWhatsappHref(order.phone, order.orderId, order.fullName)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.whatsappButton}
                                    >
                                        WhatsApp
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
