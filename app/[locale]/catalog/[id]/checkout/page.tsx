import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OrderCheckout from "@/components/OrderCheckout";
import { getDollBySlug, type CatalogMode } from "@/lib/dolls";
import { createOrderAction } from "./actions";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    isCatalogModeEnabled,
} from "@/lib/settings";
import type { Locale } from "@/i18n/routing";

type CheckoutPageProps = {
    params: Promise<{
        locale: Locale;
        id: string;
    }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: t("checkoutTitle"),
        description: t("checkoutDescription"),
    };
}

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
    const { id, locale } = await params;
    setRequestLocale(locale);

    const resolvedSearchParams = await searchParams;
    const tNotice = await getTranslations({ locale, namespace: "notice" });

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
                title={tNotice("checkoutTitle")}
                description={tNotice("checkoutDescription")}
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
