import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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
            className="velvet-final-cta relative isolate overflow-hidden bg-velvet-950 text-silk"
        >
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/landing/final-cta.jpg"
                    alt=""
                    role="presentation"
                    fill
                    sizes="100vw"
                    className="object-cover object-right"
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-velvet-950 from-15% via-velvet-950/85 via-45% to-transparent to-65%"
                />
            </div>

            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 px-6 py-28 sm:px-10 lg:min-h-[640px] lg:grid-cols-2 lg:px-16 lg:py-32">
                <div className="flex flex-col justify-center">
                    <p className="font-heading text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h2
                        id="final-cta-title"
                        className="mt-5 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-silk"
                    >
                        {t("titleLine1")}{" "}
                        <span className="italic text-gold-light">
                            {t("titleEmphasis")}
                        </span>
                    </h2>
                    <p className="mt-7 max-w-md text-sm leading-relaxed text-silk/75">
                        {t("description")}
                    </p>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                        {catalogEnabled && (
                            <Link
                                href="/catalog"
                                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-gold to-gold-dark px-7 py-3.5 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-velvet-950 shadow-xl shadow-gold/20 transition-all duration-300 hover:from-gold-light hover:to-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                            >
                                {t("ctaPrimary")}
                                <span
                                    aria-hidden="true"
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-velvet-950/40 transition-transform duration-300 group-hover:translate-x-0.5"
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
                        )}
                        <Link
                            href="/contact"
                            className="group inline-flex items-center gap-3 rounded-full border border-gold/50 bg-velvet-950/40 px-7 py-3.5 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-silk backdrop-blur transition-all duration-300 hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none"
                        >
                            {t("ctaSecondary")}
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
