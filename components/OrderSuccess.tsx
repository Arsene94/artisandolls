import Link from "next/link";
import {
    formatDateRo,
    formatOrderMode,
    type OrderRow,
} from "@/lib/orders";
import styles from "./OrderSuccess.module.css";

type OrderSuccessProps = {
    order: OrderRow;
};

export default function OrderSuccess({ order }: OrderSuccessProps) {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern} />

                <div className={styles.card}>
                    <span className={styles.successIcon}>✓</span>
                    <span className="section-label">Comandă trimisă</span>

                    <h1>
                        Cererea ta a fost <em>înregistrată</em>
                    </h1>

                    <p>
                        Am salvat detaliile pentru {formatOrderMode(order.mode).toLowerCase()}.
                        Următorul pas este confirmarea disponibilității și a livrării.
                    </p>

                    <div className={styles.summary}>
                        <div>
                            <span>Număr comandă</span>
                            <strong>{order.order_number}</strong>
                        </div>

                        <div>
                            <span>Păpușă</span>
                            <strong>{order.doll_name}</strong>
                        </div>

                        <div>
                            <span>Mod</span>
                            <strong>{formatOrderMode(order.mode)}</strong>
                        </div>

                        <div>
                            <span>Perioadă</span>
                            <strong>
                                {formatDateRo(order.start_date)} — {formatDateRo(order.end_date)}
                            </strong>
                        </div>

                        <div>
                            <span>Total estimat</span>
                            <strong>{order.total_label}</strong>
                        </div>

                        <div>
                            <span>Client</span>
                            <strong>{order.customer_name}</strong>
                        </div>

                        <div>
                            <span>Contact</span>
                            <strong>{order.customer_phone}</strong>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/" className="btn btn-gold">
                            Înapoi acasă
                        </Link>

                        <Link href="/catalog" className="btn btn-outline-light">
                            Vezi catalogul
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
