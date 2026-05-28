# PROMPT MASTER — REDESIGN AXELHIDROCONS.RO ÎN NEXT.JS

> **Rol pe care îl asumi:** Ești un Senior Product Designer & Front-End Architect cu peste 10 ani de experiență în redesign de site-uri pentru companii B2B din construcții și industrie grea. Ai livrat proiecte pentru branduri precum Sika, Knauf, BCR, Holcim. Stăpânești la nivel expert: design systems (Figma + Tokens Studio), Next.js 14+ (App Router, RSC, Server Actions), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, accesibilitate WCAG 2.2 AA, Core Web Vitals și SEO tehnic pentru piața din România.
>
> **Ce am de făcut:** Vei livra un redesign complet — strategie + UX + UI + implementare tehnică — al site-ului **axelhidrocons.ro**, o firmă din București specializată în hidroizolații bituminoase și PVC (peste 18 ani experiență, portofoliu cu Ministerul Transporturilor, Plaza Mall, Parcul Carol).
>
> **Tonul livrabilului:** profesional, ferm, fără jargon inutil, cu rationale pentru fiecare decizie. Nu omite NIMIC. Dacă există ambiguitate, propune cea mai bună variantă și justifică.

---

## 1. CONTEXT DE BUSINESS & DIAGNOSTIC AL SITE-ULUI EXISTENT

### 1.1 Despre client
- **Companie:** Axel Hidro Cons SRL
- **Sediu:** Drumul Săbăreni 24-26, Sector 6, București
- **Domeniu:** Hidroizolații profesionale (bituminoase, PVC, sintetice, lichide), termohidroizolații, săpături mecanizate, mentenanță panouri solare, montaj atice
- **Vechime în piață:** 18+ ani
- **Volum executat:** peste 300.000 m²
- **Garanții acordate:** până la 25 ani
- **Tagline existent:** „Poate nu suntem cei mai ieftini, dar suntem cei mai buni meseriași"
- **Parteneri/furnizori:** Sika, Ceresit, Den Braven, General Membrane, Soudal
- **Proiecte de referință:** Ministerul Transporturilor (corp principal + corp 2 și 3), Plaza Mall România, Cartierul Parcul Carol, hale industriale Cristian/Vălenii de Munte, clădiri rezidențiale Iancu de Hunedoara

### 1.2 Probleme identificate pe site-ul actual
Inventariază problemele actuale și menționează-le explicit în briefingul de design pentru a justifica redesignul:
1. Stack învechit: WordPress + Slider Revolution 5.4 (vulnerabil, lent, dependent de plugin-uri externe).
2. Lipsă de ierarhie vizuală: heroul amestecă 3 titluri concurente, fără un CTA dominant.
3. Tipografie generică, fără personalitate, fără sistem (mix arbitrar de greutăți).
4. Iconografia este stock-icon-pack — nu reflectă autoritatea de „18 ani și 300.000 m²".
5. Portofoliul cu cele mai puternice proiecte (Ministerul Transporturilor, Plaza Mall) este îngropat în grid plat, fără storytelling, fără cifre, fără context tehnic.
6. Lipsesc dovezile sociale puternice: nu există un counter animat coerent, logo wall-ul de furnizori este mic și plasat ca afterthought.
7. Formularul de ofertă nu are micro-conversii intermediare (telefon-to-call cu confirmare, WhatsApp, callback).
8. Nu există schema markup pentru LocalBusiness, Service, Review.
9. SEO on-page slab — meta-uri scurte, fără pillar pages, fără ancore interne strategice.
10. UX mobile: meniul este greoi (dublu nested), CTA-ul de telefon nu este fixed în viewport pe scroll.
11. Imagini servite ne-lazy, fără AVIF/WebP la rezoluții corecte → LCP probabil > 4s.
12. Lipsă de calculator orientativ de preț / configurator de tip „spune-mi în 4 pași ce ai nevoie".
13. Lipsă strategie de trust: nu există certificări vizibile, ANRE, ISO, asigurări de răspundere, contracte-cadru cu firme mari.

---

## 2. OBIECTIVE DE BUSINESS & KPI

Tot designul se subordonează acestor KPI. Marchează în fiecare livrabil cum contribuie la ei.

| # | Obiectiv | KPI măsurabil | Ținta la 90 zile post-launch |
|---|----------|---------------|------------------------------|
| O1 | Crește lead-uri calificate (B2B + rezidențial premium) | Trimiteri formular „Cere ofertă" | +120% vs. baseline |
| O2 | Crește call-uri direct din site | Click-to-call tracked (gtag event) | +80% |
| O3 | Scade bounce rate pe paginile de servicii | Bounce rate < 45% pe top 5 pagini | de la ~70% |
| O4 | Poziționare pe „hidroizolatii Bucuresti", „hidroizolatie terasa", „hidroizolatie membrana PVC" | Top 3 în SERP | top 3 organic |
| O5 | Core Web Vitals — pass pe toate metricile | LCP < 2.0s, INP < 200ms, CLS < 0.05 | 100% green pe CrUX |
| O6 | Calitate brand percepută | NPS dintr-un mini-survey post-cotație | > 60 |
| O7 | Operational efficiency | Timpul mediu de la lead la cotație | < 4h în orele de program |

---

## 3. AUDIENȚĂ ȚINTĂ & BUYER PERSONAS

Construiește 3 personas detaliate. Pentru fiecare specifică: scenariu de intrare, întrebări mentale, obiecții, dovezi necesare, CTA preferat.

### Persona 1 — „Constructorul general" (B2B principal)
- **Rol:** Project manager / Director tehnic la antrepriză generală
- **Vârstă:** 38–55
- **Job-to-be-done:** Selectează subantreprenor de hidroizolații pentru un proiect rezidențial sau industrial; vrea calitate, garanție extinsă, capacitate de execuție rapidă, facturare la zi
- **Întrebări mentale:** „Au făcut proiecte similare ca scară? Au asigurare de răspundere civilă profesională? Pot semna contract cu clauze penalizatoare?"
- **Dovezi necesare:** case studies cu m², durată, sistem aplicat, fișe tehnice; certificări ISO 9001/14001/45001; lista de utilaje proprii
- **CTA preferat:** „Cere ofertă personalizată" + upload plan de proiect

### Persona 2 — „Administratorul de asociație / Property manager"
- **Rol:** Administrator bloc, manager imobiliar
- **Vârstă:** 35–60
- **Job-to-be-done:** Reparație terasă bloc sau hidroizolație generală în regim de urgență după infiltrații
- **Întrebări mentale:** „Cât costă pe m²? Cât durează? Există garanție pentru lucrare? Trebuie să evacuez locatarii?"
- **Dovezi necesare:** prețuri orientative, durata execuției pe m², before/after, testimoniale de la asociații (există deja — Victoria Business Center)
- **CTA preferat:** „Programează evaluare gratuită" cu drone inspection

### Persona 3 — „Proprietarul rezidențial premium"
- **Rol:** Proprietar casă/duplex în Pipera, Băneasa, Cotroceni
- **Vârstă:** 35–60
- **Job-to-be-done:** Hidroizolație terasă verde, fundație, sau reparație după infiltrații în casă nouă
- **Întrebări mentale:** „Vor strica peisagistica? Cât e ciclul total? Ce membrană recomandă pentru terasă circulabilă cu deck?"
- **Dovezi necesare:** finisaje fine, soluții pentru terasă verde, integrare cu peisagistica, garanție în scris
- **CTA preferat:** „Discută cu un consultant" (telefon, WhatsApp, formular cu upload poze)

---

## 4. STRATEGIE DE POZIȚIONARE & MESAJE-CHEIE

### 4.1 Poziționare
> **„Hidroizolații care țin cât clădirea. Garanție până la 25 de ani, executate de oameni care fac asta de 18 ani."**

Asta înlocuiește vechiul tagline „Poate nu suntem cei mai ieftini" (care este defensiv și subminează prețul) cu o promisiune de durabilitate care justifică prețul.

### 4.2 Piloni de mesaj (folosește-i ca repetare structurată în UI)
1. **Durabilitate dovedită** — garanție extinsă, materiale top-tier (Sika, General Membrane)
2. **Scară reală** — 300.000+ m² executați, instituții și mall-uri în portofoliu
3. **Echipă proprie** — nu intermediar, nu subcontractăm execuția
4. **Răspuns rapid** — evaluare pe șantier în 48h, ofertă în maxim 4h în program

### 4.3 Tonul vocii
- **Caracter:** Direct, tehnic, fără floricele, dar uman. Vorbim ca un meseriaș cu 18 ani de experiență, nu ca un agent de marketing.
- **Persoană:** „Noi" și „echipa noastră" — niciodată „compania noastră" sau „organizația".
- **Verbe preferate:** executăm, montăm, garantăm, evaluăm, livrăm.
- **Verbe de evitat:** oferim, propunem, asigurăm un suport.
- **Diacritice:** obligatoriu peste tot (ș, ț, ă, â, î) — actualul site nu le folosește.

---

## 5. IDENTITATE VIZUALĂ

### 5.1 Paletă de culori (cu motiv pentru fiecare)
Construiește o paletă industrial-premium care să comunice masculinitate calmă, încredere, tehnică. NU folosi portocaliu/galben țipător „construction cliché".

| Token | Hex | Rol | Folosire |
|-------|-----|-----|----------|
| `--bitumen-900` | `#0E1014` | Negru bituminos | Background hero, footer, headerul după scroll |
| `--bitumen-700` | `#1C2128` | Antracit | Carduri pe dark mode, secțiuni „about" |
| `--steel-500` | `#3A4452` | Steel mid | Borders, secondary text pe light |
| `--steel-300` | `#8A95A5` | Steel light | Caption, metadata, label |
| `--cement-100` | `#F4F5F7` | Cement off-white | Background light section |
| `--cement-50` | `#FAFBFC` | Quasi-white | Cards pe light bg |
| `--accent-amber` | `#E8A33D` | Amber industrial | CTA primar, focus state, accents |
| `--accent-amber-dark` | `#B57814` | Amber hover | Hover pe CTA primar |
| `--success-green` | `#2F7D32` | Verde semaforic | Confirmări, garanție |
| `--warning-rust` | `#B54810` | Roșu cărămidă | Stările critice, „atenție infiltrații" |

**Rationale:** Bitumen-ul ca culoare de bază reflectă literal materialul; amberul evoacă caldura sudării cu flacără pe membrană; verdele este atipic pentru sector → diferențiere.

### 5.2 Tipografie

| Familie | Folosire | Greutăți | Fallback |
|---------|----------|----------|----------|
| **Inter** (Variable) | UI, body, caption | 400, 500, 600, 700 | system-ui, sans-serif |
| **Manrope** (Variable) | Display, headings H1–H3 | 600, 700, 800 | Inter, sans-serif |
| **JetBrains Mono** | Numere mari (counters, m²), spec sheets | 500, 700 | ui-monospace |

**Scala (modular scale 1.250 — major third):**
- `--text-xs` 12px / 16
- `--text-sm` 14px / 20
- `--text-base` 16px / 26
- `--text-lg` 18px / 28
- `--text-xl` 20px / 30
- `--text-2xl` 24px / 32
- `--text-3xl` 30px / 38
- `--text-4xl` 38px / 46
- `--text-5xl` 48px / 56
- `--text-6xl` 60px / 68
- `--text-7xl` 72px / 80 (doar hero desktop)

**Reguli:**
- H1 doar Manrope 700, tracking -0.02em
- Body Inter 400, măsurare 65–75 caractere/linie
- Numerele (300.000 m², 25 ani, 18 ani) folosesc JetBrains Mono pentru a comunica „spec sheet"
- NU folosi `<small>` pentru disclaimers — folosește componentă dedicată `<Caption>` cu Inter 500 12px steel-500

### 5.3 Iconografie
- **Bibliotecă:** Lucide React (open source, consistent stroke 1.5)
- **Iconuri custom necesare:** 3 iconuri SVG desenate manual pentru cele trei tipuri de membrană (bituminoasă, PVC, lichidă) — în stil line art 1.5px, identice ca proporții cu Lucide
- **Mărimi standard:** 16, 20, 24, 32, 48
- **Color:** moștenesc currentColor

### 5.4 Fotografie & video
- **Stil obligatoriu:** Toate fotografiile de pe șantier — pe vreme bună, lumină naturală laterală (golden hour preferat), cu echipa Axel în uniformă (creează identitate vizuală pentru uniformă: tricou negru cu logo amber pe spate, pantalon antracit).
- **Compoziție:** 1/3 cer, 2/3 lucrare. Evită compoziții centrate plictisitoare.
- **Inițiere bibliotecă:** rebriefiază fotograful pentru 1 zi de teren pe 3 șantiere active. Costă ~600 EUR și schimbă complet percepția brandului.
- **Drone footage** obligatoriu pentru hero și pentru portofoliul mall-uri/ministere.
- **Before/After:** componentă slider cu drag, NU două imagini juxtapuse.
- **Format livrare:** AVIF primary, WebP fallback, JPEG ultim fallback. Servire via `next/image` cu `sizes` corect pe fiecare punct.

### 5.5 Logo
- Logo-ul actual este șters și ilizibil în meta. Propune **refresh** (nu rebrand):
    - Wordmark Manrope 800, „AXEL" amber + „HIDRO CONS" steel-300
    - Symbol opțional: un strat de membrană simplificat în diagonală 15°
    - Variants: full, mark-only, monochrome (light & dark)
    - Spațiu de respirație = înălțimea literei „A"

---

## 6. SISTEM DE DESIGN (DESIGN TOKENS)

Livrează un `tokens.json` în formatul **W3C Design Tokens Community Group** + export Tailwind config. Tokenii includ: color, typography, spacing, radius, shadow, motion, breakpoint, z-index.

### 6.1 Spacing (4px base grid)
`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160`

### 6.2 Radius
- `--radius-sm` 4px (input, badges)
- `--radius-md` 8px (cards)
- `--radius-lg` 16px (modals, hero panels)
- `--radius-full` 9999px (chips, avatar, buton pill)

### 6.3 Shadow (subtilă, nu fluffy)
- `--shadow-xs` `0 1px 2px rgba(14,16,20,0.06)`
- `--shadow-sm` `0 2px 8px rgba(14,16,20,0.08)`
- `--shadow-md` `0 8px 24px rgba(14,16,20,0.10)`
- `--shadow-lg` `0 24px 48px rgba(14,16,20,0.12)`

### 6.4 Motion
- Durata standard: 200ms; tranziții lente: 400ms
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (out-quint) pentru UI; `cubic-bezier(0.32, 0, 0.67, 0)` pentru exit
- Respect `prefers-reduced-motion`

### 6.5 Breakpoints
- `sm` 640px
- `md` 768px
- `lg` 1024px
- `xl` 1280px
- `2xl` 1536px
- Container max-width: 1280px desktop, padding inline 24px mobile / 48px desktop

### 6.6 Z-index scale (named)
`base 0, raised 10, dropdown 20, sticky 30, drawer 40, modal 50, popover 60, toast 70`

---

## 7. ARHITECTURA INFORMAȚIEI & SITEMAP

```
/
├── /                              (Home)
├── /despre                        (Despre noi)
├── /servicii                      (Servicii — overview)
│   ├── /servicii/membrane-bituminoase
│   ├── /servicii/membrane-pvc-sintetice
│   ├── /servicii/hidroizolatie-acoperis
│   ├── /servicii/hidroizolatie-terasa
│   │   ├── /servicii/hidroizolatie-terasa/circulabile
│   │   ├── /servicii/hidroizolatie-terasa/necirculabile
│   │   ├── /servicii/hidroizolatie-terasa/verzi
│   │   ├── /servicii/hidroizolatie-terasa/monostrat
│   │   └── /servicii/hidroizolatie-terasa/dublustrat
│   ├── /servicii/hidroizolatie-fundatii
│   ├── /servicii/hidroizolatie-poduri-pasaje-parcari
│   ├── /servicii/bariera-de-vapori
│   ├── /servicii/reparatii-hidroizolatii
│   ├── /servicii/termohidroizolatii
│   ├── /servicii/sapaturi
│   ├── /servicii/mentenanta-panouri-solare
│   └── /servicii/montaj-atice
├── /portofoliu                    (Grid cu filtre)
│   └── /portofoliu/[slug]         (Case study individual)
├── /resurse                       (Hub educațional — pillar pages)
│   ├── /resurse/ghid-hidroizolatie-terasa
│   ├── /resurse/cum-aleg-membrana
│   ├── /resurse/cost-hidroizolatie-2026
│   └── /resurse/blog/[slug]
├── /cere-oferta                   (Configurator în 4 pași)
├── /contact
├── /testimoniale
├── /garantii-si-certificari       (Trust page — NOU)
└── /[utility pages: cookies, politica-de-confidentialitate, gdpr]
```

**Strategie SEO:** /resurse devine motorul de trafic organic informational; /servicii/* sunt paginile commercial-intent; /cere-oferta este conversia finală.

---

## 8. SPECIFICAȚII PAGINĂ CU PAGINĂ (UX + UI)

### 8.1 HOMEPAGE (/)

**Scop:** Comunică în 5 secunde: ce facem, pentru cine, de ce noi.

**Stratificare:**

**Hero (100vh desktop, 85vh mobile)**
- Background: video full-bleed muted autoplay, 8 sec loop, drone shot peste o terasă cu echipa lucrând. Fallback: poster JPEG/AVIF de înaltă calitate.
- Overlay: gradient linear `from-bitumen-900/80 to-bitumen-900/30`
- Conținut:
    - Eyebrow Manrope 600 14px tracking 0.16em uppercase amber: „HIDROIZOLAȚII PROFESIONALE • BUCUREȘTI"
    - H1 Manrope 800 72/60/40px (xl/lg/sm): „Hidroizolații care țin cât clădirea."
    - Sub Inter 400 20px steel-300: „Membrane bituminoase și PVC pentru terase, fundații, hale industriale și instituții. Garanție până la 25 de ani."
    - CTA primar (amber, large): „Cere ofertă în 4 ore"
    - CTA secundar (ghost): „Vezi portofoliul" cu icon arrow-right
    - Trust strip jos: 5 logo-uri parteneri (Sika, Ceresit, Den Braven, General Membrane, Soudal) cu opacitate 0.7
- Micro-interacțiune: counter pe scroll indicator (chevron animat), parallax pe video la 0.15 speed

**Bandă proof (sticky după hero, înălțime 96px)**
- 4 metrici JetBrains Mono 36px: `18+ ani` • `300.000+ m²` • `25 ani garanție` • `200+ proiecte`
- Pe scroll devine sticky 8px high, doar cifrele, fundal bitumen-900 cu blur backdrop

**Secțiunea servicii (8 categorii reorganizate)**
- Grid 4×2 desktop, 2×4 tablet, 1×8 mobile
- Card: ilustrație SVG custom (nu icon stock), titlu Manrope 600 20px, descriere Inter 14px 2 rânduri, link „Detalii →" amber care apare la hover
- Hover state: card se ridică 4px, shadow-md, border accent-amber stânga 4px slide-in din 0 la 4px width

**Secțiunea „Cum lucrăm" — proces în 5 pași**
- Numerotare mare JetBrains Mono 96px steel-300/30
- 5 pași: (1) Apel / formular → (2) Evaluare pe șantier 48h → (3) Cotație detaliată pe m² → (4) Execuție cu echipa noastră → (5) Garanție scrisă & follow-up la 12 luni
- Layout: scrollytelling orizontal pe desktop (snap), vertical stack pe mobile, cu progress line verticală pe stânga

**Showcase proiecte (3 carduri mari + link spre /portofoliu)**
- Featured: Ministerul Transporturilor, Plaza Mall, Cartier Parcul Carol
- Card: imagine 16:10 cu overlay gradient bottom, titlu proiect, badge categorie, m² executați, an
- Hover: imaginea scale 1.04 cu mask radial reveal pentru a expune o suprapunere amber a detaliilor tehnice
- Bottom CTA: „Vezi toate cele 50+ proiecte →"

**Secțiune comparație: De ce Axel vs. „concurența standard"**
- Tabel comparativ 4 rânduri × 3 coloane (Criteriu | Axel | Concurență standard)
- Criterii: Garanție (25 ani vs. 2 ani), Echipă (proprie vs. subcontractată), Materiale (top-tier vs. cel mai ieftin), Răspuns ofertă (4h vs. 3 zile)
- Iconuri check/x clare, fără ironie agresivă

**Testimoniale — slider „cititor"**
- Carduri 1 pe ecran desktop, full width, cu poză client + nume + funcție + firmă
- Quote mare Manrope 600 italic 28px
- Subliniază testimonialele B2B existente (Imago Comimpex, Solutions Group, Victoria Business Center, arh. Liviu Daneș, ing. Sorin Chirigiu)
- Logos firme client jos sub fiecare

**Mini-calculator orientativ**
- Componentă cu 3 input-uri: tip suprafață (dropdown: terasă/acoperiș/fundație/parcare), m² (slider 50–5000), tip membrană (bituminoasă/PVC/eu nu știu)
- Output: interval estimativ „45–80 RON/m²" + disclaimer „Cotație finală după evaluare pe șantier"
- CTA: „Primește cotație exactă în 4h"

**Bloc trust extins**
- Logo wall furnizori (5 logos, animat orizontal subtil)
- Certificări: ISO 9001, ISO 14001, ISO 45001 (placeholders dacă nu există încă; recomandare strategică: obține-le)
- Membru asociație: ARACO, Patronatul Construcțiilor (de verificat)
- Asigurare răspundere profesională Allianz/Generali — afișare badge

**Footer secundar de conversie**
- Înălțime mare, fundal bitumen-900
- Stânga: „Ai o lucrare în plan? Hai să vorbim astăzi."
- Dreapta: CTA-uri duble (tel + formular short 3-câmpuri)

### 8.2 PAGINA SERVICIU INDIVIDUAL (template pentru toate cele 17 sub-pagini)

Structură universală, conținut variabil:

1. **Hero compact (40vh)** cu breadcrumbs, H1, subtitle, CTA dublu
2. **Anatomy section** — diagramă SVG interactivă a stratificării membranei (hover pe fiecare strat → tooltip cu rol și material)
3. **Pentru cine este indicat** — 3 carduri persona (rezidențial / comercial / industrial)
4. **Procesul tehnic** — 6 pași cu fotografii reale de pe șantier
5. **Materiale folosite** — lista cu logos parteneri + fișe PDF descărcabile
6. **Garanție specifică** — accordion cu termenii (durata, ce acoperă, ce nu)
7. **Cost orientativ** — interval RON/m² + factori care influențează prețul
8. **Proiecte realizate cu acest serviciu** — 3–6 carduri din portofoliu filtrate automat
9. **FAQ contextuală** — 5–8 întrebări, în format `<details>` pentru SEO + schema FAQPage
10. **CTA final dublu** — „Cere ofertă pentru acest serviciu" + „Vorbește cu un consultant"

**Schema markup obligatoriu per pagină:** `Service`, `Offer`, `AggregateRating`, `FAQPage`, `BreadcrumbList`

### 8.3 PORTOFOLIU (/portofoliu)

- Grid masonry cu filtre orizontale sticky: Tip lucrare • Sector • An • m² (range)
- Card: imagine 4:3, overlay la hover cu m², an, tip membrană
- Click → modal sau pagină dedicată (preferat pagină dedicată pentru SEO)
- Pagina individuală de case study: hero imagine full, metadate (client, an, m², durată execuție, sistem aplicat), text 300–500 cuvinte (provocare, soluție, rezultat), galerie 6–12 poze before/after slider, video drone embedded, testimonial dacă există, CTA „Proiect similar?"

### 8.4 CERE OFERTĂ (/cere-oferta)

- **Configurator wizard în 4 pași** cu progress bar:
    1. **Ce tip de lucrare?** (cards mari clickable: terasă / acoperiș / fundație / parcare / altă)
    2. **Detalii tehnice:** m² (input numeric cu slider), tip clădire (radio), urgență (radio: imediat / 1–3 luni / >3 luni)
    3. **Adresă & vizită:** județ + localitate + cod poștal opțional, programare slot opțional (date picker cu sloturi 2h)
    4. **Date contact:** nume, telefon (validat), email, mesaj opțional, upload poze/plan (max 10 fișiere, drag&drop)
- **Submit:** Server Action Next.js → API route → email + Slack/SMS notification pentru echipă + Google Calendar invite dacă a ales slot + push în CRM (HubSpot / Pipedrive)
- **Confirmare:** pagină dedicată cu „Te sunăm în maxim 4h" + microcopy de ce să mai aștepți + alte CTA-uri secundare (vezi portofoliul / urmărește-ne pe Instagram)

### 8.5 CONTACT
- Hartă Google Maps embedded (sau Mapbox cu styling custom dark)
- 3 carduri: telefon (click-to-call vizibil), email (mailto), adresă (link Google Maps)
- Program: tabel cu zilele și orele
- Formular scurt: nume, telefon, mesaj
- WhatsApp button float fixed bottom-right (cu badge „Online")

### 8.6 RESURSE / BLOG (motorul SEO)

- Hub-page cu 3 pillar topics + ultimele 6 articole
- Pillar pages 2500+ cuvinte cu TOC sticky, internal links, schema Article + HowTo
- Article cards cu reading time, dată update, autor (numele tehnicianului-șef pentru EAT)

---

## 9. COMPONENTE CHEIE (DESIGN SYSTEM)

Livrează în Figma + cod (shadcn/ui ca bază, customizate):

1. **Button** — variante: primary (amber), secondary (outline bitumen), ghost, destructive; sizes: sm (32px), md (40px), lg (48px), xl (56px); states: default, hover, active, focus-visible (ring 2px amber), disabled, loading (spinner inline)
2. **Input / Textarea / Select** — label floating, helper text, error state cu icon, success state, character count
3. **Card** — variante: default, elevated, outlined, image-top, image-side
4. **Badge / Chip** — culori semantic + categorii servicii
5. **Counter** (animat la scroll cu IntersectionObserver) — folosește framer-motion `useMotionValue` + `animate`
6. **Before/After Slider** — touch-friendly, ARIA slider role
7. **Accordion / FAQ** — animat cu Radix Accordion, schema FAQ automat
8. **Stepper / Wizard** — pentru configuratorul de ofertă
9. **Drawer mobile menu** — full-screen overlay, animat slide-up
10. **Sticky header** — transformă la scroll (înălțime 80→64, fundal transparent→blur backdrop)
11. **Hero video** — cu poster fallback, autoplay+muted+playsInline, lazy-loaded
12. **Image gallery / Lightbox** — keyboard navigable (← → Esc), preserve scroll position
13. **Map embed** — cu lazy loading, click-to-load (privacy by default)
14. **Toast notifications** — Sonner sau Radix Toast
15. **Floating call/WhatsApp** — bottom-right cluster, expandabil
16. **Cookie consent** — GDPR-compliant, cu opt-in granular (necesar / analytics / marketing)

Toate componentele documentate în Storybook cu props, states, accessibility notes.

---

## 10. ANIMAȚII & MOTION DESIGN

### Principii
- **Restraint over flash.** Acest brand este industrial — niciun bounce, niciun confetti.
- **Funcțional, nu decorativ.** Fiecare animație trebuie să confirme o acțiune sau să orienteze atenția.
- **Reduced motion respect** obligatoriu — animațiile devin instant la `prefers-reduced-motion: reduce`.

### Animații specifice
- **Page transitions:** fade + slide 8px de jos, 300ms, out-quint
- **Hero video → parallax 0.15** doar la scroll
- **Counter numbers** — count-up la intersect, 1500ms, ease-out
- **Cards hover** — translateY -4px, shadow elevation change, 200ms
- **Stagger reveal** pe grid-uri — copiii apar cu delay 60ms unul după altul
- **Sticky header transformation** — height + backdrop blur tween pe scroll 0→120px
- **Form field focus** — label float-up cu 200ms scale 0.85
- **Loading states** — skeletons cu shimmer subtil, NU spinneri în paginile principale

### Stack tehnic motion
- Framer Motion (acum „Motion") pentru orchestrare avansată
- CSS transitions pentru micro (200ms)
- View Transitions API pentru route transitions unde browser support permite

---

## 11. RESPONSIVE & MOBILE-FIRST

- Designul Figma se face mobile-first (375px → 768px → 1024px → 1280px → 1440px → 1920px)
- **Reguli specifice mobile:**
    - Sticky bottom action bar pe paginile de servicii: 2 butoane (Sună / Cere ofertă)
    - Meniul = drawer full-screen cu nivele expandabile, nu hover dropdown
    - Hero ridică textul mai sus, evitând overlay-ul cu CTA-uri
    - Card carusele swipe cu snap, nu scroll liber
    - Telefonul header devine icon-only sub 480px
- **Touch targets:** minim 44×44px
- **Tap delay:** elimină 300ms cu `touch-action: manipulation`

---

## 12. ACCESIBILITATE (WCAG 2.2 AA)

Toate punctele de mai jos sunt non-negociabile.

- Contrast minim 4.5:1 text normal, 3:1 text large; verifică toți tokenii cu Stark sau Polypane
- Focus-visible vizibil pe TOATE elementele interactive (ring 2px amber + offset 2px)
- Skip-to-content link la `Tab` primul
- Toate imaginile cu `alt` descriptiv (NU „image" sau gol pentru imagini de conținut)
- Iconurile decorative cu `aria-hidden="true"`
- Formularele: label asociat, `aria-describedby` pentru helper, `aria-invalid` + mesaj de eroare specific
- Landmark-uri: `<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>` corect folosite
- Heading hierarchy strict (un singur `<h1>` per pagină, fără sărituri h2→h4)
- Keyboard navigation: testată end-to-end pe Home și Cere Ofertă
- Screen reader testing: NVDA Windows + VoiceOver macOS/iOS
- Video hero: fără autoplay sunet, cu controls accesibile, captions dacă există dialog
- Hartă: alternativă text cu adresa + link Maps
- Color is not the only signal: erorile au icon + text, nu doar roșu

---

## 13. PERFORMANCE & CORE WEB VITALS

### Targets stricte
- **LCP** < 2.0s pe 3G slow (Largest Contentful Paint)
- **INP** < 200ms (Interaction to Next Paint)
- **CLS** < 0.05 (Cumulative Layout Shift)
- **TBT** < 200ms
- **Bundle JS** < 180KB gzipped pe homepage

### Implementare
- `next/image` cu `priority` doar pe LCP image (poster hero); celelalte cu `loading="lazy"` și `sizes` corect
- AVIF + WebP servite via `next/image` automat
- Fonturile self-hosted via `next/font/google` cu `display: swap` și subsetting `latin-ext` (pentru diacritice)
- Preconnect doar la origini critice (analytics, GMaps)
- Defer + async pentru toate scripturile third-party
- Google Maps lazy-load on intersect, nu preîncărcat
- Video hero: 1080p AV1, fallback H.265 mp4, max 1.2MB, poster preîncărcat
- Code splitting per route automat în App Router + dynamic imports pentru componente grele (lightbox, calculator)
- HTTP/3 + Brotli pe server
- Cache-Control imutabil pe assets, ISR pe pagini de portofoliu
- Edge runtime pentru routes statice; Node runtime pentru forms și uploads
- Lighthouse CI integrat în GitHub Actions cu prag de pasaj

---

## 14. SEO TEHNIC & ON-PAGE

### Tehnic
- **Sitemap.xml** generat dinamic prin `next-sitemap`, submitat în GSC
- **Robots.txt** cu reguli explicite
- **Canonical tags** pe fiecare pagină
- **Hreflang:** ro_RO singur (pentru moment); pregătit pentru en-GB ulterior
- **Schema.org JSON-LD:**
    - `LocalBusiness` + `RoofingContractor` pe layout root
    - `Service` pe fiecare pagină de serviciu cu `areaServed` București + Ilfov + jud. limitrofe
    - `BreadcrumbList` global
    - `FAQPage` unde există FAQ
    - `Review` + `AggregateRating` pe testimoniale (cu date reale, nu fake)
    - `Project` (sau `CreativeWork`) pe case studies
    - `Organization` cu `sameAs` pentru profiluri sociale
- **Open Graph + Twitter Card** generate per route cu `generateMetadata`
- **OG images** dinamice via `@vercel/og` cu titlu + logo + culori brand
- **URL slugs** SEO-friendly românești fără diacritice (transliterate)
- **Redirecturi 301** din toate URL-urile vechi WordPress în noul site (CSV mapping livrat)
- **404 page** cu search + linkuri populare + CTA contact
- **Internal linking:** fiecare pagină de serviciu linkează cel puțin 3 pagini conexe + 2 case studies relevante

### On-page
- Titles 50–60 caractere, cu localizare „București", brand „Axel Hidro Cons"
- Meta description 140–160 caractere, cu propunere unică + CTA
- H1 unic, conține keyword principal, dar natural
- Densitate keyword 1–2%, fără stuffing
- Alt text descriptiv inclusiv pentru imagini de portofoliu („Hidroizolație membrană PVC pe terasă bloc rezidențial, sector 1, București, 1.200 m², 2024")
- Numere și statistici (300.000 m², 25 ani) repetate în piloni de pagină pentru featured snippets
- Pillar pages 2.500+ cuvinte cu TOC + schema HowTo unde aplicabil
- Local SEO: NAP consistent peste tot, Google Business Profile sincronizat, reviews handler

---

## 15. STACK TEHNIC

### Frontend
- **Next.js 14+** (App Router, React Server Components, Server Actions)
- **TypeScript** strict mode (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- **Tailwind CSS** cu tokens injectați via CSS vars + plugin pentru typography
- **shadcn/ui** ca bibliotecă de bază (Radix + Tailwind), customizată cu tokenii brandului
- **Framer Motion (Motion)** pentru animații
- **React Hook Form + Zod** pentru formulare cu validare type-safe
- **next-intl** dacă se planifică versiune EN ulterioară

### Content & data
- **Sanity** sau **Payload CMS** self-hosted (Payload preferat pentru control total) — pentru articole blog, case studies, testimoniale, servicii
- Schema CMS: Service, CaseStudy, Testimonial, BlogPost, Author, Page, Settings (NAP, programul, hero)
- ISR (Incremental Static Regeneration) cu revalidate 1h

### Backend services
- **Email transactional:** Resend (mai bun decât SendGrid pe UX dev)
- **CRM sync:** HubSpot Forms API sau Pipedrive (în funcție de ce folosește clientul)
- **Slack notifications** pentru leaduri noi
- **Analytics:** GA4 + Plausible (privacy-first) + Hotjar/Microsoft Clarity pentru session recordings
- **Form spam protection:** Cloudflare Turnstile (nu reCAPTCHA — issue privacy)
- **Image uploads (in Cere Ofertă):** UploadThing sau direct S3 cu pre-signed URLs

### Hosting & infra
- **Vercel** pentru frontend (Edge Network, ISR built-in)
- **Cloudflare DNS + R2** pentru media library
- **GitHub Actions** pentru CI: lint, type-check, build, lighthouse-ci, visual regression (Chromatic)
- **Sentry** pentru error tracking
- **Preview deployments** pentru fiecare PR

### Dev tooling
- **Biome** sau ESLint + Prettier
- **Husky + lint-staged** pre-commit hooks
- **Conventional Commits** + semantic-release pentru changelog
- **Playwright** pentru E2E pe Home, Servicii sample, Cere Ofertă

### Documentație livrată
- README cu setup local
- ARCHITECTURE.md cu decizii (ADRs)
- DESIGN_SYSTEM.md cu tokeni și usage
- DEPLOYMENT.md cu env vars și runbook

---

## 16. STRATEGIE DE CONVERSIE

### Micro-conversii (în ordine)
1. Scroll past hero → ai 5 secunde de atenție
2. Click pe „Cum lucrăm" sau pe un card serviciu → engagement
3. Hover/click pe un proiect din portofoliu → interes
4. Click pe „Cere ofertă" sau telefon → intent
5. Submit formular sau call efectiv → conversie principală

### Tactici
- **Multiple CTA-uri**, dar UN SINGUR CTA DOMINANT pe fiecare viewport
- **Sticky CTA-uri pe mobile** (telefon + cere ofertă)
- **Floating WhatsApp** cu „Online — răspunde Andrei" personalizare
- **Exit-intent popup** doar pe desktop, doar o dată per sesiune, propunând „Te sunăm noi gratis în 4h"
- **Trust strip vizibil** pe orice viewport (parteneri + cifre)
- **Sociale proof contextual** — testimoniale relevante per pagină serviciu
- **Microcopy reasurant** lângă formular: „Nu trimitem newsletter. Doar te sunăm pentru cotație."

### A/B Testing roadmap
- Test 1: CTA text „Cere ofertă în 4h" vs „Cere ofertă gratuită"
- Test 2: Hero video vs hero static (LCP impact)
- Test 3: Wizard 4 pași vs formular long single-page
- Test 4: Trust strip jos vs sub hero
- Folosește Vercel Edge Config sau GrowthBook

---

## 17. COPY & CONTENT TONE

### Reguli de scriere
- Propoziții scurte (max 18 cuvinte mediu)
- Verbe la persoana I plural („Executăm...", „Garantăm...")
- Cifre concrete în loc de superlative („300.000 m² executați" în loc de „experiență vastă")
- Numerale cu separator românesc (300.000, nu 300,000)
- Diacritice obligatorii peste tot
- Anti-cliché: zero „soluții personalizate", zero „echipă dedicată", zero „satisfacția clientului"

### CTA microcopy (exemple)
- Principal: „Cere ofertă în 4 ore"
- Secundar: „Vezi cum lucrăm"
- Telefon: „Sună acum — 0784 847 669"
- WhatsApp: „Trimite poza pe WhatsApp"
- Formular submit: „Trimite și primesc cotația"
- Submit success: „Te sunăm în maxim 4 ore. Telefon: 0784 847 669."

### Pagini noi de scris (recomandare)
- /resurse/ghid-hidroizolatie-terasa-2026 (3000 cuvinte)
- /resurse/cum-aleg-membrana-bituminoasa-vs-pvc (2000 cuvinte)
- /resurse/cost-hidroizolatie-terasa-bucuresti-2026 (1500 cuvinte cu calculator embedded)
- /resurse/infiltratii-la-bloc-ce-fac (1500 cuvinte, target asociații)

---

## 18. DELIVERABLES — CE TREBUIE SĂ ÎMI LIVREZI

### Faza 1 — Discovery & Strategy (Săptămâna 1)
- [ ] Audit complet site existent (PDF, 15–20 pagini)
- [ ] Personas finale (3 documente)
- [ ] Sitemap final cu URL-uri (Figma sau Whimsical)
- [ ] Content inventory CSV (vechi URL → nou URL + status redirect)
- [ ] Brand strategy one-pager (poziționare + piloni mesaj)

### Faza 2 — Design System (Săptămâna 2)
- [ ] Figma file: foundations (color, type, spacing, radius, shadow, motion)
- [ ] Token JSON exportabil
- [ ] Tailwind config preset
- [ ] Component library Figma + Storybook scheletul
- [ ] Refresh logo + brand kit (PNG, SVG, PDF, favicon, OG image generator)

### Faza 3 — UI Design (Săptămânile 3–5)
- [ ] Wireframes lo-fi pentru toate templateurile (8 unice)
- [ ] High-fidelity Figma pentru: Home, 2 pagini servicii (1 categorie + 1 sub), Portofoliu list + detail, Cere Ofertă, Contact, Despre, 1 pagină pillar resurse, 404
- [ ] Mobile + tablet + desktop pentru fiecare
- [ ] Dark mode opțional pentru pagini de portofoliu
- [ ] Prototip clickable end-to-end pentru flow „caut serviciu → cer ofertă"

### Faza 4 — Implementare (Săptămânile 6–10)
- [ ] Repo Next.js cu CI/CD
- [ ] Toate componentele în Storybook
- [ ] Toate paginile implementate, conectate la CMS
- [ ] Toate formularele funcționale cu email + Slack + CRM sync
- [ ] Schema markup pe toate paginile
- [ ] Sitemap + robots.txt + redirect map
- [ ] Lighthouse > 95 pe toate metricile
- [ ] WCAG 2.2 AA audit pass (axe-core)
- [ ] Cross-browser test (Chrome, Safari, Firefox, Edge, Samsung Internet)

### Faza 5 — Pre-launch (Săptămâna 11)
- [ ] Migrare conținut din WordPress (script de import)
- [ ] Setup Google Analytics 4 + GTM + GSC + Bing Webmaster
- [ ] Setup Google Business Profile sincronizat
- [ ] Test redirect mapping cu Screaming Frog
- [ ] Backup site vechi
- [ ] UAT cu clientul (checklist 50+ puncte)

### Faza 6 — Launch & Post-launch (Săptămâna 12+)
- [ ] DNS cutover cu downtime zero
- [ ] Monitoring 48h sentinel
- [ ] Submit sitemap în GSC
- [ ] Săptămânal report pe KPI (CWV, leaduri, conversii) pentru 90 zile
- [ ] 2 cicluri de A/B test pe CTA-uri în primele 60 zile

---

## 19. CRITERII DE ACCEPTARE (DEFINITION OF DONE)

Site-ul este considerat „terminat" doar când:

1. **Performance:** Lighthouse Mobile > 95 pe Performance, Accessibility, Best Practices, SEO; LCP < 2.0s pe 4G; INP < 200ms; CLS < 0.05.
2. **Accesibilitate:** Axe-core 0 violation pe paginile critice; testat manual cu NVDA și VoiceOver.
3. **SEO:** toate paginile au title unic, meta unic, schema validă (Google Rich Results Test pass); 100% URL-uri vechi mapate cu 301; sitemap submis în GSC.
4. **Conversie:** funnel-ul „cere ofertă" funcționează end-to-end cu email + Slack + CRM, testat de 3 persoane diferite pe 3 device-uri.
5. **Conținut:** toate cele 17 pagini de serviciu au minim 600 cuvinte unice + schema Service + FAQ; portofoliul are minim 12 case studies cu cifre.
6. **Brand:** toate textele au diacritice, niciun „lorem ipsum", niciun placeholder, niciun text traduit cu Google Translate.
7. **Cross-browser:** identic vizual pe Chrome, Safari (iOS 16+), Firefox, Edge, Samsung Internet pe testare BrowserStack.
8. **Resilience:** site-ul funcționează cu JS dezactivat pentru paginile statice (servicii, portofoliu, contact); doar configuratorul de ofertă necesită JS.
9. **Legal:** politica cookie, politica de confidențialitate, GDPR consent funcțional, datele firmei (CUI, J, sediu) în footer.
10. **Documentație:** un partener tehnic poate face un PR într-o componentă în max 30 min de la clone.

---

## 20. INSTRUCȚIUNI FINALE PENTRU EXECUTANT

> Lucrează ca un senior. Nu cere clarificări pentru lucruri pe care le poți decide singur — propune varianta optimă și justifică în 1–2 propoziții.
>
> Livrează în iterații săptămânale, cu video de 5 min Loom care explică ce ai făcut și de ce.
>
> Toate deciziile contestabile (paletă, tipografie, structură wizard) merită un mini „why this, not that" în Notion.
>
> Calitatea bate viteza. Mai bine livrezi două săptămâni mai târziu, dar fără regrete.
>
> **Stelele polare ale acestui proiect:**
> 1. „Hidroizolații care țin cât clădirea" — tot designul trebuie să transpire durabilitate.
> 2. „Profesional, nu corporate" — păstrează personalitatea de meseriaș, nu transformi Axel în Deloitte.
> 3. „Conversie peste estetică" — dacă un detaliu vizual frumos rănește conversia, taie-l.

---

**END OF BRIEF.**

Acest document este sursa de adevăr. Orice neînțelegere între părți se rezolvă recitindu-l.

Tine cont ca este un redesign al https://axelhidrocons.ro/. Vreau sa modific culorile sa modific culorile din redesignul scris in ceva deschis dar in aceasi directie profesionala
