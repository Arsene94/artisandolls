import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Eyebrow from "@/components/landing/Eyebrow";
import PrimaryButton from "@/components/landing/PrimaryButton";

type FinalCtaProps = {
    catalogEnabled: boolean;
};

export default async function FinalCta({ catalogEnabled }: FinalCtaProps) {
    const t = await getTranslations("home.finalCta");

    return (
        <section
            id="final-cta"
            aria-labelledby="final-cta-title"
            data-surface="dark"
            className="velvet-final-cta relative isolate overflow-hidden bg-[#0c0001] text-silk"
        >
            {/* ───────────────── MOBILE (<lg) — Figma 360px composition ─────────────────
                Centered eyebrow w/ side rules, heading, copy, primary CTA, then a framed
                image card, then the secondary CTA (node 12859:7579). */}
            <div className="flex flex-col items-center px-4 py-16 text-center lg:hidden">
                <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-px w-[40px] bg-gold/60" />
                    <Eyebrow>{t("eyebrow")}</Eyebrow>
                    <span aria-hidden="true" className="h-px w-[40px] bg-gold/60" />
                </div>
                <h2 className="mt-6 font-display text-[28px] leading-[1.3] tracking-tight text-silk">
                    {t("titleLine1")}{" "}
                    <span className="italic text-gold">{t("titleEmphasis")}</span>
                </h2>
                <p className="mt-5 max-w-[300px] text-[12px] leading-relaxed text-[#b9b2aa]">
                    {t("description")}
                </p>

                {catalogEnabled && (
                    <PrimaryButton
                        href="/catalog"
                        variant="solid"
                        className="mt-8 w-full max-w-[280px]"
                    >
                        {t("ctaPrimary")}
                    </PrimaryButton>
                )}

                <div className="relative mt-10 aspect-[6/5] w-full overflow-hidden rounded-[24px] border border-velvet-800/60 shadow-2xl shadow-velvet-950/60">
                    <Image
                        src="/images/landing/final-cta.png"
                        alt=""
                        role="presentation"
                        fill
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </div>

                <PrimaryButton
                    href="/contact"
                    variant="outline"
                    className="mt-8 w-full max-w-[280px]"
                >
                    {t("ctaSecondary")}
                </PrimaryButton>
            </div>

            {/* ───────────────── DESKTOP (lg+) — Figma node 12738:3083 (1441×704) ─────
                Photo pinned to the right 61.2% (Figma "Frame 34708": left 557 / w 882
                of 1441) and object-right to reproduce the exact crop — figure centre-
                right, warm lamp at the edge. Content sits left, vertically centred. */}
            <div className="relative hidden min-h-[704px] w-full lg:block">
                <div className="absolute inset-y-0 right-0 w-[61.2%]">
                    <Image
                        src="/images/landing/final-cta-desktop.png"
                        alt=""
                        role="presentation"
                        fill
                        sizes="(min-width: 1024px) 62vw, 0px"
                        className="object-cover object-right"
                    />
                    {/* Blend the photo's left edge into the #0c0001 field so the copy
                        stays legible where it overlaps it (Figma leans on the photo's
                        own shadow; this keeps it clean at every desktop width). */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0c0001] via-[#0c0001]/80 to-transparent"
                    />
                </div>

                <div className="relative mx-auto flex min-h-[704px] max-w-[1441px] flex-col justify-center px-[71px]">
                    <div className="flex max-w-[700px] flex-col gap-20">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-4">
                                <span
                                    aria-hidden="true"
                                    className="h-px w-[80px] bg-gold/30"
                                />
                                <Eyebrow>{t("eyebrow")}</Eyebrow>
                                <span
                                    aria-hidden="true"
                                    className="h-px w-[80px] bg-gold/30"
                                />
                            </div>
                            <div className="flex flex-col gap-10">
                                <h2
                                    id="final-cta-title"
                                    className="font-display text-[60px] leading-[1.5] tracking-[-0.01em] text-[#f3eee7]"
                                >
                                    {t("titleLine1")}{" "}
                                    <span className="italic text-gold">
                                        {t("titleEmphasis")}
                                    </span>
                                </h2>
                                <p className="max-w-[602px] text-[18px] leading-[1.5] tracking-[-0.01em] text-[#b9b2aa]">
                                    {t("description")}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-8">
                            {catalogEnabled && (
                                <PrimaryButton href="/catalog" variant="solid">
                                    {t("ctaPrimary")}
                                </PrimaryButton>
                            )}
                            <PrimaryButton href="/contact" variant="outline">
                                {t("ctaSecondary")}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
