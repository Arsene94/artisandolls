import { getTranslations } from "next-intl/server";

function FireIcon() {
    return (
        <svg className="w-6 h-6 text-velvet-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14a8 8 0 0016 0c0-4.16-2-7.88-6.5-13.33zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
        </svg>
    );
}

function FeatherIcon() {
    return (
        <svg className="w-6 h-6 text-velvet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
    );
}

function SkeletonIcon() {
    return (
        <svg className="w-6 h-6 text-velvet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="5" r="2.5" />
            <path d="M12 7.5v4M9 11h6M8 16l4-4 4 4M9 21l3-5 3 5" />
        </svg>
    );
}

export default async function SensoryBenefits() {
    const t = await getTranslations("home.benefits");

    return (
        <section id="despre" className="py-24 bg-silk text-velvet-900 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-xs font-bold uppercase tracking-widest text-velvet-500 bg-velvet-100 px-4 py-2 rounded-full">
                        {t("badge")}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 font-serif">
                        {t("title")}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-gold via-velvet-500 to-gold mx-auto mb-6" />
                    <p className="text-gray-600 font-light text-base sm:text-lg">
                        {t("description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <FireIcon />, title: t("benefit1Title"), description: t.raw("benefit1Description") as string },
                        { icon: <FeatherIcon />, title: t("benefit2Title"), description: t.raw("benefit2Description") as string },
                        { icon: <SkeletonIcon />, title: t("benefit3Title"), description: t.raw("benefit3Description") as string },
                    ].map((b, i) => (
                        <div
                            key={i}
                            className="bg-white p-8 rounded-2xl shadow-xl shadow-velvet-900/5 hover:shadow-velvet-500/10 hover:border-velvet-300 transition-all duration-300 border border-gray-100 group"
                        >
                            <div className="w-14 h-14 bg-velvet-50 group-hover:bg-velvet-100 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                                {b.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 font-serif group-hover:text-velvet-500 transition-colors">
                                {b.title}
                            </h3>
                            <p
                                className="text-gray-600 text-sm font-light leading-relaxed [&_strong]:text-velvet-500"
                                dangerouslySetInnerHTML={{ __html: b.description }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
