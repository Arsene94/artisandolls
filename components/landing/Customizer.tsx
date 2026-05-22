"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type OptionKey<T extends string> = {
    key: T;
    label: string;
};

export default function Customizer() {
    const t = useTranslations("home.customizer");

    const hairOptions: OptionKey<"blonde" | "brunette" | "redhead">[] = [
        { key: "blonde", label: t("hairBlonde") },
        { key: "brunette", label: t("hairBrunette") },
        { key: "redhead", label: t("hairRedhead") },
    ];
    const eyeOptions: OptionKey<"blue" | "green" | "brown">[] = [
        { key: "blue", label: t("eyesBlue") },
        { key: "green", label: t("eyesGreen") },
        { key: "brown", label: t("eyesBrown") },
    ];
    const heightOptions: OptionKey<"petite" | "athletic" | "statuesque">[] = [
        { key: "petite", label: t("heightPetite") },
        { key: "athletic", label: t("heightAthletic") },
        { key: "statuesque", label: t("heightStatuesque") },
    ];

    const [hair, setHair] = useState(hairOptions[0]);
    const [eyes, setEyes] = useState(eyeOptions[0]);
    const [height, setHeight] = useState(heightOptions[0]);
    const [heatOn, setHeatOn] = useState(true);
    const [voiceOn, setVoiceOn] = useState(false);

    const heatId = useId();
    const voiceId = useId();

    const handleQuote = () => {
        const lines = [
            `${t("messagePrefix")}:`,
            `• ${t("messageHair")}: ${hair.label}`,
            `• ${t("messageEyes")}: ${eyes.label}`,
            `• ${t("messageHeight")}: ${height.label}`,
            `• ${t("messageUpgrades")}: ${heatOn ? t("messageHeatOn") : t("messageHeatOff")}, ${voiceOn ? t("messageVoiceOn") : t("messageVoiceOff")}`,
        ];
        const messageEl = document.getElementById("contact-message");
        const interestEl = document.getElementById("contact-interest");
        if (interestEl instanceof HTMLSelectElement) {
            interestEl.value = "custom";
        }
        if (messageEl instanceof HTMLTextAreaElement) {
            messageEl.value = lines.join("\n");
        }
        document
            .getElementById("contact")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section id="customizer" className="py-24 bg-velvet-900 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-velvet-900 via-velvet-950 to-velvet-900 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold uppercase tracking-widest text-gold bg-velvet-800 px-4 py-2 rounded-full border border-gold/20">
                        {t("badge")}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4 font-serif">
                        {t("title")}
                    </h2>
                    <p className="text-silk/70 font-light text-sm sm:text-base">
                        {t("description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-velvet-900/50 p-6 sm:p-10 rounded-3xl border border-gold/10 backdrop-blur-sm">
                    <div className="lg:col-span-7 space-y-8">
                        <OptionGroup
                            iconPath="M9.64 7.64a3.5 3.5 0 11-4.95 4.95L2.05 14.94 3.46 16.35l2.65-2.65a3.5 3.5 0 11-4.95-4.95L3.99 6.06l1.41-1.41 2.65 2.65a3.5 3.5 0 011.59.34zm5.07 4.69l8.49-8.49-2.83-2.82-5.66 5.66 2.83 2.83-1.41 1.41-2.83-2.83-5.66 5.66 2.83 2.83-1.41 1.41-2.83-2.83-2.83 2.83 4.24 4.24L21.7 8.71l-2.83-2.83-2.83 2.83 2.83 2.83-1.41 1.41-2.83-2.83z"
                            title={t("hairTitle")}
                            options={hairOptions}
                            selected={hair.key}
                            onChange={(k) => setHair(hairOptions.find((o) => o.key === k)!)}
                        />
                        <OptionGroup
                            iconPath="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"
                            title={t("eyesTitle")}
                            options={eyeOptions}
                            selected={eyes.key}
                            onChange={(k) => setEyes(eyeOptions.find((o) => o.key === k)!)}
                        />
                        <OptionGroup
                            iconPath="M16 17l-4 4-4-4h3V7H8l4-4 4 4h-3v10h3z"
                            title={t("heightTitle")}
                            options={heightOptions}
                            selected={height.key}
                            onChange={(k) => setHeight(heightOptions.find((o) => o.key === k)!)}
                        />

                        <div>
                            <h4 className="text-sm font-semibold tracking-wider uppercase text-gold mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {t("modulesTitle")}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label
                                    htmlFor={heatId}
                                    className="flex items-center gap-3 p-4 bg-velvet-800/50 rounded-xl border border-silk/10 cursor-pointer hover:border-gold transition"
                                >
                                    <input
                                        id={heatId}
                                        type="checkbox"
                                        checked={heatOn}
                                        onChange={(e) => setHeatOn(e.target.checked)}
                                        className="w-5 h-5 accent-gold"
                                    />
                                    <div>
                                        <p className="text-sm font-bold">{t("module1Title")}</p>
                                        <p className="text-xs text-silk/60">{t("module1Description")}</p>
                                    </div>
                                </label>
                                <label
                                    htmlFor={voiceId}
                                    className="flex items-center gap-3 p-4 bg-velvet-800/50 rounded-xl border border-silk/10 cursor-pointer hover:border-gold transition"
                                >
                                    <input
                                        id={voiceId}
                                        type="checkbox"
                                        checked={voiceOn}
                                        onChange={(e) => setVoiceOn(e.target.checked)}
                                        className="w-5 h-5 accent-gold"
                                    />
                                    <div>
                                        <p className="text-sm font-bold">{t("module2Title")}</p>
                                        <p className="text-xs text-silk/60">{t("module2Description")}</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-gradient-to-br from-velvet-950 to-velvet-900 border border-gold/20 p-6 rounded-2xl flex flex-col justify-between h-full shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/10 rounded-full blur-xl pointer-events-none" />
                        <div>
                            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-2">
                                {t("specsBadge")}
                            </span>
                            <h3 className="text-2xl font-bold font-serif mb-6 border-b border-velvet-800 pb-3">
                                {t("specsTitle")}
                            </h3>

                            <ul className="space-y-4 text-sm">
                                <SpecRow label={t("specHair")} value={hair.label} />
                                <SpecRow label={t("specEyes")} value={eyes.label} />
                                <SpecRow label={t("specHeight")} value={height.label} />
                                <SpecRow label={t("specStructure")} value={t("specStructureValue")} />
                            </ul>
                        </div>

                        <div className="mt-8 pt-6 border-t border-velvet-800">
                            <p className="text-xs text-silk/60 text-center mb-4 italic">
                                {t("disclaimer")}
                            </p>
                            <button
                                type="button"
                                onClick={handleQuote}
                                className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-white hover:to-silk text-velvet-900 font-bold py-3.5 rounded-xl shadow-lg transition duration-200 uppercase tracking-wider text-xs cursor-pointer"
                            >
                                {t("ctaButton")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SpecRow({ label, value }: { label: string; value: string }) {
    return (
        <li className="flex justify-between items-center bg-velvet-800/30 p-2.5 rounded-lg">
            <span className="text-silk/60">{label}</span>
            <span className="font-bold text-white text-right">{value}</span>
        </li>
    );
}

function OptionGroup<T extends string>({
    iconPath,
    title,
    options,
    selected,
    onChange,
}: {
    iconPath: string;
    title: string;
    options: OptionKey<T>[];
    selected: T;
    onChange: (key: T) => void;
}) {
    return (
        <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-gold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={iconPath} />
                </svg>
                {title}
            </h4>
            <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => {
                    const isActive = opt.key === selected;
                    return (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => onChange(opt.key)}
                            className={
                                isActive
                                    ? "bg-gradient-to-r from-velvet-500 to-velvet-600 border-2 border-gold text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition duration-200 shadow-md shadow-velvet-500/10 cursor-pointer"
                                    : "bg-velvet-800/80 border border-silk/10 hover:border-gold text-white px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition duration-200 cursor-pointer"
                            }
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
