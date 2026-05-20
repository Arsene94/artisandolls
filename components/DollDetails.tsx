"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import Image from "next/image";
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

    if (!year || !month || !day) {
        return value;
    }

    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale === "nl" ? "nl-NL" : "ro-RO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(`${year}-${month}-${day}T00:00:00`));
}

function parseDate(value: string) {
    if (!value) return null;

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function getRentalDays(startDate: string, endDate: string) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
        return 0;
    }

    const diff = end.getTime() - start.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    return Math.max(1, Math.ceil(diff / dayMs));
}

function getModeLabel(mode: CatalogMode, rentLabel: string, buyLabel: string) {
    return mode === "rent" ? rentLabel : buyLabel;
}

function getCatalogHref(mode: CatalogMode, period: RentalRangeValue) {
    const params = new URLSearchParams({
        mode,
    });

    if (period.startDate) {
        params.set("start", period.startDate);
    }

    if (period.endDate) {
        params.set("end", period.endDate);
    }

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

function getSelectedOutfit(
    outfitId: string,
    availableOutfits: OutfitOptionForCatalog[]
) {
    return availableOutfits.find((outfit) => outfit.id === outfitId) ?? null;
}

function getOutfitTotal(
    outfitId: string,
    availableOutfits: OutfitOptionForCatalog[]
) {
    return getSelectedOutfit(outfitId, availableOutfits)?.price ?? 0;
}

type CustomizationPickerProps = {
    mode: CatalogMode;
    groups: CustomizationGroupWithOptions[];
    outfits: OutfitOptionForCatalog[];
    selectedOptions: string[];
    selectedOutfitId: string;
    onToggle: (groupId: string, optionId: string) => void;
    onOutfitSelect: (outfitId: string) => void;
};

function CustomizationPicker({
                                 mode,
                                 groups,
                                 outfits,
                                 selectedOptions,
                                 selectedOutfitId,
                                 onToggle,
                                 onOutfitSelect,
                             }: CustomizationPickerProps) {
    const t = useTranslations("details");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const [isOutfitOpen, setIsOutfitOpen] = useState(false);
    const outfitOptions = outfits;
    const selectedOutfit = getSelectedOutfit(selectedOutfitId, outfitOptions);
    const modeLabel = getModeLabel(mode, tCommon("rent"), tCommon("buy")).toLowerCase();

    return (
        <div className={styles.customizationPanel}>
            <div className={styles.customizationHeader}>
                <div>
                    <span className="section-label">{t("customizationsLabel")}</span>
                    <h2>
                        {mode === "rent"
                            ? t("rentOptions")
                            : t("buyOptions")}
                    </h2>
                </div>

                <span className={styles.modePill}>
                    {getModeLabel(mode, tCommon("rent"), tCommon("buy"))}
                </span>
            </div>

            <div className={styles.outfitSelector}>
                <div className={styles.groupHeader}>
                    <h3>{t("outfit")}</h3>
                    <p>
                        {t("outfitDescription", { mode: modeLabel })}
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.outfitTrigger}
                    onClick={() => setIsOutfitOpen((current) => !current)}
                    aria-expanded={isOutfitOpen}
                >
                    {selectedOutfit ? (
                        <>
                            <img src={selectedOutfit.image} alt={selectedOutfit.label} />

                            <span>
                    <strong>{selectedOutfit.label}</strong>
                    <small>+{formatLei(selectedOutfit.price, locale)}</small>
                </span>
                        </>
                    ) : (
                        <span>
                <strong>{t("chooseOutfit")}</strong>
                <small>{t("noOutfitSelected")}</small>
            </span>
                    )}

                    <em>{isOutfitOpen ? "−" : "+"}</em>
                </button>

                {isOutfitOpen && (
                    <div className={styles.outfitDropdown}>
                        <button
                            type="button"
                            className={!selectedOutfitId ? styles.outfitOptionSelected : styles.outfitOption}
                            onClick={() => {
                                onOutfitSelect("");
                                setIsOutfitOpen(false);
                            }}
                        >
                            <span className={styles.noOutfitPreview}>{t("without")}</span>

                            <span>
                    <strong>{t("noExtraOutfit")}</strong>
                    <small>+{formatLei(0, locale)}</small>
                </span>
                        </button>

                        {outfitOptions.map((outfit) => {
                            const isSelected = selectedOutfitId === outfit.id;

                            return (
                                <button
                                    key={outfit.id}
                                    type="button"
                                    className={isSelected ? styles.outfitOptionSelected : styles.outfitOption}
                                    onClick={() => {
                                        onOutfitSelect(outfit.id);
                                        setIsOutfitOpen(false);
                                    }}
                                >
                                    <img src={outfit.image} alt={outfit.label} />

                                    <span>
                            <strong>{outfit.label}</strong>
                            <small>{outfit.description}</small>
                            <em>+{formatLei(outfit.price, locale)}</em>
                        </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={styles.customizationGroups}>
                {groups.map((group) => (
                    <div key={group.id} className={styles.customizationGroup}>
                        <div className={styles.groupHeader}>
                            <h3>
                                <CustomizationIcon name={group.icon_name} />
                                {group.title}
                            </h3>
                            <p>{group.description}</p>
                        </div>

                        <div className={styles.customOptionList}>
                            {group.options.map((option) => {
                                const isSelected = selectedOptions.includes(option.id);

                                return (
                                    <label
                                        key={option.id}
                                        className={
                                            isSelected
                                                ? styles.customOptionSelected
                                                : styles.customOption
                                        }
                                    >
                                        <input
                                            type={group.selection_type === "single" ? "radio" : "checkbox"}
                                            name={`customization-${group.id}`}
                                            checked={isSelected}
                                            onChange={() => onToggle(group.id, option.id)}
                                        />

                                        <span className={styles.checkboxControl} aria-hidden="true">
                                            {isSelected ? "✓" : ""}
                                        </span>

                                        <span className={styles.customOptionIcon} aria-hidden="true">
                                            <CustomizationIcon
                                                name={option.icon_name}
                                                color={option.icon_color}
                                            />

                                            {option.swatch_color && (
                                                <i style={{ background: option.swatch_color }} />
                                            )}
                                        </span>

                                        <span className={styles.customOptionContent}>
                                            <span className={styles.customOptionTop}>
                                                <strong>{option.label}</strong>
                                                <em>+{formatLei(option.price, locale)}</em>
                                            </span>

                                            <span>{option.description ?? ""}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
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

    function goToPreviousImage() {
        setSelectedImageIndex((currentIndex) => {
            if (currentIndex === 0) {
                return galleryImages.length - 1;
            }

            return currentIndex - 1;
        });
    }

    function goToNextImage() {
        setSelectedImageIndex((currentIndex) => {
            if (currentIndex === galleryImages.length - 1) {
                return 0;
            }

            return currentIndex + 1;
        });
    }
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

    const rentalDays = useMemo(() => {
        return getRentalDays(period.startDate, period.endDate);
    }, [period.endDate, period.startDate]);

    const activeSelectedOptions = selectedOptionsByMode[mode];
    const activeSelectedOutfitId = selectedOutfitByMode[mode];
    const activeOutfits = outfits[mode];

    const customizationTotal = useMemo(() => {
        return getCustomizationTotal(activeSelectedOptions, mode, customizations);
    }, [activeSelectedOptions, mode, customizations]);

    const outfitTotal = useMemo(() => {
        return getOutfitTotal(activeSelectedOutfitId, activeOutfits);
    }, [activeSelectedOutfitId, activeOutfits]);

    const extrasTotal = customizationTotal + outfitTotal;

    const hasCompletePeriod = Boolean(period.startDate && period.endDate);
    const pricePerDay = doll.rentPricePerDay ?? 0;
    const rentalBaseTotal = mode === "rent" && hasCompletePeriod ? rentalDays * pricePerDay : 0;
    const rentalTotal = rentalBaseTotal + extrasTotal;
    const buyBasePrice = doll.buyPrice ?? 0;
    const buyTotal = buyBasePrice + extrasTotal;

    const canUseCurrentMode =
        mode === "rent" ? settings.rent_enabled : settings.buy_enabled;
    const currentModeLabel = getModeLabel(mode, tCommon("rent"), tCommon("buy"));


    const checkoutHref = getCheckoutHref(
        doll.id,
        mode,
        period,
        activeSelectedOutfitId,
        activeSelectedOptions,
        mode === "rent" ? rentalTotal : buyTotal
    );


    const isAvailableForSelectedMode = mode === "rent" ? doll.availableForRent : doll.availableForBuy;

    function toggleOption(groupId: string, optionId: string) {
        const group = customizations[mode].find((item) => item.id === groupId);

        setSelectedOptionsByMode((currentOptionsByMode) => {
            const currentModeOptions = currentOptionsByMode[mode];

            if (group?.selection_type === "single") {
                const groupOptionIds = group.options.map((option) => option.id);

                const withoutGroupOptions = currentModeOptions.filter(
                    (item) => !groupOptionIds.includes(item)
                );

                const nextModeOptions = currentModeOptions.includes(optionId)
                    ? withoutGroupOptions
                    : [...withoutGroupOptions, optionId];

                return {
                    ...currentOptionsByMode,
                    [mode]: nextModeOptions,
                };
            }

            const nextModeOptions = currentModeOptions.includes(optionId)
                ? currentModeOptions.filter((item) => item !== optionId)
                : [...currentModeOptions, optionId];

            return {
                ...currentOptionsByMode,
                [mode]: nextModeOptions,
            };
        });
    }

    function selectOutfit(outfitId: string) {
        setSelectedOutfitByMode((currentOutfitByMode) => ({
            ...currentOutfitByMode,
            [mode]: outfitId,
        }));
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern} />

                <div className={styles.heroInner}>
                    <Link href={getCatalogHref(mode, period)} className={styles.backLink}>
                        {"<-"} {t("back")}
                    </Link>

                    <div className={styles.heroGrid}>
                        <div className={styles.gallery}>
                            <div className={styles.mainImage}>
                                <Image
                                    key={selectedImage}
                                    src={getSupabaseImageUrl(selectedImage, "gallery")}
                                    alt={doll.name}
                                    width={1200}
                                    height={900}
                                    className={styles.activeImage}
                                    sizes="(max-width: 1100px) 100vw, 50vw"
                                />

                                <span>{doll.badge}</span>

                                {galleryImages.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
                                            onClick={goToPreviousImage}
                                            aria-label={t("previousImage")}
                                        >
                                            ‹
                                        </button>

                                        <button
                                            type="button"
                                            className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
                                            onClick={goToNextImage}
                                            aria-label={t("nextImage")}
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className={styles.thumbnails}>
                                {galleryImages.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        className={selectedImageIndex === index ? styles.activeThumbnail : ""}
                                        onClick={() => setSelectedImageIndex(index)}
                                        aria-label={t("viewImage", { index: index + 1 })}
                                    >
                                        <Image
                                            src={getSupabaseImageUrl(image, "thumb")}
                                            alt={`${doll.name} ${index + 1}`}
                                            width={320}
                                            height={240}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className={styles.descriptionCard}>
                                <span className="section-label">{t("descriptionLabel")}</span>
                                <h2>{t("descriptionTitle")}</h2>
                                <p>
                                    {t("descriptionParagraph1", { name: doll.name })}
                                </p>
                                <p>
                                    {t("descriptionParagraph2")}
                                </p>
                            </div>

                            <div className={styles.specsCard}>
                                <span className="section-label">{t("specsLabel")}</span>
                                <h2>{t("specsTitle")}</h2>

                                <div className={styles.specList}>
                                    <div>
                                        <span>{t("collection")}</span>
                                        <strong>{doll.collection}</strong>
                                    </div>
                                    <div>
                                        <span>{t("status")}</span>
                                        <strong>{doll.badge}</strong>
                                    </div>
                                    <div>
                                        <span>{t("rent")}</span>
                                        <strong>{doll.availableForRent ? tCommon("available") : tCommon("unavailable")}</strong>
                                    </div>
                                    <div>
                                        <span>{t("buy")}</span>
                                        <strong>{doll.availableForBuy ? tCommon("available") : tCommon("unavailable")}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.info}>
                            <span className="section-label">{doll.collection}</span>

                            <h1>{doll.name}</h1>

                            <p className={styles.lead}>{doll.description}</p>

                            <div className={styles.tags}>
                                {doll.tags.map((tag) => (
                                    <span key={tag}>{tag}</span>
                                ))}
                            </div>

                            <div className={styles.modeSwitch}>
                                <button
                                    type="button"
                                    className={mode === "rent" ? styles.activeMode : ""}
                                    onClick={() => setMode("rent")}
                                >
                                    {tCommon("rent")}
                                </button>

                                <button
                                    type="button"
                                    className={mode === "buy" ? styles.activeMode : ""}
                                    onClick={() => setMode("buy")}
                                >
                                    {tCommon("buy")}
                                </button>
                            </div>

                            {!isAvailableForSelectedMode && (
                                <div className={styles.notice}>
                                    {t("notAvailableMode", { mode: currentModeLabel.toLowerCase() })}
                                </div>
                            )}

                            <CustomizationPicker
                                mode={mode}
                                groups={customizations[mode]}
                                outfits={activeOutfits}
                                selectedOptions={activeSelectedOptions}
                                selectedOutfitId={activeSelectedOutfitId}
                                onToggle={toggleOption}
                                onOutfitSelect={selectOutfit}
                            />

                            {mode === "rent" && (
                                <div className={styles.pricePanel}>
                                    <div className={styles.priceRow}>
                                        <span>{t("pricePerDay")}</span>
                                        <strong>
                                            {doll.rentPricePerDay
                                                ? formatLeiPerDay(doll.rentPricePerDay, locale, tCommon("perDay"))
                                                : tCommon("unavailable")}
                                        </strong>
                                    </div>

                                    {outfitTotal > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>{t("outfit")}</span>
                                            <strong>{formatLei(outfitTotal, locale)}</strong>
                                        </div>
                                    )}

                                    {customizationTotal > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>{t("otherCustomizations")}</span>
                                            <strong>{formatLei(customizationTotal, locale)}</strong>
                                        </div>
                                    )}

                                    {!hasCompletePeriod && (
                                        <div className={styles.periodBox}>
                                            <span className={styles.panelLabel}>{t("choosePeriod")}</span>
                                            <p>
                                                {t("periodHelp")}
                                            </p>

                                            <RentalDateRangePicker
                                                initialStartDate={period.startDate}
                                                initialEndDate={period.endDate}
                                                onChange={setPeriod}
                                                placement="bottom"
                                            />
                                        </div>
                                    )}

                                    {hasCompletePeriod && (
                                        <>
                                            <div className={styles.priceRow}>
                                                <span>{t("period")}</span>
                                                <strong>
                                                    {formatDate(period.startDate, locale)} - {formatDate(period.endDate, locale)}
                                                </strong>
                                            </div>

                                            <div className={styles.priceRow}>
                                                <span>{t("selectedDays")}</span>
                                                <strong>{tCommon("days", { count: rentalDays })}</strong>
                                            </div>

                                            <div className={styles.totalRow}>
                                                <span>{t("estimatedTotal")}</span>
                                                <strong>{formatLei(rentalTotal, locale)}</strong>
                                            </div>
                                        </>
                                    )}

                                    {canUseCurrentMode ? (
                                        <Link href={checkoutHref} className="btn btn-gold">
                                            {tCommon("continue")}
                                        </Link>
                                    ) : (
                                        <button type="button" className="btn btn-outline-light" disabled>
                                            {mode === "rent"
                                                ? t("rentUnavailable")
                                                : t("buyUnavailable")}
                                        </button>
                                    )}
                                </div>
                            )}

                            {mode === "buy" && (
                                <div className={styles.pricePanel}>
                                    <div className={styles.priceRow}>
                                        <span>{t("basePrice")}</span>
                                        <strong>
                                            {doll.buyPrice
                                                ? formatLei(doll.buyPrice, locale)
                                                : tCommon("unavailable")}
                                        </strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>{t("outfit")}</span>
                                        <strong>{formatLei(outfitTotal, locale)}</strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>{t("otherCustomizations")}</span>
                                        <strong>{formatLei(customizationTotal, locale)}</strong>
                                    </div>

                                    <div className={styles.totalRow}>
                                        <span>{t("estimatedTotal")}</span>
                                        <strong>{formatLei(buyTotal, locale)}</strong>
                                    </div>

                                    {isAvailableForSelectedMode ? (
                                        <Link href={checkoutHref} className="btn btn-gold">
                                            {t("continuePurchase")}
                                        </Link>
                                    ) : (
                                        <button type="button" className="btn btn-gold" disabled>
                                            {t("continuePurchase")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
