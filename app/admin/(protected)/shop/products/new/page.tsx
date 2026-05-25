import Link from "next/link";
import { getShopCategories } from "@/lib/shop/products";
import { createProductAction } from "@/app/admin/(protected)/shop/actions";
import ShopProductForm from "@/components/admin/shop/ShopProductForm";

export default async function NewShopProductPage() {
    const categories = await getShopCategories().catch(() => []);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/shop/products"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la produse
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                Produs nou
            </h1>
            <ShopProductForm
                action={createProductAction}
                categories={categories}
                submitLabel="Creează produsul"
            />
        </main>
    );
}
