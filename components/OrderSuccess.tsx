import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { OrderRow } from "@/lib/orders";
import type { Doll } from "@/lib/dolls";
import { formatLei, getIntlLocale } from "@/i18n/format";
import { getSupabaseImageUrl } from "@/lib/supabase/images";

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
};

function formatDate(value: string | null, locale: string) {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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
        >
            <path d="M5 13l4 4L19 7" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function PhoneSlashIcon() {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M3 3l18 18" />
            <path d="M5 4a16 16 0 0 0 5 9l-1.5 3 3 1.5a16 16 0 0 0 9 5l1-4a2 2 0 0 0-1.5-2L17 14l-2 2a12 12 0 0 1-5-5l2-2-.5-3.5A2 2 0 0 0 9 4H5z" />
        </svg>
    );
}

function BoxIcon() {
    return (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 7v10l9 4 9-4V7" />
            <path d="M12 11v10" />
        </svg>
    );
}

function HouseIcon() {
    return (
        <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M3 11l9-7 9 7" />
            <path d="M5 10v10h14V10" />
        </svg>
    );
}

function ImagesIcon() {
    return (
        <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <rect x="3" y="5" width="14" height="14" rx="2" />
            <path d="M7 9h.01" />
            <path d="M21 9v10a2 2 0 0 1-2 2H9" />
        </svg>
    );
}

function NinjaIcon() {
    return (
        <svg
            className="w-5 h-5 text-gold opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
            <path d="M4 22c0-4 4-7 8-7s8 3 8 7" />
        </svg>
    );
}

function BoxBadgeIcon() {
    return (
        <svg
            className="w-5 h-5 text-gold opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
    );
}

function HygieneIcon() {
    return (
        <svg
            className="w-5 h-5 text-gold opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function OptionIcon() {
    return (
        <svg
            className="w-4 h-4 text-gold/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
        </svg>
    );
}

export default async function OrderSuccess({
    order,
    doll,
    customizations,
}: OrderSuccessProps) {
    const locale = await getLocale();
    const t = await getTranslations("success");
    const tCheckout = await getTranslations("checkout");
    const tCommon = await getTranslations("common");

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
        totalAmount > 0 ? formatLei(totalAmount, locale) : order.total_label;
    const baseLabel = baseAmount > 0 ? formatLei(baseAmount, locale) : null;
    const extrasLabel = extrasTotal > 0 ? formatLei(extrasTotal, locale) : null;

    const heroImageSource =
        doll?.image ?? order.outfit_image ?? null;
    const heroImageUrl = heroImageSource
        ? getSupabaseImageUrl(heroImageSource, "card")
        : null;

    const periodLabel = order.start_date
        ? `${formatDate(order.start_date, locale)} - ${formatDate(order.end_date, locale)}`
        : tCommon("noSelection");

    const stepLabels = t.raw("steps") as
        | Array<{ title: string; description: string }>
        | undefined;

    const contactMethodLabels = (t.raw("contactMethodValues") ?? {}) as Record<
        string,
        string
    >;
    const contactMethodLabel = order.contact_method
        ? contactMethodLabels[order.contact_method] ?? order.contact_method
        : null;

    const steps = (stepLabels ?? []).map((step, index) => ({
        ...step,
        icon:
            index === 0 ? (
                <ShieldIcon />
            ) : index === 1 ? (
                <PhoneSlashIcon />
            ) : (
                <BoxIcon />
            ),
    }));

    return (
        <main className="bg-velvet-950 text-silk min-h-screen flex flex-col">
            <section className="flex-grow pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-velvet-500/10 rounded-full filter blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full filter blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                        <div className="lg:col-span-7 flex flex-col justify-center">
                            <div className="bg-velvet-900/60 backdrop-blur-xl border border-gold/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden h-full">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-white to-gold" />

                                <div className="text-left sm:text-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-velvet-950 border-2 border-gold rounded-full flex items-center justify-center mb-6 sm:mx-auto shadow-[0_0_30px_rgba(212,175,55,0.25)]">
                                        <CheckIcon />
                                    </div>

                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-velvet-800 px-4 py-2 rounded-full border border-gold/20 inline-block mb-4">
                                        {t("badgeConfidential")}
                                    </span>

                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white mb-4">
                                        {t("title")}
                                    </h1>

                                    <p className="text-silk/70 font-light text-sm sm:text-base leading-relaxed mb-6 max-w-lg sm:mx-auto lg:mx-0">
                                        {t("description", { mode: modeLabel.toLowerCase() })}
                                    </p>

                                    <div className="mb-10 inline-flex items-center gap-3 bg-velvet-950/80 border border-velvet-800 rounded-xl px-4 py-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-silk/50">
                                            {t("orderNumber")}
                                        </span>
                                        <span className="text-sm font-bold text-gold">
                                            {order.order_number}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-10 text-left">
                                        {steps.map((step, index) => (
                                            <div
                                                key={index}
                                                className="bg-velvet-950/80 p-5 rounded-2xl border border-velvet-800 flex gap-5 items-center"
                                            >
                                                <div className="text-gold w-12 h-12 flex-shrink-0 bg-velvet-900 rounded-full flex items-center justify-center border border-gold/20">
                                                    {step.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                                                        {index + 1}. {step.title}
                                                    </h3>
                                                    <p className="text-xs font-light text-silk/60 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                        <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-800">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-silk/50 mb-1">
                                                {t("client")}
                                            </span>
                                            <span className="block text-sm font-medium text-white">
                                                {order.customer_name}
                                            </span>
                                        </div>
                                        <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-800">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-silk/50 mb-1">
                                                {t("contact")}
                                            </span>
                                            <span className="block text-sm font-medium text-white">
                                                {order.customer_phone}
                                            </span>
                                        </div>
                                        {contactMethodLabel && (
                                            <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-800">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest text-silk/50 mb-1">
                                                    {tCheckout("contactMethod")}
                                                </span>
                                                <span className="block text-sm font-medium text-white">
                                                    {contactMethodLabel}
                                                </span>
                                            </div>
                                        )}
                                        {(order.contact_window_start ||
                                            order.contact_window_end) && (
                                            <div className="bg-velvet-950/80 p-4 rounded-2xl border border-velvet-800">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest text-silk/50 mb-1">
                                                    {tCheckout("contactWindow")}
                                                </span>
                                                <span className="block text-sm font-medium text-white">
                                                    {(order.contact_window_start ?? "--:--")} - {(order.contact_window_end ?? "--:--")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-center lg:justify-start mt-10">
                                        <Link
                                            href="/"
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-velvet-950 border border-gold hover:bg-gold hover:text-velvet-950 text-gold font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-[11px] transition-colors duration-300"
                                        >
                                            <HouseIcon />
                                            {t("backHome")}
                                        </Link>
                                        <Link
                                            href="/catalog"
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-velvet-500 to-velvet-700 hover:from-velvet-600 hover:to-velvet-800 text-white font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-[11px] transition-colors duration-300 shadow-lg shadow-velvet-950/40"
                                        >
                                            <ImagesIcon />
                                            {t("viewCatalog")}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="lg:col-span-5 relative hidden md:block">
                            <div className="lg:sticky">
                                <div className="bg-velvet-900/60 backdrop-blur-md border border-gold/20 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="relative h-48 sm:h-56 overflow-hidden bg-velvet-950">
                                        {heroImageUrl && (
                                            <Image
                                                src={heroImageUrl}
                                                alt={order.doll_name}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                                className="object-cover object-top opacity-80"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-velvet-900 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-6 right-6">
                                            <span className="bg-velvet-950/80 text-gold px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-gold/20 backdrop-blur-md">
                                                {tCheckout("summaryConfiguredModel")}
                                            </span>
                                            <h3 className="text-3xl font-bold font-serif text-white mt-2">
                                                {order.doll_name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-velvet-800">
                                            <span className="text-xs text-silk/60 uppercase tracking-widest">
                                                {tCheckout("summaryLabel")}
                                            </span>
                                            <span className="text-sm font-bold text-white bg-velvet-800 px-3 py-1 rounded-md">
                                                {serviceLabel}
                                            </span>
                                        </div>

                                        <ul className="text-sm space-y-3 font-light text-silk/80 mb-6">
                                            <li className="flex justify-between">
                                                <span className="flex items-center gap-2 text-silk/70">
                                                    {tCheckout("deliveryReturnPeriod")}
                                                </span>
                                                <span className="font-medium text-white">
                                                    {periodLabel}
                                                </span>
                                            </li>
                                            {order.mode === "rent" && order.rental_days ? (
                                                <li className="flex justify-between">
                                                    <span className="text-silk/70">
                                                        {tCheckout("selectedDays")}
                                                    </span>
                                                    <span className="font-medium text-white">
                                                        {tCommon("days", { count: order.rental_days })}
                                                    </span>
                                                </li>
                                            ) : null}
                                            {order.outfit_label && (
                                                <li className="flex justify-between">
                                                    <span className="text-silk/70">
                                                        {t("outfit")}
                                                    </span>
                                                    <span className="font-medium text-white text-right">
                                                        {order.outfit_label}
                                                        {outfitTotal > 0 && (
                                                            <span className="block text-[11px] text-gold">
                                                                +{formatLei(outfitTotal, locale)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            )}
                                            {customizations.map((entry) => (
                                                <li
                                                    key={entry.id}
                                                    className="flex justify-between items-start"
                                                >
                                                    <span className="flex items-center gap-2 text-silk/70">
                                                        <OptionIcon />
                                                        <span>
                                                            {entry.groupTitle || t("optionGeneric")}
                                                        </span>
                                                    </span>
                                                    <span className="font-medium text-white text-right">
                                                        {entry.label}
                                                        {entry.price > 0 && (
                                                            <span className="block text-[11px] text-gold">
                                                                +{formatLei(entry.price, locale)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                            {(order.delivery_city || order.delivery_address) && (
                                                <li className="flex justify-between items-start">
                                                    <span className="text-silk/70">
                                                        {tCheckout("deliveryAddress")}
                                                    </span>
                                                    <span className="font-medium text-white text-right max-w-[55%]">
                                                        {[order.delivery_city, order.delivery_address]
                                                            .filter(Boolean)
                                                            .join(", ") || "-"}
                                                    </span>
                                                </li>
                                            )}
                                        </ul>

                                        <div className="bg-velvet-950 p-4 rounded-2xl border border-velvet-800">
                                            {baseLabel && (
                                                <div className="flex justify-between text-xs text-silk/50 mb-2">
                                                    <span>{tCheckout("basePrice")}</span>
                                                    <span>{baseLabel}</span>
                                                </div>
                                            )}
                                            {extrasLabel && (
                                                <div className="flex justify-between text-xs text-silk/50 mb-3 pb-3 border-b border-velvet-800/60">
                                                    <span>{tCheckout("extras")}</span>
                                                    <span>+{extrasLabel}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-end">
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

                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    <div className="bg-velvet-900/30 border border-silk/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                                        <NinjaIcon />
                                        <span className="mt-2 text-[9px] uppercase tracking-widest text-silk/60 font-bold leading-tight">
                                            {tCheckout("trustAnon")}
                                        </span>
                                    </div>
                                    <div className="bg-velvet-900/30 border border-silk/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                                        <BoxBadgeIcon />
                                        <span className="mt-2 text-[9px] uppercase tracking-widest text-silk/60 font-bold leading-tight">
                                            {tCheckout("trustBox")}
                                        </span>
                                    </div>
                                    <div className="bg-velvet-900/30 border border-silk/5 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                                        <HygieneIcon />
                                        <span className="mt-2 text-[9px] uppercase tracking-widest text-silk/60 font-bold leading-tight">
                                            {tCheckout("trustHygiene")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    );
}
