"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
};

function parseDateValue(value: string) {
    if (!value) return null;

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return normalizeDate(nextDate);
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeekMonday(date: Date) {
    const normalizedDate = normalizeDate(date);
    const day = normalizedDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    return addDays(normalizedDate, diff);
}

function isSameDay(firstDate: Date | null, secondDate: Date | null) {
    if (!firstDate || !secondDate) return false;

    return firstDate.getTime() === secondDate.getTime();
}

function isBetween(date: Date, startDate: Date | null, endDate: Date | null) {
    if (!startDate || !endDate) return false;

    const currentTime = date.getTime();

    return currentTime > startDate.getTime() && currentTime < endDate.getTime();
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

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
                                          }: RentalDateRangePickerProps) {
    const locale = useLocale();
    const t = useTranslations("datePicker");
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const weekDays = t.raw("weekDays") as string[];

    const initialStartDateValue = clampDateToToday(parseDateValue(initialStartDate));
    const initialEndDateValue = clampDateToToday(parseDateValue(initialEndDate));

    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() =>
        startOfMonth(initialStartDateValue ?? getToday())
    );
    const [startDate, setStartDate] = useState<Date | null>(initialStartDateValue);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDateValue);

    const startDateValue = formatHiddenDate(startDate);
    const endDateValue = formatHiddenDate(endDate);

    const displayValue = useMemo(() => {
        if (startDate && endDate) {
            return `${formatDisplayDate(startDate, locale)} - ${formatDisplayDate(endDate, locale)}`;
        }

        if (startDate) {
            return `${formatDisplayDate(startDate, locale)} - ${t("chooseEnd")}`;
        }

        return "";
    }, [endDate, locale, startDate, t]);

    const calendarDays = useMemo(() => {
        const firstCalendarDay = startOfWeekMonday(visibleMonth);

        return Array.from({ length: 42 }, (_, index) => addDays(firstCalendarDay, index));
    }, [visibleMonth]);

    useEffect(() => {
        onChange?.({
            startDate: startDateValue,
            endDate: endDateValue,
        });
    }, [startDateValue, endDateValue, onChange]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!pickerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleDateSelect(date: Date) {
        const selectedDate = normalizeDate(date);

        if (isBeforeToday(selectedDate)) {
            return;
        }

        if (!startDate || endDate) {
            setStartDate(selectedDate);
            setEndDate(null);
            return;
        }

        if (selectedDate < startDate) {
            setStartDate(selectedDate);
            setEndDate(null);
            return;
        }

        setEndDate(selectedDate);
        setIsOpen(false);
    }

    function goToPreviousMonth() {
        setVisibleMonth((currentMonth) => {
            const previousMonth = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
            );

            const todayMonth = startOfMonth(getToday());

            if (previousMonth.getTime() < todayMonth.getTime()) {
                return currentMonth;
            }

            return previousMonth;
        });
    }

    function goToNextMonth() {
        setVisibleMonth((currentMonth) => {
            return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        });
    }

    return (
        <div ref={pickerRef} className={styles.root}>
            <div className={styles.inputShell}>
                <input
                    type="text"
                    readOnly
                    value={displayValue}
                    placeholder={t("placeholder")}
                    className={`${styles.input} border border-velvet-800/80`}
                    onClick={() => setIsOpen(true)}
                    onFocus={() => setIsOpen(true)}
                    aria-label={t("ariaChoose")}
                />

                <button
                    type="button"
                    className={styles.calendarButton}
                    onClick={() => setIsOpen((current) => !current)}
                    aria-label={t("ariaOpen")}
                    aria-expanded={isOpen}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                </button>
            </div>

            <input type="hidden" name="rental_start_date" value={startDateValue} />
            <input type="hidden" name="rental_end_date" value={endDateValue} />

            {isOpen && (
                <div
                    className={`${styles.calendarPopover} ${
                        placement === "bottom" ? styles.calendarPopoverBottom : styles.calendarPopoverTop
                    }`}
                >
                    <div className={styles.calendarHeader}>
                        <button type="button" onClick={goToPreviousMonth} aria-label={t("previousMonth")}>
                            ‹
                        </button>

                        <span>{formatMonthTitle(visibleMonth, locale)}</span>

                        <button type="button" onClick={goToNextMonth} aria-label={t("nextMonth")}>
                            ›
                        </button>
                    </div>

                    <div className={styles.weekDays}>
                        {weekDays.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div className={styles.daysGrid}>
                        {calendarDays.map((date) => {
                            const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
                            const isStart = isSameDay(date, startDate);
                            const isEnd = isSameDay(date, endDate);
                            const isInRange = isBetween(date, startDate, endDate);
                            const isDisabled = isBeforeToday(date);

                            const className = [
                                styles.day,
                                isOutsideMonth ? styles.outsideMonth : "",
                                isStart ? styles.rangeStart : "",
                                isEnd ? styles.rangeEnd : "",
                                isInRange ? styles.inRange : "",
                                isDisabled ? styles.disabledDay : "",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    className={className}
                                    disabled={isDisabled}
                                    aria-disabled={isDisabled}
                                    onClick={() => handleDateSelect(date)}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.calendarHint}>
                        {startDate && !endDate
                            ? t("hintChooseEnd")
                            : t("hintChooseStart")}
                    </div>
                </div>
            )}
        </div>
    );
}
