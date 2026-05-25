"use client";

import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, {
    type RentalRangeValue,
} from "@/components/RentalDateRangePicker";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatPrice, formatPricePerDay } from "@/i18n/format";
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
        locale === "en" ? "en-GB" : locale === "nl" ? "nl-NL" : "ro-RO",
        { day: "2-digit", month: "2-digit", year: "numeric" },
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
                .map((image) => image?.trim() ?? "")
                .filter(Boolean),
        ),
    );
    return uniqueImages.length > 0 ? uniqueImages : [doll.image];
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
    total: number,
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
    onClearGroup: (groupId: string) => void;
    currency: string;
};

function SingleChoiceGroup({
    group,
    index,
    selected,
    onToggle,
    onClearGroup,
    currency,
}: GroupRendererProps) {
    const locale = useLocale();
    const t = useTranslations("details");
    const tCommon = useTranslations("common");
    const hasSwatches = group.options.some((o) => o.swatch_color);
    const cols = group.options.length >= 4 ? "grid-cols-4" : "grid-cols-3";
    const hasSelection = group.options.some((o) => selected.includes(o.id));
    const radioGroupName = `single-${group.id}`;
    const headingId = `${radioGroupName}-heading`;

    return (
        <fieldset aria-labelledby={headingId}>
            <legend className="sr-only">{group.title}</legend>
            <div className="flex items-center justify-between mb-3 gap-3">
                <span
                    id={headingId}
                    className="block text-sm font-bold text-white uppercase tracking-wider"
                >
                    <span className="text-gold mr-2">{index}.</span>
                    {group.title}
                </span>
                {hasSelection && (
                    <button
                        type="button"
                        onClick={() => onClearGroup(group.id)}
                        className="text-[10px] uppercase tracking-widest text-silk/70 hover:text-gold focus-visible:outline-none focus-visible:underline"
                    >
                        {t("clearChoice")}
                    </button>
                )}
            </div>
            {group.description && (
                <p className="text-xs text-silk/70 mb-3 leading-relaxed">{group.description}</p>
            )}

            <div className={`grid ${cols} gap-3`}>
                {group.options.map((option) => {
                    const isSelected = selected.includes(option.id);
                    const inputId = `opt-${group.id}-${option.id}`;
                    return (
                        <div key={option.id} className="relative">
                            <input
                                type="radio"
                                name={radioGroupName}
                                id={inputId}
                                checked={isSelected}
                                onChange={() => onToggle(group.id, option.id)}
                                className={styles.swatchInput}
                            />
                            <label
                                htmlFor={inputId}
                                className={styles.swatchLabel}
                                title={option.label}
                            >
                                {hasSwatches && option.swatch_color ? (
                                    <div
                                        aria-hidden="true"
                                        className="w-9 h-9 rounded-full mx-auto mb-2 shadow-inner border border-white/20"
                                        style={{
                                            background: option.swatch_color,
                                        }}
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full mx-auto mb-2 inline-flex items-center justify-center text-gold-light bg-velvet-900 border border-gold/30">
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
                                    <span className="block text-[11px] text-gold-light mt-1 font-semibold">
                                        +{formatPrice(option.price, locale, currency)}
                                    </span>
                                )}
                                <i className={styles.swatchCheck} aria-hidden="true">
                                    ✓
                                </i>
                                <span className="sr-only">
                                    {isSelected ? tCommon("selected") : ""}
                                </span>
                            </label>
                        </div>
                    );
                })}
            </div>
        </fieldset>
    );
}

function MultiChoiceGroup({
    group,
    index,
    selected,
    onToggle,
    currency,
}: Omit<GroupRendererProps, "onClearGroup">) {
    const locale = useLocale();
    const t = useTranslations("details");
    const tCommon = useTranslations("common");
    const headingId = `multi-${group.id}-heading`;

    return (
        <fieldset aria-labelledby={headingId}>
            <legend className="sr-only">{group.title}</legend>
            <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 text-gold-light">
                    <CustomizationIcon name={group.icon_name} size={18} />
                </span>
                <h3
                    id={headingId}
                    className="text-sm font-bold text-white uppercase tracking-wider"
                >
                    <span className="text-gold mr-2">{index}.</span>
                    {group.title}
                </h3>
            </div>
            {group.description && (
                <p className="text-xs text-silk/70 mb-4 leading-relaxed">
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
                                "relative flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors group border bg-velvet-900/40 motion-reduce:transition-none",
                                isSelected
                                    ? "border-gold/70 bg-gold/10"
                                    : "border-velvet-700 hover:border-gold/50",
                            ].join(" ")}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggle(group.id, option.id)}
                                className="mt-1 h-5 w-5 bg-velvet-950 border-velvet-700 rounded focus:ring-gold focus-visible:ring-2 cursor-pointer"
                                aria-describedby={
                                    option.description ? `desc-${option.id}` : undefined
                                }
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center gap-3 mb-1">
                                    <span
                                        className={`font-semibold ${
                                            isSelected ? "text-gold" : "text-white"
                                        }`}
                                    >
                                        {option.label}
                                    </span>
                                    {option.price > 0 && (
                                        <span className="shrink-0 text-xs font-bold text-gold bg-gold/10 px-2 py-1 rounded">
                                            +{formatPrice(option.price, locale, currency)}
                                        </span>
                                    )}
                                </div>
                                {option.description && (
                                    <p
                                        id={`desc-${option.id}`}
                                        className="text-xs text-silk/80 leading-relaxed"
                                    >
                                        {option.description}
                                    </p>
                                )}
                                {isSelected && (
                                    <span className="sr-only">{tCommon("selected")}</span>
                                )}
                            </div>
                            {isSelected && (
                                <span className="absolute top-3 right-3 text-xs uppercase tracking-widest font-bold text-gold">
                                    {t("optionSelected")}
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

type OutfitSelectorProps = {
    outfits: OutfitOptionForCatalog[];
    selectedId: string;
    onSelect: (id: string) => void;
    index: number;
    currency: string;
};

function OutfitSelector({
    outfits,
    selectedId,
    onSelect,
    index,
    currency,
}: OutfitSelectorProps) {
    const t = useTranslations("details");
    const locale = useLocale();
    const reactId = useId();
    const listboxId = `${reactId}-outfit`;
    const [open, setOpen] = useState(false);
    const selected = getSelectedOutfit(selectedId, outfits);

    if (outfits.length === 0) return null;

    return (
        <div>
            <span className="block text-sm font-bold text-white uppercase tracking-wider mb-3">
                <span className="text-gold mr-2">{index}.</span> {t("outfit")}
            </span>

            <button
                type="button"
                className={styles.outfitTrigger}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={listboxId}
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
                            <small>+{formatPrice(selected.price, locale, currency)}</small>
                        </span>
                    </>
                ) : (
                    <>
                        <span
                            aria-hidden="true"
                            className={styles.noOutfitPreview}
                            style={{ width: 56, height: 56 }}
                        >
                            {t("without")}
                        </span>
                        <span className={styles.outfitTriggerMain}>
                            <strong>{t("chooseOutfit")}</strong>
                            <small>{t("noOutfitSelected")}</small>
                        </span>
                    </>
                )}
                <em className={styles.outfitTriggerChevron} aria-hidden="true">
                    {open ? "−" : "+"}
                </em>
            </button>

            {open && (
                <div className={styles.outfitDropdown} role="listbox" id={listboxId}>
                    <button
                        type="button"
                        role="option"
                        aria-selected={!selectedId}
                        className={!selectedId ? styles.outfitOptionSelected : styles.outfitOption}
                        onClick={() => {
                            onSelect("");
                            setOpen(false);
                        }}
                    >
                        <span aria-hidden="true" className={styles.noOutfitPreview}>
                            {t("without")}
                        </span>
                        <span>
                            <strong>{t("noExtraOutfit")}</strong>
                            <small>{formatPrice(0, locale, currency)}</small>
                        </span>
                    </button>

                    {outfits.map((outfit) => {
                        const isSelected = selectedId === outfit.id;
                        return (
                            <button
                                key={outfit.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
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
                                    width={72}
                                    height={88}
                                />
                                <span>
                                    <strong>{outfit.label}</strong>
                                    {outfit.description && <small>{outfit.description}</small>}
                                    <em>+{formatPrice(outfit.price, locale, currency)}</em>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

type GalleryProps = {
    images: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    dollName: string;
    badge: string | null;
    collection: string | null;
    onZoom: () => void;
    altBase: string;
};

function Gallery({
    images,
    selectedIndex,
    onSelect,
    dollName,
    badge,
    collection,
    onZoom,
    altBase,
}: GalleryProps) {
    const t = useTranslations("details");
    const selectedImage = images[selectedIndex] ?? images[0];

    const handleKey = useCallback(
        (e: ReactKeyboardEvent<HTMLElement>) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onSelect(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
            }
        },
        [images.length, onSelect, selectedIndex],
    );

    return (
        <div className="lg:sticky lg:top-32 space-y-4">
            <div
                role="region"
                aria-roledescription="image gallery"
                aria-label={altBase}
                className="relative rounded-3xl overflow-hidden bg-velvet-900 border border-gold/30 shadow-2xl shadow-velvet-900/60 aspect-[4/5] flex items-center justify-center group"
            >
                <button
                    type="button"
                    onClick={onZoom}
                    onKeyDown={handleKey}
                    aria-label={t("zoomImage")}
                    className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold focus-visible:ring-inset"
                >
                    <Image
                        key={selectedImage}
                        src={getSupabaseImageUrl(selectedImage, "gallery")}
                        alt={`${altBase} — ${selectedIndex + 1}/${images.length}`}
                        width={1200}
                        height={1500}
                        className={`absolute inset-0 w-full h-full object-cover object-top ${styles.galleryImageFade}`}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                </button>

                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 pointer-events-none">
                    {badge && (
                        <span className="bg-gradient-to-r from-velvet-600 to-velvet-800 text-white px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full border border-gold/40 shadow-lg backdrop-blur-md">
                            {badge}
                        </span>
                    )}
                    {collection && (
                        <span className="bg-velvet-950/85 text-gold px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border border-gold/20 backdrop-blur-md w-max">
                            {collection}
                        </span>
                    )}
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                onSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
                            }
                            aria-label={t("previousImage")}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 inline-flex items-center justify-center rounded-full bg-velvet-950/85 border border-gold/40 text-silk hover:bg-gold hover:text-velvet-950 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none"
                        >
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                onSelect(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
                            }
                            aria-label={t("nextImage")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 inline-flex items-center justify-center rounded-full bg-velvet-950/85 border border-gold/40 text-silk hover:bg-gold hover:text-velvet-950 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none"
                        >
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 list-none m-0 p-0">
                    {images.slice(0, 8).map((img, idx) => {
                        const isActive = idx === selectedIndex;
                        return (
                            <li key={`${img}-${idx}`}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(idx)}
                                    aria-label={t("viewImage", { index: idx + 1 })}
                                    aria-current={isActive ? "true" : undefined}
                                    className={[
                                        "w-full border-2 rounded-xl overflow-hidden aspect-square transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none",
                                        isActive
                                            ? "border-gold opacity-100"
                                            : "border-transparent opacity-75 hover:border-gold/50 hover:opacity-100",
                                    ].join(" ")}
                                >
                                    <Image
                                        src={getSupabaseImageUrl(img, "thumb")}
                                        alt={`${dollName} — ${idx + 1}`}
                                        width={300}
                                        height={300}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

type ZoomDialogProps = {
    open: boolean;
    onClose: () => void;
    image: string;
    alt: string;
};

function ZoomDialog({ open, onClose, image, alt }: ZoomDialogProps) {
    const t = useTranslations("details");

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKey);
        };
    }, [onClose, open]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={t("zoomImage")}
            className="fixed inset-0 z-[1000] bg-velvet-950/95 backdrop-blur-sm flex items-center justify-center p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label={t("closeZoom")}
                className="absolute top-4 right-4 inline-flex w-12 h-12 items-center justify-center rounded-full bg-velvet-900 text-silk hover:text-gold border border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
                <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
            <Image
                src={getSupabaseImageUrl(image, "gallery")}
                alt={alt}
                width={1600}
                height={2000}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                sizes="100vw"
                priority
            />
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
    const currency = settings.currency || "RON";

    const galleryImages = useMemo(() => getGalleryImages(doll), [doll]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0];

    const [mode, setMode] = useState<CatalogMode>(initialMode);
    const [period, setPeriod] = useState<RentalRangeValue>({
        startDate: initialStartDate,
        endDate: initialEndDate,
    });
    const [selectedOptionsByMode, setSelectedOptionsByMode] = useState<
        Record<CatalogMode, string[]>
    >({ rent: [], buy: [] });
    const [selectedOutfitByMode, setSelectedOutfitByMode] = useState<
        Record<CatalogMode, string>
    >({ rent: "", buy: "" });

    const rentalDays = useMemo(
        () => getRentalDays(period.startDate, period.endDate),
        [period.endDate, period.startDate],
    );

    const activeSelectedOptions = selectedOptionsByMode[mode];
    const activeSelectedOutfitId = selectedOutfitByMode[mode];
    const activeOutfits = outfits[mode];
    const activeGroups = customizations[mode];
    const activeSelectedOutfit = getSelectedOutfit(activeSelectedOutfitId, activeOutfits);

    const customizationTotal = useMemo(() => {
        const options = activeGroups.flatMap((g) => g.options);
        return activeSelectedOptions.reduce((total, optionId) => {
            const option = options.find((item) => item.id === optionId || item.slug === optionId);
            return total + (option?.price ?? 0);
        }, 0);
    }, [activeGroups, activeSelectedOptions]);

    const outfitTotal = useMemo(
        () => getOutfitTotal(activeSelectedOutfitId, activeOutfits),
        [activeSelectedOutfitId, activeOutfits],
    );
    const extrasTotal = customizationTotal + outfitTotal;

    const hasCompletePeriod = Boolean(period.startDate && period.endDate);
    const pricePerDay = doll.rentPricePerDay ?? 0;
    const rentalBaseTotal = mode === "rent" && hasCompletePeriod ? rentalDays * pricePerDay : 0;
    const rentalTotal = rentalBaseTotal + extrasTotal;
    const buyBasePrice = doll.buyPrice ?? 0;
    const buyTotal = buyBasePrice + extrasTotal;

    const canUseCurrentMode = mode === "rent" ? settings.rent_enabled : settings.buy_enabled;
    const isAvailableForSelectedMode =
        mode === "rent" ? doll.availableForRent : doll.availableForBuy;
    const canCheckout = canUseCurrentMode && isAvailableForSelectedMode;

    const checkoutHref = getCheckoutHref(
        doll.id,
        mode,
        period,
        activeSelectedOutfitId,
        activeSelectedOptions,
        mode === "rent" ? rentalTotal : buyTotal,
    );

    const altBase = useMemo(() => {
        const parts = [doll.name];
        if (doll.collection) parts.push(doll.collection);
        const tags = (doll.tags ?? []).slice(0, 2).join(", ");
        if (tags) parts.push(tags);
        return parts.join(" — ");
    }, [doll]);

    const toggleOption = useCallback(
        (groupId: string, optionId: string) => {
            const group = customizations[mode].find((item) => item.id === groupId);
            setSelectedOptionsByMode((current) => {
                const currentModeOptions = current[mode];
                if (group?.selection_type === "single") {
                    const groupOptionIds = group.options.map((o) => o.id);
                    const withoutGroupOptions = currentModeOptions.filter(
                        (item) => !groupOptionIds.includes(item),
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
        },
        [customizations, mode],
    );

    const clearGroup = useCallback(
        (groupId: string) => {
            const group = customizations[mode].find((item) => item.id === groupId);
            if (!group) return;
            const groupOptionIds = group.options.map((o) => o.id);
            setSelectedOptionsByMode((current) => ({
                ...current,
                [mode]: current[mode].filter((id) => !groupOptionIds.includes(id)),
            }));
        },
        [customizations, mode],
    );

    const selectOutfit = useCallback(
        (outfitId: string) => {
            setSelectedOutfitByMode((current) => ({ ...current, [mode]: outfitId }));
        },
        [mode],
    );

    const singleGroupSummary = useMemo(
        () =>
            activeGroups
                .filter((g) => g.selection_type === "single")
                .map((group) => {
                    const picked = group.options.find((o) => activeSelectedOptions.includes(o.id));
                    return picked ? { title: group.title, value: picked.label } : null;
                })
                .filter((entry): entry is { title: string; value: string } => entry !== null),
        [activeGroups, activeSelectedOptions],
    );

    const multiUpgradeNames = useMemo(
        () =>
            activeGroups
                .filter((g) => g.selection_type === "multiple")
                .flatMap((g) =>
                    g.options
                        .filter((o) => activeSelectedOptions.includes(o.id))
                        .map((o) => o.label),
                ),
        [activeGroups, activeSelectedOptions],
    );

    const orderedSteps: Array<
        | { kind: "outfit" }
        | { kind: "group"; group: CustomizationGroupWithOptions }
    > = [];
    if (activeOutfits.length > 0) orderedSteps.push({ kind: "outfit" });
    activeGroups
        .filter((g) => g.selection_type === "single")
        .forEach((group) => {
            orderedSteps.push({ kind: "group", group });
        });
    const multiGroups = activeGroups.filter((g) => g.selection_type === "multiple");

    const modeLabel = mode === "rent" ? tCommon("rent") : tCommon("buy");
    const ctaLabel = mode === "rent" ? t("rentCta") : t("buyCta");
    const ctaUnavailableLabel = mode === "rent" ? t("rentUnavailable") : t("buyUnavailable");

    return (
        <div className="relative bg-velvet-950 text-silk min-h-screen">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 50%, rgba(179, 57, 81, 0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(179, 57, 81, 0.12) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 30%)",
                }}
            />
            <div className="relative z-10 pt-28 pb-20 lg:pt-36 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label={t("breadcrumbCatalog")}
                    className="text-sm text-silk/80 mb-6 flex items-center gap-2 flex-wrap"
                >
                    <Link
                        href="/"
                        className="hover:text-gold transition focus-visible:outline-none focus-visible:underline underline-offset-4 motion-reduce:transition-none"
                    >
                        {t("breadcrumbHome")}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link
                        href={getCatalogHref(mode, period)}
                        className="hover:text-gold transition focus-visible:outline-none focus-visible:underline underline-offset-4 motion-reduce:transition-none"
                    >
                        {t("breadcrumbCatalog")}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="text-gold" aria-current="page">
                        {doll.name}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    <div className="lg:col-span-6 xl:col-span-7">
                        <Gallery
                            images={galleryImages}
                            selectedIndex={selectedImageIndex}
                            onSelect={setSelectedImageIndex}
                            dollName={doll.name}
                            badge={doll.badge || null}
                            collection={doll.collection || null}
                            onZoom={() => setZoomOpen(true)}
                            altBase={altBase}
                        />
                    </div>

                    <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
                        <div className="mb-8 border-b border-velvet-700 pb-6">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white mb-3 leading-tight">
                                {doll.name}
                            </h1>
                            <p className="text-silk/85 leading-relaxed text-sm sm:text-base mb-6">
                                {doll.description}
                            </p>

                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    {
                                        icon: "stars",
                                        label: t("collection"),
                                        value: doll.collection || "—",
                                    },
                                    {
                                        icon: "shield-check",
                                        label: t("status"),
                                        value: doll.badge || "—",
                                    },
                                    {
                                        icon: "ruler-measure",
                                        label: t("rent"),
                                        value: doll.availableForRent
                                            ? tCommon("available")
                                            : tCommon("unavailable"),
                                    },
                                    {
                                        icon: "box",
                                        label: t("buy"),
                                        value: doll.availableForBuy
                                            ? tCommon("available")
                                            : tCommon("unavailable"),
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="bg-velvet-900/50 border border-gold/15 p-3 rounded-xl text-center"
                                    >
                                        <div
                                            className="text-gold mb-1 flex justify-center"
                                            aria-hidden="true"
                                        >
                                            <CustomizationIcon name={item.icon} size={18} />
                                        </div>
                                        <dt className="text-[10px] text-silk/80 uppercase tracking-widest">
                                            {item.label}
                                        </dt>
                                        <dd className="font-bold text-white text-sm truncate mt-0.5">
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {doll.tags.length > 0 && (
                                <ul className="flex flex-wrap gap-2 mt-5 list-none p-0">
                                    {doll.tags.map((tag) => (
                                        <li
                                            key={tag}
                                            className="text-[10px] uppercase tracking-widest text-silk/80 border border-velvet-700 bg-velvet-900/50 rounded-full px-2.5 py-1"
                                        >
                                            {tag}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div
                            className="inline-grid grid-cols-2 gap-1 mb-8 p-1 rounded-full bg-velvet-900/60 border border-velvet-700"
                            role="radiogroup"
                            aria-label={t("specsLabel")}
                        >
                            {settings.rent_enabled && (
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={mode === "rent"}
                                    onClick={() => setMode("rent")}
                                    className={[
                                        "min-h-10 px-6 rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none",
                                        mode === "rent"
                                            ? "bg-gold text-velvet-950"
                                            : "text-silk/85 hover:text-silk",
                                    ].join(" ")}
                                >
                                    {tCommon("rent")}
                                </button>
                            )}
                            {settings.buy_enabled && (
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={mode === "buy"}
                                    onClick={() => setMode("buy")}
                                    className={[
                                        "min-h-10 px-6 rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none",
                                        mode === "buy"
                                            ? "bg-gold text-velvet-950"
                                            : "text-silk/85 hover:text-silk",
                                    ].join(" ")}
                                >
                                    {tCommon("buy")}
                                </button>
                            )}
                        </div>

                        {!isAvailableForSelectedMode && (
                            <div
                                role="status"
                                className="mb-6 px-4 py-3 rounded-2xl border border-velvet-700 bg-velvet-900/60 text-sm text-silk/95"
                            >
                                {t("notAvailableMode", { mode: modeLabel })}
                            </div>
                        )}

                        {mode === "rent" && (
                            <section
                                className="mb-8 p-5 rounded-2xl border border-velvet-700 bg-velvet-900/40 backdrop-blur-xl"
                                aria-labelledby="period-heading"
                            >
                                <h2
                                    id="period-heading"
                                    className="text-sm font-bold font-serif text-gold mb-2 flex items-center gap-2"
                                >
                                    <CustomizationIcon name="ruler-measure" size={16} />
                                    {t("choosePeriod")}
                                </h2>
                                <p className="text-xs text-silk/80 mb-4 leading-relaxed">
                                    {t("periodHelp")}
                                </p>
                                <RentalDateRangePicker
                                    initialStartDate={period.startDate}
                                    initialEndDate={period.endDate}
                                    onChange={setPeriod}
                                    placement="bottom"
                                />
                                {hasCompletePeriod && (
                                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-silk/85">
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
                            </section>
                        )}

                        {(orderedSteps.length > 0 || multiGroups.length > 0) && (
                            <>
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
                                                    currency={currency}
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
                                                onClearGroup={clearGroup}
                                                currency={currency}
                                            />
                                        );
                                    })}

                                    {multiGroups.length > 0 && (
                                        <div className="border-t border-velvet-700 pt-8 space-y-8">
                                            {multiGroups.map((group, idx) => (
                                                <MultiChoiceGroup
                                                    key={group.id}
                                                    group={group}
                                                    index={orderedSteps.length + idx + 1}
                                                    selected={activeSelectedOptions}
                                                    onToggle={toggleOption}
                                                    currency={currency}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <aside
                            aria-label={t("summaryTitle")}
                            aria-live="polite"
                            className={`lg:sticky lg:bottom-4 z-30 bg-velvet-950/95 backdrop-blur-xl border border-gold/40 rounded-3xl p-5 sm:p-6 flex flex-col mt-auto ${styles.summaryGlow}`}
                        >
                            <h2 className="text-sm font-bold text-silk uppercase tracking-widest border-b border-velvet-700 pb-3 mb-3">
                                {t("summaryTitle")}
                            </h2>

                            <ul className="text-sm text-silk/95 space-y-2 mb-4 list-none p-0">
                                {singleGroupSummary.map((entry) => (
                                    <li key={entry.title} className="flex justify-between gap-3">
                                        <span className="text-silk/80">{entry.title}:</span>
                                        <span className="font-medium text-white text-right truncate">
                                            {entry.value}
                                        </span>
                                    </li>
                                ))}
                                <li className="flex justify-between gap-3">
                                    <span className="text-silk/80">{t("summaryOutfit")}:</span>
                                    <span className="font-medium text-white text-right truncate">
                                        {activeSelectedOutfit
                                            ? activeSelectedOutfit.label
                                            : t("summaryNoOutfit")}
                                    </span>
                                </li>
                                {multiUpgradeNames.length > 0 && (
                                    <li className="flex justify-between gap-3">
                                        <span className="text-silk/80">{t("summaryExtras")}:</span>
                                        <span className="font-medium text-gold text-right">
                                            {multiUpgradeNames.join(", ")}
                                        </span>
                                    </li>
                                )}
                            </ul>

                            <div className="flex items-end justify-between border-t border-velvet-700 pt-4 mb-5 gap-4">
                                <div>
                                    <p className="text-[11px] text-silk/80 uppercase tracking-wider">
                                        {t("extrasEstimate")}
                                    </p>
                                    <div className="text-xl font-bold text-gold">
                                        +{formatPrice(extrasTotal, locale, currency)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-silk/80 uppercase tracking-wider">
                                        {mode === "rent" ? t("baseRentPrice") : t("baseBuyPrice")}
                                    </p>
                                    <p className="text-sm font-bold text-white">
                                        {mode === "rent"
                                            ? doll.rentPricePerDay
                                                ? formatPricePerDay(
                                                      doll.rentPricePerDay,
                                                      locale,
                                                      currency,
                                                      tCommon("perDay"),
                                                  )
                                                : tCommon("unavailable")
                                            : doll.buyPrice
                                              ? formatPrice(doll.buyPrice, locale, currency)
                                              : tCommon("unavailable")}
                                    </p>
                                </div>
                            </div>

                            {((mode === "rent" && hasCompletePeriod) || mode === "buy") && (
                                <div className="flex items-center justify-between border-t border-velvet-700 pt-3 mb-4">
                                    <span className="text-[11px] text-silk/80 uppercase tracking-wider">
                                        {t("estimatedTotal")}
                                    </span>
                                    <span className="text-lg font-bold text-gold">
                                        {formatPrice(
                                            mode === "rent" ? rentalTotal : buyTotal,
                                            locale,
                                            currency,
                                        )}
                                    </span>
                                </div>
                            )}
                            {mode === "rent" && !hasCompletePeriod && (
                                <p className="text-xs text-silk/80 mb-4 italic">
                                    {t("estimatedTotalPending")}
                                </p>
                            )}

                            {canCheckout && (mode === "buy" || hasCompletePeriod) ? (
                                <Link
                                    href={checkoutHref}
                                    className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-bold transition text-center inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-velvet-950 shadow-lg shadow-gold/30 hover:from-silk hover:to-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silk focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                                >
                                    {ctaLabel}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    aria-disabled="true"
                                    title={
                                        !canCheckout
                                            ? ctaUnavailableLabel
                                            : t("choosePeriod")
                                    }
                                    className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-bold text-center inline-flex items-center justify-center gap-2 bg-velvet-800 text-silk/90 border border-velvet-600 cursor-not-allowed"
                                >
                                    {canCheckout ? t("choosePeriod") : ctaUnavailableLabel}
                                </button>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            <ZoomDialog
                open={zoomOpen}
                onClose={() => setZoomOpen(false)}
                image={selectedImage}
                alt={altBase}
            />
        </div>
    );
}
