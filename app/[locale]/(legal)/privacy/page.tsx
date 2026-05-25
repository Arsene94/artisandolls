import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { getPublicPlatformSettings } from "@/lib/settings";
import {
    LEGAL_IDENTIFIERS,
    LEGAL_OPERATOR_NAME,
    SUBPROCESSORS,
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
        title: t("privacy"),
        alternates: {
            canonical: localeUrl(siteUrl, locale, "/privacy"),
            languages: localeAlternates(siteUrl, "/privacy"),
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

function subprocessorLines(locale: Locale) {
    return SUBPROCESSORS.map((sp) => {
        const purpose = sp.purpose;
        const region = sp.region;
        if (locale === "ro") return `${sp.name} — ${purpose}. Regiune: ${region}.`;
        if (locale === "nl") return `${sp.name} — ${purpose}. Regio: ${region}.`;
        return `${sp.name} — ${purpose}. Region: ${region}.`;
    });
}

function buildDict(locale: Locale, business: string, contactEmail: string): Dict {
    const dpo = LEGAL_IDENTIFIERS.dpoEmail;

    if (locale === "ro") {
        return {
            eyebrow: "Politica de confidențialitate",
            toc: "Pe această pagină",
            intro: `${business} prelucrează datele dvs. personale strict pentru a stabili logistica și pentru a vă contacta privind cererile dvs. Această politică explică ce date colectăm, de ce și pentru cât timp.`,
            sections: [
                {
                    heading: "1. Operatorul datelor",
                    body: `Operatorul datelor cu caracter personal este ${business} (${LEGAL_OPERATOR_NAME}). Contact operațional: ${contactEmail}. Responsabil cu protecția datelor (DPO): ${dpo}.`,
                },
                {
                    heading: "2. Ce date colectăm",
                    body: [
                        {
                            type: "list",
                            items: [
                                "Date de identificare: nume sau pseudonim, telefon, opțional email.",
                                "Date de logistică: județ, oraș, adresă de livrare, interval orar preferat.",
                                "Date despre comandă: piese alese, personalizări, perioada de închiriere.",
                                "Date tehnice minime: tip browser, limbă, dată/oră.",
                                "Date de verificare a vârstei: răspunsul „peste 18 ani”, păstrat 30 de zile într-un cookie local (nu colectăm data de naștere).",
                            ],
                        },
                    ],
                },
                {
                    heading: "3. Temei legal și scop",
                    body: "Prelucrăm datele pe baza consimțământului explicit la trimiterea formularului (art. 6 alin. 1 lit. a GDPR) și pentru executarea contractului dintre părți (art. 6 alin. 1 lit. b). Nu folosim datele în scop de marketing.",
                },
                {
                    heading: "4. Cât timp păstrăm datele",
                    body: "Datele de comandă: 30 de zile după finalizarea livrării sau ridicării. Datele de facturare: 5 ani conform legislației fiscale. Cookie-urile non-esențiale (analiză): șterse la 13 luni sau imediat la retragerea consimțământului.",
                },
                {
                    heading: "5. Subprocesatori (Art. 28 GDPR)",
                    body: [
                        "Pentru funcționarea serviciului colaborăm cu următorii subprocesatori, cu acorduri de prelucrare conforme:",
                        { type: "list", items: subprocessorLines("ro") },
                        "Pentru notificarea internă a consilierilor folosim WhatsApp Business API (Meta Ireland Ltd.). Numărul de telefon și un sumar al comenzii sunt transmise prin această platformă.",
                    ],
                },
                {
                    heading: "6. Transferuri internaționale",
                    body: "Subprocesatorii pot opera în afara SEE. În aceste cazuri folosim Clauze Contractuale Standard ale UE și măsuri tehnice suplimentare (criptare în tranzit, minimizare).",
                },
                {
                    heading: "7. Drepturile dvs.",
                    body: [
                        "Aveți dreptul de:",
                        {
                            type: "list",
                            items: [
                                "acces la datele dvs.;",
                                "rectificare;",
                                "ștergere („dreptul de a fi uitat”);",
                                "restricționarea prelucrării;",
                                "portabilitatea datelor;",
                                "opoziție și retragerea consimțământului;",
                                "depunere a unei plângeri la ANSPDCP (anspdcp.ro).",
                            ],
                        },
                        `Pentru exercitarea drepturilor, scrieți la ${dpo}.`,
                    ],
                },
                {
                    heading: "8. Securitate",
                    body: "Folosim TLS 1.2+ pe toate conexiunile, criptare la repaus pentru baza de date, autentificare strictă cu 2FA pentru personalul intern și principiul minimizării. Adresele IP de utilizator nu sunt înregistrate operațional.",
                },
                {
                    heading: "9. Modificări",
                    body: "Această politică poate fi actualizată. Versiunea curentă este cea publicată pe această pagină. Modificările materiale sunt comunicate prin canalele de contact disponibile.",
                },
            ],
        };
    }

    if (locale === "nl") {
        return {
            eyebrow: "Privacybeleid",
            toc: "Op deze pagina",
            intro: `${business} verwerkt uw persoonsgegevens uitsluitend om de logistiek te regelen en om contact met u op te nemen over uw aanvragen. Dit beleid legt uit welke gegevens we verzamelen, waarom en hoelang.`,
            sections: [
                {
                    heading: "1. Verwerkingsverantwoordelijke",
                    body: `De verwerkingsverantwoordelijke is ${business} (${LEGAL_OPERATOR_NAME}). Operationeel contact: ${contactEmail}. Functionaris gegevensbescherming (DPO): ${dpo}.`,
                },
                {
                    heading: "2. Welke gegevens verzamelen we",
                    body: [
                        {
                            type: "list",
                            items: [
                                "Identificatie: naam of pseudoniem, telefoonnummer, optioneel e-mailadres.",
                                "Logistiek: provincie, plaats, bezorgadres, voorkeurstijdvenster.",
                                "Bestelgegevens: gekozen stukken, aanpassingen, huurperiode.",
                                "Minimale technische gegevens: browsertype, taal, datum/tijd.",
                                "Leeftijdsverificatie: het antwoord „18+”, 30 dagen bewaard in een lokale cookie (we verzamelen geen geboortedatum).",
                            ],
                        },
                    ],
                },
                {
                    heading: "3. Rechtsgrondslag en doel",
                    body: "Wij verwerken gegevens op grond van uw uitdrukkelijke toestemming bij het indienen van het formulier (art. 6 lid 1 sub a AVG) en voor de uitvoering van de overeenkomst (art. 6 lid 1 sub b). Wij gebruiken gegevens niet voor marketing.",
                },
                {
                    heading: "4. Bewaartermijn",
                    body: "Bestelgegevens: 30 dagen na levering of ophaling. Factureringsgegevens: 5 jaar zoals voorgeschreven door belastingwetgeving. Niet-essentiële cookies (analyse): 13 maanden of onmiddellijk bij intrekking van toestemming.",
                },
                {
                    heading: "5. Subverwerkers (AVG art. 28)",
                    body: [
                        "Voor de werking van de dienst werken we samen met de volgende subverwerkers, met conforme verwerkersovereenkomsten:",
                        { type: "list", items: subprocessorLines("nl") },
                        "Voor interne meldingen aan adviseurs gebruiken we de WhatsApp Business API (Meta Ireland Ltd.). Telefoonnummer en een samenvatting van de bestelling worden via dit platform verzonden.",
                    ],
                },
                {
                    heading: "6. Internationale doorgiften",
                    body: "Subverwerkers kunnen buiten de EER opereren. In dat geval gebruiken we EU-modelcontractbepalingen en aanvullende technische maatregelen (versleuteling in transit, minimalisatie).",
                },
                {
                    heading: "7. Uw rechten",
                    body: [
                        "U heeft het recht op:",
                        {
                            type: "list",
                            items: [
                                "inzage in uw gegevens;",
                                "rectificatie;",
                                "wissing („recht om vergeten te worden”);",
                                "beperking van de verwerking;",
                                "overdraagbaarheid;",
                                "bezwaar en intrekking van toestemming;",
                                "indiening van een klacht bij ANSPDCP (RO) of de AP (NL).",
                            ],
                        },
                        `Stuur uw verzoek naar ${dpo}.`,
                    ],
                },
                {
                    heading: "8. Beveiliging",
                    body: "We gebruiken TLS 1.2+ op alle verbindingen, versleuteling at-rest voor de database, strikte authenticatie met 2FA voor intern personeel en het principe van minimalisatie. IP-adressen worden niet operationeel gelogd.",
                },
                {
                    heading: "9. Wijzigingen",
                    body: "Dit beleid kan worden bijgewerkt. De huidige versie staat op deze pagina. Materiële wijzigingen worden via de beschikbare contactkanalen aangekondigd.",
                },
            ],
        };
    }

    return {
        eyebrow: "Privacy policy",
        toc: "On this page",
        intro: `${business} processes your personal data strictly to arrange logistics and to contact you about your requests. This policy explains what we collect, why, and for how long.`,
        sections: [
            {
                heading: "1. Data controller",
                body: `The data controller is ${business} (${LEGAL_OPERATOR_NAME}). Operational contact: ${contactEmail}. Data Protection Officer: ${dpo}.`,
            },
            {
                heading: "2. What data we collect",
                body: [
                    {
                        type: "list",
                        items: [
                            "Identification: name or pseudonym, phone, optional email.",
                            "Logistics: county, city, delivery address, preferred time window.",
                            "Order data: chosen pieces, customisations, rental period.",
                            "Minimal technical data: browser type, language, date/time.",
                            "Age verification: the “18+” answer, stored for 30 days in a local cookie (we do not collect date of birth).",
                        ],
                    },
                ],
            },
            {
                heading: "3. Lawful basis and purpose",
                body: "We process data based on your explicit consent on form submission (GDPR art. 6(1)(a)) and to perform the contract between us (art. 6(1)(b)). We do not use data for marketing.",
            },
            {
                heading: "4. Retention",
                body: "Order data: 30 days after delivery or pickup. Invoicing data: 5 years per tax law. Non-essential cookies (analytics): 13 months or immediately upon consent withdrawal.",
            },
            {
                heading: "5. Subprocessors (GDPR Art. 28)",
                body: [
                    "We rely on the following subprocessors under compliant data-processing agreements:",
                    { type: "list", items: subprocessorLines("en") },
                    "For internal notifications to advisors we use the WhatsApp Business API (Meta Ireland Ltd.). Phone number and an order summary are sent through this platform.",
                ],
            },
            {
                heading: "6. International transfers",
                body: "Subprocessors may operate outside the EEA. In those cases we rely on EU Standard Contractual Clauses and additional technical measures (in-transit encryption, minimisation).",
            },
            {
                heading: "7. Your rights",
                body: [
                    "You have the right to:",
                    {
                        type: "list",
                        items: [
                            "access to your data;",
                            "rectification;",
                            "erasure (“right to be forgotten”);",
                            "restriction of processing;",
                            "data portability;",
                            "object and withdraw consent;",
                            "lodge a complaint with the Romanian DPA (ANSPDCP).",
                        ],
                    },
                    `Write to ${dpo} to exercise these rights.`,
                ],
            },
            {
                heading: "8. Security",
                body: "We use TLS 1.2+ for every connection, at-rest encryption for the database, strict 2FA authentication for staff, and the minimisation principle. User IP addresses are not logged operationally.",
            },
            {
                heading: "9. Changes",
                body: "This policy may be updated. The current version is the one published on this page. Material changes are announced via the available contact channels.",
            },
        ],
    };
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const tFooter = await getTranslations("footer");
    const tCheckout = await getTranslations("checkout");
    const settings = await getPublicPlatformSettings().catch(() => null);
    const operatorNote = settings?.privacy_note?.trim();
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
            title={tFooter("privacy")}
            intro={dict.intro}
            lastUpdated={updatedLabel}
            sections={dict.sections}
            tocLabel={dict.toc}
            operatorBlock={
                operatorNote ? (
                    <aside className="mb-10 rounded-2xl border border-silk-300 bg-silk-100 p-6">
                        <h2 className="font-heading text-lg font-semibold text-velvet-900">
                            {tCheckout("privacyNote")}
                        </h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-silk-800">
                            {operatorNote}
                        </p>
                    </aside>
                ) : null
            }
        />
    );
}
