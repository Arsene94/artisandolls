import { getTranslations } from "next-intl/server";

export default async function LocaleLoading() {
    const t = await getTranslations("common");

    return (
        <section
            className="relative flex min-h-[60vh] items-center justify-center bg-velvet-950 px-4 py-24 text-silk"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="flex flex-col items-center gap-6">
                <div className="relative h-12 w-12">
                    <span className="absolute inset-0 rounded-full border-2 border-gold/20" />
                    <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold motion-reduce:animate-none" />
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-silk/60">
                    {t("loading")}
                </p>
            </div>
        </section>
    );
}
