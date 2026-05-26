import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CityPillar } from "@/lib/cities";
import { getDolls, type Doll } from "@/lib/dolls";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import {
    CANONICAL_BRAND,
    LEGAL_IDENTIFIERS,
    LEGAL_OPERATOR_NAME,
    getSiteUrl,
    localeUrl,
} from "@/lib/site";
import { getPublicPlatformSettings } from "@/lib/settings";

type Props = { city: CityPillar };

// Sortare deterministă pentru afișaj: featured pe hero, apoi available-for-rent,
// apoi tot ce e activ. Garantăm că arătăm cel mult 6 modele ca să nu inducem
// false advertising — orașul are acces la TOT catalog-ul, dar pagina e o
// vitrină, nu un index complet.
function pickFeaturedDolls(dolls: Doll[]) {
    const seen = new Set<string>();
    const result: Doll[] = [];
    const rentableFirst = [...dolls].sort((a, b) => {
        if (a.availableForRent === b.availableForRent) return 0;
        return a.availableForRent ? -1 : 1;
    });
    for (const doll of rentableFirst) {
        if (seen.has(doll.id)) continue;
        seen.add(doll.id);
        result.push(doll);
        if (result.length >= 6) break;
    }
    return result;
}

export default async function CityPillarSection({ city }: Props) {
    const t = await getTranslations({ locale: "ro", namespace: "cityPillar" });
    const [settings, allDolls] = await Promise.all([
        getPublicPlatformSettings().catch(() => null),
        getDolls().catch(() => []),
    ]);

    const featured = pickFeaturedDolls(allDolls);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, "ro", `/${city.slug}`);
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;

    // Service schema cu LocalBusiness ca provider — combinația semnalează Google
    // că oferim un serviciu local concret într-o arie de acoperire identificată,
    // chiar dacă nu avem profil Google Business Profile (interzis pe nișă).
    const localBusinessLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${canonical}#localbusiness`,
        name: `${businessName} ${city.cityName}`,
        url: canonical,
        image: `${siteUrl}/opengraph-image`,
        priceRange: "€€€",
        telephone: settings?.contact_phone ?? settings?.whatsapp_phone ?? undefined,
        email: settings?.contact_email ?? LEGAL_IDENTIFIERS.contactEmail,
        address: {
            "@type": "PostalAddress",
            addressLocality: city.cityName,
            addressRegion: city.countyCode,
            addressCountry: "RO",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: city.geo.lat,
            longitude: city.geo.lng,
        },
        areaServed: city.deliveryZones.map((zone) => ({
            "@type": "AdministrativeArea",
            name: zone.name,
        })),
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ],
                opens: "10:00",
                closes: "22:00",
            },
        ],
        currenciesAccepted: "RON",
        paymentAccepted: "Cash, Credit Card",
        sameAs: undefined,
        parentOrganization: { "@id": `${siteUrl}/#org` },
    };

    const serviceLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${canonical}#service`,
        name: t("metaTitle", { city: city.cityName }),
        description: city.intro,
        provider: { "@id": `${canonical}#localbusiness` },
        areaServed: {
            "@type": "City",
            name: city.cityName,
            address: {
                "@type": "PostalAddress",
                addressLocality: city.cityName,
                addressRegion: city.countyCode,
                addressCountry: "RO",
            },
        },
        serviceType: t("serviceType"),
        audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
        hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            opens: "10:00",
            closes: "22:00",
            dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ],
        },
        offers: {
            "@type": "Offer",
            url: localeUrl(siteUrl, "ro", "/catalog"),
            priceCurrency: settings?.currency ?? "RON",
            availability: "https://schema.org/InStock",
        },
    };

    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: city.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
        })),
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: businessName,
                item: localeUrl(siteUrl, "ro", "/"),
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("breadcrumbCities"),
                item: localeUrl(siteUrl, "ro", "/catalog"),
            },
            {
                "@type": "ListItem",
                position: 3,
                name: city.cityName,
                item: canonical,
            },
        ],
    };

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-16">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {t("eyebrow", { city: city.cityName })}
                    </p>
                    <h1 className="mt-4 font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                        {t("h1", { city: city.cityName })}
                    </h1>
                    <p className="mt-6 text-lg text-silk/85 leading-relaxed">
                        {city.intro}
                    </p>
                    <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-velvet-800">
                        <div>
                            <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                {t("statDeliveryWindow")}
                            </dt>
                            <dd className="mt-2 font-display italic text-xl text-silk">
                                {city.deliveryWindow}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                {t("statZones")}
                            </dt>
                            <dd className="mt-2 font-display italic text-xl text-silk">
                                {t("statZonesValue", { count: city.deliveryZones.length })}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                {t("statBilling")}
                            </dt>
                            <dd className="mt-2 font-display italic text-xl text-silk">
                                {LEGAL_OPERATOR_NAME}
                            </dd>
                        </div>
                    </dl>
                </header>

                <section
                    aria-labelledby="zones-heading"
                    className="mb-16 p-6 sm:p-8 border border-velvet-800 rounded-3xl bg-velvet-900/40"
                >
                    <h2
                        id="zones-heading"
                        className="font-display italic text-2xl text-silk mb-6"
                    >
                        {t("zonesHeading", { city: city.cityName })}
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                        {city.deliveryZones.map((zone) => (
                            <li
                                key={zone.name}
                                className="flex items-baseline justify-between gap-3 py-2 border-b border-velvet-800/60 last:border-b-0"
                            >
                                <span className="text-base text-silk">{zone.name}</span>
                                {zone.note ? (
                                    <span className="text-sm text-silk/65">{zone.note}</span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-6 text-sm text-silk/70 leading-relaxed">
                        {t("zonesNote")}
                    </p>
                </section>

                <section className="space-y-12 mb-16">
                    {city.pillars.map((pillar, idx) => (
                        <div key={idx}>
                            <h2 className="font-display italic text-2xl sm:text-3xl text-silk mb-4 leading-tight">
                                {pillar.heading}
                            </h2>
                            <div className="text-base sm:text-lg text-silk/85 leading-relaxed space-y-4">
                                {pillar.body.split("\n\n").map((p, pIdx) => (
                                    <p key={pIdx}>{p}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                {featured.length > 0 ? (
                    <section
                        aria-labelledby="featured-heading"
                        className="mb-16 pt-12 border-t border-velvet-800"
                    >
                        <h2
                            id="featured-heading"
                            className="font-display italic text-2xl sm:text-3xl text-silk mb-8"
                        >
                            {t("featuredHeading", { city: city.cityName })}
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
                            {featured.map((doll) => (
                                <li key={doll.id}>
                                    <Link
                                        href={`/catalog/${doll.id}`}
                                        className="group block bg-velvet-950 border border-gold/15 hover:border-gold/40 rounded-2xl overflow-hidden transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                    >
                                        <div className="relative aspect-[4/5]">
                                            {doll.image ? (
                                                <Image
                                                    src={getSupabaseImageUrl(doll.image, "card")}
                                                    alt={`${doll.name} — ${city.cityName}`}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                                />
                                            ) : (
                                                <div
                                                    aria-hidden="true"
                                                    className="absolute inset-0 bg-velvet-900"
                                                />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-display italic text-lg text-silk leading-tight">
                                                {doll.name}
                                            </h3>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-8 text-sm">
                            <Link
                                href="/catalog"
                                className="text-gold hover:text-gold-light focus-visible:outline-none focus-visible:underline"
                            >
                                {t("seeFullCatalog")}
                                <span aria-hidden="true"> →</span>
                            </Link>
                        </p>
                    </section>
                ) : null}

                <section
                    aria-labelledby="faq-heading"
                    className="pt-12 border-t border-velvet-800"
                >
                    <h2
                        id="faq-heading"
                        className="font-display italic text-2xl sm:text-3xl text-silk mb-8"
                    >
                        {t("faqHeading", { city: city.cityName })}
                    </h2>
                    <div className="space-y-6">
                        {city.faq.map(({ q, a }) => (
                            <details
                                key={q}
                                className="group border border-velvet-800 rounded-2xl"
                            >
                                <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-4 text-silk font-medium hover:text-gold-light motion-reduce:hover:text-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                                    <span>{q}</span>
                                    <span
                                        aria-hidden="true"
                                        className="shrink-0 mt-0.5 text-gold transition-transform group-open:rotate-45 motion-reduce:transition-none"
                                    >
                                        +
                                    </span>
                                </summary>
                                <p className="px-5 pb-5 text-base text-silk/85 leading-relaxed">
                                    {a}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
