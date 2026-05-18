import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DollDetails from "@/components/DollDetails";
import { dolls, type CatalogMode } from "@/lib/dolls";

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
    const doll = dolls.find((item) => item.id === id);

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

    const doll = dolls.find((item) => item.id === id);

    if (!doll) {
        notFound();
    }

    const rawMode = getSearchParamValue(resolvedSearchParams?.mode);
    const mode: CatalogMode = rawMode === "buy" ? "buy" : "rent";

    const startDate = getSearchParamValue(resolvedSearchParams?.start);
    const endDate = getSearchParamValue(resolvedSearchParams?.end);

    return (
        <DollDetails
            doll={doll}
            initialMode={mode}
            initialStartDate={startDate}
            initialEndDate={endDate}
        />
    );
}
