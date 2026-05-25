import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import {
    SHOP_ORDER_STATUS_OPTIONS,
    type ShopOrderStatus,
} from "@/lib/shop/shared";
import { updateShopOrderStatusAction } from "@/app/admin/(protected)/shop/actions";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

function statusLabel(value: string): string {
    return (
        SHOP_ORDER_STATUS_OPTIONS.find((opt) => opt.value === value)?.label ??
        value
    );
}

export default async function ShopOrderDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const [{ data: order }, { data: items }] = await Promise.all([
        supabase.from("shop_orders").select("*").eq("id", id).maybeSingle(),
        supabase
            .from("shop_order_items")
            .select("*")
            .eq("order_id", id)
            .order("created_at", { ascending: true }),
    ]);

    if (!order) notFound();

    const currency = order.currency ?? "RON";

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/shop/orders"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la comenzi
            </Link>
            <header className="mb-8">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold font-mono">
                    {order.order_number}
                </p>
                <h1 className="font-display italic text-3xl text-silk mt-2">
                    Comandă magazin
                </h1>
            </header>

            <div className="grid lg:grid-cols-[1fr_22rem] gap-6 items-start">
                <section className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-6">
                    <h2 className="font-heading text-sm uppercase tracking-[0.18em] text-silk/65 mb-4">
                        Linii comandă
                    </h2>
                    <ul className="divide-y divide-velvet-800/40 list-none p-0">
                        {(items ?? []).map((item) => (
                            <li
                                key={item.id}
                                className="py-3 flex justify-between gap-3 text-sm"
                            >
                                <div>
                                    <p className="text-silk">{item.product_name}</p>
                                    <p className="text-[0.72rem] text-silk/55 font-mono">
                                        {item.product_sku ?? item.product_slug} × {item.quantity}
                                    </p>
                                </div>
                                <p className="text-silk whitespace-nowrap">
                                    {formatPrice(
                                        item.line_total,
                                        "ro",
                                        item.currency ?? currency,
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-velvet-800 flex justify-between items-baseline">
                        <span className="text-[0.72rem] uppercase tracking-[0.18em] text-gold">
                            Total
                        </span>
                        <span className="font-display italic text-2xl text-silk">
                            {formatPrice(order.total_amount, "ro", currency)}
                        </span>
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-6">
                        <h2 className="font-heading text-sm uppercase tracking-[0.18em] text-silk/65 mb-4">
                            Status
                        </h2>
                        <form
                            action={async (formData) => {
                                "use server";
                                const next = String(formData.get("status") ?? "") as ShopOrderStatus;
                                await updateShopOrderStatusAction(id, next);
                            }}
                            className="space-y-3"
                        >
                            <select
                                name="status"
                                defaultValue={order.status}
                                className="w-full bg-velvet-950 border border-velvet-700 rounded-lg px-3 py-2 text-silk focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold text-sm"
                            >
                                {SHOP_ORDER_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="w-full bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-2 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                            >
                                Actualizează
                            </button>
                            <p className="text-[0.72rem] text-silk/55">
                                Curent: {statusLabel(order.status)}
                            </p>
                        </form>
                    </div>

                    <div className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-6 text-sm space-y-2">
                        <h2 className="font-heading text-sm uppercase tracking-[0.18em] text-silk/65 mb-3">
                            Client
                        </h2>
                        <p className="text-silk">{order.customer_name}</p>
                        <p className="text-silk/75">{order.customer_phone}</p>
                        {order.customer_email ? (
                            <p className="text-silk/75 break-all">{order.customer_email}</p>
                        ) : null}
                        <p className="text-silk/75 pt-2 border-t border-velvet-800 mt-3">
                            {order.delivery_address}
                            {order.delivery_city ? `, ${order.delivery_city}` : ""}
                            {order.delivery_county ? `, ${order.delivery_county}` : ""}
                        </p>
                        {order.contact_method ? (
                            <p className="text-silk/65 text-[0.78rem]">
                                Canal: {order.contact_method}
                                {order.contact_window_start && order.contact_window_end
                                    ? ` · ${order.contact_window_start}–${order.contact_window_end}`
                                    : ""}
                            </p>
                        ) : null}
                        {order.notes ? (
                            <p className="text-silk/75 pt-2 border-t border-velvet-800 mt-3 italic">
                                „{order.notes}”
                            </p>
                        ) : null}
                    </div>
                </aside>
            </div>
        </main>
    );
}
