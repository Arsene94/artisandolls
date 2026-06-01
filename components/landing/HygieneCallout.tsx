import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Eyebrow from "@/components/landing/Eyebrow";
import PrimaryButton from "@/components/landing/PrimaryButton";

const BULLET_KEYS = [
    "cleaning",
    "disinfection",
    "sterilization",
    "inspection",
    "sealed",
] as const;

/** Figma `EllipseFill` — 12px filled champagne-gold dot marking each item. */
function Dot() {
    return (
        <span
            aria-hidden="true"
            className="mt-[5px] block size-[12px] shrink-0 rounded-full bg-[#c9a15a]"
        />
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
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-10 lg:grid-cols-[minmax(0,619px)_minmax(0,1fr)] lg:gap-16 lg:px-16 lg:py-24">
                {/* Text column — `display:contents` on mobile so the image sits between
                    the centered header and the bullet list (Figma order: header →
                    image → bullets → button). On lg it is the left flex column. */}
                <div className="contents lg:order-1 lg:flex lg:flex-col lg:gap-[80px]">
                    <div className="contents lg:flex lg:flex-col lg:gap-[60px]">
                        <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
                            <Eyebrow>{t("eyebrow")}</Eyebrow>
                            <h2
                                id="hygiene-title"
                                className="mt-[30px] font-display text-[34px] leading-[1.15] tracking-[-0.01em] text-ivory lg:text-[60px]"
                            >
                                {t("titleLine1")} {t("titleEmphasis")}
                            </h2>
                            <span
                                aria-hidden="true"
                                className="mt-[40px] block h-px w-[60px] bg-[#6a5330]"
                            />
                            <p className="mt-[40px] max-w-[36rem] text-[15px] leading-[1.5] tracking-[-0.01em] text-[#b9b2aa] lg:text-[18px]">
                                {t("description")}
                            </p>
                        </div>

                        <div className="order-3 flex flex-col items-start text-left">
                            <ul className="flex flex-col gap-[15px]">
                                {BULLET_KEYS.map((k) => (
                                    <li
                                        key={k}
                                        className="flex items-start gap-[11px] text-[14px] leading-[1.5] tracking-[-0.01em] text-[#b9b2aa]"
                                    >
                                        <Dot />
                                        <span>{t(`bullets.${k}`)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <PrimaryButton
                        href="/about#hygiene"
                        variant="solid"
                        className="order-4 mt-10 self-start lg:mt-0"
                    >
                        {t("cta")}
                    </PrimaryButton>
                </div>

                <div className="relative order-2 lg:order-2">
                    <div className="relative aspect-[633/959] w-full overflow-hidden rounded-[20px] border border-velvet-800/60 shadow-2xl shadow-velvet-950/60">
                        <Image
                            src="/images/landing/hygiene.png"
                            alt={t("imageAlt")}
                            fill
                            sizes="(max-width: 1024px) 100vw, 633px"
                            className="object-cover object-center"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
