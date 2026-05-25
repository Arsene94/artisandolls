import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateCategoryAction } from "@/app/admin/(protected)/shop/actions";
import ShopCategoryForm from "@/components/admin/shop/ShopCategoryForm";
import type { ShopCategoryRow } from "@/lib/shop/shared";

type Props = { params: Promise<{ id: string }> };

export default async function EditShopCategoryPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from("shop_categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (!data) notFound();
    const category = data as ShopCategoryRow;
    const action = updateCategoryAction.bind(null, id);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-4xl">
            <Link
                href="/admin/shop/categories"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la categorii
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                {category.name}
            </h1>
            <ShopCategoryForm
                action={action}
                initial={category}
                submitLabel="Salvează modificările"
            />
        </main>
    );
}
