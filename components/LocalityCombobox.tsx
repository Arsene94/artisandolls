"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
};

function normalize(value: string) {
    return value
        .toLocaleLowerCase("ro-RO")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
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
}: LocalityComboboxProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");

    const effectiveOpen = isOpen && !disabled;

    useEffect(() => {
        if (!effectiveOpen) return;

        function handleOutsideClick(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [effectiveOpen]);

    useEffect(() => {
        if (effectiveOpen) {
            const handle = requestAnimationFrame(() => searchRef.current?.focus());
            return () => cancelAnimationFrame(handle);
        }
    }, [effectiveOpen]);

    const filteredGroups = useMemo(() => {
        const term = normalize(query.trim());

        if (!term) return groups;

        return groups
            .map((group) => ({
                label: group.label,
                localities: group.localities.filter((locality) =>
                    normalize(locality).includes(term),
                ),
            }))
            .filter((group) => group.localities.length > 0);
    }, [groups, query]);

    const displayValue = value || (disabled ? emptyPlaceholder : placeholder);

    return (
        <div ref={rootRef} className="relative">
            <input type="hidden" name={name} value={value} required={required} />

            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((current) => !current)}
                className={`w-full bg-velvet-950 border border-velvet-800 rounded-xl px-4 py-3.5 text-left text-sm transition focus:outline-none focus:border-gold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between gap-3 ${
                    value ? "text-white" : "text-silk/40"
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate">{displayValue}</span>
                <svg
                    className={`w-4 h-4 text-silk/40 transition-transform ${effectiveOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {effectiveOpen && (
                <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl border border-gold/30 bg-velvet-950 shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-velvet-800">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-silk/40 pointer-events-none">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M21 21l-4.3-4.3" />
                                </svg>
                            </span>
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full bg-velvet-900 border border-velvet-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-silk/40 focus:outline-none focus:border-gold"
                            />
                        </div>
                    </div>

                    <div
                        className="max-h-72 overflow-y-auto py-1"
                        role="listbox"
                    >
                        {filteredGroups.length === 0 ? (
                            <div className="px-4 py-6 text-center text-silk/40 text-sm">
                                {noResultsLabel}
                            </div>
                        ) : (
                            filteredGroups.map((group) => (
                                <div key={group.label}>
                                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold/70 bg-velvet-900/60">
                                        {group.label}
                                    </div>
                                    {group.localities.map((locality) => {
                                        const isSelected = locality === value;
                                        return (
                                            <button
                                                key={`${group.label}-${locality}`}
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected}
                                                onClick={() => {
                                                    onChange(locality);
                                                    setQuery("");
                                                    setIsOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition ${
                                                    isSelected
                                                        ? "bg-gold/15 text-gold"
                                                        : "text-silk/90 hover:bg-velvet-900 hover:text-white"
                                                }`}
                                            >
                                                {locality}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
