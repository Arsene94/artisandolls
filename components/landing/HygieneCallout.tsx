import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const BULLET_KEYS = [
    "cleaning",
    "disinfection",
    "sterilization",
    "inspection",
    "sealed",
] as const;

function Check() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-gold"
        >
            <path
                d="M3 8.5 L6.5 12 L13 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default async function HygieneCallout() {
    const t = await getTranslations("home.hygiene");

    return (
        <section
            id="hygiene"
            aria-labelledby="hygiene-title"
            data-surface="dark"
            className="velvet-hygiene relative overflow-hidden bg-velvet-950 text-silk"
        >
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-16">
                <div className="flex flex-col justify-center">
                    <p className="font-heading text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h2
                        id="hygiene-title"
                        className="mt-5 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-silk"
                    >
                        {t("titleLine1")}{" "}
                        <span className="italic text-gold-light">
                            {t("titleEmphasis")}
                        </span>
                    </h2>
                    <span
                        aria-hidden="true"
                        className="mt-6 block h-px w-[60px] bg-gold/60"
                    />
                    <p className="mt-7 max-w-[36rem] text-sm leading-relaxed text-silk/70">
                        {t("description")}
                    </p>

                    <ul className="mt-10 space-y-3.5">
                        {BULLET_KEYS.map((k) => (
                            <li
                                key={k}
                                className="flex items-center gap-3 text-sm text-silk/85"
                            >
                                <Check />
                                <span>{t(`bullets.${k}`)}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-10">
                        <Link
                            href="/about#hygiene"
                            className="group inline-flex items-center gap-3 rounded-full border border-gold/60 bg-gradient-to-r from-gold-light/15 to-gold/10 px-6 py-3 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-gold-light transition-all duration-300 hover:border-gold hover:from-gold hover:to-gold-dark hover:text-velvet-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                        >
                            {t("cta")}
                            <span
                                aria-hidden="true"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gold/40 transition-transform duration-300 group-hover:translate-x-0.5"
                            >
                                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="relative lg:-mr-16 lg:mr-[calc((100vw-1440px)/-2)] xl:mr-[calc((100vw-1440px)/-2)]">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[24px] border border-velvet-800/60 shadow-2xl shadow-velvet-950/60 lg:aspect-auto lg:h-full lg:min-h-[640px] lg:rounded-l-[24px] lg:rounded-r-none lg:border-r-0">
                        <Image
                            src="/images/landing/hygiene.jpg"
                            alt={t("imageAlt")}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover object-center"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-velvet-950/40 to-transparent"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
