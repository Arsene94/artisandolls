import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderCheckout from "@/components/OrderCheckout";
import { getDollBySlug, type CatalogMode } from "@/lib/dolls";
import { createOrderAction } from "./actions";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    isCatalogModeEnabled,
} from "@/lib/settings";

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

    const [doll, settings] = await Promise.all([
        getDollBySlug(id),
        getPublicPlatformSettings(),
    ]);

    if (!doll) {
        notFound();
    }

    const rawMode = getSearchParamValue(resolvedSearchParams?.mode);
    const mode: CatalogMode = rawMode === "buy" ? "buy" : "rent";

    if (
        settings.maintenance_mode ||
        !settings.catalog_enabled ||
        !isCatalogModeEnabled(mode, settings)
    ) {
        return (
            <PublicUnavailableNotice
                title="Checkout indisponibil"
                description="Această opțiune de comandă este momentan oprită din setările platformei."
                settings={settings}
            />
        );
    }

    return (
        <OrderCheckout
            doll={doll}
            mode={mode}
            startDate={getSearchParamValue(resolvedSearchParams?.start)}
            endDate={getSearchParamValue(resolvedSearchParams?.end)}
            outfitId={getSearchParamValue(resolvedSearchParams?.outfit)}
            options={getSearchParamValue(resolvedSearchParams?.options)}
            total={getSearchParamValue(resolvedSearchParams?.total)}
            action={createOrderAction}
            settings={settings}
        />
    );
}
