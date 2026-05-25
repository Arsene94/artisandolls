import { getTranslations } from "next-intl/server";

type RibbonItem = {
    titleKey: string;
    detailKey: string;
    icon: React.ReactNode;
};

const ITEMS: RibbonItem[] = [
    {
        titleKey: "discreetShipping",
        detailKey: "discreetShippingDetail",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" />
                <path d="M4 7.5 12 11l8-3.5" />
                <path d="M12 11v9" />
            </svg>
        ),
    },
    {
        titleKey: "discreetBilling",
        detailKey: "discreetBillingDetail",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M3 10h18" />
                <path d="M7 15h4" />
            </svg>
        ),
    },
    {
        titleKey: "clinicalHygiene",
        detailKey: "clinicalHygieneDetail",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        ),
    },
    {
        titleKey: "ageVerified",
        detailKey: "ageVerifiedDetail",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 9.5h2v5" />
                <path d="M14 9.5c1.5 0 2 .8 2 1.6 0 1.6-2 1.4-2 2.6v.8h2" />
            </svg>
        ),
    },
];

export default async function TrustRibbon() {
    const t = await getTranslations("home.trust");

    return (
        <section
            aria-label="Trust signals"
            className="surface-light bg-pearl-50 border-y border-pearl-200/70 py-10 sm:py-12 text-silk-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {ITEMS.map(({ titleKey, detailKey, icon }) => (
                        <li
                            key={titleKey}
                            className="flex items-start gap-3 sm:gap-4"
                        >
                            <span
                                aria-hidden="true"
                                className="shrink-0 w-11 h-11 rounded-full bg-white border border-pearl-200 text-pearl-700 flex items-center justify-center"
                            >
                                <span className="block w-5 h-5">{icon}</span>
                            </span>
                            <div className="min-w-0">
                                <p className="font-heading font-semibold text-velvet-900 text-[0.92rem] leading-tight">
                                    {t(titleKey)}
                                </p>
                                <p className="text-[0.82rem] text-silk-800/75 mt-1 leading-snug">
                                    {t(detailKey)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
