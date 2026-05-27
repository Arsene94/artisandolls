import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteCategoryAction } from "@/app/admin/(protected)/shop/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import type { ShopCategoryRow } from "@/lib/shop/shared";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

export default async function AdminShopCategoriesPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("shop_categories")
        .select("*")
        .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);

    const categories = (data ?? []) as ShopCategoryRow[];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Shop</span>
                        <h2>Categorii magazin</h2>
                        <p>Organizarea produselor din magazin.</p>
                    </div>
                    <Link
                        href="/admin/shop/categories/new"
                        className={styles.primaryLink}
                    >
                        Adaugă categorie
                    </Link>
                </div>

                {categories.length === 0 ? (
                    <div className={styles.emptyState}>
                        Nu există categorii. Creează una pentru a începe.
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Categorie</th>
                                    <th>Descriere</th>
                                    <th className={styles.right}>Ordine</th>
                                    <th className={styles.center}>Status</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <Link
                                                href={`/admin/shop/categories/${c.id}/edit`}
                                                className={styles.nameLink}
                                            >
                                                {c.name}
                                            </Link>
                                            <small className={styles.sub}>
                                                /{c.slug}
                                            </small>
                                        </td>
                                        <td>
                                            {c.description ? (
                                                <span className={styles.clamp}>
                                                    {c.description}
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className={styles.right}>
                                            {c.display_order}
                                        </td>
                                        <td className={styles.center}>
                                            <span className={styles.status}>
                                                <span
                                                    className={`${styles.dot} ${c.is_active ? styles.dotOn : styles.dotOff}`}
                                                />
                                                {c.is_active ? "Activ" : "Inactiv"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/shop/categories/${c.id}/edit`}
                                                    aria-label="Editează"
                                                    title="Editează"
                                                    className={styles.actionBtn}
                                                >
                                                    <IconPencil size={18} />
                                                </Link>
                                                <DeleteButton
                                                    icon
                                                    className={styles.actionBtnDanger}
                                                    confirmMessage={`Ștergi categoria „${c.name}"?`}
                                                    onDelete={async () => {
                                                        "use server";
                                                        await deleteCategoryAction(
                                                            c.id,
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
