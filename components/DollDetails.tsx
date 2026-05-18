"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import styles from "./DollDetails.module.css";

type DollDetailsProps = {
    doll: Doll;
    initialMode: CatalogMode;
    initialStartDate: string;
    initialEndDate: string;
};

type CustomOption = {
    id: string;
    label: string;
    description: string;
    price: number;
};

const customOptions: CustomOption[] = [
    {
        id: "face-detailing",
        label: "Detalii față premium",
        description: "Finisaj expresiv, machiaj artistic și accente pictate manual.",
        price: 350,
    },
    {
        id: "custom-outfit",
        label: "Ținută couture personalizată",
        description: "Materiale premium, croială dedicată și accesorii potrivite colecției.",
        price: 650,
    },
    {
        id: "display-box",
        label: "Cutie de prezentare",
        description: "Ambalaj rigid, interior protejat și prezentare premium.",
        price: 280,
    },
    {
        id: "certificate",
        label: "Certificat extins",
        description: "Fișă detaliată cu număr de serie, colecție și recomandări de întreținere.",
        price: 120,
    },
];

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

export default function DollDetails({
                                        doll,
                                        initialMode,
                                        initialStartDate,
                                        initialEndDate,
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
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const rentalDays = useMemo(() => {
        return getRentalDays(period.startDate, period.endDate);
    }, [period.endDate, period.startDate]);

    const customizationTotal = useMemo(() => {
        return selectedOptions.reduce((total, optionId) => {
            const option = customOptions.find((item) => item.id === optionId);
            return total + (option?.price ?? 0);
        }, 0);
    }, [selectedOptions]);

    const hasCompletePeriod = Boolean(period.startDate && period.endDate);
    const pricePerDay = doll.rentPricePerDay ?? 0;
    const rentalTotal = mode === "rent" && hasCompletePeriod ? rentalDays * pricePerDay : 0;
    const buyBasePrice = doll.buyPrice ?? 0;
    const buyTotal = buyBasePrice + customizationTotal;

    const isAvailableForSelectedMode = mode === "rent" ? doll.availableForRent : doll.availableForBuy;

    function toggleOption(optionId: string) {
        setSelectedOptions((currentOptions) => {
            if (currentOptions.includes(optionId)) {
                return currentOptions.filter((item) => item !== optionId);
            }

            return [...currentOptions, optionId];
        });
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
                                <img
                                    key={selectedImage}
                                    src={selectedImage}
                                    alt={doll.name}
                                    className={styles.activeImage}
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
                                        <img src={image} alt={`${doll.name} ${index + 1}`} />
                                    </button>
                                ))}
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

                                    <button
                                        type="button"
                                        className="btn btn-gold"
                                        disabled={!isAvailableForSelectedMode || !hasCompletePeriod}
                                    >
                                        Continuă cu închirierea
                                    </button>
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
                                        <span>Customizări</span>
                                        <strong>{customizationTotal.toLocaleString("ro-RO")} lei</strong>
                                    </div>

                                    <div className={styles.totalRow}>
                                        <span>Total estimat</span>
                                        <strong>{buyTotal.toLocaleString("ro-RO")} lei</strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-gold"
                                        disabled={!isAvailableForSelectedMode}
                                    >
                                        Continuă cu achiziția
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.detailsSection}>
                <div className={styles.detailsGrid}>
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

                <div className={styles.customizeSection}>
                    <div className={styles.sectionHeader}>
                        <span className="section-label">Customizare</span>
                        <h2>Personalizează experiența</h2>
                        <p>
                            Alege opțiuni extra pentru prezentare, finisaj și ambalare. Costurile se calculează automat
                            pentru modul de cumpărare.
                        </p>
                    </div>

                    <div className={styles.optionsGrid}>
                        {customOptions.map((option) => {
                            const isSelected = selectedOptions.includes(option.id);

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={isSelected ? styles.selectedOption : styles.optionCard}
                                    onClick={() => toggleOption(option.id)}
                                >
                                    <span>{option.label}</span>
                                    <p>{option.description}</p>
                                    <strong>+{option.price.toLocaleString("ro-RO")} lei</strong>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>
        </main>
    );
}
