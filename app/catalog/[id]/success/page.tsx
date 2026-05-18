import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderSuccess from "@/components/OrderSuccess";
import { dolls, type CatalogMode } from "@/lib/dolls";

export const metadata: Metadata = {
    title: "Comandă trimisă — Artisan Dolls",
    description: "Confirmarea cererii tale Artisan Dolls.",
};

type SuccessPageProps = {
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

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;

    const doll = dolls.find((item) => item.id === id);

    if (!doll) {
        notFound();
    }

    const rawMode = getSearchParamValue(resolvedSearchParams?.mode);
    const mode: CatalogMode = rawMode === "buy" ? "buy" : "rent";
    const orderId = getSearchParamValue(resolvedSearchParams?.orderId);

    return <OrderSuccess doll={doll} mode={mode} orderId={orderId} />;
}
