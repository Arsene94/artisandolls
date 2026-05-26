export type CityFaq = {
    q: string;
    a: string;
};

export type DeliveryZone = {
    /** Subdiviziune locală — pentru București: „Sectorul 1"; Cluj: cartier; etc. */
    name: string;
    /** Notă scurtă: distanță, fereastră de livrare etc. */
    note?: string;
};

export type CityPillar = {
    /** Slug-ul URL: `/inchiriere-papusi-bucuresti`. RO-only intent. */
    slug: string;
    /** Numele localității cu diacritice corecte. */
    cityName: string;
    /** Articulat — pentru construcția de titluri „în București", „la Cluj-Napoca". */
    cityInLocative: string;
    /** Județul administrativ — folosit în `addressRegion` din schema LocalBusiness. */
    county: string;
    /** Cod ISO-3166-2 ("RO-B", "RO-CJ", "RO-TM"). */
    countyCode: string;
    /** Coordonate centroide ale orașului — pentru `geo` în schema LocalBusiness. */
    geo: { lat: number; lng: number };
    /** Fereastra orară standard pe care o respectăm pentru livrări (24h). */
    deliveryWindow: string;
    /** Lista zonelor de livrare — sectoare, cartiere, comune limitrofe. */
    deliveryZones: DeliveryZone[];
    /** Curierii locali principali. */
    couriers: string[];
    /** 3-4 paragrafe SEO unice per oraș. */
    intro: string;
    pillars: { heading: string; body: string }[];
    /** Întrebări locale: timp de livrare, zone deservite, plată discretă, alegerea limbii. */
    faq: CityFaq[];
};
