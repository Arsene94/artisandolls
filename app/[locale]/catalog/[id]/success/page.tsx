import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OrderSuccess, {
    type CustomizationSummaryEntry,
} from "@/components/OrderSuccess";
import { getOrderByIdForSuccess } from "@/lib/orders";
import { ownsRecentOrder } from "@/lib/orders/recent-cookie";
import { getDollBySlug } from "@/lib/dolls";
import { getPublicPlatformSettings } from "@/lib/settings";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Locale } from "@/i18n/routing";

type SuccessPageProps = {
    params: Promise<{ locale: Locale; id: string }>;
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

async function fetchSelectedCustomizations(
    selectedOptionIds: string[],
): Promise<CustomizationSummaryEntry[]> {
    if (selectedOptionIds.length === 0) {
        return [];
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
        .from("doll_customization_options")
        .select(
            "id, label, price, group:doll_customization_groups(id, title, icon_name, display_order)",
        )
        .in("id", selectedOptionIds);

    if (error || !data) {
        return [];
    }

    type RowGroup = {
        id: string;
        title: string;
        icon_name: string | null;
        display_order: number;
    };

    type Row = {
        id: string;
        label: string;
        price: number;
        group: RowGroup | RowGroup[] | null;
    };

    return (data as Row[])
        .map((row) => {
            const group = Array.isArray(row.group) ? row.group[0] : row.group;

            return {
                id: row.id,
                label: row.label,
                price: Number(row.price ?? 0),
                groupTitle: group?.title ?? "",
                groupIcon: group?.icon_name ?? "sparkles",
                groupOrder: group?.display_order ?? 0,
            };
        })
        .sort(
            (first, second) =>
                first.groupOrder - second.groupOrder ||
                first.label.localeCompare(second.label),
        );
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const resolvedSearchParams = await searchParams;
    const orderId = getSearchParamValue(resolvedSearchParams?.orderId);
    const notificationError =
        getSearchParamValue(resolvedSearchParams?.notificationError) === "1";

    if (!orderId) {
        notFound();
    }

    // Pagina expune nume, telefon, adresă livrare. Cookie-ul `ad_recent_orders`
    // setat la `createOrderAction` leagă vizualizarea de browserul care a
    // plasat comanda. Fără cookie → 404 (echivalent „nu există").
    if (!(await ownsRecentOrder(orderId))) {
        notFound();
    }

    const order = await getOrderByIdForSuccess(orderId);

    if (!order) {
        notFound();
    }

    const [doll, customizations, settings] = await Promise.all([
        getDollBySlug(order.doll_slug),
        fetchSelectedCustomizations(order.selected_options ?? []),
        getPublicPlatformSettings().catch(() => null),
    ]);

    return (
        <OrderSuccess
            order={order}
            doll={doll}
            customizations={customizations}
            settings={settings ?? undefined}
            notificationError={notificationError}
        />
    );
}
