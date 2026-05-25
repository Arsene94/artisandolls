"use client";

import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { getIntlLocale } from "@/i18n/format";
import styles from "./RentalDateRangePicker.module.css";

export type RentalRangeValue = {
    startDate: string;
    endDate: string;
};

type DatePickerPlacement = "top" | "bottom";

type RentalDateRangePickerProps = {
    onChange?: (value: RentalRangeValue) => void;
    initialStartDate?: string;
    initialEndDate?: string;
    placement?: DatePickerPlacement;
    name?: { start: string; end: string };
    /** Dates marked as unavailable (already rented, blackout). ISO yyyy-mm-dd. */
    unavailableDates?: readonly string[];
    /** Minimum rental length in days (inclusive). Default 1. */
    minDays?: number;
    /** Maximum rental length in days (inclusive). */
    maxDays?: number;
};

function parseDateValue(value: string): Date | null {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return normalizeDate(next);
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeekMonday(date: Date) {
    const normalized = normalizeDate(date);
    const day = normalized.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return addDays(normalized, diff);
}

function isSameDay(a: Date | null, b: Date | null) {
    if (!a || !b) return false;
    return a.getTime() === b.getTime();
}

function isBetween(date: Date, start: Date | null, end: Date | null) {
    if (!start || !end) return false;
    const t = date.getTime();
    return t > start.getTime() && t < end.getTime();
}

function formatDisplayDate(date: Date, locale: string) {
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatHiddenDate(date: Date | null) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatMonthTitle(date: Date, locale: string) {
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        month: "long",
        year: "numeric",
    }).format(date);
}

function getToday() {
    return normalizeDate(new Date());
}

function isBeforeToday(date: Date) {
    return normalizeDate(date).getTime() < getToday().getTime();
}

function clampDateToToday(date: Date | null) {
    if (!date) return null;
    return isBeforeToday(date) ? getToday() : date;
}

export default function RentalDateRangePicker({
    onChange,
    initialStartDate = "",
    initialEndDate = "",
    placement = "top",
    name,
    unavailableDates,
    minDays = 1,
    maxDays,
}: RentalDateRangePickerProps) {
    const unavailableSet = useMemo(
        () => new Set(unavailableDates ?? []),
        [unavailableDates],
    );

    const isUnavailable = useCallback(
        (date: Date) => unavailableSet.has(formatHiddenDate(date)),
        [unavailableSet],
    );

    const hasUnavailableBetween = useCallback(
        (a: Date, b: Date) => {
            if (unavailableSet.size === 0) return false;
            const start = a.getTime() < b.getTime() ? a : b;
            const end = a.getTime() < b.getTime() ? b : a;
            for (let d = addDays(start, 0); d.getTime() <= end.getTime(); d = addDays(d, 1)) {
                if (isUnavailable(d)) return true;
            }
            return false;
        },
        [isUnavailable, unavailableSet.size],
    );
    const locale = useLocale();
    const t = useTranslations("datePicker");
    const reactId = useId();
    const calendarId = `${reactId}-calendar`;
    const inputId = `${reactId}-input`;
    const hintId = `${reactId}-hint`;

    const pickerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const focusedDayRef = useRef<Date | null>(null);
    const lastEmittedRef = useRef<RentalRangeValue>({ startDate: "", endDate: "" });

    const initialStart = clampDateToToday(parseDateValue(initialStartDate));
    const initialEnd = clampDateToToday(parseDateValue(initialEndDate));

    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() =>
        startOfMonth(initialStart ?? getToday()),
    );
    const [startDate, setStartDate] = useState<Date | null>(initialStart);
    const [endDate, setEndDate] = useState<Date | null>(initialEnd);
    const [focusDate, setFocusDate] = useState<Date>(initialStart ?? getToday());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const startDateValue = formatHiddenDate(startDate);
    const endDateValue = formatHiddenDate(endDate);

    const weekDays = useMemo(() => t.raw("weekDays") as string[], [t]);

    const displayValue = useMemo(() => {
        if (startDate && endDate) {
            return `${formatDisplayDate(startDate, locale)} – ${formatDisplayDate(endDate, locale)}`;
        }
        if (startDate) {
            return t("startSelected", { start: formatDisplayDate(startDate, locale) });
        }
        return "";
    }, [endDate, locale, startDate, t]);

    const calendarDays = useMemo(() => {
        const firstCalendarDay = startOfWeekMonday(visibleMonth);
        return Array.from({ length: 42 }, (_, i) => addDays(firstCalendarDay, i));
    }, [visibleMonth]);

    const hintText = useMemo(() => {
        if (startDate && !endDate) return t("hintChooseEnd");
        return t("hintChooseStart");
    }, [endDate, startDate, t]);

    useEffect(() => {
        const next = { startDate: startDateValue, endDate: endDateValue };
        const previous = lastEmittedRef.current;
        if (previous.startDate === next.startDate && previous.endDate === next.endDate) return;
        lastEmittedRef.current = next;
        onChange?.(next);
    }, [startDateValue, endDateValue, onChange]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (!pickerRef.current?.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const dayBtn = focusedDayRef.current
            ? calendarRef.current?.querySelector<HTMLButtonElement>(
                  `[data-day="${focusedDayRef.current.toISOString().slice(0, 10)}"]`,
              )
            : null;
        const target =
            dayBtn ??
            calendarRef.current?.querySelector<HTMLButtonElement>("[data-day]:not([disabled])");
        target?.focus();
    }, [isOpen, focusDate]);

    const handleDateSelect = useCallback(
        (date: Date) => {
            const selected = normalizeDate(date);
            if (isBeforeToday(selected)) return;
            if (isUnavailable(selected)) return;

            if (!startDate || (startDate && endDate)) {
                setStartDate(selected);
                setEndDate(null);
                setFocusDate(selected);
                focusedDayRef.current = selected;
                return;
            }

            if (selected.getTime() < startDate.getTime()) {
                setStartDate(selected);
                setEndDate(null);
                setFocusDate(selected);
                focusedDayRef.current = selected;
                return;
            }

            const dayDiff =
                Math.round(
                    (selected.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
                ) + 1;
            if (dayDiff < minDays) return;
            if (maxDays && dayDiff > maxDays) return;
            if (hasUnavailableBetween(startDate, selected)) return;

            setEndDate(selected);
            setFocusDate(selected);
            focusedDayRef.current = selected;
            setIsOpen(false);
            setHoverDate(null);
            inputRef.current?.focus();
        },
        [endDate, hasUnavailableBetween, isUnavailable, maxDays, minDays, startDate],
    );

    const goToPreviousMonth = useCallback(() => {
        setVisibleMonth((current) => {
            const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
            const todayMonth = startOfMonth(getToday());
            if (previous.getTime() < todayMonth.getTime()) return current;
            return previous;
        });
    }, []);

    const goToNextMonth = useCallback(() => {
        setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }, []);

    const handleDayKeyDown = useCallback(
        (e: ReactKeyboardEvent<HTMLButtonElement>, date: Date) => {
            const moves: Record<string, number> = {
                ArrowLeft: -1,
                ArrowRight: 1,
                ArrowUp: -7,
                ArrowDown: 7,
                PageUp: -30,
                PageDown: 30,
            };
            if (e.key === "Home") {
                e.preventDefault();
                setFocusDate(startOfWeekMonday(date));
                return;
            }
            if (e.key === "End") {
                e.preventDefault();
                setFocusDate(addDays(startOfWeekMonday(date), 6));
                return;
            }
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isBeforeToday(date)) handleDateSelect(date);
                return;
            }
            if (moves[e.key] !== undefined) {
                e.preventDefault();
                const target = addDays(date, moves[e.key]);
                const safe = isBeforeToday(target) ? getToday() : target;
                setFocusDate(safe);
                if (safe.getMonth() !== visibleMonth.getMonth()) {
                    setVisibleMonth(startOfMonth(safe));
                }
            }
        },
        [handleDateSelect, visibleMonth],
    );

    const clearSelection = useCallback(() => {
        setStartDate(null);
        setEndDate(null);
        const today = getToday();
        setFocusDate(today);
        focusedDayRef.current = today;
    }, []);

    const jumpToToday = useCallback(() => {
        const today = getToday();
        setVisibleMonth(startOfMonth(today));
        setFocusDate(today);
        focusedDayRef.current = today;
    }, []);

    const startInputName = name?.start ?? "rental_start_date";
    const endInputName = name?.end ?? "rental_end_date";

    const isPrevMonthDisabled = useMemo(() => {
        const previous = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
        return previous.getTime() < startOfMonth(getToday()).getTime();
    }, [visibleMonth]);

    return (
        <div ref={pickerRef} className={styles.root}>
            <div className={styles.inputShell}>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    readOnly
                    value={displayValue}
                    placeholder={t("placeholder")}
                    className={styles.input}
                    onClick={() => setIsOpen(true)}
                    onFocus={() => setIsOpen(true)}
                    aria-label={t("ariaChoose")}
                    aria-describedby={hintId}
                    aria-controls={calendarId}
                    aria-expanded={isOpen}
                    role="combobox"
                    aria-haspopup="dialog"
                />

                <button
                    type="button"
                    className={styles.calendarButton}
                    onClick={() => setIsOpen((c) => !c)}
                    aria-label={t("ariaOpen")}
                    aria-expanded={isOpen}
                    aria-controls={calendarId}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                </button>
            </div>

            <input type="hidden" name={startInputName} value={startDateValue} />
            <input type="hidden" name={endInputName} value={endDateValue} />

            <span id={hintId} className="sr-only">
                {hintText}
            </span>

            {isOpen && (
                <div
                    ref={calendarRef}
                    id={calendarId}
                    role="dialog"
                    aria-modal="false"
                    aria-label={t("ariaChoose")}
                    className={`${styles.calendarPopover} ${
                        placement === "bottom"
                            ? styles.calendarPopoverBottom
                            : styles.calendarPopoverTop
                    }`}
                >
                    <div className={styles.calendarHeader}>
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            aria-label={t("previousMonth")}
                            aria-disabled={isPrevMonthDisabled}
                            disabled={isPrevMonthDisabled}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <span aria-live="polite">{formatMonthTitle(visibleMonth, locale)}</span>
                        <button type="button" onClick={goToNextMonth} aria-label={t("nextMonth")}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.weekDays} aria-hidden="true">
                        {weekDays.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div
                        className={styles.daysGrid}
                        role="grid"
                        onMouseLeave={() => setHoverDate(null)}
                    >
                        {calendarDays.map((date) => {
                            const isoKey = date.toISOString().slice(0, 10);
                            const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
                            const isStart = isSameDay(date, startDate);
                            const isEnd = isSameDay(date, endDate);
                            const isInRange = isBetween(date, startDate, endDate);
                            const isUnav = isUnavailable(date);
                            const isDisabled = isBeforeToday(date) || isUnav;
                            const isToday = isSameDay(date, getToday());
                            const shouldTab = isSameDay(date, focusDate) && !isDisabled;
                            const isHoverPreview =
                                !endDate &&
                                startDate !== null &&
                                hoverDate !== null &&
                                date.getTime() > startDate.getTime() &&
                                date.getTime() <= hoverDate.getTime() &&
                                !hasUnavailableBetween(startDate, date);

                            const className = [
                                styles.day,
                                isOutsideMonth ? styles.outsideMonth : "",
                                isStart ? styles.rangeStart : "",
                                isEnd ? styles.rangeEnd : "",
                                isInRange ? styles.inRange : "",
                                isHoverPreview ? styles.inRange : "",
                                isToday ? styles.today : "",
                                isUnav ? styles.unavailableDay : "",
                                isBeforeToday(date) ? styles.disabledDay : "",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            const label = new Intl.DateTimeFormat(getIntlLocale(locale), {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            }).format(date);

                            return (
                                <button
                                    key={isoKey}
                                    type="button"
                                    className={className}
                                    disabled={isDisabled}
                                    aria-disabled={isDisabled}
                                    aria-label={label}
                                    aria-selected={isStart || isEnd}
                                    aria-current={isToday ? "date" : undefined}
                                    data-day={isoKey}
                                    tabIndex={shouldTab ? 0 : -1}
                                    onClick={() => handleDateSelect(date)}
                                    onMouseEnter={() => {
                                        if (!isDisabled) setHoverDate(date);
                                    }}
                                    onKeyDown={(e) => handleDayKeyDown(e, date)}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <p className={styles.calendarHint} aria-live="polite">
                        {hintText}
                    </p>

                    <div className={styles.calendarActions}>
                        <button type="button" onClick={jumpToToday}>
                            {t("today")}
                        </button>
                        <button type="button" onClick={clearSelection} disabled={!startDate}>
                            {t("clear")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
