import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Eyebrow from "@/components/landing/Eyebrow";
import PrimaryButton from "@/components/landing/PrimaryButton";

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
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-28">
                <div className="relative order-2 lg:order-1">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] border border-velvet-800/60 shadow-2xl shadow-velvet-950/60 lg:aspect-[4/5]">
                        <Image
                            src="/images/landing/about.png"
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

                {/* Text column — `display:contents` on mobile so the image sits between
                    the centered header and the values (Figma order: header → image →
                    values → button). On lg it is the right flex column. */}
                <div className="contents lg:order-2 lg:flex lg:flex-col lg:justify-center">
                    <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
                        <Eyebrow>{t("eyebrow")}</Eyebrow>
                        <h2
                            id="about-title"
                            className="mt-5 font-display text-[28px] leading-[1.3] tracking-tight text-ivory lg:text-[clamp(2.25rem,4.5vw,4rem)] lg:leading-[1.05]"
                        >
                            <span className="block">
                                {t("titleLine1").replace(/\.$/, "")}
                            </span>
                            <span className="block italic text-gold">
                                {t("titleLine2")} {t("titleEmphasis")}
                            </span>
                        </h2>
                        <span
                            aria-hidden="true"
                            className="mt-6 block h-px w-[60px] bg-gold/60"
                        />
                        <p className="mt-7 max-w-[36rem] text-[12px] leading-relaxed text-silk/70 lg:text-sm">
                            {t("body")}
                        </p>
                    </div>

                    <div className="order-3 mt-2 flex flex-col items-center text-center lg:mt-0 lg:items-start lg:text-left">
                        <ul className="w-full space-y-[26px] lg:space-y-[30px]">
                            {VALUES.map(({ key, num }) => (
                                <li
                                    key={key}
                                    className="flex items-start gap-5 text-left"
                                >
                                    <span className="font-display text-3xl font-light leading-none text-gold lg:text-[40px]">
                                        {num}
                                    </span>
                                    <div>
                                        <h3 className="font-display text-[18px] font-semibold tracking-tight text-ivory lg:text-[20px]">
                                            {t(`values.${key}.title`)}
                                        </h3>
                                        <p className="mt-2 text-[12px] leading-relaxed text-[#b9b2aa] lg:text-sm">
                                            {t(`values.${key}.body`)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <PrimaryButton
                            href="/about"
                            variant="solid"
                            ariaLabel={t("cta")}
                            className="mt-10 self-center lg:self-start"
                        >
                            {t("cta")}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
