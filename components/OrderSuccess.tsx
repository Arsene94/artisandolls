import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { OrderRow } from "@/lib/orders";
import type { Doll } from "@/lib/dolls";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import { formatPrice, getIntlLocale } from "@/i18n/format";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import PrintButton from "@/components/PrintButton";

export type CustomizationSummaryEntry = {
    id: string;
    label: string;
    price: number;
    groupTitle: string;
    groupIcon: string;
    groupOrder: number;
};

type OrderSuccessProps = {
    order: OrderRow;
    doll: Doll | null;
    customizations: CustomizationSummaryEntry[];
    settings?: Pick<PublicPlatformSettings, "currency" | "contact_email" | "whatsapp_phone" | "contact_phone">;
    notificationError?: boolean;
};

function formatDate(value: string | null, locale: string) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatDateTime(value: string, locale: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

// Rental start/end are stored as UTC wall-clock (the time the customer picked),
// so render them in UTC to avoid shifting by the server timezone.
function formatRentalDateTime(value: string | null, locale: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    }).format(date);
}

function CheckIcon() {
    return (
        <svg
            className="w-9 h-9 sm:w-10 sm:h-10 text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M5 13l4 4L19 7" />
        </svg>
    );
}

function StepIcon({ index }: { index: number }) {
    const paths = [
        // received
        <path key="r" d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4zM9 12l2 2 4-4" />,
        // contact
        <path
            key="c"
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        />,
        // delivery
        <path
            key="d"
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        />,
    ];
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {paths[index] ?? paths[0]}
        </svg>
    );
}

export default async function OrderSuccess({
    order,
    doll,
    customizations,
    settings,
    notificationError = false,
}: OrderSuccessProps) {
    const locale = await getLocale();
    const t = await getTranslations("success");
    const tCheckout = await getTranslations("checkout");
    const tCommon = await getTranslations("common");
    const currency = settings?.currency || "RON";

    const modeLabel = order.mode === "rent" ? tCommon("rent") : tCommon("buy");
    const serviceLabel =
        order.mode === "rent"
            ? tCheckout("serviceTypeRent")
            : tCheckout("serviceTypeBuy");

    const subtotalAmount = Number(order.subtotal_amount ?? 0);
    const totalAmount = Number(order.total_amount ?? subtotalAmount);
    const customizationsTotal = customizations.reduce(
        (sum, entry) => sum + (entry.price ?? 0),
        0,
    );
    const outfitTotal = Number(order.outfit_price ?? 0);
    const extrasTotal = outfitTotal + customizationsTotal;
    const baseAmount = Math.max(0, totalAmount - extrasTotal);

    const totalLabel =
        totalAmount > 0 ? formatPrice(totalAmount, locale, currency) : order.total_label;
    const baseLabel = baseAmount > 0 ? formatPrice(baseAmount, locale, currency) : null;
    const extrasLabel = extrasTotal > 0 ? formatPrice(extrasTotal, locale, currency) : null;

    const heroImageSource = doll?.image ?? order.outfit_image ?? null;
    const heroImageUrl = heroImageSource
        ? getSupabaseImageUrl(heroImageSource, "card")
        : null;

    const periodLabel = order.rental_start_at
        ? `${formatRentalDateTime(order.rental_start_at, locale)} – ${formatRentalDateTime(order.rental_end_at, locale)}`
        : order.start_date
          ? `${formatDate(order.start_date, locale)} – ${formatDate(order.end_date, locale)}`
          : tCommon("noSelection");

    const durationLabel =
        order.mode === "rent" && order.rental_unit && order.rental_quantity
            ? `${order.rental_quantity} ${
                  order.rental_unit === "hour"
                      ? tCommon("hours")
                      : tCommon("days_unit")
              }`
            : order.mode === "rent" && order.rental_days
              ? tCommon("days", { count: order.rental_days })
              : null;

    const stepLabels = t.raw("steps") as
        | Array<{ title: string; description: string; eta?: string }>
        | undefined;

    const contactMethodLabels = (t.raw("contactMethodValues") ?? {}) as Record<
        string,
        string
    >;
    const contactMethodLabel = order.contact_method
        ? contactMethodLabels[order.contact_method] ?? order.contact_method
        : null;

    const supportHref = settings?.whatsapp_phone
        ? `https://wa.me/${settings.whatsapp_phone.replace(/[^\d]/g, "")}`
        : settings?.contact_email
          ? `mailto:${settings.contact_email}`
          : settings?.contact_phone
            ? `tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`
            : "/";

    const supportLabel = settings?.whatsapp_phone
        ? t("contactSupportWhatsapp")
        : settings?.contact_email
          ? t("contactSupportEmail")
          : settings?.contact_phone
            ? t("contactSupportCall")
            : t("contactSupportGeneric");

    return (
        <div className="bg-velvet-950 text-silk min-h-screen flex flex-col">
            <section className="flex-grow pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-start sm:items-center justify-center relative overflow-hidden">
                <div
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-velvet-500/10 rounded-full filter blur-[120px] pointer-events-none"
                />
                <div
                    aria-hidden="true"
                    className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-[100px] pointer-events-none"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        <div className="lg:col-span-7 flex flex-col">
                            <div className="bg-velvet-900/70 backdrop-blur-xl border border-gold/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                                <div
                                    aria-hidden="true"
                                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-silk to-gold"
                                />

                                <div className="text-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-velvet-950 border-2 border-gold rounded-full flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(212,175,55,0.25)]">
                                        <CheckIcon />
                                    </div>

                                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold bg-velvet-800 px-4 py-2 rounded-full border border-gold/30 mb-3">
                                        {t("badgeConfidential")}
                                    </span>

                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white mb-3 leading-tight">
                                        {t("title")}{" "}
                                        <em className="text-gold not-italic">
                                            {t("titleEmphasis")}
                                        </em>
                                    </h1>

                                    <p className="text-silk/85 text-sm sm:text-base leading-relaxed mb-3 max-w-lg mx-auto">
                                        {t("description", { mode: modeLabel })}
                                    </p>

                                    <p className="text-xs text-silk/70 mb-5">
                                        {t("createdAt", {
                                            datetime: formatDateTime(order.created_at, locale),
                                        })}
                                    </p>

                                    {notificationError && (
                                        <div
                                            role="status"
                                            aria-live="polite"
                                            className="mb-6 rounded-2xl border border-warning/50 bg-warning/10 p-4 text-sm text-silk/90 text-left max-w-lg mx-auto"
                                        >
                                            <p className="font-semibold text-warning">
                                                {t("notificationDelayTitle")}
                                            </p>
                                            <p className="text-silk/85 mt-1">
                                                {t("notificationDelayDescription")}
                                            </p>
                                        </div>
                                    )}

                                    <div className="inline-flex flex-wrap items-center justify-center gap-3 mb-8">
                                        <span className="inline-flex items-center gap-2 bg-velvet-950/80 border border-velvet-700 rounded-xl px-4 py-3">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-silk/80">
                                                {t("orderNumber")}
                                            </span>
                                            <span className="text-sm font-bold text-gold">
                                                {order.order_number}
                                            </span>
                                        </span>
                                        <span className="inline-flex items-center gap-2 bg-velvet-950/80 border border-gold/30 rounded-xl px-4 py-3 text-[11px] uppercase tracking-widest text-gold font-bold">
                                            <svg
                                                className="w-3.5 h-3.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                aria-hidden="true"
                                                focusable="false"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 6v6l4 2" />
                                            </svg>
                                            {t("statusBadge")}
                                        </span>
                                    </div>
                                </div>

                                <ol className="space-y-4 mb-10 text-left list-none p-0">
                                    {(stepLabels ?? []).map((step, index) => (
                                        <li
                                            key={index}
                                            className="bg-velvet-950/80 p-5 rounded-2xl border border-velvet-700 flex gap-5 items-start"
                                        >
                                            <span className="text-gold w-12 h-12 flex-shrink-0 bg-velvet-900 rounded-full flex items-center justify-center border border-gold/30">
                                                <StepIcon index={index} />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                                    <h2 className="text-white font-bold text-sm uppercase tracking-wider">
                                                        {index + 1}. {step.title}
                                                    </h2>
                                                    {step.eta && (
                                                        <span className="text-[11px] uppercase tracking-widest text-gold font-bold whitespace-nowrap">
                                                            {step.eta}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-silk/85 leading-relaxed mt-1">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>

                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-10">
                                    <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-700">
                                        <dt className="block text-[10px] font-bold uppercase tracking-widest text-silk/80 mb-1">
                                            {t("client")}
                                        </dt>
                                        <dd className="block text-sm font-medium text-white">
                                            {order.customer_name}
                                        </dd>
                                    </div>
                                    <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-700">
                                        <dt className="block text-[10px] font-bold uppercase tracking-widest text-silk/80 mb-1">
                                            {t("contact")}
                                        </dt>
                                        <dd className="block text-sm font-medium text-white">
                                            {order.customer_phone}
                                        </dd>
                                    </div>
                                    {contactMethodLabel && (
                                        <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-700">
                                            <dt className="block text-[10px] font-bold uppercase tracking-widest text-silk/80 mb-1">
                                                {t("contactMethodLabel")}
                                            </dt>
                                            <dd className="block text-sm font-medium text-white">
                                                {contactMethodLabel}
                                            </dd>
                                        </div>
                                    )}
                                    {(order.contact_window_start || order.contact_window_end) && (
                                        <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-700">
                                            <dt className="block text-[10px] font-bold uppercase tracking-widest text-silk/80 mb-1">
                                                {t("contactWindowLabel")}
                                            </dt>
                                            <dd className="block text-sm font-medium text-white">
                                                {(order.contact_window_start ?? "--:--")} – {(order.contact_window_end ?? "--:--")}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:justify-center">
                                    <Link
                                        href={supportHref}
                                        target={supportHref.startsWith("http") ? "_blank" : undefined}
                                        rel={supportHref.startsWith("http") ? "noopener noreferrer" : undefined}
                                        className="no-print w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-velvet-950 font-semibold py-3.5 px-6 rounded-xl uppercase tracking-[0.16em] text-[11px] transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                                    >
                                        {supportLabel}
                                    </Link>
                                    <PrintButton />
                                    <Link
                                        href="/"
                                        className="no-print w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-silk/30 hover:border-silk text-silk font-semibold py-3.5 px-6 rounded-xl uppercase tracking-[0.16em] text-[11px] transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                                    >
                                        {t("backHome")}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <aside className="lg:col-span-5 relative" aria-label={tCheckout("summaryConfiguredModel")}>
                            <div className="lg:sticky lg:top-32">
                                <div className="bg-velvet-900/70 backdrop-blur-md border border-gold/30 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="relative h-48 sm:h-56 overflow-hidden bg-velvet-950">
                                        {heroImageUrl && (
                                            <Image
                                                src={heroImageUrl}
                                                alt={order.doll_name}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                                className="object-cover object-top opacity-90"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-velvet-950 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-6 right-6">
                                            <span className="bg-velvet-950/85 text-gold px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-gold/30 backdrop-blur-md">
                                                {tCheckout("summaryConfiguredModel")}
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-2">
                                                {order.doll_name}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-velvet-700 gap-3">
                                            <span className="text-xs text-silk/85 uppercase tracking-widest">
                                                {tCheckout("summaryLabel")}
                                            </span>
                                            <span className="text-sm font-bold text-white bg-velvet-800 px-3 py-1 rounded-md">
                                                {serviceLabel}
                                            </span>
                                        </div>

                                        <dl className="text-sm space-y-3 text-silk/90 mb-6">
                                            <div className="flex justify-between gap-3">
                                                <dt>{tCheckout("deliveryReturnPeriod")}</dt>
                                                <dd className="font-medium text-white text-right">
                                                    {periodLabel}
                                                </dd>
                                            </div>
                                            {durationLabel ? (
                                                <div className="flex justify-between gap-3">
                                                    <dt>{tCheckout("selectedDuration")}</dt>
                                                    <dd className="font-medium text-white">
                                                        {durationLabel}
                                                    </dd>
                                                </div>
                                            ) : null}
                                            {order.outfit_label && (
                                                <div className="flex justify-between gap-3">
                                                    <dt>{t("outfit")}</dt>
                                                    <dd className="font-medium text-white text-right">
                                                        {order.outfit_label}
                                                        {outfitTotal > 0 && (
                                                            <span className="block text-[11px] text-gold">
                                                                +{formatPrice(outfitTotal, locale, currency)}
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                            )}
                                            {customizations.map((entry) => (
                                                <div key={entry.id} className="flex justify-between gap-3 items-start">
                                                    <dt>{entry.groupTitle || t("optionGeneric")}</dt>
                                                    <dd className="font-medium text-white text-right">
                                                        {entry.label}
                                                        {entry.price > 0 && (
                                                            <span className="block text-[11px] text-gold">
                                                                +{formatPrice(entry.price, locale, currency)}
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                            ))}
                                            {(order.delivery_city || order.delivery_address) && (
                                                <div className="flex justify-between gap-3 items-start">
                                                    <dt>{tCheckout("deliveryAddress")}</dt>
                                                    <dd className="font-medium text-white text-right max-w-[55%]">
                                                        {[order.delivery_city, order.delivery_address]
                                                            .filter(Boolean)
                                                            .join(", ") || "—"}
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>

                                        <div className="bg-velvet-950 p-4 rounded-2xl border border-velvet-700">
                                            {baseLabel && (
                                                <div className="flex justify-between text-xs text-silk/80 mb-2">
                                                    <span>{tCheckout("basePrice")}</span>
                                                    <span>{baseLabel}</span>
                                                </div>
                                            )}
                                            {extrasLabel && (
                                                <div className="flex justify-between text-xs text-silk/80 mb-3 pb-3 border-b border-velvet-700">
                                                    <span>{tCheckout("extras")}</span>
                                                    <span>+{extrasLabel}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-end gap-3">
                                                <span className="text-[11px] uppercase tracking-widest text-gold font-bold">
                                                    {t("estimatedTotal")}
                                                </span>
                                                <span className="text-2xl font-bold text-white">
                                                    {totalLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ul className="mt-6 grid grid-cols-3 gap-3 list-none p-0">
                                    {[
                                        { label: tCheckout("trustAnon"), path: "M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zM4 22c0-4 4-7 8-7s8 3 8 7" },
                                        { label: tCheckout("trustBox"), path: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
                                        { label: tCheckout("trustHygiene"), path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
                                    ].map((item) => (
                                        <li
                                            key={item.label}
                                            className="bg-velvet-900/50 border border-velvet-700 rounded-xl p-3 text-center flex flex-col items-center justify-center"
                                        >
                                            <svg
                                                className="w-6 h-6 text-gold mb-2"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                aria-hidden="true"
                                                focusable="false"
                                            >
                                                <path d={item.path} />
                                            </svg>
                                            <span className="text-[11px] uppercase tracking-widest text-silk/90 font-bold leading-tight">
                                                {item.label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
}
