import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateCouponAction } from "@/app/admin/(protected)/shop/actions";
import ShopCouponForm from "@/components/admin/shop/ShopCouponForm";
import type { ShopCategoryRow, ShopCouponRow } from "@/lib/shop/shared";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditShopCouponPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const [{ data: coupon }, { data: categories }] = await Promise.all([
        supabase.from("shop_coupons").select("*").eq("id", id).maybeSingle(),
        supabase
            .from("shop_categories")
            .select("*")
            .order("display_order", { ascending: true }),
    ]);

    if (!coupon) notFound();
    const action = updateCouponAction.bind(null, id);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/shop/coupons"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la coduri
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-2">
                {coupon.code}
            </h1>
            <p className="text-silk/65 mb-8">
                Utilizări:{" "}
                <span className="font-mono">
                    {coupon.redemptions_count}
                    {coupon.max_redemptions !== null
                        ? ` / ${coupon.max_redemptions}`
                        : " (nelimitat)"}
                </span>
            </p>
            <ShopCouponForm
                action={action}
                categories={(categories ?? []) as ShopCategoryRow[]}
                initial={coupon as ShopCouponRow}
                submitLabel="Salvează modificările"
            />
        </main>
    );
}
