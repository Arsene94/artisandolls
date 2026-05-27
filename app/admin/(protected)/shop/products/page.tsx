import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import { deleteProductAction } from "@/app/admin/(protected)/shop/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import type { ShopProductRow } from "@/lib/shop/shared";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

export default async function AdminShopProductsPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    const products = (data ?? []) as ShopProductRow[];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-7xl">
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Shop</span>
                        <h2>Produse magazin</h2>
                        <p>
                            Catalogul comercial — produse de îngrijire, lenjerie,
                            accesorii.
                        </p>
                    </div>
                    <Link href="/admin/shop/products/new" className={styles.primaryLink}>
                        Adaugă produs
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className={styles.emptyState}>
                        Nu există produse încă. Adaugă primul produs pentru a popula
                        magazinul.
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nume</th>
                                    <th>SKU</th>
                                    <th className={styles.right}>Preț</th>
                                    <th className={styles.right}>Stoc</th>
                                    <th className={styles.center}>Status</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <Link
                                                href={`/admin/shop/products/${product.id}/edit`}
                                                className={styles.nameLink}
                                            >
                                                {product.name}
                                            </Link>
                                            <small className={styles.sub}>
                                                /{product.slug}
                                                {product.is_featured ? " · ★" : ""}
                                            </small>
                                        </td>
                                        <td>
                                            <span className={styles.mono}>
                                                {product.sku ?? "—"}
                                            </span>
                                        </td>
                                        <td className={styles.right}>
                                            <strong>
                                                {formatPrice(
                                                    product.price,
                                                    "ro",
                                                    product.currency,
                                                )}
                                            </strong>
                                        </td>
                                        <td className={styles.right}>
                                            {product.track_stock
                                                ? product.stock_quantity
                                                : "∞"}
                                        </td>
                                        <td className={styles.center}>
                                            <span className={styles.status}>
                                                <span
                                                    className={`${styles.dot} ${product.is_active ? styles.dotOn : styles.dotOff}`}
                                                />
                                                {product.is_active
                                                    ? "Activ"
                                                    : "Inactiv"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/shop/products/${product.id}/edit`}
                                                    aria-label="Editează"
                                                    title="Editează"
                                                    className={styles.actionBtn}
                                                >
                                                    <IconPencil size={18} />
                                                </Link>
                                                <DeleteButton
                                                    icon
                                                    className={styles.actionBtnDanger}
                                                    confirmMessage={`Ștergi „${product.name}"?`}
                                                    onDelete={async () => {
                                                        "use server";
                                                        await deleteProductAction(
                                                            product.id,
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
