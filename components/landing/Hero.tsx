import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type HeroProps = {
    catalogEnabled: boolean;
};

export default async function Hero({ catalogEnabled }: HeroProps) {
    const t = await getTranslations("home.hero");

    return (
        <section
            id="hero"
            aria-labelledby="hero-title"
            data-surface="dark"
            className="velvet-hero relative isolate overflow-hidden bg-[#12070b] text-[#f3eee7] lg:h-[1302px]"
        >
            {/* Velvet textured backdrop — only the hero band (top 871px in Figma). */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-20 h-[560px] lg:h-[871px]">
                <Image
                    src="/images/landing/hero.png"
                    alt=""
                    fill
                    priority
                    fetchPriority="high"
                    sizes="100vw"
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="relative mx-auto flex w-full max-w-[1474px] flex-col px-6 pt-[120px] pb-0 sm:px-10 lg:h-[871px] lg:px-[87px] lg:pt-[95px]">
                <h1
                    id="hero-title"
                    className="font-display text-center font-bold leading-[1.5] tracking-[-0.01em] text-[#f3eee7] text-[clamp(3rem,10.5vw,130px)] lg:whitespace-nowrap"
                    style={{
                        fontFamily:
                            'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                    }}
                >
                    <span>{t("titleLine1")} </span>
                    <span className="italic font-normal text-[#c9a15a]">
                        {t("titleEmphasis")}
                    </span>
                </h1>

                <div className="mt-12 flex flex-col items-stretch gap-10 lg:mt-[136px] lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                    <div className="flex w-full flex-col gap-[39px] lg:max-w-[327px]">
                        <p className="font-display text-[20px] font-semibold leading-[1.5] text-[#f3eee7]">
                            {t.rich("taglinePremium", {
                                accent: (chunks) => (
                                    <span className="text-[#c9a15a]">{chunks}</span>
                                ),
                                break: () => <br />,
                            })}
                        </p>
                        <p className="font-sans text-[18px] font-normal leading-[1.5] tracking-[-0.01em] text-[#b9b2aa]">
                            {t("description")}
                        </p>
                    </div>

                    {catalogEnabled && (
                        <Link
                            href="/catalog"
                            aria-label={t("ctaAria")}
                            className="inline-flex w-fit items-center justify-center gap-[10px] self-start rounded-[20px] px-6 py-[14px] font-display text-[17px] font-bold tracking-[-0.01em] text-[#12070b] shadow-[0_8px_24px_rgba(201,161,90,0.35)] transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12070b] motion-reduce:transition-none motion-reduce:hover:scale-100 lg:self-center"
                            style={{
                                backgroundImage:
                                    "linear-gradient(108.19deg, #c9a15a 0.59%, #daffed 103.75%)",
                            }}
                        >
                            <span className="whitespace-nowrap">{t("cta")}</span>
                            <span
                                aria-hidden="true"
                                className="inline-flex h-6 w-6 items-center justify-center"
                            >
                                <svg
                                    width="18"
                                    height="14"
                                    viewBox="0 0 18 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 7h16m0 0L11 1m6 6l-6 6"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Single unified figure (hero.png). On lg it is 1013px wide → 1107px tall and,
                bottom-anchored to the 1302px section, lands at top:195px exactly as in Figma,
                its legs overflowing 431px below the hero band. On smaller screens it flows
                directly under the copy so text and figure never overlap. */}
            <div
                aria-hidden="true"
                className="pointer-events-none relative z-0 mt-2 flex justify-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:-z-10 lg:mt-0"
            >
                <Image
                    src="/hero.png"
                    alt={t("imageAltFallback")}
                    width={2026}
                    height={2212}
                    priority
                    sizes="(max-width: 1024px) 90vw, 1013px"
                    className="h-auto w-[92vw] max-w-[460px] object-contain object-bottom sm:max-w-[560px] lg:w-[1013px] lg:max-w-none lg:translate-x-[4px]"
                />
            </div>
        </section>
    );
}
