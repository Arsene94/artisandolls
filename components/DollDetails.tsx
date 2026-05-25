"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatLei, formatLeiPerDay } from "@/i18n/format";
import type { CustomizationGroupWithOptions } from "@/lib/customizations/shared";
import CustomizationIcon from "@/components/icons/CustomizationIcon";
import type { OutfitOptionForCatalog } from "@/lib/outfits/shared";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import styles from "./DollDetails.module.css";

type DollDetailsProps = {
    doll: Doll;
    initialMode: CatalogMode;
    initialStartDate: string;
    initialEndDate: string;
    customizations: Record<CatalogMode, CustomizationGroupWithOptions[]>;
    outfits: Record<CatalogMode, OutfitOptionForCatalog[]>;
    settings: PublicPlatformSettings;
};

function formatDate(value: string, locale: string) {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat(
        locale === "en" ? "en-US" : locale === "nl" ? "nl-NL" : "ro-RO",
        { day: "2-digit", month: "2-digit", year: "numeric" }
    ).format(new Date(`${year}-${month}-${day}T00:00:00`));
}

function parseDate(value: string) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getRentalDays(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return 0;
    const dayMs = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / dayMs));
}

function getCatalogHref(mode: CatalogMode, period: RentalRangeValue) {
    const params = new URLSearchParams({ mode });
    if (period.startDate) params.set("start", period.startDate);
    if (period.endDate) params.set("end", period.endDate);
    return `/catalog?${params.toString()}`;
}

function getGalleryImages(doll: Doll) {
    const uniqueImages = Array.from(
        new Set(
            [doll.image, ...(doll.images ?? [])]
                .map((image) => image.trim())
                .filter(Boolean)
        )
    );
    return uniqueImages.length > 0 ? uniqueImages : [doll.image];
}

function getCustomOptionsForMode(
    mode: CatalogMode,
    customizations: Record<CatalogMode, CustomizationGroupWithOptions[]>
) {
    return customizations[mode].flatMap((group) => group.options);
}

function getCustomizationTotal(
    optionIds: string[],
    mode: CatalogMode,
    customizations: Record<CatalogMode, CustomizationGroupWithOptions[]>
) {
    const options = getCustomOptionsForMode(mode, customizations);
    return optionIds.reduce((total, optionId) => {
        const option = options.find((item) => item.id === optionId || item.slug === optionId);
        return total + (option?.price ?? 0);
    }, 0);
}

function getSelectedOutfit(outfitId: string, available: OutfitOptionForCatalog[]) {
    return available.find((outfit) => outfit.id === outfitId) ?? null;
}

function getOutfitTotal(outfitId: string, available: OutfitOptionForCatalog[]) {
    return getSelectedOutfit(outfitId, available)?.price ?? 0;
}

function getCheckoutHref(
    dollId: string,
    mode: CatalogMode,
    period: RentalRangeValue,
    outfitId: string,
    options: string[],
    total: number
) {
    const params = new URLSearchParams({ mode });
    if (period.startDate) params.set("start", period.startDate);
    if (period.endDate) params.set("end", period.endDate);
    if (outfitId) params.set("outfit", outfitId);
    if (options.length > 0) params.set("options", options.join(","));
    if (total > 0) params.set("total", String(total));
    return `/catalog/${dollId}/checkout?${params.toString()}`;
}

type GroupRendererProps = {
    group: CustomizationGroupWithOptions;
    index: number;
    selected: string[];
    onToggle: (groupId: string, optionId: string) => void;
};

function SingleChoiceGroup({ group, index, selected, onToggle }: GroupRendererProps) {
    const locale = useLocale();
    const hasSwatches = group.options.some((o) => o.swatch_color);
    const cols = group.options.length >= 4 ? "grid-cols-4" : "grid-cols-3";

    return (
        <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-3">
                <span className="text-gold mr-1">{index}.</span> {group.title}
            </label>
            {group.description && (
                <p className="text-xs text-silk/50 font-light mb-3 -mt-2">{group.description}</p>
            )}

            <div className={`grid ${cols} gap-3`}>
                {group.options.map((option) => {
                    const isSelected = selected.includes(option.id);
                    const inputId = `opt-${group.id}-${option.id}`;
                    return (
                        <div key={option.id} className="relative">
                            <input
                                type="radio"
                                name={`group-${group.id}`}
                                id={inputId}
                                checked={isSelected}
                                onChange={() => onToggle(group.id, option.id)}
                                className={styles.swatchInput}
                            />
                            <label htmlFor={inputId} className={styles.swatchLabel}>
                                {hasSwatches && option.swatch_color ? (
                                    <div
                                        className="w-8 h-8 rounded-full mx-auto mb-2 shadow-inner border border-white/10"
                                        style={{
                                            background: `radial-gradient(circle, ${option.swatch_color} 30%, rgba(0,0,0,0.5) 95%)`,
                                        }}
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full mx-auto mb-2 inline-flex items-center justify-center text-gold-light bg-velvet-900 border border-gold/20">
                                        <CustomizationIcon
                                            name={option.icon_name}
                                            color={option.icon_color ?? undefined}
                                            size={18}
                                        />
                                    </div>
                                )}
                                <span className="block text-xs font-medium text-white truncate">
                                    {option.label}
                                </span>
                                {option.price > 0 && (
                                    <span className="block text-[10px] text-gold-light mt-1 font-semibold">
                                        +{formatLei(option.price, locale)}
                                    </span>
                                )}
                                <i className={styles.swatchCheck}>✓</i>
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MultiChoiceGroup({ group, index, selected, onToggle }: GroupRendererProps) {
    const locale = useLocale();

    return (
        <div>
            <h2 className="text-xl font-bold font-serif text-gold mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 text-gold-light">
                    <CustomizationIcon name={group.icon_name} size={18} />
                </span>
                <span>
                    <span className="text-gold-light mr-1">{index}.</span> {group.title}
                </span>
            </h2>
            {group.description && (
                <p className="text-xs text-silk/55 font-light mb-4 -mt-2 leading-relaxed">
                    {group.description}
                </p>
            )}

            <div className="space-y-3">
                {group.options.map((option) => {
                    const isSelected = selected.includes(option.id);
                    return (
                        <label
                            key={option.id}
                            className={[
                                "relative flex items-start p-4 rounded-2xl cursor-pointer transition group",
                                "border bg-velvet-900/40",
                                isSelected
                                    ? "border-gold/60 bg-gold/5"
                                    : "border-velvet-800 hover:border-gold/40",
                            ].join(" ")}
                        >
                            <div className="flex items-center h-5 mt-1">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggle(group.id, option.id)}
                                    className={`${styles.upgradeInput} w-5 h-5 bg-velvet-950 border-velvet-700 rounded focus:ring-gold focus:ring-2 cursor-pointer`}
                                />
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                                <div className="flex justify-between items-center gap-3 mb-1">
                                    <span
                                        className={`font-bold ${
                                            isSelected ? "text-gold" : "text-white group-hover:text-gold"
                                        } transition truncate`}
                                    >
                                        {option.label}
                                    </span>
                                    {option.price > 0 && (
                                        <span className="shrink-0 text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded">
                                            +{formatLei(option.price, locale)}
                                        </span>
                                    )}
                                </div>
                                {option.description && (
                                    <p className="text-xs text-silk/60 font-light leading-relaxed">
                                        {option.description}
                                    </p>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

type OutfitSelectorProps = {
    outfits: OutfitOptionForCatalog[];
    selectedId: string;
    onSelect: (id: string) => void;
    index: number;
};

function OutfitSelector({ outfits, selectedId, onSelect, index }: OutfitSelectorProps) {
    const t = useTranslations("details");
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const selected = getSelectedOutfit(selectedId, outfits);

    if (outfits.length === 0) return null;

    return (
        <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-3">
                <span className="text-gold mr-1">{index}.</span> {t("outfit")}
            </label>

            <button
                type="button"
                className={styles.outfitTrigger}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {selected ? (
                    <>
                        <Image
                            src={getSupabaseImageUrl(selected.image, "thumb")}
                            alt={selected.label}
                            width={56}
                            height={56}
                        />
                        <span className={styles.outfitTriggerMain}>
                            <strong>{selected.label}</strong>
                            <small>+{formatLei(selected.price, locale)}</small>
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.noOutfitPreview} style={{ width: 56, height: 56 }}>
                            {t("without")}
                        </span>
                        <span className={styles.outfitTriggerMain}>
                            <strong>{t("chooseOutfit")}</strong>
                            <small>{t("noOutfitSelected")}</small>
                        </span>
                    </>
                )}
                <em className={styles.outfitTriggerChevron}>{open ? "−" : "+"}</em>
            </button>

            {open && (
                <div className={styles.outfitDropdown}>
                    <button
                        type="button"
                        className={!selectedId ? styles.outfitOptionSelected : styles.outfitOption}
                        onClick={() => {
                            onSelect("");
                            setOpen(false);
                        }}
                    >
                        <span className={styles.noOutfitPreview}>{t("without")}</span>
                        <span>
                            <strong>{t("noExtraOutfit")}</strong>
                            <small>+{formatLei(0, locale)}</small>
                        </span>
                    </button>

                    {outfits.map((outfit) => {
                        const isSelected = selectedId === outfit.id;
                        return (
                            <button
                                key={outfit.id}
                                type="button"
                                className={
                                    isSelected ? styles.outfitOptionSelected : styles.outfitOption
                                }
                                onClick={() => {
                                    onSelect(outfit.id);
                                    setOpen(false);
                                }}
                            >
                                <Image
                                    src={getSupabaseImageUrl(outfit.image, "thumb")}
                                    alt={outfit.label}
                                    width={64}
                                    height={80}
                                />
                                <span>
                                    <strong>{outfit.label}</strong>
                                    {outfit.description && <small>{outfit.description}</small>}
                                    <em>+{formatLei(outfit.price, locale)}</em>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function DollDetails({
    doll,
    initialMode,
    initialStartDate,
    initialEndDate,
    customizations,
    outfits,
    settings,
}: DollDetailsProps) {
    const t = useTranslations("details");
    const tCommon = useTranslations("common");
    const locale = useLocale();

    const galleryImages = useMemo(() => getGalleryImages(doll), [doll]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0];

    const [mode, setMode] = useState<CatalogMode>(initialMode);
    const [period, setPeriod] = useState<RentalRangeValue>({
        startDate: initialStartDate,
        endDate: initialEndDate,
    });
    const [selectedOptionsByMode, setSelectedOptionsByMode] = useState<Record<CatalogMode, string[]>>({
        rent: [],
        buy: [],
    });
    const [selectedOutfitByMode, setSelectedOutfitByMode] = useState<Record<CatalogMode, string>>({
        rent: "",
        buy: "",
    });

    const rentalDays = useMemo(
        () => getRentalDays(period.startDate, period.endDate),
        [period.endDate, period.startDate]
    );

    const activeSelectedOptions = selectedOptionsByMode[mode];
    const activeSelectedOutfitId = selectedOutfitByMode[mode];
    const activeOutfits = outfits[mode];
    const activeGroups = customizations[mode];
    const activeSelectedOutfit = getSelectedOutfit(activeSelectedOutfitId, activeOutfits);

    const customizationTotal = useMemo(
        () => getCustomizationTotal(activeSelectedOptions, mode, customizations),
        [activeSelectedOptions, mode, customizations]
    );
    const outfitTotal = useMemo(
        () => getOutfitTotal(activeSelectedOutfitId, activeOutfits),
        [activeSelectedOutfitId, activeOutfits]
    );
    const extrasTotal = customizationTotal + outfitTotal;

    const hasCompletePeriod = Boolean(period.startDate && period.endDate);
    const pricePerDay = doll.rentPricePerDay ?? 0;
    const rentalBaseTotal = mode === "rent" && hasCompletePeriod ? rentalDays * pricePerDay : 0;
    const rentalTotal = rentalBaseTotal + extrasTotal;
    const buyBasePrice = doll.buyPrice ?? 0;
    const buyTotal = buyBasePrice + extrasTotal;

    const canUseCurrentMode = mode === "rent" ? settings.rent_enabled : settings.buy_enabled;
    const isAvailableForSelectedMode = mode === "rent" ? doll.availableForRent : doll.availableForBuy;
    const canCheckout = canUseCurrentMode && isAvailableForSelectedMode;

    const checkoutHref = getCheckoutHref(
        doll.id,
        mode,
        period,
        activeSelectedOutfitId,
        activeSelectedOptions,
        mode === "rent" ? rentalTotal : buyTotal
    );

    function toggleOption(groupId: string, optionId: string) {
        const group = customizations[mode].find((item) => item.id === groupId);
        setSelectedOptionsByMode((current) => {
            const currentModeOptions = current[mode];
            if (group?.selection_type === "single") {
                const groupOptionIds = group.options.map((o) => o.id);
                const withoutGroupOptions = currentModeOptions.filter(
                    (item) => !groupOptionIds.includes(item)
                );
                const next = currentModeOptions.includes(optionId)
                    ? withoutGroupOptions
                    : [...withoutGroupOptions, optionId];
                return { ...current, [mode]: next };
            }
            const next = currentModeOptions.includes(optionId)
                ? currentModeOptions.filter((item) => item !== optionId)
                : [...currentModeOptions, optionId];
            return { ...current, [mode]: next };
        });
    }

    function selectOutfit(outfitId: string) {
        setSelectedOutfitByMode((current) => ({ ...current, [mode]: outfitId }));
    }

    // Build summary lines from currently-selected options across groups.
    const singleGroupSummary = activeGroups
        .filter((g) => g.selection_type === "single")
        .map((group) => {
            const picked = group.options.find((o) => activeSelectedOptions.includes(o.id));
            return picked ? { title: group.title, value: picked.label } : null;
        })
        .filter((entry): entry is { title: string; value: string } => entry !== null);

    const multiUpgradeNames = activeGroups
        .filter((g) => g.selection_type === "multiple")
        .flatMap((g) => g.options.filter((o) => activeSelectedOptions.includes(o.id)).map((o) => o.label));

    // Render groups in order, but assign a 1-based index that also accounts for the outfit step.
    const orderedSteps: Array<
        | { kind: "outfit" }
        | { kind: "group"; group: CustomizationGroupWithOptions }
    > = [];
    if (activeOutfits.length > 0) orderedSteps.push({ kind: "outfit" });
    activeGroups.filter((g) => g.selection_type === "single").forEach((group) => {
        orderedSteps.push({ kind: "group", group });
    });
    const multiGroups = activeGroups.filter((g) => g.selection_type === "multiple");

    return (
        <main className="relative bg-velvet-950 text-silk min-h-screen">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 50%, rgba(179, 57, 81, 0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(179, 57, 81, 0.12) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 30%)",
                }}
            />
            <div className="relative z-10 pt-28 pb-20 lg:pt-36 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="text-xs font-medium text-silk/50 mb-6 flex items-center gap-2 flex-wrap">
                <Link href="/" className="hover:text-gold transition">
                    {t("breadcrumbHome")}
                </Link>
                <span>/</span>
                <Link href={getCatalogHref(mode, period)} className="hover:text-gold transition">
                    {t("breadcrumbCatalog")}
                </Link>
                <span>/</span>
                <span className="text-gold">{doll.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                {/* LEFT: Sticky gallery */}
                <div className="lg:col-span-6 xl:col-span-7">
                    <div className="lg:sticky lg:top-32 space-y-4">
                        <div className="relative rounded-3xl overflow-hidden bg-velvet-900 border border-gold/20 shadow-2xl shadow-velvet-900/50 aspect-[3/4] lg:aspect-[4/5] flex items-center justify-center group">
                            <Image
                                key={selectedImage}
                                src={getSupabaseImageUrl(selectedImage, "gallery")}
                                alt={doll.name}
                                width={1200}
                                height={1600}
                                className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[2s] group-hover:scale-105 ${styles.galleryImageFade}`}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />

                            {/* Badges */}
                            <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                                {doll.badge && (
                                    <span className="bg-gradient-to-r from-velvet-600 to-velvet-800 text-white px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full border border-gold/30 shadow-lg backdrop-blur-md">
                                        {doll.badge}
                                    </span>
                                )}
                                {doll.collection && (
                                    <span className="bg-velvet-950/80 text-gold px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-gold/10 backdrop-blur-md w-max">
                                        {doll.collection}
                                    </span>
                                )}
                            </div>

                            {galleryImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1))
                                        }
                                        aria-label={t("previousImage")}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 inline-flex items-center justify-center rounded-full bg-velvet-950/70 border border-gold/30 text-silk hover:bg-gold hover:text-velvet-950 backdrop-blur-md transition"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1))
                                        }
                                        aria-label={t("nextImage")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 inline-flex items-center justify-center rounded-full bg-velvet-950/70 border border-gold/30 text-silk hover:bg-gold hover:text-velvet-950 backdrop-blur-md transition"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {galleryImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {galleryImages.slice(0, 8).map((img, idx) => {
                                    const isActive = idx === selectedImageIndex;
                                    return (
                                        <button
                                            key={`${img}-${idx}`}
                                            type="button"
                                            onClick={() => setSelectedImageIndex(idx)}
                                            aria-label={t("viewImage", { index: idx + 1 })}
                                            className={[
                                                "border-2 rounded-xl overflow-hidden aspect-square transition",
                                                isActive
                                                    ? "border-gold opacity-100"
                                                    : "border-transparent opacity-70 hover:border-gold/50 hover:opacity-100",
                                            ].join(" ")}
                                        >
                                            <Image
                                                src={getSupabaseImageUrl(img, "thumb")}
                                                alt={`${doll.name} ${idx + 1}`}
                                                width={300}
                                                height={300}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Details & customizer */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col pt-4 lg:pt-0">
                    {/* Header */}
                    <div className="mb-8 border-b border-velvet-800/80 pb-6">
                        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white mb-3">
                            {doll.name}
                        </h1>
                        <p className="text-silk/70 leading-relaxed font-light text-sm sm:text-base mb-6">
                            {doll.description}
                        </p>

                        {/* Quick spec grid: collection / badge / rent / buy */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-velvet-900/40 border border-gold/10 p-3 rounded-xl text-center">
                                <div className="text-gold mb-1 text-lg flex justify-center">
                                    <CustomizationIcon name="stars" size={18} />
                                </div>
                                <div className="text-[10px] text-silk/50 uppercase tracking-widest">
                                    {t("collection")}
                                </div>
                                <div className="font-bold text-white text-sm truncate">
                                    {doll.collection || "—"}
                                </div>
                            </div>
                            <div className="bg-velvet-900/40 border border-gold/10 p-3 rounded-xl text-center">
                                <div className="text-gold mb-1 text-lg flex justify-center">
                                    <CustomizationIcon name="shield-check" size={18} />
                                </div>
                                <div className="text-[10px] text-silk/50 uppercase tracking-widest">
                                    {t("status")}
                                </div>
                                <div className="font-bold text-white text-sm truncate">
                                    {doll.badge || "—"}
                                </div>
                            </div>
                            <div className="bg-velvet-900/40 border border-gold/10 p-3 rounded-xl text-center">
                                <div className="text-gold mb-1 text-lg flex justify-center">
                                    <CustomizationIcon name="ruler-measure" size={18} />
                                </div>
                                <div className="text-[10px] text-silk/50 uppercase tracking-widest">
                                    {t("rent")}
                                </div>
                                <div className="font-bold text-white text-sm">
                                    {doll.availableForRent ? tCommon("available") : tCommon("unavailable")}
                                </div>
                            </div>
                            <div className="bg-velvet-900/40 border border-gold/10 p-3 rounded-xl text-center">
                                <div className="text-gold mb-1 text-lg flex justify-center">
                                    <CustomizationIcon name="box" size={18} />
                                </div>
                                <div className="text-[10px] text-silk/50 uppercase tracking-widest">
                                    {t("buy")}
                                </div>
                                <div className="font-bold text-white text-sm">
                                    {doll.availableForBuy ? tCommon("available") : tCommon("unavailable")}
                                </div>
                            </div>
                        </div>

                        {doll.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-5">
                                {doll.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[10px] uppercase tracking-widest text-silk/65 border border-velvet-800 bg-velvet-900/40 rounded-full px-2.5 py-1"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mode tabs */}
                    <div className="grid grid-cols-2 gap-2 mb-8 max-w-md">
                        <button
                            type="button"
                            onClick={() => setMode("rent")}
                            className={[
                                "min-h-11 rounded-full text-xs font-bold uppercase tracking-widest transition border",
                                mode === "rent"
                                    ? "bg-gradient-to-r from-velvet-500 to-velvet-700 text-white border-gold/30 shadow-lg shadow-velvet-950/40"
                                    : "bg-velvet-900/40 text-silk/70 border-velvet-800 hover:border-gold/40",
                            ].join(" ")}
                        >
                            {tCommon("rent")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("buy")}
                            className={[
                                "min-h-11 rounded-full text-xs font-bold uppercase tracking-widest transition border",
                                mode === "buy"
                                    ? "bg-gradient-to-r from-velvet-500 to-velvet-700 text-white border-gold/30 shadow-lg shadow-velvet-950/40"
                                    : "bg-velvet-900/40 text-silk/70 border-velvet-800 hover:border-gold/40",
                            ].join(" ")}
                        >
                            {tCommon("buy")}
                        </button>
                    </div>

                    {!isAvailableForSelectedMode && (
                        <div className="mb-6 px-4 py-3 rounded-2xl border border-velvet-700 bg-velvet-900/50 text-sm text-silk/80">
                            {t("notAvailableMode", {
                                mode: (mode === "rent" ? tCommon("rent") : tCommon("buy")).toLowerCase(),
                            })}
                        </div>
                    )}

                    {/* Rental period (only in rent mode) */}
                    {mode === "rent" && (
                        <div className="mb-8 p-5 rounded-2xl border border-velvet-800/80 bg-velvet-900/40 backdrop-blur-xl">
                            <h2 className="text-sm font-bold font-serif text-gold mb-2 flex items-center gap-2">
                                <CustomizationIcon name="ruler-measure" size={16} />
                                {t("choosePeriod")}
                            </h2>
                            <p className="text-xs text-silk/55 font-light mb-4 leading-relaxed">
                                {t("periodHelp")}
                            </p>
                            <RentalDateRangePicker
                                initialStartDate={period.startDate}
                                initialEndDate={period.endDate}
                                onChange={setPeriod}
                                placement="bottom"
                            />
                            {hasCompletePeriod && (
                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-silk/70">
                                    <span>
                                        {t("period")}:{" "}
                                        <strong className="text-white font-semibold">
                                            {formatDate(period.startDate, locale)} –{" "}
                                            {formatDate(period.endDate, locale)}
                                        </strong>
                                    </span>
                                    <span>
                                        {t("selectedDays")}:{" "}
                                        <strong className="text-white font-semibold">
                                            {tCommon("days", { count: rentalDays })}
                                        </strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Personalizer */}
                    <h2 className="text-xl font-bold font-serif text-gold mb-4 flex items-center gap-2">
                        <CustomizationIcon name="sparkles" size={16} />
                        {t("personalizer")}
                    </h2>

                    <div className="space-y-8 mb-10">
                        {orderedSteps.map((step, i) => {
                            if (step.kind === "outfit") {
                                return (
                                    <OutfitSelector
                                        key="outfit"
                                        outfits={activeOutfits}
                                        selectedId={activeSelectedOutfitId}
                                        onSelect={selectOutfit}
                                        index={i + 1}
                                    />
                                );
                            }
                            return (
                                <SingleChoiceGroup
                                    key={step.group.id}
                                    group={step.group}
                                    index={i + 1}
                                    selected={activeSelectedOptions}
                                    onToggle={toggleOption}
                                />
                            );
                        })}

                        {multiGroups.length > 0 && (
                            <div className="border-t border-velvet-800/80 pt-8 space-y-8">
                                {multiGroups.map((group, idx) => (
                                    <MultiChoiceGroup
                                        key={group.id}
                                        group={group}
                                        index={orderedSteps.length + idx + 1}
                                        selected={activeSelectedOptions}
                                        onToggle={toggleOption}
                                    />
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Sticky bottom summary */}
                    <div
                        className={`sticky bottom-4 z-30 bg-velvet-950/95 backdrop-blur-xl border border-gold/30 rounded-3xl p-5 sm:p-6 flex flex-col mt-auto ${styles.summaryGlow}`}
                    >
                        <h3 className="text-sm font-bold text-silk uppercase tracking-widest border-b border-velvet-800 pb-3 mb-3">
                            {t("summaryTitle")}
                        </h3>

                        <ul className="text-xs text-silk/70 space-y-2 mb-4 font-light">
                            {singleGroupSummary.map((entry) => (
                                <li key={entry.title} className="flex justify-between gap-3">
                                    <span>{entry.title}:</span>
                                    <span className="font-medium text-white text-right truncate">
                                        {entry.value}
                                    </span>
                                </li>
                            ))}
                            <li className="flex justify-between gap-3">
                                <span>{t("summaryOutfit")}:</span>
                                <span className="font-medium text-white text-right truncate">
                                    {activeSelectedOutfit ? activeSelectedOutfit.label : t("summaryNoOutfit")}
                                </span>
                            </li>
                            {multiUpgradeNames.length > 0 && (
                                <li className="flex justify-between gap-3">
                                    <span>{t("summaryExtras")}:</span>
                                    <span className="font-medium text-gold text-right">
                                        {multiUpgradeNames.join(", ")}
                                    </span>
                                </li>
                            )}
                        </ul>

                        <div className="flex items-end justify-between border-t border-velvet-800 pt-4 mb-5 gap-4">
                            <div>
                                <p className="text-[10px] text-silk/50 uppercase tracking-wider">
                                    {t("extrasEstimate")}
                                </p>
                                <div className="text-xl font-bold text-gold flex items-baseline gap-1">
                                    +{formatLei(extrasTotal, locale)}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-silk/50 uppercase tracking-wider">
                                    {mode === "rent" ? t("baseRentPrice") : t("baseBuyPrice")}
                                </p>
                                <p className="text-sm font-bold text-white">
                                    {mode === "rent"
                                        ? doll.rentPricePerDay
                                            ? formatLeiPerDay(doll.rentPricePerDay, locale, tCommon("perDay"))
                                            : tCommon("unavailable")
                                        : doll.buyPrice
                                            ? formatLei(doll.buyPrice, locale)
                                            : tCommon("unavailable")}
                                </p>
                            </div>
                        </div>

                        {mode === "rent" && hasCompletePeriod && (
                            <div className="flex items-center justify-between border-t border-velvet-800 pt-3 mb-4">
                                <span className="text-[10px] text-silk/50 uppercase tracking-wider">
                                    {t("estimatedTotal")}
                                </span>
                                <span className="text-lg font-bold text-gold">
                                    {formatLei(rentalTotal, locale)}
                                </span>
                            </div>
                        )}

                        {mode === "buy" && (
                            <div className="flex items-center justify-between border-t border-velvet-800 pt-3 mb-4">
                                <span className="text-[10px] text-silk/50 uppercase tracking-wider">
                                    {t("estimatedTotal")}
                                </span>
                                <span className="text-lg font-bold text-gold">
                                    {formatLei(buyTotal, locale)}
                                </span>
                            </div>
                        )}

                        {mode === "rent" ? (
                            canCheckout && hasCompletePeriod ? (
                                <Link
                                    href={checkoutHref}
                                    className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-bold transition text-center inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-velvet-950 shadow-lg shadow-gold/20 hover:from-white hover:to-white"
                                >
                                    {t("rentCta")}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    title={!canCheckout ? t("rentUnavailable") : t("choosePeriod")}
                                    className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-bold text-center inline-flex items-center justify-center gap-2 bg-velvet-900 text-silk/40 border border-velvet-800 cursor-not-allowed"
                                >
                                    {canCheckout ? t("choosePeriod") : t("rentUnavailable")}
                                </button>
                            )
                        ) : canCheckout ? (
                            <Link
                                href={checkoutHref}
                                className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-bold transition text-center inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-velvet-950 shadow-lg shadow-gold/20 hover:from-white hover:to-white"
                            >
                                {t("buyCta")}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-bold text-center inline-flex items-center justify-center gap-2 bg-velvet-900 text-silk/40 border border-velvet-800 cursor-not-allowed"
                            >
                                {t("buyUnavailable")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </main>
    );
}
