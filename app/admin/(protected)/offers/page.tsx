import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteOfferAction } from "@/app/admin/(protected)/offers/actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import type { OfferRow, OfferType } from "@/lib/offers/shared";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<OfferType, string> = {
    threshold_percent: "Prag → %",
    threshold_fixed: "Prag → sumă",
    threshold_gift: "Prag → cadou",
    buy_x_get_y: "Cumperi X, primești Y",
    collection_percent: "% pe colecție",
    promo: "Promoțional",
};

function formatScope(offer: OfferRow): string {
    const base =
        offer.applies_to === "dolls"
            ? "Păpuși"
            : offer.applies_to === "both"
              ? "Shop + Păpuși"
              : "Shop";
    if (offer.applies_to !== "shop" && offer.doll_modes?.length === 1) {
        return `${base} · ${offer.doll_modes[0] === "rent" ? "închiriere" : "cumpărare"}`;
    }
    return base;
}

function formatSchedule(offer: OfferRow): string {
    const fmt = (iso: string | null) =>
        iso
            ? new Date(iso).toLocaleDateString("ro-RO", {
                  day: "2-digit",
                  month: "short",
              })
            : null;
    const from = fmt(offer.starts_at);
    const to = fmt(offer.expires_at);
    if (!from && !to) return "fără termen";
    return `${from ?? "…"} – ${to ?? "…"}`;
}

export default async function AdminOffersPage() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("site_offers")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const offers = (data ?? []) as OfferRow[];

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        Marketing
                    </p>
                    <h1 className="font-display italic text-3xl text-silk mt-2">
                        Oferte
                    </h1>
                    <p className="text-silk/75 mt-1 max-w-2xl">
                        Promoții automate (fără cod) afișate pe site: banner pe
                        homepage, badge pe carduri și progres în checkout. Se aplică
                        automat la îndeplinirea condiției; nu se cumulează cu un cod —
                        reducerea mai mare câștigă.
                    </p>
                </div>
                <Link
                    href="/admin/offers/new"
                    className="inline-flex items-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    + Adaugă ofertă
                </Link>
            </header>

            {offers.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există oferte.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-velvet-800/60">
                    <table className="w-full text-sm">
                        <thead className="bg-velvet-900/60 text-silk/65 uppercase text-[0.7rem] tracking-[0.16em]">
                            <tr>
                                <th className="px-4 py-3 text-left">Nume</th>
                                <th className="px-4 py-3 text-left">Tip</th>
                                <th className="px-4 py-3 text-left">Aplicare</th>
                                <th className="px-4 py-3 text-right">Prioritate</th>
                                <th className="px-4 py-3 text-left">Perioadă</th>
                                <th className="px-4 py-3 text-center">Activă</th>
                                <th className="px-4 py-3 text-right">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-velvet-800/40">
                            {offers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-velvet-900/30">
                                    <td className="px-4 py-3 text-silk">
                                        <Link
                                            href={`/admin/offers/${offer.id}/edit`}
                                            className="hover:text-gold"
                                        >
                                            {offer.name}
                                        </Link>
                                        {offer.badge_label ? (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-gold/15 text-gold-light px-2 py-0.5 text-[0.66rem]">
                                                {offer.badge_label}
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3 text-silk/80">
                                        {TYPE_LABELS[offer.type]}
                                    </td>
                                    <td className="px-4 py-3 text-silk/80">
                                        <span className="inline-flex items-center rounded-full border border-velvet-700 bg-velvet-900/60 px-2.5 py-1 text-[0.7rem] text-silk/85">
                                            {formatScope(offer)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-silk/85">
                                        {offer.priority}
                                    </td>
                                    <td className="px-4 py-3 text-silk/65 text-[0.82rem]">
                                        {formatSchedule(offer)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {offer.is_active ? (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-success" />
                                        ) : (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-silk/30" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/offers/${offer.id}/edit`}
                                                className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light px-3 py-1.5 rounded-full"
                                            >
                                                Edit
                                            </Link>
                                            <DeleteButton
                                                confirmMessage={`Ștergi oferta „${offer.name}"?`}
                                                onDelete={async () => {
                                                    "use server";
                                                    await deleteOfferAction(offer.id);
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
