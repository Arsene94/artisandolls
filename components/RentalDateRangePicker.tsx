"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./RentalDateRangePicker.module.css";

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

export type RentalRangeValue = {
    startDate: string;
    endDate: string;
};

type RentalDateRangePickerProps = {
    onChange?: (value: RentalRangeValue) => void;
};

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
    if (!firstDate || !secondDate) {
        return false;
    }

    return firstDate.getTime() === secondDate.getTime();
}

function isBetween(date: Date, startDate: Date | null, endDate: Date | null) {
    if (!startDate || !endDate) {
        return false;
    }

    const currentTime = date.getTime();

    return currentTime > startDate.getTime() && currentTime < endDate.getTime();
}

function formatDisplayDate(date: Date) {
    return new Intl.DateTimeFormat("ro-RO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatHiddenDate(date: Date | null) {
    if (!date) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMonthTitle(date: Date) {
    return new Intl.DateTimeFormat("ro-RO", {
        month: "long",
        year: "numeric",
    }).format(date);
}

export default function RentalDateRangePicker({ onChange }: RentalDateRangePickerProps) {
    const pickerRef = useRef<HTMLDivElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const startDateValue = formatHiddenDate(startDate);
    const endDateValue = formatHiddenDate(endDate);

    const displayValue = useMemo(() => {
        if (startDate && endDate) {
            return `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`;
        }

        if (startDate) {
            return `${formatDisplayDate(startDate)} — alege sfârșit`;
        }

        return "";
    }, [startDate, endDate]);

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
            return new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
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
                    placeholder="Alege data început — data sfârșit"
                    className={styles.input}
                    onClick={() => setIsOpen(true)}
                    onFocus={() => setIsOpen(true)}
                    aria-label="Alege perioada de închiriere"
                />

                <button
                    type="button"
                    className={styles.calendarButton}
                    onClick={() => setIsOpen((current) => !current)}
                    aria-label="Deschide calendarul"
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
                <div className={styles.calendarPopover}>
                    <div className={styles.calendarHeader}>
                        <button type="button" onClick={goToPreviousMonth} aria-label="Luna anterioară">
                            ‹
                        </button>

                        <span>{formatMonthTitle(visibleMonth)}</span>

                        <button type="button" onClick={goToNextMonth} aria-label="Luna următoare">
                            ›
                        </button>
                    </div>

                    <div className={styles.weekDays}>
                        {WEEK_DAYS.map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>

                    <div className={styles.daysGrid}>
                        {calendarDays.map((date) => {
                            const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
                            const isStart = isSameDay(date, startDate);
                            const isEnd = isSameDay(date, endDate);
                            const isInRange = isBetween(date, startDate, endDate);

                            const className = [
                                styles.day,
                                isOutsideMonth ? styles.outsideMonth : "",
                                isStart ? styles.rangeStart : "",
                                isEnd ? styles.rangeEnd : "",
                                isInRange ? styles.inRange : "",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    className={className}
                                    onClick={() => handleDateSelect(date)}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.calendarHint}>
                        {startDate && !endDate
                            ? "Alege data de sfârșit."
                            : "Alege data de început, apoi data de sfârșit."}
                    </div>
                </div>
            )}
        </div>
    );
}
