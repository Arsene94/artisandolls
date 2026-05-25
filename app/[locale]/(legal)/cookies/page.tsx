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
        title: t("cookies"),
        alternates: {
            canonical: localeUrl(siteUrl, locale, "/cookies"),
            languages: localeAlternates(siteUrl, "/cookies"),
        },
        robots: { index: true, follow: true },
    };
}

export default async function CookiesPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    const tFooter = await getTranslations("footer");

    const dict = {
        ro: {
            eyebrow: "Politica de cookies",
            updated: "Ultima actualizare: 25 mai 2026",
            intro: "Folosim un set minim de cookies pentru a opera site-ul și, opțional, cookies anonime de analiză. Mai jos găsiți detaliile complete.",
            sections: [
                {
                    heading: "Cookies strict necesare",
                    body: "Sunt esențiale pentru funcționarea site-ului (autentificare în zona admin, alegerea limbii, preferințele de checkout). Aceste cookies nu pot fi dezactivate.",
                },
                {
                    heading: "Cookies de analiză (opționale)",
                    body: "Le folosim doar dacă acceptați explicit, pentru a măsura agregat traficul și a îmbunătăți site-ul. Datele sunt anonimizate, fără identificare individuală.",
                },
                {
                    heading: "Cum vă gestionați preferințele",
                    body: "Puteți accepta sau respinge cookies-urile de analiză din bannerul afișat la prima vizită. Setarea se salvează în browser și o puteți modifica oricând prin link-ul „Gestionează cookies” din subsolul site-ului.",
                },
                {
                    heading: "Cookies terțe",
                    body: "Nu utilizăm cookies de publicitate sau profilare. Nu transmitem date despre vizitele dvs. către rețele de advertising.",
                },
            ],
        },
        en: {
            eyebrow: "Cookie policy",
            updated: "Last updated: 25 May 2026",
            intro: "We use a minimal set of cookies to operate the site and, optionally, anonymous analytics cookies. Full details below.",
            sections: [
                {
                    heading: "Strictly necessary cookies",
                    body: "Essential for the site to function (admin authentication, language selection, checkout preferences). These cannot be disabled.",
                },
                {
                    heading: "Analytics cookies (optional)",
                    body: "Used only if you explicitly accept, to aggregate traffic measurement and improve the site. Data is anonymised, no individual identification.",
                },
                {
                    heading: "How to manage preferences",
                    body: "You can accept or decline analytics cookies in the banner shown on your first visit. The setting is stored in your browser and you can change it any time via the \"Manage cookies\" link in the site footer.",
                },
                {
                    heading: "Third-party cookies",
                    body: "We do not use advertising or profiling cookies. We do not transmit information about your visits to advertising networks.",
                },
            ],
        },
        nl: {
            eyebrow: "Cookiebeleid",
            updated: "Laatst bijgewerkt: 25 mei 2026",
            intro: "We gebruiken een minimale set cookies om de site te laten werken en, optioneel, anonieme analytische cookies. Volledige details vindt u hieronder.",
            sections: [
                {
                    heading: "Strikt noodzakelijke cookies",
                    body: "Essentieel voor de werking van de site (beheerderslogin, taalkeuze, checkout-voorkeuren). Deze kunnen niet worden uitgeschakeld.",
                },
                {
                    heading: "Analytische cookies (optioneel)",
                    body: "Worden alleen gebruikt als u uitdrukkelijk akkoord gaat, om verkeer geaggregeerd te meten en de site te verbeteren. Gegevens zijn geanonimiseerd, zonder individuele identificatie.",
                },
                {
                    heading: "Voorkeuren beheren",
                    body: "U kunt analytische cookies accepteren of weigeren via de banner die bij uw eerste bezoek verschijnt. De instelling wordt in uw browser bewaard en kan op elk moment worden gewijzigd via de link „Cookies beheren” in de voettekst.",
                },
                {
                    heading: "Cookies van derden",
                    body: "We gebruiken geen advertentie- of profileringscookies. We sturen geen informatie over uw bezoeken naar advertentienetwerken.",
                },
            ],
        },
    } as const;

    const content = dict[locale] ?? dict.en;

    return (
        <LegalPage
            eyebrow={content.eyebrow}
            title={tFooter("cookies")}
            intro={content.intro}
            lastUpdated={content.updated}
            sections={[...content.sections]}
        />
    );
}
