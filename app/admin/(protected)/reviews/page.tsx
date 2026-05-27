import Link from "next/link";
import { getReviewsForAdmin } from "@/lib/reviews/queries";
import type { ReviewStatus } from "@/lib/reviews/shared";
import { IconEye } from "@tabler/icons-react";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const STATUSES: ReviewStatus[] = ["pending", "invited", "approved", "rejected"];

const STATUS_DOT: Record<ReviewStatus, string> = {
    approved: "dotOn",
    rejected: "dotDanger",
    pending: "dotWarn",
    invited: "dotOff",
};

function parseStatus(value: string | undefined): ReviewStatus | undefined {
    if (!value) return undefined;
    return (STATUSES as string[]).includes(value) ? (value as ReviewStatus) : undefined;
}

function ratingStars(rating: number | null) {
    if (rating === null) return "—";
    return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export default async function AdminReviewsPage(props: { searchParams: SearchParams }) {
    const { status } = await props.searchParams;
    const filter = parseStatus(status);
    const reviews = await getReviewsForAdmin(filter);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Moderare</span>
                        <h2>Recenzii clienți</h2>
                        <p>
                            Toate recenziile trec prin moderare manuală înainte de
                            publicare. Aprobările apar pe pagina țintă (doll sau produs)
                            și sunt injectate în JSON-LD pentru rich results.
                        </p>
                    </div>
                </div>

                <nav aria-label="Filtre status" className={styles.filters}>
                    <Link
                        href="/admin/reviews"
                        className={`${styles.filter} ${!filter ? styles.filterActive : ""}`}
                    >
                        Toate ({reviews.length})
                    </Link>
                    {STATUSES.map((s) => (
                        <Link
                            key={s}
                            href={`/admin/reviews?status=${s}`}
                            className={`${styles.filter} ${filter === s ? styles.filterActive : ""}`}
                        >
                            {s}
                        </Link>
                    ))}
                </nav>

                {reviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        Nicio recenzie pentru filtrul selectat.
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Recenzie</th>
                                    <th>Rating</th>
                                    <th>Client</th>
                                    <th>Țintă</th>
                                    <th className={styles.center}>Status</th>
                                    <th>Data</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <Link
                                                href={`/admin/reviews/${r.id}`}
                                                className={styles.nameLink}
                                            >
                                                {r.title ?? "(fără titlu)"}
                                            </Link>
                                            <small className={`${styles.sub} ${styles.clamp}`}>
                                                {r.body ??
                                                    "Invitație în așteptare — clientul nu a completat încă."}
                                            </small>
                                        </td>
                                        <td>
                                            <span className={styles.stars}>
                                                {ratingStars(r.rating)}
                                            </span>
                                        </td>
                                        <td>
                                            {r.customer_name ??
                                                r.customer_initials ??
                                                "Anonim"}
                                            <small className={styles.sub}>
                                                {r.locale ?? "—"}
                                            </small>
                                        </td>
                                        <td>{r.target_type}</td>
                                        <td className={styles.center}>
                                            <span className={styles.status}>
                                                <span
                                                    className={`${styles.dot} ${styles[STATUS_DOT[r.status]]}`}
                                                />
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(r.created_at).toLocaleDateString(
                                                "ro-RO",
                                                { day: "numeric", month: "short" },
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/reviews/${r.id}`}
                                                    aria-label="Deschide"
                                                    title="Deschide"
                                                    className={styles.actionBtn}
                                                >
                                                    <IconEye size={18} />
                                                </Link>
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
