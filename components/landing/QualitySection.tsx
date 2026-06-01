import { getTranslations } from "next-intl/server";

type CardKey = "evaluation" | "materials" | "hygiene" | "preparation";

const CARDS: { key: CardKey; num: string }[] = [
    { key: "evaluation", num: "01" },
    { key: "materials", num: "02" },
    { key: "hygiene", num: "03" },
    { key: "preparation", num: "04" },
];

function CardIcon({ name }: { name: CardKey }) {
    const common = {
        width: 22,
        height: 22,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.4,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
    switch (name) {
        case "evaluation":
            return (
                <svg {...common}>
                    <path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6l-8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            );
        case "materials":
            return (
                <svg {...common}>
                    <path d="M12 3 14 9.5l6.5.5-5 4.5L17 21l-5-3-5 3 1.5-6.5-5-4.5L10 9.5 12 3Z" />
                </svg>
            );
        case "hygiene":
            return (
                <svg {...common}>
                    <path d="M12 3 13.5 8.5 19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
                    <path d="M19 17l.7 2.3 2.3.7-2.3.7L19 23l-.7-2.3-2.3-.7 2.3-.7L19 17Z" />
                </svg>
            );
        case "preparation":
            return (
                <svg {...common}>
                    <path d="M3 7.5 12 4l9 3.5v9L12 20l-9-3.5v-9Z" />
                    <path d="M3 7.5 12 11l9-3.5" />
                    <path d="M12 11v9" />
                </svg>
            );
    }
}

export default async function QualitySection() {
    const t = await getTranslations("home.quality");

    return (
        <section
            id="quality"
            aria-labelledby="quality-title"
            data-surface="dark"
            className="velvet-quality relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 py-24 sm:px-10 lg:px-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h2
                        id="quality-title"
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

                <ul className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {CARDS.map(({ key, num }) => (
                        <li
                            key={key}
                            className="group relative flex flex-col rounded-[20px] border border-velvet-800/60 bg-gradient-to-b from-velvet-900/30 to-velvet-950/60 p-6 transition-colors hover:border-gold/40"
                        >
                            <div className="flex items-start justify-between">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold">
                                    <CardIcon name={key} />
                                </span>
                                <span className="font-display text-3xl italic leading-none text-gold/70">
                                    {num}
                                </span>
                            </div>
                            <h3 className="mt-6 font-heading text-base font-semibold tracking-tight text-silk">
                                {t(`cards.${key}.title`)}
                            </h3>
                            <p className="mt-4 text-[0.82rem] leading-relaxed text-silk/65">
                                {t(`cards.${key}.body`)}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
