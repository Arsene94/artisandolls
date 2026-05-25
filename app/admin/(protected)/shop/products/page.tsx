import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import { deleteProductAction } from "@/app/admin/(protected)/shop/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import type { ShopProductRow } from "@/lib/shop/shared";

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
            <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        Shop
                    </p>
                    <h1 className="font-display italic text-3xl text-silk mt-2">
                        Produse magazin
                    </h1>
                    <p className="text-silk/75 mt-1 max-w-2xl">
                        Catalogul comercial — produse de îngrijire, lenjerie, accesorii.
                    </p>
                </div>
                <Link
                    href="/admin/shop/products/new"
                    className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    + Adaugă produs
                </Link>
            </header>

            {products.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există produse încă. Adaugă primul produs pentru a popula magazinul.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-velvet-800/60">
                    <table className="w-full text-sm">
                        <thead className="bg-velvet-900/60 text-silk/65 uppercase text-[0.7rem] tracking-[0.16em]">
                            <tr>
                                <th className="px-4 py-3 text-left">Nume</th>
                                <th className="px-4 py-3 text-left">SKU</th>
                                <th className="px-4 py-3 text-right">Preț</th>
                                <th className="px-4 py-3 text-right">Stoc</th>
                                <th className="px-4 py-3 text-center">Activ</th>
                                <th className="px-4 py-3 text-right">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-velvet-800/40">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-velvet-900/30">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/shop/products/${product.id}/edit`}
                                            className="text-silk hover:text-gold font-medium"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="text-[0.72rem] text-silk/55 mt-0.5">
                                            /{product.slug}
                                            {product.is_featured ? " · ★" : ""}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-silk/70 font-mono text-[0.78rem]">
                                        {product.sku ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-silk">
                                        {formatPrice(product.price, "ro", product.currency)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-silk/85">
                                        {product.track_stock
                                            ? product.stock_quantity
                                            : "∞"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {product.is_active ? (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-success" />
                                        ) : (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-silk/30" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/shop/products/${product.id}/edit`}
                                                className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light px-3 py-1.5 rounded-full"
                                            >
                                                Edit
                                            </Link>
                                            <DeleteButton
                                                confirmMessage={`Ștergi „${product.name}"?`}
                                                onDelete={async () => {
                                                    "use server";
                                                    await deleteProductAction(product.id);
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
        </main>
    );
}
