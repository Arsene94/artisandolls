import { getTranslations } from "next-intl/server";

type StepKey = "explore" | "choose" | "personalize" | "confirm" | "delivery";

const STEPS: StepKey[] = ["explore", "choose", "personalize", "confirm", "delivery"];

function StepIcon({ name }: { name: StepKey }) {
    const common = {
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.4,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
    switch (name) {
        case "explore":
            return (
                <svg {...common}>
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4 4" />
                </svg>
            );
        case "choose":
            return (
                <svg {...common}>
                    <path d="M12 21s-7-4.4-7-10.2A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 7 4.8C19 16.6 12 21 12 21Z" />
                </svg>
            );
        case "personalize":
            return (
                <svg {...common}>
                    <path d="M4 17 14 7l3 3L7 20H4v-3Z" />
                    <path d="M13 6.5 17.5 11" />
                </svg>
            );
        case "confirm":
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12 3 3 5-6" />
                </svg>
            );
        case "delivery":
            return (
                <svg {...common}>
                    <path d="M3 7.5 12 4l9 3.5v9L12 20l-9-3.5v-9Z" />
                    <path d="M3 7.5 12 11l9-3.5M12 11v9" />
                </svg>
            );
    }
}

export default async function HowItWorksSection() {
    const t = await getTranslations("home.howItWorks");

    return (
        <section
            id="how-it-works"
            aria-labelledby="how-title"
            data-surface="dark"
            className="velvet-how relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto w-full max-w-[1440px] px-4 py-24 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h2
                        id="how-title"
                        className="font-display text-[28px] leading-[1.35] tracking-tight text-silk lg:text-[clamp(2.25rem,4.5vw,4rem)] lg:leading-[1.05]"
                    >
                        {t("titleLine1")}{" "}
                        <span className="italic text-gold">
                            {t("titleEmphasis")}
                        </span>
                    </h2>
                    <p className="mt-8 text-[12px] leading-relaxed text-silk/70 lg:text-sm">
                        {t("description")}
                    </p>
                </div>

                <ol className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
                    {STEPS.map((key, idx) => (
                        <li
                            key={key}
                            className="relative flex flex-col items-center px-4 text-center"
                        >
                            <span className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] border border-gold bg-gradient-to-b from-[#2a0d12] to-[#1a0508] text-gold lg:rounded-[32px]">
                                <StepIcon name={key} />
                            </span>
                            <h3 className="mt-6 font-display text-[20px] font-light text-gold lg:text-[24px]">
                                {t(`steps.${key}.title`)}
                            </h3>
                            <p className="mt-3 max-w-[18ch] text-[12px] leading-relaxed text-ivory lg:text-sm">
                                {t(`steps.${key}.body`)}
                            </p>
                            {idx < STEPS.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-1/2 top-[4.5rem] h-[calc(100%-4.5rem)] w-px -translate-x-1/2 bg-gold/40 sm:hidden"
                                />
                            )}
                            {idx < STEPS.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-[calc(50%+2.5rem)] top-7 hidden h-px w-[calc(100%-5rem)] border-t border-solid border-gold lg:block"
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
