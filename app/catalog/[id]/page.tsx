import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DollDetails from "@/components/DollDetails";
import { getOutfitsForCatalog } from "@/lib/outfits";
import { getDollBySlug, type CatalogMode } from "@/lib/dolls";
import { getCustomizationGroupsWithOptionsForCatalog } from "@/lib/customizations";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import {
    getPublicPlatformSettings,
    getSafeCatalogMode,
} from "@/lib/settings";

type DollPageProps = {
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

export async function generateMetadata({ params }: DollPageProps): Promise<Metadata> {
    const { id } = await params;
    const doll = await getDollBySlug(id);

    if (!doll) {
        return {
            title: "Păpușă indisponibilă — Artisan Dolls",
        };
    }

    return {
        title: `${doll.name} — Artisan Dolls`,
        description: doll.description,
    };
}

export default async function DollPage({ params, searchParams }: DollPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;

    const [doll, customizations, outfits, settings] = await Promise.all([
        getDollBySlug(id),
        getCustomizationGroupsWithOptionsForCatalog(),
        getOutfitsForCatalog(),
        getPublicPlatformSettings(),
    ]);

    if (!doll) {
        notFound();
    }

    if (settings.maintenance_mode || !settings.catalog_enabled) {
        return (
            <PublicUnavailableNotice
                title="Catalog indisponibil temporar"
                description="Această pagină nu este disponibilă momentan."
                settings={settings}
            />
        );
    }

    const rawMode = getSearchParamValue(resolvedSearchParams?.mode);
    const requestedMode: CatalogMode = rawMode === "buy" ? "buy" : "rent";
    const mode = getSafeCatalogMode(requestedMode, settings);

    if (!mode) {
        return (
            <PublicUnavailableNotice
                title="Comenzile sunt indisponibile temporar"
                description="Închirierea și cumpărarea sunt momentan oprite."
                settings={settings}
            />
        );
    }

    const startDate = getSearchParamValue(resolvedSearchParams?.start);
    const endDate = getSearchParamValue(resolvedSearchParams?.end);

    return (
        <DollDetails
            doll={doll}
            initialMode={mode}
            initialStartDate={startDate}
            initialEndDate={endDate}
            customizations={customizations}
            outfits={outfits}
            settings={settings}
        />
    );
}
