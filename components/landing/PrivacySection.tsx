import { getTranslations } from "next-intl/server";

type CardKey = "packaging" | "data" | "billing" | "control";

const CARDS: CardKey[] = ["packaging", "data", "billing", "control"];

function Icon({ name }: { name: CardKey }) {
    const common = {
        width: 26,
        height: 26,
        viewBox: "0 0 28 28",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.4,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
    switch (name) {
        case "packaging":
            return (
                <svg {...common}>
                    <path d="M4 8 14 4l10 4v12L14 24 4 20V8Z" />
                    <path d="M4 8l10 4 10-4" />
                    <path d="M14 12v12" />
                </svg>
            );
        case "data":
            return (
                <svg {...common}>
                    <path d="M14 3 5 6v8c0 4.5 3.5 8 9 10 5.5-2 9-5.5 9-10V6l-9-3Z" />
                    <path d="m10 14 3 3 5-5" />
                </svg>
            );
        case "billing":
            return (
                <svg {...common}>
                    <rect x="3.5" y="7" width="21" height="14" rx="2" />
                    <path d="M3.5 11h21" />
                    <path d="M8 17h4" />
                </svg>
            );
        case "control":
            return (
                <svg {...common}>
                    <circle cx="18" cy="14" r="4" />
                    <path d="M16 16l-9 9-3-1 1-3 9-9" />
                </svg>
            );
    }
}

export default async function PrivacySection() {
    const t = await getTranslations("home.privacy");

    return (
        <section
            id="privacy"
            aria-labelledby="privacy-title"
            data-surface="dark"
            className="velvet-privacy relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h2
                        id="privacy-title"
                        className="font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-silk"
                    >
                        {t("titleLine1")}{" "}
                        <span className="italic text-gold-light">
                            {t("titleEmphasis")}
                        </span>
                    </h2>
                    <p className="mt-8 text-sm leading-relaxed text-silk/70">
                        {t("description")}
                    </p>
                </div>

                <ul className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                    {CARDS.map((key) => (
                        <li
                            key={key}
                            className="rounded-[20px] border border-velvet-800/60 bg-gradient-to-b from-velvet-900/30 to-velvet-950/60 p-7 transition-colors hover:border-gold/40"
                        >
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                                <Icon name={key} />
                            </span>
                            <h3 className="mt-5 font-heading text-base font-semibold tracking-tight text-silk">
                                {t(`cards.${key}.title`)}
                            </h3>
                            <p className="mt-3 text-[0.82rem] leading-relaxed text-silk/65">
                                {t(`cards.${key}.body`)}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
