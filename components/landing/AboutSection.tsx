import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type ValueKey = "studio" | "experience" | "privacy";

const VALUES: { key: ValueKey; num: string }[] = [
    { key: "studio", num: "01" },
    { key: "experience", num: "02" },
    { key: "privacy", num: "03" },
];

const STAT_KEYS = ["criteria", "steps", "support"] as const;

export default async function AboutSection() {
    const t = await getTranslations("home.about");

    return (
        <section
            id="about"
            aria-labelledby="about-title"
            data-surface="dark"
            className="velvet-about relative bg-velvet-950 text-silk"
        >
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-14 px-6 py-28 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-16">
                <div className="relative">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] border border-velvet-800/60 shadow-2xl shadow-velvet-950/60 lg:aspect-[4/5]">
                        <Image
                            src="/images/landing/about.jpg"
                            alt={t("imageAlt")}
                            fill
                            sizes="(max-width: 1024px) 100vw, 631px"
                            className="object-cover object-center"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-velvet-950 via-velvet-950/70 to-transparent"
                        />
                        <dl className="absolute inset-x-8 bottom-8 grid grid-cols-3 gap-2 divide-x divide-gold/40 text-center">
                            {STAT_KEYS.map((k) => (
                                <div key={k} className="px-2">
                                    <dt className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] italic leading-none text-gold-light">
                                        {t(`stats.${k}.value`)}
                                    </dt>
                                    <dd className="mt-3 font-heading text-[0.6rem] uppercase tracking-[0.22em] text-silk/80">
                                        {t(`stats.${k}.label`)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <p className="font-heading text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h2
                        id="about-title"
                        className="mt-5 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-silk"
                    >
                        <span className="block">{t("titleLine1")}</span>
                        <span className="block">
                            {t("titleLine2")}{" "}
                            <span className="italic text-gold-light">
                                {t("titleEmphasis")}
                            </span>
                        </span>
                    </h2>
                    <span
                        aria-hidden="true"
                        className="mt-6 block h-px w-[60px] bg-gold/60"
                    />
                    <p className="mt-7 max-w-[36rem] text-sm leading-relaxed text-silk/70">
                        {t("body")}
                    </p>

                    <ul className="mt-10 space-y-6">
                        {VALUES.map(({ key, num }) => (
                            <li
                                key={key}
                                className="flex items-start gap-5 border-l border-gold/20 pl-5"
                            >
                                <span className="font-display text-2xl italic text-gold/70">
                                    {num}
                                </span>
                                <div>
                                    <h3 className="font-heading text-base font-semibold tracking-tight text-silk">
                                        {t(`values.${key}.title`)}
                                    </h3>
                                    <p className="mt-2 text-[0.82rem] leading-relaxed text-silk/65">
                                        {t(`values.${key}.body`)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-10 self-start">
                        <Link
                            href="/about"
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
            </div>
        </section>
    );
}
