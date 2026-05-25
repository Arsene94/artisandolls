import { getTranslations } from "next-intl/server";

function ThermalIcon() {
    return (
        <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
            <path d="M12 5v9.5" />
        </svg>
    );
}

function SilkIcon() {
    return (
        <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M3 7c4 3 6 3 9 0 3-3 5-3 9 0" />
            <path d="M3 12c4 3 6 3 9 0 3-3 5-3 9 0" />
            <path d="M3 17c4 3 6 3 9 0 3-3 5-3 9 0" />
        </svg>
    );
}

function SkeletonIcon() {
    return (
        <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <circle cx="12" cy="4.5" r="2" />
            <path d="M12 6.5V11" />
            <path d="M7 9.5h10" />
            <path d="M12 11v4" />
            <path d="M9 14.5l-2 6" />
            <path d="M15 14.5l2 6" />
            <circle cx="9" cy="9.5" r="0.75" fill="currentColor" />
            <circle cx="15" cy="9.5" r="0.75" fill="currentColor" />
            <circle cx="12" cy="15" r="0.75" fill="currentColor" />
        </svg>
    );
}

export default async function SensoryBenefits() {
    const t = await getTranslations("home.benefits");

    const benefits = [
        { icon: <ThermalIcon />, title: t("benefit1Title"), description: t("benefit1Description") },
        { icon: <SilkIcon />, title: t("benefit2Title"), description: t("benefit2Description") },
        { icon: <SkeletonIcon />, title: t("benefit3Title"), description: t("benefit3Description") },
    ];

    return (
        <section
            id="despre"
            aria-labelledby="benefits-title"
            className="surface-light py-24 bg-silk text-silk-800 relative"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
                    <span className="inline-block text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-velvet-700 bg-velvet-100 px-4 py-2 rounded-full">
                        {t("badge")}
                    </span>
                    <h2
                        id="benefits-title"
                        className="font-display italic font-medium text-velvet-900 text-3xl sm:text-4xl lg:text-5xl mt-5 mb-5 leading-[1.1]"
                    >
                        {t("title")}
                    </h2>
                    <p className="text-silk-800/85 text-base sm:text-lg leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {benefits.map((b) => (
                        <li
                            key={b.title}
                            className="group bg-white p-7 lg:p-8 rounded-2xl border border-silk-300 transition-all duration-300 motion-reduce:transition-none hover:border-velvet-300 hover:shadow-lg hover:-translate-y-1 motion-reduce:hover:translate-y-0"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-velvet-100 text-velvet-700 group-hover:bg-velvet-200 flex items-center justify-center mb-6 transition-colors motion-reduce:transition-none">
                                {b.icon}
                            </div>
                            <h3 className="font-heading text-xl font-semibold text-velvet-900 mb-3">
                                {b.title}
                            </h3>
                            <p className="text-silk-800/85 text-[0.92rem] leading-relaxed">
                                {b.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
