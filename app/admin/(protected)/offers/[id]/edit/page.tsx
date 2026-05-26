import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateOfferAction } from "@/app/admin/(protected)/offers/actions";
import OfferForm, { type OfferOption } from "@/components/admin/offers/OfferForm";
import type { OfferRow } from "@/lib/offers/shared";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditOfferPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const [{ data: offer }, { data: categories }, { data: collections }, { data: products }] =
        await Promise.all([
            supabase.from("site_offers").select("*").eq("id", id).maybeSingle(),
            supabase
                .from("shop_categories")
                .select("id, name")
                .order("display_order", { ascending: true }),
            supabase
                .from("doll_collections")
                .select("id, name")
                .order("display_order", { ascending: true }),
            supabase
                .from("shop_products")
                .select("id, name")
                .order("name", { ascending: true }),
        ]);

    if (!offer) notFound();
    const action = updateOfferAction.bind(null, id);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/offers"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la oferte
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                {offer.name}
            </h1>
            <OfferForm
                action={action}
                categories={(categories ?? []) as OfferOption[]}
                collections={(collections ?? []) as OfferOption[]}
                products={(products ?? []) as OfferOption[]}
                initial={offer as OfferRow}
                submitLabel="Salvează modificările"
            />
        </main>
    );
}
