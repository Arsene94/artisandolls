import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderSuccess from "@/components/OrderSuccess";
import { getOrderByIdForSuccess } from "@/lib/orders";

export const metadata: Metadata = {
    title: "Comandă trimisă — Artisan Dolls",
    description: "Confirmarea cererii tale Artisan Dolls.",
};

type SuccessPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
    const resolvedSearchParams = await searchParams;
    const orderId = getSearchParamValue(resolvedSearchParams?.orderId);

    if (!orderId) {
        notFound();
    }

    const order = await getOrderByIdForSuccess(orderId);

    if (!order) {
        notFound();
    }

    return <OrderSuccess order={order} />;
}
