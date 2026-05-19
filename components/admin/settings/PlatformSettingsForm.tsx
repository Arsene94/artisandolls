"use client";

import { useTransition } from "react";
import type { PlatformSettingsRow } from "@/lib/settings/shared";
import styles from "./AdminSettings.module.css";

type Props = {
    settings: PlatformSettingsRow;
    action: (formData: FormData) => Promise<void>;
};

export default function PlatformSettingsForm({ settings, action }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await action(formData);
        });
    }

    return (
        <form action={handleSubmit} className={styles.form}>
            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <span>Business</span>
                    <h2>Date platformă</h2>
                </div>

                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        Nume business
                        <input name="business_name" defaultValue={settings.business_name} />
                    </label>

                    <label className={styles.field}>
                        URL public site
                        <input name="public_site_url" defaultValue={settings.public_site_url ?? ""} />
                    </label>

                    <label className={styles.field}>
                        Email contact
                        <input name="contact_email" defaultValue={settings.contact_email ?? ""} />
                    </label>

                    <label className={styles.field}>
                        Telefon contact
                        <input name="contact_phone" defaultValue={settings.contact_phone ?? ""} />
                    </label>

                    <label className={styles.field}>
                        WhatsApp public
                        <input name="whatsapp_phone" defaultValue={settings.whatsapp_phone ?? ""} />
                    </label>

                    <label className={styles.field}>
                        Monedă
                        <input name="currency" defaultValue={settings.currency} />
                    </label>

                    <label className={styles.field}>
                        Locale
                        <input name="locale" defaultValue={settings.locale} />
                    </label>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <span>Funcționalități</span>
                    <h2>Disponibilitate platformă</h2>
                </div>

                <div className={styles.checksGrid}>
                    <label className={styles.checkField}>
                        <input name="catalog_enabled" type="checkbox" defaultChecked={settings.catalog_enabled} />
                        Catalog activ
                    </label>

                    <label className={styles.checkField}>
                        <input name="rent_enabled" type="checkbox" defaultChecked={settings.rent_enabled} />
                        Închirieri active
                    </label>

                    <label className={styles.checkField}>
                        <input name="buy_enabled" type="checkbox" defaultChecked={settings.buy_enabled} />
                        Cumpărări active
                    </label>

                    <label className={styles.checkField}>
                        <input name="maintenance_mode" type="checkbox" defaultChecked={settings.maintenance_mode} />
                        Maintenance mode
                    </label>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <span>Livrare</span>
                    <h2>Ore implicite</h2>
                </div>

                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        Livrare de la
                        <input
                            type="time"
                            name="default_delivery_start_time"
                            defaultValue={settings.default_delivery_start_time ?? ""}
                        />
                    </label>

                    <label className={styles.field}>
                        Livrare până la
                        <input
                            type="time"
                            name="default_delivery_end_time"
                            defaultValue={settings.default_delivery_end_time ?? ""}
                        />
                    </label>

                    <label className={styles.field}>
                        Retur de la
                        <input
                            type="time"
                            name="default_return_start_time"
                            defaultValue={settings.default_return_start_time ?? ""}
                        />
                    </label>

                    <label className={styles.field}>
                        Retur până la
                        <input
                            type="time"
                            name="default_return_end_time"
                            defaultValue={settings.default_return_end_time ?? ""}
                        />
                    </label>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <span>Texte</span>
                    <h2>Termeni și note</h2>
                </div>

                <label className={styles.field}>
                    Termeni comandă
                    <textarea name="order_terms" defaultValue={settings.order_terms ?? ""} />
                </label>

                <label className={styles.field}>
                    Notă privacy
                    <textarea name="privacy_note" defaultValue={settings.privacy_note ?? ""} />
                </label>

                <label className={styles.field}>
                    Note interne admin
                    <textarea name="admin_notes" defaultValue={settings.admin_notes ?? ""} />
                </label>
            </section>

            <button className={styles.primaryButton} disabled={isPending}>
                {isPending ? "Se salvează..." : "Salvează setările"}
            </button>
        </form>
    );
}
