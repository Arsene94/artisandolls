import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/i18n/format";
import { deleteCouponAction } from "@/app/admin/(protected)/shop/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { IconPencil } from "@tabler/icons-react";
import type { ShopCouponRow } from "@/lib/shop/shared";
import styles from "@/components/admin/shared/AdminTable.module.css";

export const dynamic = "force-dynamic";

function formatType(type: ShopCouponRow["type"]): string {
    if (type === "percentage") return "Procentaj";
    if (type === "fixed") return "Sumă fixă";
    return "Livrare gratuită";
}

function formatScope(coupon: ShopCouponRow): string {
    const base =
        coupon.applies_to === "dolls"
            ? "Păpuși"
            : coupon.applies_to === "both"
              ? "Shop + Păpuși"
              : "Shop";
    if (coupon.applies_to === "shop") return base;
    const modes = coupon.doll_modes ?? [];
    if (modes.length === 1) {
        return `${base} · ${modes[0] === "rent" ? "închiriere" : "cumpărare"}`;
    }
    return base;
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
            <section className={styles.panel}>
                <div className={styles.toolbar}>
                    <div>
                        <span>Shop</span>
                        <h2>Coduri promoționale</h2>
                        <p>
                            Coduri reducere pentru magazin și păpuși: procentaj, sumă
                            fixă sau livrare gratuită. Fiecare cod poate fi limitat la
                            shop, la păpuși sau ambele. Setează termen și limite atent —
                            nu pot fi anulate retroactiv pe comenzile deja confirmate.
                        </p>
                    </div>
                    <Link href="/admin/shop/coupons/new" className={styles.primaryLink}>
                        Adaugă cod
                    </Link>
                </div>

                {coupons.length === 0 ? (
                    <div className={styles.emptyState}>
                        Nu există coduri promoționale.
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Cod</th>
                                    <th>Aplicare</th>
                                    <th>Tip</th>
                                    <th className={styles.right}>Valoare</th>
                                    <th className={styles.right}>Utilizări</th>
                                    <th>Expiră</th>
                                    <th className={styles.center}>Status</th>
                                    <th className={styles.right}>Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td>
                                            <Link
                                                href={`/admin/shop/coupons/${coupon.id}/edit`}
                                                className={`${styles.nameLink} ${styles.mono}`}
                                            >
                                                {coupon.code}
                                            </Link>
                                            {coupon.description ? (
                                                <small className={styles.sub}>
                                                    {coupon.description}
                                                </small>
                                            ) : null}
                                        </td>
                                        <td>
                                            <span className={styles.badge}>
                                                {formatScope(coupon)}
                                            </span>
                                        </td>
                                        <td>{formatType(coupon.type)}</td>
                                        <td className={styles.right}>
                                            <strong>{formatValue(coupon)}</strong>
                                        </td>
                                        <td className={styles.right}>
                                            {coupon.redemptions_count}
                                            {coupon.max_redemptions !== null
                                                ? ` / ${coupon.max_redemptions}`
                                                : ""}
                                        </td>
                                        <td>{formatExpiry(coupon)}</td>
                                        <td className={styles.center}>
                                            <span className={styles.status}>
                                                <span
                                                    className={`${styles.dot} ${coupon.is_active ? styles.dotOn : styles.dotOff}`}
                                                />
                                                {coupon.is_active
                                                    ? "Activ"
                                                    : "Inactiv"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <Link
                                                    href={`/admin/shop/coupons/${coupon.id}/edit`}
                                                    aria-label="Editează"
                                                    title="Editează"
                                                    className={styles.actionBtn}
                                                >
                                                    <IconPencil size={18} />
                                                </Link>
                                                <DeleteButton
                                                    icon
                                                    className={styles.actionBtnDanger}
                                                    confirmMessage={`Ștergi codul „${coupon.code}"?`}
                                                    onDelete={async () => {
                                                        "use server";
                                                        await deleteCouponAction(
                                                            coupon.id,
                                                        );
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
            </section>
        </main>
    );
}
