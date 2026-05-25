import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import { SHOP_ORDER_STATUS_OPTIONS } from "@/lib/shop/shared";

export const dynamic = "force-dynamic";

function statusLabel(value: string): string {
    return (
        SHOP_ORDER_STATUS_OPTIONS.find((opt) => opt.value === value)?.label ??
        value
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function AdminShopOrdersPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("shop_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
    if (error) throw new Error(error.message);

    const orders = data ?? [];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-7xl">
            <header className="mb-8">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                    Shop
                </p>
                <h1 className="font-display italic text-3xl text-silk mt-2">
                    Comenzi magazin
                </h1>
                <p className="text-silk/75 mt-1">
                    Cele mai recente 200 de comenzi.
                </p>
            </header>

            {orders.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există comenzi încă.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-velvet-800/60">
                    <table className="w-full text-sm">
                        <thead className="bg-velvet-900/60 text-silk/65 uppercase text-[0.7rem] tracking-[0.16em]">
                            <tr>
                                <th className="px-4 py-3 text-left">Comandă</th>
                                <th className="px-4 py-3 text-left">Client</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-left">Creată</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-velvet-800/40">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-velvet-900/30"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/shop/orders/${order.id}`}
                                            className="text-gold hover:text-gold-light font-mono text-[0.85rem]"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-silk">
                                        {order.customer_name}
                                        <p className="text-[0.72rem] text-silk/55">
                                            {order.customer_phone}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-silk/85">
                                        {statusLabel(order.status)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-silk">
                                        {formatPrice(
                                            order.total_amount,
                                            "ro",
                                            order.currency ?? "RON",
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-silk/65 text-[0.82rem]">
                                        {formatDateTime(order.created_at)}
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
