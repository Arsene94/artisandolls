import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
    const t = await getTranslations("errors");

    return (
        <section className="relative min-h-[70vh] bg-velvet-950 px-4 py-24 text-silk">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-gold">
                    404
                </p>
                <h1 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                    {t("notFoundTitle")}
                </h1>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-silk/70">
                    {t("notFoundDescription")}
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-dark px-7 py-3 text-sm font-semibold uppercase tracking-wider text-velvet-950 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950 motion-reduce:transition-none motion-reduce:hover:scale-100"
                    >
                        {t("backHome")}
                    </Link>
                    <Link
                        href="/catalog"
                        className="inline-flex items-center justify-center rounded-full border border-silk/30 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-silk transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
                    >
                        {t("exploreCatalog")}
                    </Link>
                </div>
            </div>
        </section>
    );
}
