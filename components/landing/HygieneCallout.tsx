import { getTranslations } from "next-intl/server";

type Step = {
    label: string;
    description: string;
    icon: React.ReactNode;
};

const STEP_ICONS: React.ReactNode[] = [
    // wash
    <svg key="wash" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
        <path d="M9 8V5a3 3 0 0 1 6 0v3" />
        <path d="M10 13v3M14 13v3" />
    </svg>,
    // disinfect (droplet shield)
    <svg key="disinfect" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />
        <path d="M9.5 13.5h5" />
    </svg>,
    // UV-C
    <svg key="uv" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </svg>,
    // drying (sun + arrow up)
    <svg key="dry" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M4 16c0-3.3 3-6 6.5-6 .9-2 3-3.5 5.5-3.5A5.5 5.5 0 0 1 21 12c0 .7-.1 1.4-.4 2" />
        <path d="M3 20h18" />
        <path d="m8 15 4-4 4 4" />
    </svg>,
    // sealed box
    <svg key="sealed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" />
        <path d="M4 7.5 12 11l8-3.5M12 11v9" />
    </svg>,
];

export default async function HygieneCallout() {
    const t = await getTranslations("home.hygiene");

    const steps: Step[] = STEP_ICONS.map((icon, idx) => ({
        icon,
        label: t(`step${idx + 1}Label`),
        description: t(`step${idx + 1}Description`),
    }));

    return (
        <section
            id="hygiene"
            aria-labelledby="hygiene-title"
            className="surface-light py-24 bg-pearl-50 text-silk-800 relative overflow-hidden"
        >
            <div
                aria-hidden="true"
                className="absolute -top-32 right-[8%] w-72 h-72 rounded-full bg-pearl-200/50 blur-3xl pointer-events-none"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-32 left-[5%] w-80 h-80 rounded-full bg-pearl-100/60 blur-3xl pointer-events-none"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-pearl-700 bg-white border border-pearl-200 px-4 py-2 rounded-full">
                        <span
                            aria-hidden="true"
                            className="w-1.5 h-1.5 rounded-full bg-pearl-500"
                        />
                        {t("badge")}
                    </span>
                    <h2
                        id="hygiene-title"
                        className="font-display italic font-medium text-velvet-900 text-3xl sm:text-4xl lg:text-5xl mt-5 leading-[1.1]"
                    >
                        {t("title")}
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-silk-800/85 leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                <ol className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {steps.map((step, idx) => (
                        <li
                            key={step.label}
                            className="relative bg-white border border-pearl-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow motion-reduce:transition-none"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    aria-hidden="true"
                                    className="w-10 h-10 rounded-full bg-pearl-100 text-pearl-700 flex items-center justify-center shrink-0"
                                >
                                    <span className="block w-5 h-5">
                                        {step.icon}
                                    </span>
                                </span>
                                <span className="font-mono text-[0.72rem] tracking-[0.18em] text-pearl-700">
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <p className="font-heading font-semibold text-velvet-900 text-sm sm:text-base mb-1">
                                {step.label}
                            </p>
                            <p className="text-[0.85rem] leading-snug text-silk-800/75">
                                {step.description}
                            </p>
                        </li>
                    ))}
                </ol>

                <div className="mt-10 text-center">
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-pearl-700 hover:text-velvet-900 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pearl-500 rounded-md px-2 py-1"
                    >
                        {t("methodologyLink")}
                        <svg
                            aria-hidden="true"
                            focusable="false"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
