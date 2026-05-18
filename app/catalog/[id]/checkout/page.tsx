import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderCheckout from "@/components/OrderCheckout";
import { dolls, type CatalogMode } from "@/lib/dolls";

export const metadata: Metadata = {
    title: "Finalizare comandă — Artisan Dolls",
    description: "Completează datele de livrare pentru comanda Artisan Dolls.",
};

type CheckoutPageProps = {
    params: Promise<{
        id: string;
    }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;

    const doll = dolls.find((item) => item.id === id);

    if (!doll) {
        notFound();
    }

    const rawMode = getSearchParamValue(resolvedSearchParams?.mode);
    const mode: CatalogMode = rawMode === "buy" ? "buy" : "rent";

    return (
        <OrderCheckout
            doll={doll}
            mode={mode}
            startDate={getSearchParamValue(resolvedSearchParams?.start)}
            endDate={getSearchParamValue(resolvedSearchParams?.end)}
            outfitId={getSearchParamValue(resolvedSearchParams?.outfit)}
            options={getSearchParamValue(resolvedSearchParams?.options)}
            total={getSearchParamValue(resolvedSearchParams?.total)}
        />
    );
}
