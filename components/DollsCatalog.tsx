"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { type CatalogMode, type Doll } from "@/lib/dolls";
import { getRentFromPrice } from "@/lib/dolls/tiers";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { formatPrice } from "@/i18n/format";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import { searchCatalogSemantic } from "@/app/[locale]/catalog/search-actions";
import {
    dollBadgeOffer,
    offerBadgeLabel,
    type OfferRow,
} from "@/lib/offers/shared";
import styles from "./DollsCatalog.module.css";

type DollsCatalogProps = {
    dolls: Doll[];
    collections: string[];
    initialMode: CatalogMode;
    settings: PublicPlatformSettings;
    offers?: OfferRow[];
};

function DollOfferBadge({
    offers,
    doll,
    locale,
}: {
    offers: OfferRow[];
    doll: Doll;
    locale: string;
}) {
    const offer = dollBadgeOffer(offers, doll.collectionId, locale);
    const text = offer ? offerBadgeLabel(offer, locale) : null;
    if (!text) return null;
    return (
        <span
            style={offer?.accent ? { backgroundColor: offer.accent } : undefined}
            className="absolute bottom-3 left-3 z-10 inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-gold/90 text-velvet-950"
        >
            {text}
        </span>
    );
}

type AvailabilityFilter = "all" | "available" | "rent" | "buy" | "custom" | "sold_out";
type SortValue = "featured" | "name" | "price_asc" | "price_desc";

function isAvailableForMode(doll: Doll, mode: CatalogMode) {
    return mode === "rent" ? doll.availableForRent : doll.availableForBuy;
}

function getDetailsHref(doll: Doll, mode: CatalogMode) {
    return `/catalog/${doll.id}?mode=${mode}`;
}

function getRentSortPrice(doll: Doll) {
    return getRentFromPrice(doll.rentalTiers)?.price ?? null;
}

function getCatalogHrefWithCurrentParams(mode: CatalogMode) {
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    params.delete("start");
    params.delete("end");
    return `/catalog?${params.toString()}`;
}

function getServiceLabel(
    doll: Doll,
    rentLabel: string,
    buyLabel: string,
    unavailableLabel: string,
) {
    const services: string[] = [];
    if (doll.availableForRent) services.push(rentLabel);
    if (doll.availableForBuy) services.push(buyLabel);
    return services.length > 0 ? services.join(" / ") : unavailableLabel;
}

function buildAltText(doll: Doll, collectionLabel: string) {
    const tags = (doll.tags ?? []).slice(0, 3).join(", ");
    const tail = tags ? ` — ${tags}` : "";
    return `${doll.name} — ${collectionLabel}: ${doll.collection}${tail}`;
}

export default function DollsCatalog({
    dolls,
    collections,
    initialMode,
    settings,
    offers = [],
}: DollsCatalogProps) {
    const t = useTranslations("catalog");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const router = useRouter();
    const hasInitializedModeRef = useRef(false);
    const currency = settings.currency || "RON";
    const rentLabel = tCommon("rent");
    const buyLabel = tCommon("buy");
    const unavailableLabel = tCommon("unavailable");
    const collectionLabel = t("collection");

    const [mode, setMode] = useState<CatalogMode>(initialMode);
    const [search, setSearch] = useState("");
    const [collection, setCollection] = useState("all");
    const [availability, setAvailability] = useState<AvailabilityFilter>("all");
    const [sort, setSort] = useState<SortValue>("featured");
    const [semanticOrder, setSemanticOrder] = useState<string[] | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Count of the filters tucked behind the "Filtre" button (mode + search
    // stay always-visible, so they're excluded from the badge).
    const advancedCount =
        (collection !== "all" ? 1 : 0) +
        (availability !== "all" ? 1 : 0) +
        (sort !== "featured" ? 1 : 0);

    const currentModeLabel = mode === "rent" ? rentLabel : buyLabel;

    useEffect(() => {
        const trimmed = search.trim();
        let cancelled = false;
        const handle = window.setTimeout(() => {
            if (cancelled) return;
            if (trimmed.length < 2) {
                setSemanticOrder(null);
                return;
            }
            searchCatalogSemantic(trimmed, locale)
                .then((res) => {
                    if (cancelled) return;
                    setSemanticOrder(res.slugs);
                })
                .catch(() => {
                    if (cancelled) return;
                    setSemanticOrder(null);
                });
        }, 220);
        return () => {
            cancelled = true;
            window.clearTimeout(handle);
        };
    }, [search, locale]);

    const filteredDolls = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        const semanticSet =
            semanticOrder && semanticOrder.length > 0
                ? new Set(semanticOrder)
                : null;

        const result = dolls.filter((doll) => {
            if (semanticSet) {
                if (!semanticSet.has(doll.id)) return false;
            } else if (normalizedSearch) {
                const matchesSearch =
                    doll.name.toLowerCase().includes(normalizedSearch) ||
                    doll.collection.toLowerCase().includes(normalizedSearch) ||
                    doll.description.toLowerCase().includes(normalizedSearch) ||
                    doll.tags.some((tag) =>
                        tag.toLowerCase().includes(normalizedSearch),
                    );
                if (!matchesSearch) return false;
            }

            const matchesCollection = collection === "all" || doll.collection === collection;

            const matchesAvailability =
                availability === "all" ||
                (availability === "available" && doll.availability === "available") ||
                (availability === "custom" && doll.availability === "custom") ||
                (availability === "sold_out" && doll.availability === "sold_out") ||
                (availability === "rent" && doll.availableForRent) ||
                (availability === "buy" && doll.availableForBuy);

            return matchesCollection && matchesAvailability;
        });

        if (semanticSet && sort === "featured") {
            const rank = new Map<string, number>();
            semanticOrder!.forEach((slug, index) => rank.set(slug, index));
            return result.sort(
                (a, b) =>
                    (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                    (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
            );
        }

        return result.sort((first, second) => {
            if (sort === "name") return first.name.localeCompare(second.name);
            if (sort === "price_asc") {
                const a =
                    mode === "rent"
                        ? getRentSortPrice(first) ?? Infinity
                        : first.buyPrice ?? Infinity;
                const b =
                    mode === "rent"
                        ? getRentSortPrice(second) ?? Infinity
                        : second.buyPrice ?? Infinity;
                return a - b;
            }
            if (sort === "price_desc") {
                const a = mode === "rent" ? getRentSortPrice(first) ?? 0 : first.buyPrice ?? 0;
                const b = mode === "rent" ? getRentSortPrice(second) ?? 0 : second.buyPrice ?? 0;
                return b - a;
            }
            return 0;
        });
    }, [availability, collection, dolls, mode, search, semanticOrder, sort]);

    useEffect(() => {
        if (!hasInitializedModeRef.current) {
            hasInitializedModeRef.current = true;
            return;
        }
        const nextHref = getCatalogHrefWithCurrentParams(mode);
        const currentHref = `${window.location.pathname}${window.location.search}`;
        if (nextHref !== currentHref) {
            router.replace(nextHref, { scroll: false });
        }
    }, [mode, router]);

    const resetFilters = useCallback(() => {
        setSearch("");
        setCollection("all");
        setAvailability("all");
        setSort("featured");
    }, []);

    const activeFilters = useMemo(() => {
        const list: { id: string; label: string; clear: () => void }[] = [];
        if (search.trim()) {
            list.push({
                id: "search",
                label: `“${search.trim()}”`,
                clear: () => setSearch(""),
            });
        }
        if (collection !== "all") {
            list.push({
                id: "collection",
                label: collection,
                clear: () => setCollection("all"),
            });
        }
        if (availability !== "all") {
            const labelKey =
                availability === "available"
                    ? "availabilityNow"
                    : availability === "rent"
                      ? "availabilityRent"
                      : availability === "buy"
                        ? "availabilityBuy"
                        : availability === "custom"
                          ? "availabilityCustom"
                          : "availabilitySoldOut";
            list.push({
                id: "availability",
                label: t(labelKey),
                clear: () => setAvailability("all"),
            });
        }
        if (sort !== "featured") {
            const labelKey =
                sort === "name"
                    ? "sortName"
                    : sort === "price_asc"
                      ? "sortPriceAsc"
                      : "sortPriceDesc";
            list.push({
                id: "sort",
                label: t(labelKey),
                clear: () => setSort("featured"),
            });
        }
        return list;
    }, [availability, collection, search, sort, t]);

    return (
        <div className={styles.page}>
            <section className={styles.hero} aria-labelledby="catalog-title">
                <div className={`${styles.glow} ${styles.glowPrimary}`} aria-hidden="true" />
                <div className={`${styles.glow} ${styles.glowGold}`} aria-hidden="true" />

                <div className={styles.heroInner}>
                    <span className={styles.heroBadge}>{t("label")}</span>
                    <h1 id="catalog-title" className={styles.title}>
                        {t("title")}
                        <br />
                        <span>{t("titleEmphasis")}</span>
                    </h1>
                    <p className={styles.subtitle}>{t("subtitle")}</p>
                </div>
            </section>

            <section className={styles.filtersSection} aria-label={t("filtersLabel")}>
                <div className={styles.filtersInner}>
                    <div className={styles.filterPanel}>
                        <div className={styles.searchRow}>
                            <label className={`${styles.field} ${styles.searchField}`}>
                                <span className={styles.srOnly}>{t("search")}</span>
                                <span className={styles.searchInputWrap}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        focusable="false"
                                        className={styles.searchIcon}
                                    >
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="M20 20l-3.8-3.8" />
                                    </svg>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder={t("searchPlaceholder")}
                                        aria-describedby="catalog-search-hint"
                                    />
                                </span>
                                <span id="catalog-search-hint" className={styles.srOnly}>
                                    {t("searchHint")}
                                </span>
                            </label>

                            <div
                                className={styles.resultCounter}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                <span>{t("results", { count: filteredDolls.length })}</span>
                            </div>
                        </div>

                        <div className={styles.controlsRow}>
                            <div className={styles.filterControl}>
                                <span className={styles.controlLabel}>{t("selectedMode")}</span>
                                <div className={styles.modeToggle} role="group" aria-label={t("selectedMode")}>
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

                            <button
                                type="button"
                                className={`${styles.filtersButton}${
                                    filtersOpen ? ` ${styles.filtersButtonActive}` : ""
                                }`}
                                onClick={() => setFiltersOpen((open) => !open)}
                                aria-expanded={filtersOpen}
                                aria-controls="catalog-advanced-filters"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                    focusable="false"
                                    className={styles.filtersButtonIcon}
                                >
                                    <line x1="4" y1="6" x2="20" y2="6" />
                                    <line x1="7" y1="12" x2="17" y2="12" />
                                    <line x1="10" y1="18" x2="14" y2="18" />
                                </svg>
                                <span>{t("filtersButton")}</span>
                                {advancedCount > 0 ? (
                                    <span className={styles.filtersBadge}>{advancedCount}</span>
                                ) : null}
                            </button>
                        </div>

                        {filtersOpen ? (
                            <div id="catalog-advanced-filters" className={styles.advancedPanel}>
                                <label className={styles.field}>
                                    <span>{t("collection")}</span>
                                    <select
                                        value={collection}
                                        onChange={(event) => setCollection(event.target.value)}
                                    >
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
                                        onChange={(event) =>
                                            setAvailability(event.target.value as AvailabilityFilter)
                                        }
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
                                    <select
                                        value={sort}
                                        onChange={(event) => setSort(event.target.value as SortValue)}
                                    >
                                        <option value="featured">{t("sortFeatured")}</option>
                                        <option value="name">{t("sortName")}</option>
                                        <option value="price_asc">{t("sortPriceAsc")}</option>
                                        <option value="price_desc">{t("sortPriceDesc")}</option>
                                    </select>
                                </label>
                            </div>
                        ) : null}

                        {activeFilters.length > 0 && (
                            <div className={styles.activeFilters} aria-live="polite">
                                <span className={styles.activeFiltersLabel}>
                                    {t("activeFiltersLabel")}:
                                </span>
                                <ul>
                                    {activeFilters.map((af) => (
                                        <li key={af.id}>
                                            <button
                                                type="button"
                                                onClick={af.clear}
                                                aria-label={t("removeFilter", { label: af.label })}
                                            >
                                                <span>{af.label}</span>
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.4"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                    focusable="false"
                                                >
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                    <li>
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className={styles.activeFiltersReset}
                                        >
                                            {t("resetFilters")}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.resultsSection} aria-label={t("results", { count: filteredDolls.length })}>
                <div className={styles.resultsInner}>
                    {filteredDolls.length === 0 ? (
                        <div className={styles.emptyState} role="status">
                            <span aria-hidden="true" className={styles.emptyIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-3.5-3.5" />
                                    <path d="m8.5 8.5 5 5" />
                                    <path d="m13.5 8.5-5 5" />
                                </svg>
                            </span>
                            <h3>{t("emptyTitle")}</h3>
                            <p>{t("emptyDescription")}</p>
                            <button
                                type="button"
                                className={styles.resetButton}
                                onClick={resetFilters}
                            >
                                {t("resetFilters")}
                            </button>
                        </div>
                    ) : (
                        <ul className={styles.results}>
                            {filteredDolls.map((doll) => {
                                const availableForSelectedMode = isAvailableForMode(doll, mode);
                                const rentFrom = getRentFromPrice(doll.rentalTiers);
                                const priceLabel =
                                    mode === "rent"
                                        ? rentFrom
                                            ? tCommon("fromPrice", {
                                                  price: formatPrice(
                                                      rentFrom.price,
                                                      locale,
                                                      currency,
                                                  ),
                                              })
                                            : unavailableLabel
                                        : doll.buyPrice
                                          ? formatPrice(doll.buyPrice, locale, currency)
                                          : unavailableLabel;
                                const availabilityLabel = availableForSelectedMode
                                    ? t("availableFor", { mode: currentModeLabel })
                                    : t("unavailableFor", { mode: currentModeLabel });
                                const visibleTags = doll.tags.slice(0, 4);
                                const remainingTags = doll.tags.length - visibleTags.length;

                                return (
                                    <li key={doll.id}>
                                        <article className={styles.card}>
                                            <div className={styles.imageWrap}>
                                                <Image
                                                    src={getSupabaseImageUrl(doll.image, "card")}
                                                    alt={buildAltText(doll, collectionLabel)}
                                                    width={600}
                                                    height={720}
                                                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                                                />
                                                <span className={styles.badge}>{doll.badge}</span>
                                                <DollOfferBadge
                                                    offers={offers}
                                                    doll={doll}
                                                    locale={locale}
                                                />
                                            </div>

                                            <div className={styles.cardBody}>
                                                <div>
                                                    <div className={styles.cardTop}>
                                                        <h3>
                                                            <Link
                                                                href={getDetailsHref(doll, mode)}
                                                                aria-label={`${doll.name} — ${t("viewDetails")}`}
                                                                className={styles.cardTitleLink}
                                                            >
                                                                {doll.name}
                                                            </Link>
                                                        </h3>
                                                        <span className={styles.pricePill}>{priceLabel}</span>
                                                    </div>
                                                    <p>{doll.description}</p>
                                                </div>

                                                <div className={styles.cardDetails}>
                                                    <dl className={styles.specGrid}>
                                                        <div className={styles.specItem}>
                                                            <dt>{t("collection")}</dt>
                                                            <dd>{doll.collection}</dd>
                                                        </div>
                                                        <div className={styles.specItem}>
                                                            <dt>{t("selectedMode")}</dt>
                                                            <dd>
                                                                {getServiceLabel(
                                                                    doll,
                                                                    rentLabel,
                                                                    buyLabel,
                                                                    unavailableLabel,
                                                                )}
                                                            </dd>
                                                        </div>
                                                        <div className={styles.specItem}>
                                                            <dt>{t("availability")}</dt>
                                                            <dd
                                                                className={
                                                                    availableForSelectedMode
                                                                        ? styles.available
                                                                        : styles.unavailable
                                                                }
                                                            >
                                                                {availabilityLabel}
                                                            </dd>
                                                        </div>
                                                        <div className={styles.specItem}>
                                                            <dt>{t("price")}</dt>
                                                            <dd>{priceLabel}</dd>
                                                        </div>
                                                    </dl>

                                                    {doll.tags.length > 0 && (
                                                        <ul className={styles.tags} aria-label="Tags">
                                                            {visibleTags.map((tag) => (
                                                                <li key={tag}>{tag}</li>
                                                            ))}
                                                            {remainingTags > 0 && (
                                                                <li>
                                                                    {t("tagsMore", {
                                                                        count: remainingTags,
                                                                    })}
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}

                                                    <div className={styles.cardFooter}>
                                                        <Link
                                                            href={getDetailsHref(doll, mode)}
                                                            className={`${styles.cardCta} ${
                                                                availableForSelectedMode
                                                                    ? ""
                                                                    : styles.cardCtaMuted
                                                            }`}
                                                            aria-disabled={!availableForSelectedMode}
                                                            aria-label={`${availableForSelectedMode ? mode === "rent" ? t("chooseRent") : t("chooseBuy") : t("viewDetails")} — ${doll.name}`}
                                                        >
                                                            {availableForSelectedMode
                                                                ? mode === "rent"
                                                                    ? t("chooseRent")
                                                                    : t("chooseBuy")
                                                                : t("viewDetails")}
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                aria-hidden="true"
                                                                focusable="false"
                                                            >
                                                                <path d="M12 1a5 5 0 0 0-5 5v4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5Zm-3 9V6a3 3 0 0 1 6 0v4H9Z" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
