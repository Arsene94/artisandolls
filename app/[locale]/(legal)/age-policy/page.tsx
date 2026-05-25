import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSiteUrl, localeAlternates, localeUrl } from "@/lib/site";
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
        title: t("ageLimit"),
        alternates: {
            canonical: localeUrl(siteUrl, locale, "/age-policy"),
            languages: localeAlternates(siteUrl, "/age-policy"),
        },
        robots: { index: true, follow: true },
    };
}

export default async function AgePolicyPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const tFooter = await getTranslations("footer");

    const dict = {
        ro: {
            eyebrow: "Politica 18+",
            updated: "Ultima actualizare: 25 mai 2026",
            intro: "Accesul la conținutul și serviciile acestui site este permis exclusiv persoanelor majore (peste 18 ani împliniți).",
            sections: [
                {
                    heading: "Acces și responsabilitate",
                    body: "Prin utilizarea platformei, declarați pe propria răspundere că aveți peste 18 ani. Confirmarea explicită este solicitată la plasarea oricărei cereri.",
                },
                {
                    heading: "Conținut destinat adulților",
                    body: "Site-ul prezintă produse și servicii destinate exclusiv unui public adult. Imaginile, descrierile și opțiunile de personalizare pot conține elemente nepotrivite pentru minori.",
                },
                {
                    heading: "Protecția minorilor",
                    body: "Recomandăm părinților și tutorilor să folosească soluții de control parental și să se asigure că minorii din grija lor nu accesează acest site.",
                },
                {
                    heading: "Sancțiuni",
                    body: "Orice tentativă de a accesa sau achiziționa servicii prin declarații false referitoare la vârstă va duce la anularea cererii și, după caz, la sesizarea autorităților competente.",
                },
            ],
        },
        en: {
            eyebrow: "18+ policy",
            updated: "Last updated: 25 May 2026",
            intro: "Access to the content and services of this site is permitted exclusively for adults (over 18).",
            sections: [
                {
                    heading: "Access and responsibility",
                    body: "By using the platform, you declare on your own responsibility that you are over 18. Explicit confirmation is required when placing any request.",
                },
                {
                    heading: "Adult content",
                    body: "The site presents products and services intended exclusively for an adult audience. Images, descriptions and customisation options may include elements unsuitable for minors.",
                },
                {
                    heading: "Protection of minors",
                    body: "We recommend that parents and guardians use parental-control solutions and ensure that minors in their care do not access this site.",
                },
                {
                    heading: "Consequences",
                    body: "Any attempt to access or purchase services through false statements regarding age will result in the cancellation of the request and, where applicable, notification of the competent authorities.",
                },
            ],
        },
        nl: {
            eyebrow: "18+ beleid",
            updated: "Laatst bijgewerkt: 25 mei 2026",
            intro: "Toegang tot de inhoud en diensten van deze site is uitsluitend toegestaan voor volwassenen (18+).",
            sections: [
                {
                    heading: "Toegang en verantwoordelijkheid",
                    body: "Door gebruik te maken van het platform verklaart u op eigen verantwoordelijkheid ouder dan 18 te zijn. Bij elke aanvraag is een uitdrukkelijke bevestiging vereist.",
                },
                {
                    heading: "Inhoud voor volwassenen",
                    body: "Op de site worden producten en diensten getoond die uitsluitend bedoeld zijn voor een volwassen publiek. Afbeeldingen, beschrijvingen en aanpassingsopties kunnen elementen bevatten die ongeschikt zijn voor minderjarigen.",
                },
                {
                    heading: "Bescherming van minderjarigen",
                    body: "We raden ouders en voogden aan om oplossingen voor ouderlijk toezicht te gebruiken en ervoor te zorgen dat minderjarigen onder hun hoede deze site niet bezoeken.",
                },
                {
                    heading: "Gevolgen",
                    body: "Elke poging om toegang te krijgen tot of diensten aan te schaffen via valse verklaringen over leeftijd leidt tot annulering van de aanvraag en, waar van toepassing, melding aan de bevoegde autoriteiten.",
                },
            ],
        },
    } as const;

    const content = dict[locale] ?? dict.en;

    return (
        <LegalPage
            eyebrow={content.eyebrow}
            title={tFooter("ageLimit")}
            intro={content.intro}
            lastUpdated={content.updated}
            sections={[...content.sections]}
        />
    );
}
