import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getShopCategories } from "@/lib/shop/products";
import { updateProductAction } from "@/app/admin/(protected)/shop/actions";
import ShopProductForm from "@/components/admin/shop/ShopProductForm";
import type { ShopProductRow } from "@/lib/shop/shared";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditShopProductPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const [{ data: product }, categories] = await Promise.all([
        supabase.from("shop_products").select("*").eq("id", id).maybeSingle(),
        getShopCategories().catch(() => []),
    ]);

    if (!product) notFound();

    const action = updateProductAction.bind(null, id);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/shop/products"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la produse
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                {product.name}
            </h1>
            <ShopProductForm
                action={action}
                categories={categories}
                initial={product as ShopProductRow}
                submitLabel="Salvează modificările"
            />
        </main>
    );
}
