import Link from "next/link";
import { getBlogPostsForAdmin } from "@/lib/blog/posts";
import { deleteBlogPostAction } from "./actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

const STATUS_LABELS = {
    active: "Activ",
    scheduled: "Programat",
    draft: "Inactiv",
} as const;

type Status = keyof typeof STATUS_LABELS;

function deriveStatus(row: { is_active: boolean; publish_at: string }): Status {
    if (!row.is_active) return "draft";
    if (new Date(row.publish_at).getTime() > Date.now()) return "scheduled";
    return "active";
}

const STATUS_DOT: Record<Status, string> = {
    active: "dotOn",
    scheduled: "dotWarn",
    draft: "dotOff",
};

export default async function AdminBlogIndexPage() {
    const posts = await getBlogPostsForAdmin();

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Conținut</span>
                        <h2>Blog</h2>
                        <p>Articole publicate, programate sau în lucru.</p>
                    </div>
                    <Link href="/admin/blog/new" className={styles.primaryLink}>
                        Articol nou
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className={styles.emptyState}>
                        Nu există articole. Creează unul pentru a începe.
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Articol</th>
                                    <th>Categorie</th>
                                    <th className={styles.center}>Status</th>
                                    <th>Publicare</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((p) => {
                                    const status = deriveStatus(p);
                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <Link
                                                    href={`/admin/blog/${p.id}/edit`}
                                                    className={styles.nameLink}
                                                >
                                                    {p.title}
                                                </Link>
                                                <small className={styles.sub}>
                                                    /blog/{p.slug}
                                                </small>
                                            </td>
                                            <td>{p.category}</td>
                                            <td className={styles.center}>
                                                <span className={styles.status}>
                                                    <span
                                                        className={`${styles.dot} ${styles[STATUS_DOT[status]]}`}
                                                    />
                                                    {STATUS_LABELS[status]}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(
                                                    p.publish_at,
                                                ).toLocaleDateString("ro-RO", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                <div className={styles.rowActions}>
                                                    <Link
                                                        href={`/admin/blog/${p.id}/edit`}
                                                        aria-label="Editează"
                                                        title="Editează"
                                                        className={styles.actionBtn}
                                                    >
                                                        <IconPencil size={18} />
                                                    </Link>
                                                    <DeleteButton
                                                        icon
                                                        className={styles.actionBtnDanger}
                                                        confirmMessage={`Ștergi articolul „${p.title}"?`}
                                                        onDelete={async () => {
                                                            "use server";
                                                            await deleteBlogPostAction(
                                                                p.id,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
