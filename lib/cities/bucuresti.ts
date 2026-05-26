import type { CityPillar } from "./types";

export const bucuresti: CityPillar = {
    slug: "inchiriere-papusi-bucuresti",
    cityName: "București",
    cityInLocative: "în București",
    county: "București",
    countyCode: "RO-B",
    geo: { lat: 44.4268, lng: 26.1025 },
    deliveryWindow: "10:00 – 22:00, 7 zile pe săptămână",
    deliveryZones: [
        { name: "Sectorul 1", note: "fereastră de livrare 2h" },
        { name: "Sectorul 2", note: "fereastră de livrare 2h" },
        { name: "Sectorul 3", note: "fereastră de livrare 2h" },
        { name: "Sectorul 4", note: "fereastră de livrare 2h" },
        { name: "Sectorul 5", note: "fereastră de livrare 2h" },
        { name: "Sectorul 6", note: "fereastră de livrare 2h" },
        { name: "Otopeni, Voluntari, Pantelimon", note: "fereastră de livrare 3h" },
        { name: "Popești-Leordeni, Chiajna, Bragadiru", note: "fereastră de livrare 3h" },
    ],
    couriers: ["Sameday by curier dedicat", "FanCourier express", "Livrare cu mașină proprie pentru cauțiune > 1000 RON"],
    intro: "Pentru clienții din București oferim cea mai scurtă fereastră de livrare din întreaga rețea Velvet Companions: 2 ore garantate în toate cele șase sectoare, plus zonele limitrofe Otopeni, Voluntari și Pantelimon. Plata se finalizează la livrare — numerar sau card prin terminal mobil — fără cerință de date bancare în avans și fără urmă a tranzacției pe extras dincolo de denumirea „Velvet Studio SRL”.",
    pillars: [
        {
            heading: "Cum funcționează închirierea în București",
            body: "Alegi modelul din catalog, selectezi intervalul (între 4 ore și 7 zile) și confirmi adresa exactă. Un consilier te contactează discret prin canalul tău preferat (WhatsApp, Telegram sau telefon) pentru a stabili fereastra orară și cauțiunea — tipic 500–1500 RON, eliberată integral în 48 de ore după inspecția de retur.\n\nLivrarea se face într-o cutie neutră, fără logo, fără text indicativ. Documentele de transport declară generic „echipamente cosmetice” — curierul nu cunoaște conținutul. Ridicarea se face în pungă opacă sigilată; întreaga procedură este non-verbală pe partea curierului.",
        },
        {
            heading: "Igienă clinică între închirieri",
            body: "Fiecare companion trece printr-un protocol de cinci pași documentat per ciclu: spălare cu detergent pH-neutru la 30 °C, dezinfecție cu clorhexidină < 0,5%, sterilizare UV-C 15 minute (253,7 nm), uscare în mediu cu umiditate controlată (40-50% RH) și resigilare cu indicator de tamperare.\n\nCiclul complet durează aproximativ 3 ore. La cerere putem furniza certificarea procedurii — utilă mai ales pentru evenimente private și sesiuni foto profesionale. Pentru clienții cu alergii cunoscute la TPE, recomandăm modelele cu silicon platinum-cure, care au porozitate ≈0%.",
        },
        {
            heading: "Achiziție personalizată cu livrare în Capitală",
            body: "Pentru achiziție directă oferim consultanță tehnică în studioul nostru din sectorul 1, pe bază de programare. Acolo evaluezi modelele fizic, alegi materialul (TPE clasic versus silicon platinum-cure), tonurile pielii, dimensiunile, opțiunile de schelet articulat și modulele opționale (termic, vocal). Pre-vizualizările digitale ale configurației finale ajung prin WhatsApp în 24-72 de ore.\n\nDurata fabricației variază în funcție de personalizări: 14 zile pentru o configurație standard, 4-6 săptămâni pentru o comandă cu turnare nouă. Garanția acoperă 12 luni pentru schelet și module electronice și 6 luni pentru pielea exterioară.",
        },
    ],
    faq: [
        {
            q: "Cât durează livrarea unei păpuși în București?",
            a: "În cele șase sectoare livrăm în maximum 2 ore de la confirmarea consilierului, în fereastra 10:00 – 22:00. Pentru Otopeni, Voluntari, Pantelimon, Popești-Leordeni, Chiajna și Bragadiru fereastra este de 3 ore. Pentru intervale orare în afara acestui program, programăm livrarea pentru dimineața următoare.",
        },
        {
            q: "Cum se asigură anonimatul la livrare în bloc?",
            a: "Cutia exterioară este carton kraft natural, complet neutru. Curierul comunică doar numele tău și nu cunoaște conținutul. La adrese din blocuri, ne putem opri în fața porții, în mașină, sau putem confirma livrarea prin SMS — alegi metoda care îți convine la confirmarea comenzii.",
        },
        {
            q: "Pot ridica direct din studio pentru a evita livrarea?",
            a: "Da. Studioul din sectorul 1 acceptă ridicări pe bază de programare confidențială. Adresa exactă o primești cu 24h înainte de programare, prin WhatsApp. La studio se poate verifica modelul fizic înainte de a confirma închirierea sau achiziția.",
        },
        {
            q: "Plata se face online sau cash la livrare?",
            a: "Ambele variante sunt disponibile. Plata cash sau card prin terminal mobil la livrare este metoda implicită — nu cerem date de card înainte. Pentru clienți care preferă plata online, oferim card 3D-Secure prin Stripe sau Netopia, cu același „discreet billing”: pe extras apare doar „Velvet Studio SRL”.",
        },
        {
            q: "Există un studio sau showroom fizic în București?",
            a: "Da, în sectorul 1, pe bază de programare. Adresa exactă o comunicăm doar după confirmarea programării, prin canalul tău preferat. Vizitele durează 45-60 de minute și includ evaluarea fizică a 2-3 modele alese în prealabil.",
        },
    ],
};
