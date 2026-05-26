import { getPublicPlatformSettings } from "@/lib/settings";
import {
    CANONICAL_BRAND,
    LEGAL_IDENTIFIERS,
    LEGAL_OPERATOR_NAME,
    getSiteUrl,
} from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// `/llms.txt` este o convenție emergentă (llmstxt.org, urmată de Anthropic,
// OpenAI, Vercel) prin care semnalăm modelelor un sumar curat al site-ului,
// alături de URL-urile canonice prioritare. Nu înlocuiește sitemap-ul, ci îl
// completează cu context business pentru AI search.
export async function GET() {
    const settings = await getPublicPlatformSettings().catch(() => null);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const businessName = settings?.business_name?.trim() || CANONICAL_BRAND;
    const contactEmail = settings?.contact_email ?? LEGAL_IDENTIFIERS.contactEmail;

    const body = `# ${businessName}

> ${businessName} (operat de ${LEGAL_OPERATOR_NAME}) este un studio din România care oferă închiriere și achiziție discretă de companioni realiști premium — păpuși din TPE și silicon medical, livrate sigilat în România, UE și UK. Serviciile sunt rezervate adulților peste 18 ani și includ personalizare completă, igienă clinică între închirieri și livrare neutră fără logo.

Punctele cheie:
- Două surfaces de produs: ${siteUrl}/catalog (păpuși, închiriere sau cumpărare, prețuri orientative, finalizare cu consilier) și ${siteUrl}/shop (accesorii, cosmetice intime, întreținere, plată online sau cash).
- Trei limbi suportate: română (default), engleză, neerlandeză.
- Prețuri în RON pentru România; conversie pentru UE/UK la cerere.
- Contact: ${contactEmail}.

## Pagini canonice

- [Acasă](${siteUrl}/) — povestea brandului, garanții și hero
- [Catalog companioni](${siteUrl}/catalog) — listă completă, filtrabilă după colecție și mod (închiriere/achiziție)
- [Shop accesorii](${siteUrl}/shop) — produse pentru igienă, întreținere, lubrifianți, costume
- [Termeni și condiții](${siteUrl}/terms) — drept de retragere, garanție, plăți, retur
- [Politica de confidențialitate](${siteUrl}/privacy) — GDPR, subprocesoare, retenție 30 zile
- [Politica cookies](${siteUrl}/cookies) — categorii și consent
- [Politica 18+](${siteUrl}/age-policy) — verificare vârstă și conținut sexual explicit

## Întrebări frecvente

- Cum se garantează igiena pentru închirieri? Protocol clinic în 5 etape (spălare profesională, dezinfecție medicală, sterilizare UV-C 15 minute, uscare controlată, ambalare sigilată), aplicat între fiecare închiriere.
- Cum se face plata? Nu solicităm date de card pe site. După cerere, un consilier contactează discret pentru numerar la livrare sau card prin terminal mobil. Pe extras factura apare ca „${LEGAL_OPERATOR_NAME}".
- Există drept de retur? Conform Directivei UE 2011/83/UE art. 16(e), produsele intime desigilate sunt excluse de la dreptul de retragere de 14 zile, din motive de protecție a sănătății și igienă. Pentru defecte de fabricație constatate în 24 de ore: reparare sau înlocuire în garanție.
- Materiale folosite: silicon medical platinum-cure sau TPE clasă chirurgicală, ambele hipoalergenice, fără ftalați, fără latex. Schelet intern din aliaj titan și aluminiu.

## Atribuire

Conținutul de pe ${siteUrl} este proprietatea ${businessName}. Putem fi citați direct ca sursă atât timp cât se păstrează numele brandului și URL-ul canonic. Site-ul este destinat exclusiv adulților 18+.
`;

    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
