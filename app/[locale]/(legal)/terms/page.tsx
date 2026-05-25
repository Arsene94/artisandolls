import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    LEGAL_IDENTIFIERS,
    LEGAL_OPERATOR_NAME,
    formatLastUpdated,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type PageProps = {
    params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "footer" });
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    return {
        title: t("terms"),
        alternates: {
            canonical: localeUrl(siteUrl, locale, "/terms"),
            languages: localeAlternates(siteUrl, "/terms"),
        },
        robots: { index: true, follow: true },
    };
}

type Dict = {
    eyebrow: string;
    intro: string;
    toc: string;
    sections: LegalSection[];
};

function buildDict(locale: Locale, business: string, contactEmail: string): Dict {
    const dpo = LEGAL_IDENTIFIERS.dpoEmail;
    const cui = LEGAL_IDENTIFIERS.cui;
    const reg = LEGAL_IDENTIFIERS.regCom;
    const address = LEGAL_IDENTIFIERS.address;

    if (locale === "ro") {
        return {
            eyebrow: "Document legal",
            toc: "Pe această pagină",
            intro: `Acești termeni reglementează utilizarea serviciilor oferite de ${business}. Vă rugăm să îi citiți integral înainte de a folosi platforma.`,
            sections: [
                {
                    heading: "1. Identitatea operatorului",
                    body: [
                        `Denumire: ${business} (denumire legală ${LEGAL_OPERATOR_NAME}).`,
                        `CUI: ${cui}. Reg. Comerțului: ${reg}.`,
                        `Sediu: ${address}.`,
                        `Contact: ${contactEmail}. Responsabil prelucrare date: ${dpo}.`,
                    ],
                },
                {
                    heading: "2. Eligibilitate (18+)",
                    body: "Serviciile sunt destinate exclusiv persoanelor de minim 18 ani împliniți. Accesul la conținut este condiționat de verificarea vârstei la intrarea în site și de o reconfirmare la plasarea comenzii.",
                },
                {
                    heading: "3. Procesul de comandă",
                    body: [
                        "Toate comenzile transmise prin site reprezintă cereri, nu acceptări automate. Un consilier vă contactează pentru a confirma disponibilitatea, prețul final, livrarea și modalitatea de plată.",
                        "Comanda devine fermă numai după confirmarea explicită din partea operatorului prin canalul de contact ales.",
                    ],
                },
                {
                    heading: "4. Plăți și prețuri",
                    body: [
                        "Nu se efectuează plăți online la momentul cererii. Plata se face cu consilierul prin numerar sau card via terminal mobil la livrare.",
                        "Prețurile afișate sunt orientative pentru configurația standard și pot varia în funcție de personalizări, perioadă, opțiuni de livrare. Pe extras factura apare ca „Velvet Studio SRL”.",
                    ],
                },
                {
                    heading: "5. Retur și drept de retragere",
                    body: [
                        "Conform Directivei UE 2011/83/UE art. 16(e) transpuse prin OUG 34/2014 art. 16 lit. e), produsele intime desigilate, care nu pot fi returnate din motive de protecție a sănătății sau de igienă, sunt excluse de la dreptul de retragere de 14 zile.",
                        "În cazul unui defect de fabricație constatat în 24 de ore de la primire, contactați-ne pentru reparație sau înlocuire în condițiile garanției.",
                        "Pentru închirieri, eventualele daune se evaluează individual și pot fi reținute parțial sau integral din cauțiune.",
                    ],
                },
                {
                    heading: "6. Garanție și asistență",
                    body: [
                        "Pentru piesele achiziționate oferim 12 luni asistență tehnică pentru schelet și module electronice.",
                        "Pielea exterioară este garantată 6 luni împotriva defectelor de fabricație, în condiții de utilizare normală și respectare a instrucțiunilor de îngrijire.",
                    ],
                },
                {
                    heading: "7. Limitarea răspunderii",
                    body: "Operatorul nu răspunde pentru utilizări improprii, nerespectarea protocoalelor de igienă sau a instrucțiunilor de îngrijire ori pentru deteriorări cauzate de utilizator. Răspunderea contractuală este limitată la valoarea comenzii.",
                },
                {
                    heading: "8. Soluționarea disputelor",
                    body: [
                        "Pentru reclamații ne puteți contacta direct prin canalele puse la dispoziție. În cazul nesoluționării amiabile, puteți apela la Autoritatea Națională pentru Protecția Consumatorilor (ANPC) sau la procedura SAL.",
                        "Pentru disputele transfrontaliere puteți utiliza platforma europeană SOL (ODR) disponibilă la ec.europa.eu/consumers/odr.",
                    ],
                },
                {
                    heading: "9. Modificarea termenilor",
                    body: "Ne rezervăm dreptul de a actualiza acești termeni. Versiunea aplicabilă este cea publicată pe site la data plasării comenzii. Modificările materiale vor fi comunicate cu un preaviz rezonabil.",
                },
                {
                    heading: "10. Contact",
                    body: `Pentru orice întrebare legată de acești termeni ne puteți contacta la ${contactEmail} (operațional) sau ${dpo} (probleme de date personale).`,
                },
            ],
        };
    }

    if (locale === "nl") {
        return {
            eyebrow: "Juridisch document",
            toc: "Op deze pagina",
            intro: `Deze voorwaarden regelen het gebruik van diensten van ${business}. Lees ze volledig door voordat u het platform gebruikt.`,
            sections: [
                {
                    heading: "1. Identiteit van de exploitant",
                    body: [
                        `Naam: ${business} (juridische naam ${LEGAL_OPERATOR_NAME}).`,
                        `BTW: ${cui}. Handelsregister: ${reg}.`,
                        `Zetel: ${address}.`,
                        `Contact: ${contactEmail}. Functionaris gegevensbescherming: ${dpo}.`,
                    ],
                },
                {
                    heading: "2. Geschiktheid (18+)",
                    body: "De diensten zijn uitsluitend bedoeld voor personen van minstens 18 jaar. Toegang tot de inhoud is afhankelijk van leeftijdsverificatie bij het betreden van de site en een herbevestiging bij het plaatsen van een bestelling.",
                },
                {
                    heading: "3. Bestelproces",
                    body: [
                        "Alle via de site verzonden bestellingen zijn aanvragen, geen automatische aanvaarding. Een adviseur neemt contact op om beschikbaarheid, definitieve prijs, levering en betaalmethode te bevestigen.",
                        "De bestelling wordt pas definitief na uitdrukkelijke bevestiging door de exploitant.",
                    ],
                },
                {
                    heading: "4. Betalingen en prijzen",
                    body: [
                        "Op het moment van de aanvraag worden geen onlinebetalingen verricht. Betaling vindt plaats met de adviseur, contant of via mobiele kaartterminal bij levering.",
                        "Vermelde prijzen zijn indicatief voor de standaardconfiguratie en kunnen variëren afhankelijk van aanpassingen, periode en levering. Op het uittreksel verschijnt „Velvet Studio SRL”.",
                    ],
                },
                {
                    heading: "5. Retour en herroepingsrecht",
                    body: [
                        "Op grond van EU-richtlijn 2011/83 art. 16(e) zijn ontzegelde intieme producten — die om redenen van gezondheidsbescherming of hygiëne niet geretourneerd kunnen worden — uitgesloten van het herroepingsrecht van 14 dagen.",
                        "Bij een fabricagefout vastgesteld binnen 24 uur na ontvangst, neem contact op voor reparatie of vervanging onder de garantievoorwaarden.",
                        "Voor verhuringen wordt eventuele schade individueel beoordeeld en kan deze gedeeltelijk of volledig op de waarborg worden ingehouden.",
                    ],
                },
                {
                    heading: "6. Garantie en ondersteuning",
                    body: [
                        "Voor aangekochte stukken bieden we 12 maanden technische ondersteuning voor het skelet en de elektronische modules.",
                        "De buitenste huid is 6 maanden gewaarborgd tegen fabricagefouten bij normaal gebruik en naleving van de verzorgingsinstructies.",
                    ],
                },
                {
                    heading: "7. Aansprakelijkheidsbeperking",
                    body: "De exploitant is niet aansprakelijk voor onjuist gebruik, niet-naleving van hygiëneprotocollen of verzorgingsinstructies, of schade veroorzaakt door de gebruiker. De contractuele aansprakelijkheid is beperkt tot de waarde van de bestelling.",
                },
                {
                    heading: "8. Geschillenbeslechting",
                    body: [
                        "Voor klachten kunt u rechtstreeks contact opnemen via de aangeboden kanalen. Wordt geen minnelijke schikking bereikt, dan kunt u zich wenden tot de Roemeense consumentenautoriteit (ANPC) of de SAL-procedure.",
                        "Voor grensoverschrijdende geschillen kunt u het Europese ODR-platform gebruiken: ec.europa.eu/consumers/odr.",
                    ],
                },
                {
                    heading: "9. Wijziging van de voorwaarden",
                    body: "Wij behouden ons het recht voor deze voorwaarden bij te werken. De toepasselijke versie is de versie die op de site is gepubliceerd op het moment van bestelling. Materiële wijzigingen worden met redelijke aankondiging gecommuniceerd.",
                },
                {
                    heading: "10. Contact",
                    body: `Voor vragen over deze voorwaarden kunt u contact opnemen via ${contactEmail} (operationeel) of ${dpo} (gegevensbescherming).`,
                },
            ],
        };
    }

    return {
        eyebrow: "Legal document",
        toc: "On this page",
        intro: `These terms govern the use of services provided by ${business}. Please read them in full before using the platform.`,
        sections: [
            {
                heading: "1. Operator identity",
                body: [
                    `Name: ${business} (legal name ${LEGAL_OPERATOR_NAME}).`,
                    `VAT ID: ${cui}. Trade Register: ${reg}.`,
                    `Registered office: ${address}.`,
                    `Contact: ${contactEmail}. Data Protection Officer: ${dpo}.`,
                ],
            },
            {
                heading: "2. Eligibility (18+)",
                body: "Services are intended strictly for persons aged 18 or over. Access to content depends on age verification on entry to the site and a reconfirmation at checkout.",
            },
            {
                heading: "3. Order process",
                body: [
                    "All orders submitted through the site are requests, not automatic acceptances. An advisor will contact you to confirm availability, the final price, delivery, and payment method.",
                    "An order becomes binding only after explicit confirmation by the operator on the chosen channel.",
                ],
            },
            {
                heading: "4. Payments and pricing",
                body: [
                    "No online payments are taken at the time of the request. Payment is arranged with the advisor — cash or card via mobile terminal at delivery.",
                    "Listed prices are indicative for the standard configuration and may vary with customisations, period and delivery. The bank statement reads “Velvet Studio SRL”.",
                ],
            },
            {
                heading: "5. Returns and right of withdrawal",
                body: [
                    "Pursuant to EU Directive 2011/83 art. 16(e), unsealed intimate goods — which cannot be returned for reasons of health protection or hygiene — are excluded from the 14-day right of withdrawal.",
                    "In case of a manufacturing defect noted within 24 hours of receipt, contact us for repair or replacement under warranty terms.",
                    "For rentals, any damage is assessed individually and may be deducted partially or fully from the deposit.",
                ],
            },
            {
                heading: "6. Warranty and support",
                body: [
                    "Purchased pieces include 12 months of technical support for the skeleton and electronic modules.",
                    "The outer skin is warranted for 6 months against manufacturing defects under normal use and adherence to care instructions.",
                ],
            },
            {
                heading: "7. Limitation of liability",
                body: "The operator is not liable for misuse, failure to follow hygiene protocols or care instructions, or damage caused by the user. Contractual liability is capped at the order value.",
            },
            {
                heading: "8. Dispute resolution",
                body: [
                    "For complaints, contact us directly through the channels provided. If no amicable resolution is reached, you may refer to the Romanian National Authority for Consumer Protection (ANPC) or the SAL procedure.",
                    "For cross-border disputes you may use the EU ODR platform at ec.europa.eu/consumers/odr.",
                ],
            },
            {
                heading: "9. Changes to the terms",
                body: "We reserve the right to update these terms. The applicable version is the one published on the site at the time of the order. Material changes are announced with reasonable notice.",
            },
            {
                heading: "10. Contact",
                body: `For any questions about these terms, contact us at ${contactEmail} (operational) or ${dpo} (data protection).`,
            },
        ],
    };
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const tFooter = await getTranslations("footer");
    const tCheckout = await getTranslations("checkout");
    const settings = await getPublicPlatformSettings().catch(() => null);
    const operatorTerms = settings?.order_terms?.trim();
    const business = settings?.business_name ?? LEGAL_OPERATOR_NAME;
    const contactEmail = settings?.contact_email ?? LEGAL_IDENTIFIERS.contactEmail;

    const dict = buildDict(locale, business, contactEmail);
    const lastUpdated = formatLastUpdated(locale);
    const updatedLabel =
        locale === "ro"
            ? `Ultima actualizare: ${lastUpdated}`
            : locale === "nl"
              ? `Laatst bijgewerkt: ${lastUpdated}`
              : `Last updated: ${lastUpdated}`;

    return (
        <LegalPage
            eyebrow={dict.eyebrow}
            title={tFooter("terms")}
            intro={dict.intro}
            lastUpdated={updatedLabel}
            sections={dict.sections}
            tocLabel={dict.toc}
            operatorBlock={
                operatorTerms ? (
                    <aside className="mb-10 rounded-2xl border border-silk-300 bg-silk-100 p-6">
                        <h2 className="font-heading text-lg font-semibold text-velvet-900">
                            {tCheckout("orderTerms")}
                        </h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-silk-800">
                            {operatorTerms}
                        </p>
                    </aside>
                ) : null
            }
        />
    );
}
