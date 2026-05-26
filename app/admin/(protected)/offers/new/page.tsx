import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createOfferAction } from "@/app/admin/(protected)/offers/actions";
import OfferForm, { type OfferOption } from "@/components/admin/offers/OfferForm";

export const dynamic = "force-dynamic";

export default async function NewOfferPage() {
    const supabase = await createSupabaseServerClient();
    const [{ data: categories }, { data: collections }, { data: products }] =
        await Promise.all([
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

    return (
        <main className="px-6 sm:px-10 py-10 max-w-5xl">
            <Link
                href="/admin/offers"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la oferte
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                Ofertă nouă
            </h1>
            <OfferForm
                action={createOfferAction}
                categories={(categories ?? []) as OfferOption[]}
                collections={(collections ?? []) as OfferOption[]}
                products={(products ?? []) as OfferOption[]}
                submitLabel="Creează oferta"
            />
        </main>
    );
}
