"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import type { CustomizationGroupWithOptions } from "@/lib/customizations/shared";
import CustomizationIcon from "@/components/icons/CustomizationIcon";
import styles from "./DollDetails.module.css";

type DollDetailsProps = {
    doll: Doll;
    initialMode: CatalogMode;
    initialStartDate: string;
    initialEndDate: string;
    customizations: Record<CatalogMode, CustomizationGroupWithOptions[]>;
};


type OutfitOption = {
    id: string;
    label: string;
    description: string;
    price: number;
    image: string;
};

const outfitOptionsByMode: Record<CatalogMode, OutfitOption[]> = {
    rent: [
        {
            id: "rent-outfit-classic",
            label: "Ținută elegantă clasică",
            description: "Look rafinat pentru prezentare, decor sau sesiuni foto simple.",
            price: 120,
            image: "https://placehold.co/420x520/130713/ff9bd0?text=Classic+Outfit",
        },
        {
            id: "rent-outfit-evening",
            label: "Ținută de seară",
            description: "Styling mai dramatic, potrivit pentru evenimente și cadre premium.",
            price: 180,
            image: "https://placehold.co/420x520/24051c/ff4fa3?text=Evening+Outfit",
        },
        {
            id: "rent-outfit-photo",
            label: "Ținută foto premium",
            description: "Ținută cu impact vizual ridicat pentru shooting sau vitrină.",
            price: 240,
            image: "https://placehold.co/420x520/2a0821/ffc1df?text=Photo+Outfit",
        },
    ],
    buy: [
        {
            id: "buy-outfit-couture",
            label: "Ținută couture personalizată",
            description: "Materiale premium, croială dedicată și accesorii potrivite colecției.",
            price: 650,
            image: "https://placehold.co/420x520/130713/ff9bd0?text=Couture",
        },
        {
            id: "buy-outfit-royal",
            label: "Ținută royal collection",
            description: "Ținută amplă, cu detalii decorative și finisaj de colecție.",
            price: 890,
            image: "https://placehold.co/420x520/24051c/ff4fa3?text=Royal",
        },
        {
            id: "buy-outfit-noir",
            label: "Ținută Noir premium",
            description: "Styling dark, elegant, cu accente dramatice și prezentare premium.",
            price: 760,
            image: "https://placehold.co/420x520/090009/ffc1df?text=Noir",
        },
    ],
};

function formatDate(value: string) {
    if (!value) return "";

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) {
        return value;
    }

    return `${day}.${month}.${year}`;
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

function getModeLabel(mode: CatalogMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
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

function getSelectedOutfit(outfitId: string, mode: CatalogMode) {
    return outfitOptionsByMode[mode].find((outfit) => outfit.id === outfitId) ?? null;
}

function getOutfitTotal(outfitId: string, mode: CatalogMode) {
    return getSelectedOutfit(outfitId, mode)?.price ?? 0;
}

type CustomizationPickerProps = {
    mode: CatalogMode;
    groups: CustomizationGroupWithOptions[];
    selectedOptions: string[];
    selectedOutfitId: string;
    onToggle: (groupId: string, optionId: string) => void;
    onOutfitSelect: (outfitId: string) => void;
};

function CustomizationPicker({
                                 mode,
                                 groups,
                                 selectedOptions,
                                 selectedOutfitId,
                                 onToggle,
                                 onOutfitSelect,
                             }: CustomizationPickerProps) {
    const [isOutfitOpen, setIsOutfitOpen] = useState(false);
    const outfitOptions = outfitOptionsByMode[mode];
    const selectedOutfit = getSelectedOutfit(selectedOutfitId, mode);

    return (
        <div className={styles.customizationPanel}>
            <div className={styles.customizationHeader}>
                <div>
                    <span className="section-label">Customizări</span>
                    <h2>
                        {mode === "rent"
                            ? "Opțiuni pentru închiriere"
                            : "Opțiuni pentru cumpărare"}
                    </h2>
                </div>

                <span className={styles.modePill}>
                    {mode === "rent" ? "Închiriere" : "Cumpărare"}
                </span>
            </div>

            <div className={styles.outfitSelector}>
                <div className={styles.groupHeader}>
                    <h3>Ținută</h3>
                    <p>
                        Alege o ținută separată pentru {mode === "rent" ? "închiriere" : "cumpărare"}.
                        Fiecare ținută are preț separat.
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
                    <small>+{selectedOutfit.price.toLocaleString("ro-RO")} lei</small>
                </span>
                        </>
                    ) : (
                        <span>
                <strong>Alege o ținută</strong>
                <small>Nicio ținută selectată</small>
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
                            <span className={styles.noOutfitPreview}>Fără</span>

                            <span>
                    <strong>Fără ținută extra</strong>
                    <small>+0 lei</small>
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
                            <em>+{outfit.price.toLocaleString("ro-RO")} lei</em>
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
                                                <em>+{option.price.toLocaleString("ro-RO")} lei</em>
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
                                    }: DollDetailsProps) {
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

    const customizationTotal = useMemo(() => {
        return getCustomizationTotal(activeSelectedOptions, mode, customizations);
    }, [activeSelectedOptions, mode, customizations]);

    const outfitTotal = useMemo(() => {
        return getOutfitTotal(activeSelectedOutfitId, mode);
    }, [activeSelectedOutfitId, mode]);

    const extrasTotal = customizationTotal + outfitTotal;

    const hasCompletePeriod = Boolean(period.startDate && period.endDate);
    const pricePerDay = doll.rentPricePerDay ?? 0;
    const rentalBaseTotal = mode === "rent" && hasCompletePeriod ? rentalDays * pricePerDay : 0;
    const rentalTotal = rentalBaseTotal + extrasTotal;
    const buyBasePrice = doll.buyPrice ?? 0;
    const buyTotal = buyBasePrice + extrasTotal;

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
                        ← Înapoi la catalog
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
                                            aria-label="Imaginea anterioară"
                                        >
                                            ‹
                                        </button>

                                        <button
                                            type="button"
                                            className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
                                            onClick={goToNextImage}
                                            aria-label="Imaginea următoare"
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
                                        aria-label={`Vezi imaginea ${index + 1}`}
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
                                <span className="section-label">Descriere</span>
                                <h2>Detalii despre piesă</h2>
                                <p>
                                    {doll.name} este o piesă creată pentru colecționari care caută o prezență vizuală puternică,
                                    finisaje atent lucrate și o experiență premium. Fiecare detaliu este gândit pentru prezentare,
                                    păstrare și integrare într-o colecție personală.
                                </p>
                                <p>
                                    Poate fi aleasă pentru sesiuni foto, decor tematic, colecții private sau comandă personalizată,
                                    în funcție de disponibilitate și modul selectat.
                                </p>
                            </div>

                            <div className={styles.specsCard}>
                                <span className="section-label">Specificații</span>
                                <h2>Informații rapide</h2>

                                <div className={styles.specList}>
                                    <div>
                                        <span>Colecție</span>
                                        <strong>{doll.collection}</strong>
                                    </div>
                                    <div>
                                        <span>Status</span>
                                        <strong>{doll.badge}</strong>
                                    </div>
                                    <div>
                                        <span>Închiriere</span>
                                        <strong>{doll.availableForRent ? "Disponibilă" : "Indisponibilă"}</strong>
                                    </div>
                                    <div>
                                        <span>Cumpărare</span>
                                        <strong>{doll.availableForBuy ? "Disponibilă" : "Indisponibilă"}</strong>
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
                                    Închiriere
                                </button>

                                <button
                                    type="button"
                                    className={mode === "buy" ? styles.activeMode : ""}
                                    onClick={() => setMode("buy")}
                                >
                                    Cumpărare
                                </button>
                            </div>

                            {!isAvailableForSelectedMode && (
                                <div className={styles.notice}>
                                    Această piesă nu este disponibilă momentan pentru {getModeLabel(mode).toLowerCase()}.
                                </div>
                            )}

                            <CustomizationPicker
                                mode={mode}
                                groups={customizations[mode]}
                                selectedOptions={activeSelectedOptions}
                                selectedOutfitId={activeSelectedOutfitId}
                                onToggle={toggleOption}
                                onOutfitSelect={selectOutfit}
                            />

                            {mode === "rent" && (
                                <div className={styles.pricePanel}>
                                    <div className={styles.priceRow}>
                                        <span>Preț pe zi</span>
                                        <strong>
                                            {doll.rentPricePerDay
                                                ? `${doll.rentPricePerDay} lei / zi`
                                                : "Indisponibil"}
                                        </strong>
                                    </div>

                                    {outfitTotal > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>Ținută</span>
                                            <strong>{outfitTotal.toLocaleString("ro-RO")} lei</strong>
                                        </div>
                                    )}

                                    {customizationTotal > 0 && (
                                        <div className={styles.priceRow}>
                                            <span>Alte customizări</span>
                                            <strong>{customizationTotal.toLocaleString("ro-RO")} lei</strong>
                                        </div>
                                    )}

                                    {!hasCompletePeriod && (
                                        <div className={styles.periodBox}>
                                            <span className={styles.panelLabel}>Alege perioada</span>
                                            <p>
                                                Pentru închiriere avem nevoie de data de început și data de sfârșit.
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
                                                <span>Perioadă</span>
                                                <strong>
                                                    {formatDate(period.startDate)} — {formatDate(period.endDate)}
                                                </strong>
                                            </div>

                                            <div className={styles.priceRow}>
                                                <span>Zile selectate</span>
                                                <strong>{rentalDays} zile</strong>
                                            </div>

                                            <div className={styles.totalRow}>
                                                <span>Total estimat</span>
                                                <strong>{rentalTotal.toLocaleString("ro-RO")} lei</strong>
                                            </div>
                                        </>
                                    )}

                                    {isAvailableForSelectedMode && hasCompletePeriod ? (
                                        <Link href={checkoutHref} className="btn btn-gold">
                                            Continuă cu închirierea
                                        </Link>
                                    ) : (
                                        <button type="button" className="btn btn-gold" disabled>
                                            Continuă cu închirierea
                                        </button>
                                    )}
                                </div>
                            )}

                            {mode === "buy" && (
                                <div className={styles.pricePanel}>
                                    <div className={styles.priceRow}>
                                        <span>Preț de bază</span>
                                        <strong>
                                            {doll.buyPrice
                                                ? `${doll.buyPrice.toLocaleString("ro-RO")} lei`
                                                : "Indisponibil"}
                                        </strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>Ținută</span>
                                        <strong>{outfitTotal.toLocaleString("ro-RO")} lei</strong>
                                    </div>

                                    <div className={styles.priceRow}>
                                        <span>Alte customizări</span>
                                        <strong>{customizationTotal.toLocaleString("ro-RO")} lei</strong>
                                    </div>

                                    <div className={styles.totalRow}>
                                        <span>Total estimat</span>
                                        <strong>{buyTotal.toLocaleString("ro-RO")} lei</strong>
                                    </div>

                                    {isAvailableForSelectedMode ? (
                                        <Link href={checkoutHref} className="btn btn-gold">
                                            Continuă cu achiziția
                                        </Link>
                                    ) : (
                                        <button type="button" className="btn btn-gold" disabled>
                                            Continuă cu achiziția
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
