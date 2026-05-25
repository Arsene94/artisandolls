import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCouponAction } from "@/app/admin/(protected)/shop/actions";
import ShopCouponForm from "@/components/admin/shop/ShopCouponForm";
import type { ShopCategoryRow } from "@/lib/shop/shared";

export const dynamic = "force-dynamic";

export default async function NewShopCouponPage() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
        .from("shop_categories")
        .select("*")
        .order("display_order", { ascending: true });

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/shop/coupons"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la coduri
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                Cod nou
            </h1>
            <ShopCouponForm
                action={createCouponAction}
                categories={(data ?? []) as ShopCategoryRow[]}
                submitLabel="Creează codul"
            />
        </main>
    );
}
