import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import { deleteCouponAction } from "@/app/admin/(protected)/shop/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import type { ShopCouponRow } from "@/lib/shop/shared";

export const dynamic = "force-dynamic";

function formatType(type: ShopCouponRow["type"]): string {
    if (type === "percentage") return "Procentaj";
    if (type === "fixed") return "Sumă fixă";
    return "Livrare gratuită";
}

function formatValue(coupon: ShopCouponRow): string {
    if (coupon.type === "percentage") return `${coupon.value}%`;
    if (coupon.type === "fixed") {
        return formatPrice(coupon.value, "ro", coupon.currency || "RON");
    }
    return "—";
}

function formatExpiry(coupon: ShopCouponRow): string {
    if (!coupon.expires_at) return "fără termen";
    const expires = new Date(coupon.expires_at);
    if (Number.isNaN(expires.getTime())) return "—";
    return expires.toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function AdminShopCouponsPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("shop_coupons")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const coupons = (data ?? []) as ShopCouponRow[];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        Shop
                    </p>
                    <h1 className="font-display italic text-3xl text-silk mt-2">
                        Coduri promoționale
                    </h1>
                    <p className="text-silk/75 mt-1 max-w-2xl">
                        Coduri reducere pentru magazin: procentaj, sumă fixă sau
                        livrare gratuită. Setează termen și limite atent — nu pot
                        fi anulate retroactiv pe comenzile deja confirmate.
                    </p>
                </div>
                <Link
                    href="/admin/shop/coupons/new"
                    className="inline-flex items-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    + Adaugă cod
                </Link>
            </header>

            {coupons.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există coduri promoționale.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-velvet-800/60">
                    <table className="w-full text-sm">
                        <thead className="bg-velvet-900/60 text-silk/65 uppercase text-[0.7rem] tracking-[0.16em]">
                            <tr>
                                <th className="px-4 py-3 text-left">Cod</th>
                                <th className="px-4 py-3 text-left">Tip</th>
                                <th className="px-4 py-3 text-right">Valoare</th>
                                <th className="px-4 py-3 text-right">Utilizări</th>
                                <th className="px-4 py-3 text-left">Expiră</th>
                                <th className="px-4 py-3 text-center">Activ</th>
                                <th className="px-4 py-3 text-right">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-velvet-800/40">
                            {coupons.map((coupon) => (
                                <tr
                                    key={coupon.id}
                                    className="hover:bg-velvet-900/30"
                                >
                                    <td className="px-4 py-3 font-mono text-gold">
                                        <Link
                                            href={`/admin/shop/coupons/${coupon.id}/edit`}
                                            className="hover:text-gold-light"
                                        >
                                            {coupon.code}
                                        </Link>
                                        {coupon.description ? (
                                            <p className="mt-0.5 text-[0.72rem] text-silk/55 font-sans">
                                                {coupon.description}
                                            </p>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3 text-silk/80">
                                        {formatType(coupon.type)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-silk">
                                        {formatValue(coupon)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-silk/85">
                                        {coupon.redemptions_count}
                                        {coupon.max_redemptions !== null
                                            ? ` / ${coupon.max_redemptions}`
                                            : ""}
                                    </td>
                                    <td className="px-4 py-3 text-silk/65 text-[0.82rem]">
                                        {formatExpiry(coupon)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {coupon.is_active ? (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-success" />
                                        ) : (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-silk/30" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/shop/coupons/${coupon.id}/edit`}
                                                className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light px-3 py-1.5 rounded-full"
                                            >
                                                Edit
                                            </Link>
                                            <DeleteButton
                                                confirmMessage={`Ștergi codul „${coupon.code}"?`}
                                                onDelete={async () => {
                                                    "use server";
                                                    await deleteCouponAction(coupon.id);
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
