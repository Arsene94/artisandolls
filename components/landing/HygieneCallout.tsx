import { getTranslations } from "next-intl/server";

export default async function HygieneCallout() {
    const t = await getTranslations("home.hygiene");

    return (
        <section className="py-20 bg-silk text-velvet-900 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-xl shadow-velvet-900/5 relative">
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-velvet-50 rounded-full blur-xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-velvet-500 to-velvet-700 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-velvet-500/20">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M21 11c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zm-9 5l4-4-1.41-1.41L12 13.17l-2.59-2.58L8 12l4 4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold font-serif mb-3">
                            {t("title")}
                        </h3>
                        <p className="text-gray-600 font-light text-sm sm:text-base leading-relaxed">
                            {t("description")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
