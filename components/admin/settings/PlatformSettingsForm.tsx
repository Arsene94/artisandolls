"use client";

import { useTransition } from "react";
import type { PlatformSettingsRow } from "@/lib/settings/shared";
import UcpKeyManager from "./UcpKeyManager";
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
                    <span>Plată online</span>
                    <h2>Stripe & Netopia</h2>
                    <p>
                        Toggle-ul activează plata cu cardul în pagina de checkout
                        din magazin. „Cash la livrare” rămâne mereu disponibil.
                        Credențialele sensibile (chei secrete, certificate)
                        rămân doar în variabile de mediu.
                    </p>
                </div>

                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        Activează plata cu cardul în magazin
                        <select
                            name="online_payment_enabled"
                            defaultValue={settings.online_payment_enabled ? "1" : "0"}
                        >
                            <option value="0">Dezactivat — doar cash la livrare</option>
                            <option value="1">Activat — cash + card</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Procesator activ
                        <select
                            name="online_payment_provider"
                            defaultValue={settings.online_payment_provider}
                        >
                            <option value="netopia">Netopia (recomandat RO)</option>
                            <option value="stripe">Stripe</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Netopia · POS signature
                        <input
                            name="netopia_pos_signature"
                            defaultValue={settings.netopia_pos_signature ?? ""}
                            placeholder="2ZTW-..."
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </label>

                    <label className={styles.field}>
                        Netopia · Mediu producție
                        <select
                            name="netopia_live_mode"
                            defaultValue={settings.netopia_live_mode ? "1" : "0"}
                        >
                            <option value="0">Sandbox</option>
                            <option value="1">Production</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Stripe · Publishable key
                        <input
                            name="stripe_publishable_key"
                            defaultValue={settings.stripe_publishable_key ?? ""}
                            placeholder="pk_live_..."
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </label>

                    <label className={styles.field}>
                        Stripe · Connect account ID (opțional)
                        <input
                            name="stripe_account_id"
                            defaultValue={settings.stripe_account_id ?? ""}
                            placeholder="acct_..."
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </label>
                </div>

                <p
                    style={{
                        marginTop: "0.75rem",
                        lineHeight: 1.55,
                        fontSize: "0.82rem",
                        color: "rgba(255, 255, 255, 0.62)",
                    }}
                >
                    Cheile secrete se setează ca variabile de mediu pe server:
                    <code> NETOPIA_API_KEY</code>, <code> NETOPIA_PUBLIC_KEY</code>,
                    <code> STRIPE_SECRET_KEY</code>, <code> STRIPE_WEBHOOK_SECRET</code>.
                    Webhook-urile sunt configurate către{" "}
                    <code>/api/payments/netopia/webhook</code> și{" "}
                    <code>/api/payments/stripe/webhook</code>.
                </p>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <span>Checkout · UCP</span>
                    <h2>Universal Commerce Protocol</h2>
                    <p>
                        UCP expune <code>/.well-known/ucp</code> și endpoint-urile
                        <code> /api/ucp/checkout-sessions</code> pentru agenți AI
                        (Google AI Mode, Gemini, MCP). Cu „UCP" activ,
                        magazinul rămâne accesibil prin checkout-ul propriu, iar
                        agenții pot plasa comenzi prin protocolul standard.
                    </p>
                </div>

                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        Mod checkout magazin
                        <select
                            name="shop_checkout_mode"
                            defaultValue={settings.shop_checkout_mode}
                        >
                            <option value="own">Doar checkout propriu</option>
                            <option value="ucp">Propriu + UCP (agentic)</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Endpoint-uri UCP active
                        <select
                            name="ucp_enabled"
                            defaultValue={settings.ucp_enabled ? "1" : "0"}
                        >
                            <option value="0">Dezactivate</option>
                            <option value="1">Activate</option>
                        </select>
                    </label>
                </div>

                <div style={{ marginTop: 14 }}>
                    <UcpKeyManager hasKey={Boolean(settings.ucp_api_key_hash)} />
                </div>

                <p
                    style={{
                        marginTop: "0.75rem",
                        lineHeight: 1.55,
                        fontSize: "0.82rem",
                        color: "rgba(255, 255, 255, 0.62)",
                    }}
                >
                    Endpoint-uri publicate (HTTPS, TLS 1.3, JSON):
                    <br />
                    <code>GET  /.well-known/ucp</code> · descoperire profil
                    <br />
                    <code>POST /api/ucp/checkout-sessions</code> · creare sesiune
                    <br />
                    <code>GET  /api/ucp/checkout-sessions/&#123;id&#125;</code> · stare
                    <br />
                    <code>PUT  /api/ucp/checkout-sessions/&#123;id&#125;</code> · actualizare
                    <br />
                    <code>POST /api/ucp/checkout-sessions/&#123;id&#125;/complete</code> · finalizare
                    <br />
                    <code>POST /api/ucp/checkout-sessions/&#123;id&#125;/cancel</code> · anulare
                </p>
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
