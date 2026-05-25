import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AgeGateForm from "@/components/AgeGateForm";
import type { Locale } from "@/i18n/routing";

type PageProps = {
    params: Promise<{ locale: Locale }>;
    searchParams: Promise<{ next?: string }>;
};

export const metadata: Metadata = {
    title: "18+",
    robots: { index: false, follow: false },
};

export default async function AgeGatePage({ params, searchParams }: PageProps) {
    const { locale } = await params;
    const { next } = await searchParams;
    setRequestLocale(locale);

    const safeNext =
        typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
            ? next
            : "/";

    return <AgeGateForm next={safeNext} />;
}
