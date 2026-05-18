import type { Metadata } from "next";
import DollsCatalog from "@/components/DollsCatalog";
import type { CatalogMode } from "@/lib/dolls";

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

    const rawMode = getSearchParamValue(params?.mode);
    const mode: CatalogMode = rawMode === "buy" ? "buy" : "rent";

    const startDate = getSearchParamValue(params?.start);
    const endDate = getSearchParamValue(params?.end);

    return (
        <DollsCatalog
            initialMode={mode}
            initialStartDate={startDate}
            initialEndDate={endDate}
        />
    );
}
