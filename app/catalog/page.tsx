import type { Metadata } from "next";
import DollsCatalog from "@/components/DollsCatalog";
import { getCollections, getDolls, type CatalogMode } from "@/lib/dolls";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    getSafeCatalogMode,
} from "@/lib/settings";

export const metadata: Metadata = {
    title: "Catalog păpuși — Artisan Dolls",
    description: "Explorează colecția Artisan Dolls disponibilă pentru închiriere sau cumpărare.",
};

type CatalogPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const params = await searchParams;

    const settings = await getPublicPlatformSettings();

    if (settings.maintenance_mode || !settings.catalog_enabled) {
        return (
            <PublicUnavailableNotice
                title="Catalog indisponibil temporar"
                description="Catalogul este momentan oprit din setările platformei. Pentru detalii, contactează-ne direct."
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
                title="Comenzile sunt indisponibile temporar"
                description="Închirierea și cumpărarea sunt momentan oprite din setările platformei."
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
