"use client";

import { useTransition } from "react";
import type { CustomerRow } from "@/lib/customers/shared";
import styles from "./AdminCustomers.module.css";

type Props = {
    customer: CustomerRow;
    action: (formData: FormData) => Promise<void>;
};

export default function CustomerForm({ customer, action }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
                <label className={styles.field}>
                    Nume complet
                    <input name="full_name" defaultValue={customer.full_name} required />
                </label>

                <label className={styles.field}>
                    Email
                    <input
                        type="email"
                        name="email"
                        defaultValue={customer.email}
                        required
                    />
                </label>

                <label className={styles.field}>
                    Telefon
                    <input name="phone" defaultValue={customer.phone} required />
                </label>
            </div>

            <label className={styles.field}>
                Ultima adresă de livrare
                <textarea
                    name="last_delivery_address"
                    defaultValue={customer.last_delivery_address ?? ""}
                />
            </label>

            <label className={styles.field}>
                Note interne
                <textarea name="notes" defaultValue={customer.notes ?? ""} />
            </label>

            <label className={styles.checkField}>
                <input
                    name="is_blocked"
                    type="checkbox"
                    defaultChecked={customer.is_blocked}
                />
                Client blocat
            </label>

            <button className={styles.primaryButton} disabled={isPending}>
                {isPending ? "Se salvează..." : "Salvează clientul"}
            </button>
        </form>
    );
}
