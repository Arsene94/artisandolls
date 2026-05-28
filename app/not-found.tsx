import { headers } from "next/headers";
import Link from "next/link";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

type Dict = {
    eyebrow: string;
    title: string;
    description: string;
    backHome: string;
    catalog: string;
};

const COPY: Record<Locale, Dict> = {
    ro: {
        eyebrow: "404 · pagină indisponibilă",
        title: "Pagina nu a fost găsită",
        description:
            "Pagina pe care o căutați nu mai există sau a fost mutată. Reveniți la prima pagină sau explorați catalogul.",
        backHome: "Înapoi acasă",
        catalog: "Vezi catalogul",
    },
    en: {
        eyebrow: "404 · page unavailable",
        title: "Page not found",
        description:
            "The page you were looking for is no longer available or has moved. Return home or browse the catalogue.",
        backHome: "Back home",
        catalog: "View catalogue",
    },
    nl: {
        eyebrow: "404 · pagina niet beschikbaar",
        title: "Pagina niet gevonden",
        description:
            "De pagina die u zocht bestaat niet meer of is verplaatst. Keer terug naar de startpagina of bekijk de catalogus.",
        backHome: "Terug naar home",
        catalog: "Bekijk de catalogus",
    },
    de: {
        eyebrow: "404 · Seite nicht verfügbar",
        title: "Seite nicht gefunden",
        description:
            "Die gesuchte Seite existiert nicht mehr oder wurde verschoben. Kehren Sie zur Startseite zurück oder erkunden Sie den Katalog.",
        backHome: "Zur Startseite",
        catalog: "Katalog ansehen",
    },
};

function pickLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return defaultLocale;
    const ranked = acceptLanguage
        .split(",")
        .map((chunk) => {
            const [tag, q] = chunk.trim().split(";q=");
            return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
        })
        .sort((a, b) => b.q - a.q);

    for (const { tag } of ranked) {
        const match = locales.find((l) => l === tag);
        if (match) return match;
    }
    return defaultLocale;
}

export default async function RootNotFound() {
    const headerList = await headers();
    const locale = pickLocale(headerList.get("accept-language"));
    const copy = COPY[locale];
    const home = locale === defaultLocale ? "/" : `/${locale}`;
    const catalog = locale === defaultLocale ? "/catalog" : `/${locale}/catalog`;

    return (
        <html lang={locale}>
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    background: "#0F0406",
                    color: "#FCFAF7",
                    fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    display: "grid",
                    placeItems: "center",
                    padding: "1.5rem",
                }}
            >
                <main role="main" style={{ maxWidth: "34rem", textAlign: "center" }}>
                    <p
                        style={{
                            letterSpacing: "0.32em",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            color: "#C9A24A",
                            margin: "0 0 1.5rem",
                        }}
                    >
                        {copy.eyebrow}
                    </p>
                    <h1
                        style={{
                            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                            lineHeight: 1.2,
                            margin: "0 0 1rem",
                            fontWeight: 600,
                        }}
                    >
                        {copy.title}
                    </h1>
                    <p
                        style={{
                            opacity: 0.78,
                            margin: "0 0 2rem",
                            lineHeight: 1.6,
                        }}
                    >
                        {copy.description}
                    </p>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <Link
                            href={home}
                            style={{
                                background: "#C9A24A",
                                color: "#0F0406",
                                borderRadius: "999px",
                                padding: "0.875rem 1.75rem",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                textDecoration: "none",
                            }}
                        >
                            {copy.backHome}
                        </Link>
                        <Link
                            href={catalog}
                            style={{
                                background: "transparent",
                                color: "#FCFAF7",
                                border: "1px solid rgba(252, 250, 247, 0.4)",
                                borderRadius: "999px",
                                padding: "0.875rem 1.75rem",
                                fontSize: "0.8rem",
                                fontWeight: 500,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                textDecoration: "none",
                            }}
                        >
                            {copy.catalog}
                        </Link>
                    </div>
                </main>
            </body>
        </html>
    );
}
