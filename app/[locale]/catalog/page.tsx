import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DollsCatalog from "@/components/DollsCatalog";
import { getCollections, getDolls, type CatalogMode } from "@/lib/dolls";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    getSafeCatalogMode,
} from "@/lib/settings";
import type { Locale } from "@/i18n/routing";

type CatalogPageProps = {
    params: Promise<{ locale: Locale }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: t("catalogTitle"),
        description: t("catalogDescription"),
    };
}

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

export default async function CatalogPage({ params: pageParams, searchParams }: CatalogPageProps) {
    const { locale } = await pageParams;
    setRequestLocale(locale);

    const params = await searchParams;
    const tNotice = await getTranslations({ locale, namespace: "notice" });

    const settings = await getPublicPlatformSettings();

    if (settings.maintenance_mode || !settings.catalog_enabled) {
        return (
            <PublicUnavailableNotice
                title={tNotice("catalogTitle")}
                description={tNotice("catalogDescription")}
                settings={settings}
            />
        );
    }

    const rawMode = getSearchParamValue(params?.mode);
    const requestedMode: CatalogMode = rawMode === "buy" ? "buy" : "rent";
    const mode = getSafeCatalogMode(requestedMode, settings);

    if (!mode) {
        return (
            <PublicUnavailableNotice
                title={tNotice("ordersTitle")}
                description={tNotice("ordersDescription")}
                settings={settings}
            />
        );
    }

    const startDate = getSearchParamValue(params?.start);
    const endDate = getSearchParamValue(params?.end);

    const dolls = await getDolls();
    const collections = await getCollections();

    return (
        <DollsCatalog
            dolls={dolls}
            collections={collections}
            initialMode={mode}
            initialStartDate={startDate}
            initialEndDate={endDate}
            settings={settings}
        />
    );
}
