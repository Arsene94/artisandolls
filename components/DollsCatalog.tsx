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

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroPattern} />

                <div className={styles.heroInner}>
                    <Link href="/" className={styles.backLink}>
                        {"<-"} {t("back")}
                    </Link>

                    <span className="section-label">{t("label")}</span>

                    <h1 className={styles.title}>
                        {t.rich("title", {
                            mode: currentModeLabel.toLowerCase(),
                            em: (chunks) => <em>{chunks}</em>,
                        })}
                    </h1>

                    <p className={styles.subtitle}>
                        {t("subtitle")}
                    </p>

                    <div className={styles.summary}>
                        <div>
                            <span>{t("selectedMode")}</span>
                            <strong>{currentModeLabel}</strong>
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
                            <span>{t("results")}</span>
                            <strong>{tCommon("pieces", { count: filteredDolls.length })}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.catalogSection}>
                <aside className={styles.filters}>
                    <div className={styles.filterHeader}>
                        <span className="section-label">{t("filtersLabel")}</span>
                        <h2>{t("filtersTitle")}</h2>
                    </div>

                    <div className={styles.modeToggle}>
                        {settings.rent_enabled && (
                            <button
                                type="button"
                                className={mode === "rent" ? styles.activeMode : ""}
                                onClick={() => setMode("rent")}
                            >
                                {rentLabel}
                            </button>
                        )}

                        {settings.buy_enabled && (
                            <button
                                type="button"
                                className={mode === "buy" ? styles.activeMode : ""}
                                onClick={() => setMode("buy")}
                            >
                                {buyLabel}
                            </button>
                        )}
                    </div>

                    <label className={styles.field}>
                        {t("search")}
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t("searchPlaceholder")}
                        />
                    </label>

                    <label className={styles.field}>
                        {t("collection")}
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
                        {t("availability")}
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
                        {t("sort")}
                        <select value={sort} onChange={(event) => setSort(event.target.value as SortValue)}>
                            <option value="featured">{t("sortFeatured")}</option>
                            <option value="name">{t("sortName")}</option>
                            <option value="price_asc">{t("sortPriceAsc")}</option>
                            <option value="price_desc">{t("sortPriceDesc")}</option>
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

                                        <strong className={styles.price}>
                                            {getPriceLabel(
                                                doll,
                                                mode,
                                                locale,
                                                tCommon("unavailable"),
                                                tCommon("perDay")
                                            )}
                                        </strong>
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
                                                ? t("availableFor", { mode: currentModeLabel.toLowerCase() })
                                                : t("unavailableFor", { mode: currentModeLabel.toLowerCase() })}
                                        </span>

                                        <Link
                                            href={getDetailsHref(doll, mode, period.startDate, period.endDate)}
                                            className={availableForSelectedMode ? "btn btn-gold" : "btn btn-outline-light"}
                                            aria-disabled={!availableForSelectedMode}
                                        >
                                            {availableForSelectedMode
                                                ? mode === "rent"
                                                    ? t("chooseRent")
                                                    : t("chooseBuy")
                                                : t("viewDetails")}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {filteredDolls.length === 0 && (
                        <div className={styles.emptyState}>
                            <span className="section-label">{t("emptyLabel")}</span>
                            <h3>{t("emptyTitle")}</h3>
                            <p>{t("emptyDescription")}</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
