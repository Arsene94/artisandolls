"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import Image from "next/image";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatLei, formatLeiPerDay } from "@/i18n/format";
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

function getModeLabel(mode: CatalogMode, rentLabel: string, buyLabel: string) {
    return mode === "rent" ? rentLabel : buyLabel;
}

function getPriceLabel(
    doll: Doll,
    mode: CatalogMode,
    locale: string,
    unavailableLabel: string,
    perDayLabel: string
) {
    if (mode === "rent") {
        return doll.rentPricePerDay
            ? formatLeiPerDay(doll.rentPricePerDay, locale, perDayLabel)
            : unavailableLabel;
    }

    return doll.buyPrice ? formatLei(doll.buyPrice, locale) : unavailableLabel;
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

function getServiceLabel(doll: Doll, rentLabel: string, buyLabel: string, unavailableLabel: string) {
    const services = [];

    if (doll.availableForRent) {
        services.push(rentLabel);
    }

    if (doll.availableForBuy) {
        services.push(buyLabel);
    }

    return services.length > 0 ? services.join(" / ") : unavailableLabel;
}

export default function DollsCatalog({
                                         dolls,
                                         collections,
                                         initialMode,
                                         initialStartDate,
                                         initialEndDate,
                                     settings,
                                 }: DollsCatalogProps) {
    const t = useTranslations("catalog");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const router = useRouter();
    const hasInitializedPeriodRef = useRef(false);
    const rentLabel = tCommon("rent");
    const buyLabel = tCommon("buy");

    const [mode, setMode] = useState<CatalogMode>(initialMode);
    const [search, setSearch] = useState("");
    const [collection, setCollection] = useState("all");
    const [availability, setAvailability] = useState<AvailabilityFilter>("all");
    const [sort, setSort] = useState<SortValue>("featured");
    const [period, setPeriod] = useState<RentalRangeValue>({
        startDate: initialStartDate,
        endDate: initialEndDate,
    });
    const currentModeLabel = getModeLabel(mode, rentLabel, buyLabel);
    const unavailableLabel = tCommon("unavailable");

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
    }, [availability, collection, dolls, mode, search, sort]);

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

    function resetFilters() {
        setSearch("");
        setCollection("all");
        setAvailability("all");
        setSort("featured");
    }

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <div className={`${styles.glow} ${styles.glowPrimary}`} />
                <div className={`${styles.glow} ${styles.glowGold}`} />

                <div className={styles.heroInner}>
                    <span className={styles.heroBadge}>{t("label")}</span>

                    <h1 className={styles.title}>
                        {t("title")}
                        <br />
                        <span>{t("titleEmphasis")}</span>
                    </h1>

                    <p className={styles.subtitle}>
                        {t("subtitle")}
                    </p>
                </div>
            </header>

            <section className={styles.filtersSection} aria-label={t("filtersLabel")}>
                <div className={styles.filtersInner}>
                    <div className={styles.filterPanel}>
                        <div className={styles.searchRow}>
                            <label className={`${styles.field} ${styles.searchField}`}>
                                <span className={styles.srOnly}>{t("search")}</span>
                                <span className={styles.searchInputWrap}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.searchIcon}>
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="M20 20l-3.8-3.8" />
                                    </svg>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder={t("searchPlaceholder")}
                                    />
                                </span>
                            </label>

                            <div className={styles.resultCounter}>
                                <span>{t("results")}</span>
                                <strong>{filteredDolls.length}</strong>
                            </div>
                        </div>

                        <div className={styles.advancedFilters}>
                            <div className={styles.filterControl}>
                                <span className={styles.controlLabel}>{t("selectedMode")}</span>
                                <div className={styles.modeToggle}>
                                    {settings.rent_enabled && (
                                        <button
                                            type="button"
                                            className={mode === "rent" ? styles.activeMode : ""}
                                            onClick={() => setMode("rent")}
                                            aria-pressed={mode === "rent"}
                                        >
                                            {rentLabel}
                                        </button>
                                    )}

                                    {settings.buy_enabled && (
                                        <button
                                            type="button"
                                            className={mode === "buy" ? styles.activeMode : ""}
                                            onClick={() => setMode("buy")}
                                            aria-pressed={mode === "buy"}
                                        >
                                            {buyLabel}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={styles.filterControl}>
                                <span className={styles.controlLabel}>{t("period")}</span>
                                <div className={styles.datePickerControl}>
                                    <RentalDateRangePicker
                                        initialStartDate={period.startDate}
                                        initialEndDate={period.endDate}
                                        onChange={setPeriod}
                                        placement="bottom"
                                    />
                                </div>
                            </div>

                            <label className={styles.field}>
                                <span>{t("collection")}</span>
                                <select value={collection} onChange={(event) => setCollection(event.target.value)}>
                                    <option value="all">{t("allCollections")}</option>
                                    {collections.map((collectionName) => (
                                        <option key={collectionName} value={collectionName}>
                                            {collectionName}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>{t("availability")}</span>
                                <select
                                    value={availability}
                                    onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
                                >
                                    <option value="all">{t("availabilityAll")}</option>
                                    <option value="available">{t("availabilityNow")}</option>
                                    {settings.rent_enabled && (
                                        <option value="rent">{t("availabilityRent")}</option>
                                    )}
                                    {settings.buy_enabled && (
                                        <option value="buy">{t("availabilityBuy")}</option>
                                    )}
                                    <option value="custom">{t("availabilityCustom")}</option>
                                    <option value="sold_out">{t("availabilitySoldOut")}</option>
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>{t("sort")}</span>
                                <select value={sort} onChange={(event) => setSort(event.target.value as SortValue)}>
                                    <option value="featured">{t("sortFeatured")}</option>
                                    <option value="name">{t("sortName")}</option>
                                    <option value="price_asc">{t("sortPriceAsc")}</option>
                                    <option value="price_desc">{t("sortPriceDesc")}</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.resultsSection}>
                <div className={styles.resultsInner}>
                    {filteredDolls.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span aria-hidden="true" className={styles.emptyIcon}>
                                <svg viewBox="0 0 24 24">
                                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                                    <path d="M3 3l18 18" />
                                </svg>
                            </span>
                            <h3>{t("emptyTitle")}</h3>
                            <p>{t("emptyDescription")}</p>
                            <button type="button" className={styles.resetButton} onClick={resetFilters}>
                                {t("resetFilters")}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.results}>
                            {filteredDolls.map((doll) => {
                                const availableForSelectedMode = isAvailableForMode(doll, mode);
                                const priceLabel = getPriceLabel(
                                    doll,
                                    mode,
                                    locale,
                                    unavailableLabel,
                                    tCommon("perDay")
                                );
                                const availabilityLabel = availableForSelectedMode
                                    ? t("availableFor", { mode: currentModeLabel.toLowerCase() })
                                    : t("unavailableFor", { mode: currentModeLabel.toLowerCase() });

                                return (
                                    <article key={doll.id} className={styles.card}>
                                        <div className={styles.imageWrap}>
                                            <Image
                                                src={getSupabaseImageUrl(doll.image, "card")}
                                                alt={doll.name}
                                                width={600}
                                                height={720}
                                                sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                            />
                                            <span className={styles.badge}>{doll.badge}</span>
                                        </div>

                                        <div className={styles.cardBody}>
                                            <div>
                                                <div className={styles.cardTop}>
                                                    <h3>{doll.name}</h3>
                                                    <span className={styles.pricePill}>{priceLabel}</span>
                                                </div>

                                                <p>{doll.description}</p>
                                            </div>

                                            <div className={styles.cardDetails}>
                                                <div className={styles.specGrid}>
                                                    <div className={styles.specItem}>
                                                        <span>{t("collection")}</span>
                                                        <strong>{doll.collection}</strong>
                                                    </div>
                                                    <div className={styles.specItem}>
                                                        <span>{t("selectedMode")}</span>
                                                        <strong>
                                                            {getServiceLabel(doll, rentLabel, buyLabel, unavailableLabel)}
                                                        </strong>
                                                    </div>
                                                    <div className={styles.specItem}>
                                                        <span>{t("availability")}</span>
                                                        <strong className={availableForSelectedMode ? styles.available : styles.unavailable}>
                                                            {availabilityLabel}
                                                        </strong>
                                                    </div>
                                                    <div className={styles.specItem}>
                                                        <span>{t("price")}</span>
                                                        <strong>{priceLabel}</strong>
                                                    </div>
                                                </div>

                                                {doll.tags.length > 0 && (
                                                    <div className={styles.tags}>
                                                        {doll.tags.slice(0, 4).map((tag) => (
                                                            <span key={tag}>{tag}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className={styles.cardFooter}>
                                                    <span className={styles.modeLabel}>
                                                        {getServiceLabel(doll, rentLabel, buyLabel, unavailableLabel)}
                                                    </span>

                                                    <Link
                                                        href={getDetailsHref(doll, mode, period.startDate, period.endDate)}
                                                        className={`${styles.cardCta} ${
                                                            availableForSelectedMode ? "" : styles.cardCtaMuted
                                                        }`}
                                                        aria-disabled={!availableForSelectedMode}
                                                    >
                                                        {availableForSelectedMode
                                                            ? mode === "rent"
                                                                ? t("chooseRent")
                                                                : t("chooseBuy")
                                                            : t("viewDetails")}
                                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M12 1a5 5 0 0 0-5 5v4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5Zm-3 9V6a3 3 0 0 1 6 0v4H9Z" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
