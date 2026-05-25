"use client";

import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { RomanianLocalityGroup } from "@/lib/locations/romania";

type LocalityComboboxProps = {
    name: string;
    value: string;
    onChange: (value: string) => void;
    groups: RomanianLocalityGroup[];
    placeholder: string;
    emptyPlaceholder: string;
    searchPlaceholder: string;
    noResultsLabel: string;
    disabled?: boolean;
    required?: boolean;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
};

function normalize(value: string) {
    return value
        .toLocaleLowerCase("ro-RO")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function useDebouncedValue<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export default function LocalityCombobox({
    name,
    value,
    onChange,
    groups,
    placeholder,
    emptyPlaceholder,
    searchPlaceholder,
    noResultsLabel,
    disabled = false,
    required = false,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
}: LocalityComboboxProps) {
    const reactId = useId();
    const listboxId = `${reactId}-listbox`;
    const triggerId = `${reactId}-trigger`;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const listboxRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
    const [activeIndex, setActiveIndex] = useState(0);

    const effectiveOpen = isOpen && !disabled;
    const debouncedQuery = useDebouncedValue(query, 150);

    const filteredGroups = useMemo(() => {
        const term = normalize(debouncedQuery.trim());
        if (!term) return groups;
        return groups
            .map((group) => ({
                label: group.label,
                localities: group.localities.filter((locality) =>
                    normalize(locality).includes(term),
                ),
            }))
            .filter((group) => group.localities.length > 0);
    }, [groups, debouncedQuery]);

    const flatOptions = useMemo(() => {
        const flat: { locality: string; group: string }[] = [];
        for (const group of filteredGroups) {
            for (const locality of group.localities) {
                flat.push({ locality, group: group.label });
            }
        }
        return flat;
    }, [filteredGroups]);

    useEffect(() => {
        if (activeIndex >= flatOptions.length) {
            setActiveIndex(Math.max(0, flatOptions.length - 1));
        }
    }, [flatOptions.length, activeIndex]);

    useEffect(() => {
        if (!effectiveOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [effectiveOpen]);

    useEffect(() => {
        if (!effectiveOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [effectiveOpen]);

    useEffect(() => {
        if (effectiveOpen) {
            const handle = window.requestAnimationFrame(() => searchRef.current?.focus());
            return () => window.cancelAnimationFrame(handle);
        }
    }, [effectiveOpen]);

    useLayoutEffect(() => {
        if (!effectiveOpen) return;
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const spaceBelow = viewportH - rect.bottom;
        const desired = 360;
        setPlacement(spaceBelow < desired && rect.top > desired ? "top" : "bottom");
    }, [effectiveOpen]);

    useEffect(() => {
        if (!effectiveOpen) return;
        const id = window.requestAnimationFrame(() => {
            if (!value) return;
            const idx = flatOptions.findIndex((o) => o.locality === value);
            if (idx >= 0) {
                setActiveIndex(idx);
                const buttons = listboxRef.current?.querySelectorAll<HTMLButtonElement>(
                    "[data-option-index]",
                );
                buttons?.[idx]?.scrollIntoView({ block: "nearest" });
            }
        });
        return () => window.cancelAnimationFrame(id);
    }, [effectiveOpen, value, flatOptions]);

    const select = useCallback(
        (locality: string) => {
            onChange(locality);
            setIsOpen(false);
            triggerRef.current?.focus();
        },
        [onChange],
    );

    const handleSearchKeyDown = useCallback(
        (e: ReactKeyboardEvent<HTMLInputElement>) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((idx) => Math.min(flatOptions.length - 1, idx + 1));
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((idx) => Math.max(0, idx - 1));
                return;
            }
            if (e.key === "Home") {
                e.preventDefault();
                setActiveIndex(0);
                return;
            }
            if (e.key === "End") {
                e.preventDefault();
                setActiveIndex(Math.max(0, flatOptions.length - 1));
                return;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                const option = flatOptions[activeIndex];
                if (option) select(option.locality);
            }
        },
        [activeIndex, flatOptions, select],
    );

    useEffect(() => {
        if (!effectiveOpen) return;
        const buttons = listboxRef.current?.querySelectorAll<HTMLButtonElement>(
            "[data-option-index]",
        );
        buttons?.[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [activeIndex, effectiveOpen]);

    const displayValue = value || (disabled ? emptyPlaceholder : placeholder);
    let runningIndex = -1;
    const placementClass = placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2";

    return (
        <div ref={rootRef} className="relative">
            <input type="hidden" name={name} value={value} required={required} />

            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((current) => !current)}
                className={`w-full min-h-12 bg-velvet-950 border border-velvet-700 rounded-xl px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3 ${
                    value ? "text-white" : "text-silk/70"
                }`}
                aria-haspopup="listbox"
                aria-expanded={effectiveOpen}
                aria-controls={listboxId}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                aria-disabled={disabled}
            >
                <span className="truncate">{displayValue}</span>
                <svg
                    className={`w-4 h-4 text-silk/70 transition-transform motion-reduce:transition-none ${
                        effectiveOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {effectiveOpen && (
                <div
                    className={`absolute z-50 left-0 right-0 ${placementClass} rounded-xl border border-gold/40 bg-velvet-950 shadow-2xl overflow-hidden`}
                >
                    <div className="p-2 border-b border-velvet-800">
                        <div className="relative">
                            <span
                                aria-hidden="true"
                                className="absolute inset-y-0 left-0 pl-3 flex items-center text-silk/70 pointer-events-none"
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    focusable="false"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.3-4.3" />
                                </svg>
                            </span>
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full bg-velvet-900 border border-velvet-700 rounded-lg pl-9 pr-9 py-2 text-sm text-silk placeholder-silk/60 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold"
                                aria-autocomplete="list"
                                aria-controls={listboxId}
                                aria-activedescendant={
                                    flatOptions[activeIndex]
                                        ? `${listboxId}-opt-${activeIndex}`
                                        : undefined
                                }
                                autoComplete="off"
                            />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        searchRef.current?.focus();
                                    }}
                                    aria-label={searchPlaceholder}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-silk/65 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                        <circle cx="12" cy="12" r="9" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                    </svg>
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div
                        ref={listboxRef}
                        id={listboxId}
                        className="max-h-72 overflow-y-auto py-1"
                        role="listbox"
                        aria-label={placeholder}
                    >
                        {filteredGroups.length === 0 ? (
                            <div className="px-4 py-6 text-center text-silk/80 text-sm">
                                {noResultsLabel}
                            </div>
                        ) : (
                            filteredGroups.map((group, gIdx) => {
                                const groupLabelId = `${listboxId}-group-${gIdx}`;
                                return (
                                    <div
                                        key={group.label}
                                        role="group"
                                        aria-labelledby={groupLabelId}
                                    >
                                        <div
                                            id={groupLabelId}
                                            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold bg-velvet-900/70"
                                        >
                                            {group.label}
                                        </div>
                                        {group.localities.map((locality) => {
                                            runningIndex += 1;
                                            const optionIndex = runningIndex;
                                            const isSelected = locality === value;
                                            const isActive = optionIndex === activeIndex;
                                            return (
                                                <button
                                                    key={`${group.label}-${locality}`}
                                                    id={`${listboxId}-opt-${optionIndex}`}
                                                    data-option-index={optionIndex}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    onMouseEnter={() => setActiveIndex(optionIndex)}
                                                    onClick={() => select(locality)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition motion-reduce:transition-none focus-visible:outline-none ${
                                                        isSelected
                                                            ? "bg-gold/15 text-gold"
                                                            : isActive
                                                              ? "bg-velvet-800 text-white"
                                                              : "text-silk/90 hover:bg-velvet-900 hover:text-white"
                                                    }`}
                                                >
                                                    {locality}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
