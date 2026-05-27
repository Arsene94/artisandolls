import Link from "next/link";
import { getFaqItemsForAdmin } from "@/lib/faq/queries";
import { deleteFaqItemAction } from "./actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

export default async function AdminFaqIndexPage() {
    const items = await getFaqItemsForAdmin();

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Conținut</span>
                        <h2>FAQ</h2>
                        <p>Întrebări frecvente afișate pe site și pe pagina /faq.</p>
                    </div>
                    <Link href="/admin/faq/new" className={styles.primaryLink}>
                        Întrebare nouă
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className={styles.emptyState}>
                        Nu există întrebări. Creează una pentru a începe.
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Întrebare</th>
                                    <th>Categorie</th>
                                    <th>Afișare</th>
                                    <th className={styles.right}>Ordine</th>
                                    <th className={styles.center}>Status</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <Link
                                                href={`/admin/faq/${item.id}/edit`}
                                                className={styles.nameLink}
                                            >
                                                {item.question}
                                            </Link>
                                            <small className={styles.sub}>
                                                /faq#{item.slug}
                                            </small>
                                        </td>
                                        <td>{item.category}</td>
                                        <td>
                                            {item.show_on_home
                                                ? "home + /faq"
                                                : "doar /faq"}
                                        </td>
                                        <td className={styles.right}>
                                            {item.display_order}
                                        </td>
                                        <td className={styles.center}>
                                            <span className={styles.status}>
                                                <span
                                                    className={`${styles.dot} ${item.is_active ? styles.dotOn : styles.dotOff}`}
                                                />
                                                {item.is_active ? "Activ" : "Inactiv"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/faq/${item.id}/edit`}
                                                    aria-label="Editează"
                                                    title="Editează"
                                                    className={styles.actionBtn}
                                                >
                                                    <IconPencil size={18} />
                                                </Link>
                                                <DeleteButton
                                                    icon
                                                    className={styles.actionBtnDanger}
                                                    confirmMessage={`Ștergi „${item.question.slice(0, 60)}"?`}
                                                    onDelete={async () => {
                                                        "use server";
                                                        await deleteFaqItemAction(
                                                            item.id,
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
