import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OrderSuccess from "@/components/OrderSuccess";
import { getOrderByIdForSuccess } from "@/lib/orders";
import type { Locale } from "@/i18n/routing";

type SuccessPageProps = {
    params: Promise<{ locale: Locale }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: t("successTitle"),
        description: t("successDescription"),
    };
}

function getSearchParamValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

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
