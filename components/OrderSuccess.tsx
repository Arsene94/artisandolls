"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import styles from "./OrderSuccess.module.css";

type OrderSuccessProps = {
    doll: Doll;
    mode: CatalogMode;
    orderId: string;
};

type StoredOrder = {
    orderId: string;
    dollName: string;
    mode: CatalogMode;
    totalLabel: string;
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    deliveryDate: string;
    deliveryTime: string;
    returnTime: string;
};

function getModeLabel(mode: CatalogMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
}

export default function OrderSuccess({ doll, mode, orderId }: OrderSuccessProps) {
    const [order, setOrder] = useState<StoredOrder | null>(null);

    useEffect(() => {
        const storedOrder = sessionStorage.getItem(`artisandolls-order-${orderId}`);

        if (!storedOrder) {
            return;
        }

        try {
            setOrder(JSON.parse(storedOrder) as StoredOrder);
        } catch {
            setOrder(null);
        }
    }, [orderId]);

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
                        Am salvat detaliile pentru {getModeLabel(mode).toLowerCase()}. Următorul pas este confirmarea disponibilității și a livrării.
                    </p>

                    <div className={styles.summary}>
                        <div>
                            <span>Număr comandă</span>
                            <strong>{orderId}</strong>
                        </div>

                        <div>
                            <span>Păpușă</span>
                            <strong>{order?.dollName ?? doll.name}</strong>
                        </div>

                        <div>
                            <span>Mod</span>
                            <strong>{getModeLabel(mode)}</strong>
                        </div>

                        <div>
                            <span>Total estimat</span>
                            <strong>{order?.totalLabel ?? "Se confirmă după verificare"}</strong>
                        </div>

                        {order && (
                            <>
                                <div>
                                    <span>Client</span>
                                    <strong>{order.fullName}</strong>
                                </div>

                                <div>
                                    <span>Contact</span>
                                    <strong>{order.phone}</strong>
                                </div>
                            </>
                        )}
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
