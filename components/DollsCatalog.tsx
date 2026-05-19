"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import styles from "./DollsCatalog.module.css";
import RentalDateRangePicker, { type RentalRangeValue } from "@/components/RentalDateRangePicker";
import type { PublicPlatformSettings } from "@/lib/settings/shared";

type DollsCatalogProps = {
    dolls: Doll[];
    collections: string[];
    initialMode: CatalogMode;
    initialStartDate: string;
    initialEndDate: string;
    settings: PublicPlatformSettings;
};

type AvailabilityFilter = "all" | "available" | "rent" | "buy" | "custom" | "sold_out";
type SortValue = "featured" | "name" | "price_asc" | "price_desc";

function getModeLabel(mode: CatalogMode) {
    return mode === "rent" ? "Închiriere" : "Cumpărare";
}

function getActionLabel(mode: CatalogMode) {
    return mode === "rent" ? "Alege pentru închiriere" : "Alege pentru cumpărare";
}

function getPriceLabel(doll: Doll, mode: CatalogMode) {
    if (mode === "rent") {
        return doll.rentPricePerDay ? `${doll.rentPricePerDay} lei / zi` : "Indisponibil";
    }

    return doll.buyPrice ? `${doll.buyPrice.toLocaleString("ro-RO")} lei` : "Indisponibil";
}

function isAvailableForMode(doll: Doll, mode: CatalogMode) {
    return mode === "rent" ? doll.availableForRent : doll.availableForBuy;
}

function getDetailsHref(doll: Doll, mode: CatalogMode, startDate: string, endDate: string) {
    const params = new URLSearchParams({
        mode,
    });

    if (startDate) {
        params.set("start", startDate);
    }

    if (endDate) {
        params.set("end", endDate);
    }

    return `/catalog/${doll.id}?${params.toString()}`;
}

function getCatalogHrefWithCurrentParams(mode: CatalogMode, period: RentalRangeValue) {
    const params = new URLSearchParams(window.location.search);

    params.set("mode", mode);

    if (period.startDate) {
        params.set("start", period.startDate);
    } else {
        params.delete("start");
    }

    if (period.endDate) {
        params.set("end", period.endDate);
    } else {
        params.delete("end");
    }

    return `/catalog?${params.toString()}`;
}

export default function DollsCatalog({
                                         dolls,
                                         collections,
                                         initialMode,
                                         initialStartDate,
                                         initialEndDate,
                                         settings,
                                     }: DollsCatalogProps) {
    const router = useRouter();
    const hasInitializedPeriodRef = useRef(false);

    const [mode, setMode] = useState<CatalogMode>(initialMode);
    const [search, setSearch] = useState("");
    const [collection, setCollection] = useState("all");
    const [availability, setAvailability] = useState<AvailabilityFilter>("all");
    const [sort, setSort] = useState<SortValue>("featured");
    const [period, setPeriod] = useState<RentalRangeValue>({
        startDate: initialStartDate,
        endDate: initialEndDate,
    });

    const filteredDolls = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const result = dolls.filter((doll) => {
            const matchesSearch =
                !normalizedSearch ||
                doll.name.toLowerCase().includes(normalizedSearch) ||
                doll.collection.toLowerCase().includes(normalizedSearch) ||
                doll.description.toLowerCase().includes(normalizedSearch) ||
                doll.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

            const matchesCollection = collection === "all" || doll.collection === collection;

            const matchesAvailability =
                availability === "all" ||
                (availability === "available" && doll.availability === "available") ||
                (availability === "custom" && doll.availability === "custom") ||
                (availability === "sold_out" && doll.availability === "sold_out") ||
                (availability === "rent" && doll.availableForRent) ||
                (availability === "buy" && doll.availableForBuy);

            return matchesSearch && matchesCollection && matchesAvailability;
        });

        return result.sort((first, second) => {
            if (sort === "name") {
                return first.name.localeCompare(second.name);
            }

            if (sort === "price_asc") {
                const firstPrice = mode === "rent" ? first.rentPricePerDay ?? Infinity : first.buyPrice ?? Infinity;
                const secondPrice = mode === "rent" ? second.rentPricePerDay ?? Infinity : second.buyPrice ?? Infinity;

                return firstPrice - secondPrice;
            }

            if (sort === "price_desc") {
                const firstPrice = mode === "rent" ? first.rentPricePerDay ?? 0 : first.buyPrice ?? 0;
                const secondPrice = mode === "rent" ? second.rentPricePerDay ?? 0 : second.buyPrice ?? 0;

                return secondPrice - firstPrice;
            }

            return 0;
        });
    }, [availability, collection, mode, search, sort]);

    useEffect(() => {
        if (!hasInitializedPeriodRef.current) {
            hasInitializedPeriodRef.current = true;
            return;
        }

        const nextHref = getCatalogHrefWithCurrentParams(mode, period);
        const currentHref = `${window.location.pathname}${window.location.search}`;

        if (nextHref !== currentHref) {
            router.replace(nextHref, { scroll: false });
        }
    }, [mode, period, router]);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern} />

                <div className={styles.heroInner}>
                    <Link href="/" className={styles.backLink}>
                        ← Înapoi la prezentare
                    </Link>

                    <span className="section-label">Catalog Artisan Dolls</span>

                    <h1 className={styles.title}>
                        Alege păpușa pentru <em>{getModeLabel(mode).toLowerCase()}</em>
                    </h1>

                    <p className={styles.subtitle}>
                        Am păstrat selecția făcută în hero. Poți schimba modul, poți filtra colecțiile și poți compara piesele disponibile.
                    </p>

                    <div className={styles.summary}>
                        <div>
                            <span>Mod selectat</span>
                            <strong>{getModeLabel(mode)}</strong>
                        </div>

                        <div className={styles.periodPickerCard}>
                            <div>
                                <RentalDateRangePicker
                                    initialStartDate={period.startDate}
                                    initialEndDate={period.endDate}
                                    onChange={setPeriod}
                                />
                            </div>
                        </div>

                        <div>
                            <span>Rezultate</span>
                            <strong>{filteredDolls.length} piese</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.catalogSection}>
                <aside className={styles.filters}>
                    <div className={styles.filterHeader}>
                        <span className="section-label">Filtre</span>
                        <h2>Rafinează selecția</h2>
                    </div>

                    <div className={styles.modeToggle}>
                        {settings.rent_enabled && (
                            <button
                                type="button"
                                className={mode === "rent" ? styles.activeMode : ""}
                                onClick={() => setMode("rent")}
                            >
                                Închiriere
                            </button>
                        )}

                        {settings.buy_enabled && (
                            <button
                                type="button"
                                className={mode === "buy" ? styles.activeMode : ""}
                                onClick={() => setMode("buy")}
                            >
                                Cumpărare
                            </button>
                        )}
                    </div>

                    <label className={styles.field}>
                        Caută
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Ex: Aurora, Noir, couture"
                        />
                    </label>

                    <label className={styles.field}>
                        Colecție
                        <select value={collection} onChange={(event) => setCollection(event.target.value)}>
                            <option value="all">Toate colecțiile</option>
                            {collections.map((collectionName) => (
                                <option key={collectionName} value={collectionName}>
                                    {collectionName}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.field}>
                        Disponibilitate
                        <select
                            value={availability}
                            onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
                        >
                            <option value="all">Toate</option>
                            <option value="available">Disponibile acum</option>
                            {settings.rent_enabled && (
                                <option value="rent">Disponibile pentru închiriere</option>
                            )}
                            {settings.buy_enabled && (
                                <option value="buy">Disponibile pentru cumpărare</option>
                            )}
                            <option value="custom">Personalizabile</option>
                            <option value="sold_out">Sold out</option>
                        </select>
                    </label>

                    <label className={styles.field}>
                        Sortare
                        <select value={sort} onChange={(event) => setSort(event.target.value as SortValue)}>
                            <option value="featured">Recomandate</option>
                            <option value="name">Nume A-Z</option>
                            <option value="price_asc">Preț crescător</option>
                            <option value="price_desc">Preț descrescător</option>
                        </select>
                    </label>
                </aside>

                <div className={styles.results}>
                    {filteredDolls.map((doll) => {
                        const availableForSelectedMode = isAvailableForMode(doll, mode);

                        return (
                            <article key={doll.id} className={styles.card}>
                                <div className={styles.imageWrap}>
                                    <Image
                                        src={getSupabaseImageUrl(doll.image, "card")}
                                        alt={doll.name}
                                        width={600}
                                        height={400}
                                        sizes="(max-width: 760px) 100vw, 50vw"
                                    />
                                    <span className={styles.badge}>{doll.badge}</span>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.cardTop}>
                                        <div>
                                            <span className={styles.collection}>{doll.collection}</span>
                                            <h3>{doll.name}</h3>
                                        </div>

                                        <strong className={styles.price}>{getPriceLabel(doll, mode)}</strong>
                                    </div>

                                    <p>{doll.description}</p>

                                    <div className={styles.tags}>
                                        {doll.tags.map((tag) => (
                                            <span key={tag}>{tag}</span>
                                        ))}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <span className={availableForSelectedMode ? styles.available : styles.unavailable}>
                                            {availableForSelectedMode
                                                ? `Disponibilă pentru ${getModeLabel(mode).toLowerCase()}`
                                                : `Indisponibilă pentru ${getModeLabel(mode).toLowerCase()}`}
                                        </span>

                                        <Link
                                            href={getDetailsHref(doll, mode, period.startDate, period.endDate)}
                                            className={availableForSelectedMode ? "btn btn-gold" : "btn btn-outline-light"}
                                            aria-disabled={!availableForSelectedMode}
                                        >
                                            {availableForSelectedMode ? getActionLabel(mode) : "Vezi detalii"}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {filteredDolls.length === 0 && (
                        <div className={styles.emptyState}>
                            <span className="section-label">Niciun rezultat</span>
                            <h3>Nu am găsit piese pentru filtrele selectate.</h3>
                            <p>Încearcă să schimbi colecția, disponibilitatea sau termenul de căutare.</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
