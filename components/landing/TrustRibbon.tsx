import { getTranslations } from "next-intl/server";

type CardKey = "delivery" | "hygiene" | "privacy" | "materials";

const ORDER: CardKey[] = ["delivery", "hygiene", "privacy", "materials"];

function Icon({ name }: { name: CardKey }) {
    const common = {
        width: 36,
        height: 36,
        viewBox: "0 0 36 36",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.25,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    switch (name) {
        case "delivery":
        case "hygiene":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M18 4 L31 11 V25 L18 32 L5 25 V11 Z" />
                    <path d="M5 11 L18 18 L31 11" />
                    <path d="M18 18 V32" />
                </svg>
            );
        case "privacy":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M18 4 L29 9 V18 C29 25 24 30 18 32 C12 30 7 25 7 18 V9 Z" />
                    <path d="M13 18 L17 22 L24 14" />
                </svg>
            );
        case "materials":
            return (
                <svg {...common} aria-hidden="true">
                    <path d="M11 4 H25 L32 13 L18 32 L4 13 Z" />
                    <path d="M4 13 H32" />
                    <path d="M11 4 L18 13 L25 4" />
                    <path d="M11 4 L18 32 L25 4" />
                </svg>
            );
    }
}

export default async function TrustRibbon() {
    const t = await getTranslations("home.trust");

    return (
        <section
            aria-label={t("ariaLabel")}
            data-surface="dark"
            className="velvet-trust relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 lg:px-16">
                <ul className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-gold/20">
                    {ORDER.map((key) => (
                        <li
                            key={key}
                            className="flex flex-col items-center px-6 text-center"
                        >
                            <div className="text-gold">
                                <Icon name={key} />
                            </div>
                            <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-silk">
                                {t(`${key}.title`)}
                            </h3>
                            <p className="mt-3 max-w-[22ch] text-[0.78rem] leading-relaxed text-silk/65">
                                {t(`${key}.body`)}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
