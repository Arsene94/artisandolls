import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteCategoryAction } from "@/app/admin/(protected)/shop/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import type { ShopCategoryRow } from "@/lib/shop/shared";

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
            <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        Shop
                    </p>
                    <h1 className="font-display italic text-3xl text-silk mt-2">
                        Categorii magazin
                    </h1>
                </div>
                <Link
                    href="/admin/shop/categories/new"
                    className="inline-flex items-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    + Adaugă categorie
                </Link>
            </header>

            {categories.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există categorii. Creează una pentru a începe.
                </div>
            ) : (
                <ul className="grid sm:grid-cols-2 gap-4 list-none p-0">
                    {categories.map((c) => (
                        <li
                            key={c.id}
                            className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-silk/55">
                                        /{c.slug}
                                    </p>
                                    <h2 className="font-display italic text-xl text-silk mt-1">
                                        {c.name}
                                    </h2>
                                    {c.description ? (
                                        <p className="mt-2 text-sm text-silk/70 line-clamp-2">
                                            {c.description}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span
                                        className={`inline-flex w-2 h-2 rounded-full ${c.is_active ? "bg-success" : "bg-silk/30"}`}
                                        title={c.is_active ? "Activă" : "Inactivă"}
                                    />
                                    <Link
                                        href={`/admin/shop/categories/${c.id}/edit`}
                                        className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light"
                                    >
                                        Edit
                                    </Link>
                                    <DeleteButton
                                        confirmMessage={`Ștergi categoria „${c.name}"?`}
                                        onDelete={async () => {
                                            "use server";
                                            await deleteCategoryAction(c.id);
                                        }}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
