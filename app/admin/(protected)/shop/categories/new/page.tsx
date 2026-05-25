import Link from "next/link";
import { createCategoryAction } from "@/app/admin/(protected)/shop/actions";
import ShopCategoryForm from "@/components/admin/shop/ShopCategoryForm";

export default function NewShopCategoryPage() {
    return (
        <main className="px-6 sm:px-10 py-10 max-w-4xl">
            <Link
                href="/admin/shop/categories"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la categorii
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                Categorie nouă
            </h1>
            <ShopCategoryForm
                action={createCategoryAction}
                submitLabel="Creează categoria"
            />
        </main>
    );
}
