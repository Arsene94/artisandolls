import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteOfferAction } from "@/app/admin/(protected)/offers/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import type { OfferRow, OfferType } from "@/lib/offers/shared";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<OfferType, string> = {
    threshold_percent: "Prag → %",
    threshold_fixed: "Prag → sumă",
    threshold_gift: "Prag → cadou",
    buy_x_get_y: "Cumperi X, primești Y",
    collection_percent: "% pe colecție",
    promo: "Promoțional",
};

function formatScope(offer: OfferRow): string {
    const base =
        offer.applies_to === "dolls"
            ? "Păpuși"
            : offer.applies_to === "both"
              ? "Shop + Păpuși"
              : "Shop";
    if (offer.applies_to !== "shop" && offer.doll_modes?.length === 1) {
        return `${base} · ${offer.doll_modes[0] === "rent" ? "închiriere" : "cumpărare"}`;
    }
    return base;
}

function formatSchedule(offer: OfferRow): string {
    const fmt = (iso: string | null) =>
        iso
            ? new Date(iso).toLocaleDateString("ro-RO", {
                  day: "2-digit",
                  month: "short",
              })
            : null;
    const from = fmt(offer.starts_at);
    const to = fmt(offer.expires_at);
    if (!from && !to) return "fără termen";
    return `${from ?? "…"} – ${to ?? "…"}`;
}

export default async function AdminOffersPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("site_offers")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const offers = (data ?? []) as OfferRow[];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Marketing</span>
                        <h2>Oferte</h2>
                        <p>
                            Promoții automate (fără cod) afișate pe site: banner pe
                            homepage, badge pe carduri și progres în checkout. Se aplică
                            automat la îndeplinirea condiției; nu se cumulează cu un cod —
                            reducerea mai mare câștigă.
                        </p>
                    </div>
                    <Link href="/admin/offers/new" className={styles.primaryLink}>
                        Adaugă ofertă
                    </Link>
                </div>

                {offers.length === 0 ? (
                    <div className={styles.emptyState}>Nu există oferte.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nume</th>
                                    <th>Tip</th>
                                    <th>Aplicare</th>
                                    <th className={styles.right}>Prioritate</th>
                                    <th>Perioadă</th>
                                    <th className={styles.center}>Status</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.map((offer) => (
                                    <tr key={offer.id}>
                                        <td>
                                            <Link
                                                href={`/admin/offers/${offer.id}/edit`}
                                                className={styles.nameLink}
                                            >
                                                {offer.name}
                                            </Link>
                                            {offer.badge_label ? (
                                                <small className={styles.sub}>
                                                    Badge: {offer.badge_label}
                                                </small>
                                            ) : null}
                                        </td>
                                        <td>{TYPE_LABELS[offer.type]}</td>
                                        <td>
                                            <span className={styles.badge}>
                                                {formatScope(offer)}
                                            </span>
                                        </td>
                                        <td className={styles.right}>
                                            {offer.priority}
                                        </td>
                                        <td>{formatSchedule(offer)}</td>
                                        <td className={styles.center}>
                                            <span className={styles.status}>
                                                <span
                                                    className={`${styles.dot} ${offer.is_active ? styles.dotOn : styles.dotOff}`}
                                                />
                                                {offer.is_active
                                                    ? "Activ"
                                                    : "Inactiv"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/offers/${offer.id}/edit`}
                                                    aria-label="Editează"
                                                    title="Editează"
                                                    className={styles.actionBtn}
                                                >
                                                    <IconPencil size={18} />
                                                </Link>
                                                <DeleteButton
                                                    icon
                                                    className={styles.actionBtnDanger}
                                                    confirmMessage={`Ștergi oferta „${offer.name}"?`}
                                                    onDelete={async () => {
                                                        "use server";
                                                        await deleteOfferAction(
                                                            offer.id,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
