export const meta = {
  name: 'figma-landing-1to1-audit',
  description: 'Verify the coded landing page matches Figma node 10730-5096 section-by-section, then adversarially verify findings',
  phases: [
    { title: 'Audit sections', detail: 'one auditor per section: pull Figma screenshot+metadata, read code, list discrepancies' },
    { title: 'Verify findings', detail: 'adversarial verifier per section: confirm/refute each claim, catch misses' },
  ],
}

const FILE_KEY = 'c5CJ2u3K9WunvURp6wslBn'

const TOKENS = JSON.stringify({
  "Primary-bckg-color": "#12070B",
  "final-cta-bckg-color": "#060000",
  "champagne-gold": "#C9A15A",
  "warm-ivory": "#F3EEE7",
  "paragraph-color": "#B9B2AA",
  "divider-color / faq-stroke": "#6A5330",
  "grey-low-opacity": "#B0B0B0",
  "color/magenta/5": "#120710",
  "color/magenta/8": "#1a0d1a",
  "H2": "Cormorant Garamond Medium 60, lineHeight 1.5, letterSpacing -1",
  "H2 (italic)": "Cormorant Garamond Italic 60",
  "H3 (italic)": "Cormorant Garamond Italic 50",
  "model card name": "Cormorant Garamond SemiBold 50",
  "eyebrow": "Cormorant Garamond SemiBold 20, letterSpacing 0",
  "btn-text": "Cormorant Garamond Bold 17, letterSpacing -1",
  "paragraph-big": "Inter Regular 18, letterSpacing -1",
  "paragraph-small": "Inter Regular 14",
  "card-headline": "Nunito Bold 18",
  "navigation": "Nunito Bold 16",
  "label-tag": "Inter Medium 15, lineHeight 18, letterSpacing 1",
  "badge-text": "Inter Light 10, letterSpacing 2",
  "card-number": "Cormorant Garamond Light 40, lineHeight 64",
  "Card Title light": "Cormorant Garamond Light 24, lineHeight 40",
  "footer-heading": "Inter Bold 16, lineHeight 18, letterSpacing 1",
  "footer-navigation": "Inter Light 14, lineHeight 22",
})

// Each section: Figma node + code files + an authoritative content/layout spec
// transcribed from the Figma metadata (exact copy strings, element sizes, x/y
// positions that encode spacing/layout). Agents ALSO pull the live screenshot.
const SECTIONS = [
  {
    name: 'Hero',
    node: '10730-5097',
    files: ['components/landing/Hero.tsx'],
    expect: `Dark velvet bg (#12070B). Big headline "Fantezia devine realitate" with the last word ("realitate") in italic + champagne-gold. Sub-line "Realism excepțional. Materiale premium. Confidențialitate absolută." A gold PILL button "Descoperă colecția". Large hero photograph on the right (seated woman). Headline uses H2/H3 Cormorant Garamond. (Navbar is overlaid at top — out of scope, audited separately.)`,
  },
  {
    name: 'TrustRibbon',
    node: '10770-10140',
    files: ['components/landing/TrustRibbon.tsx'],
    expect: `A single row of 4 "trust-card" items, each 299x212, 30px horizontal gap, total width 1286. Screenshot to read each card's icon + label/value copy and compare count, order, and text.`,
  },
  {
    name: 'RentSection (Închiriere)',
    node: '10791-10817',
    files: ['components/landing/RentSection.tsx'],
    expect: `Two-part TEXT column on the LEFT, doll image card on the RIGHT (card-model-1 at x=670, 630x1276). Block A: eyebrow "COLECȚIA ARTISAN", H2 "Modelele noastre", 60px gold divider, paragraph "Fiecare model este disponibil pentru experiențe private sau pentru achiziție, cu personalizare completă." Block B: H3 "Închiriere" (Cormorant italic ~50), a 4-item icon+text feature list, a primary button (202x54). The doll card shows the model name in Cormorant SemiBold 50. Doll image/name is dynamic CMS content — do not flag dynamic values.`,
  },
  {
    name: 'BuySection (Achiziție)',
    node: '12707-947',
    files: ['components/landing/BuySection.tsx'],
    expect: `MIRRORED vs Rent: doll image card on the LEFT (card-model-2 "kim" at x=0), TEXT column on the RIGHT (x=740). Block A: eyebrow "ACHIZIȚIE premium", headline two lines "Companionul tău." / "Configurat pentru tine", 60px divider, paragraph "Configurează fiecare detaliu, de la aspect și materiale până la accesoriile finale, pentru o experiență construită în jurul preferințelor tale." Block B: H3 "Achiziție companion", a 4-item icon+text list, a primary button (260x54). Verify the LEFT/RIGHT mirroring vs RentSection.`,
  },
  {
    name: 'FeaturedSection',
    node: '12707-1344',
    files: ['components/landing/FeaturedSection.tsx', 'components/landing/FeaturedCarousel.tsx'],
    expect: `Top row: eyebrow "SELECȚIE EXCLUSIVĂ" + H2 "Realism reinterpretat" on the LEFT; a primary button (229x54) on the RIGHT. 60px gold divider. A carousel/row of 5 "featured-card" (each 616x878, 50px gap). Prev/next arrows (93x40) centered at the bottom. Cards are dynamic CMS dolls — judge structure/style not specific names.`,
  },
  {
    name: 'QualitySection',
    node: '12734-1339',
    files: ['components/landing/QualitySection.tsx'],
    expect: `CENTERED header: H2 "Calitate fără compromis" + centered paragraph "Fiecare companion trece printr-un proces riguros de evaluare și pregătire înainte de a intra în colecție. Materialele, structura internă și finisajele sunt analizate pentru a asigura o experiență premium." Below: a row of 4 "quality-card" (299x232, 34px gap). Screenshot to read each card icon + copy.`,
  },
  {
    name: 'AboutSection',
    node: '12738-1601',
    files: ['components/landing/AboutSection.tsx'],
    expect: `Image on the LEFT (631x516), TEXT on the RIGHT. eyebrow "Despre artisan dolls", headline "Mai mult decât un catalog" / "O experiență completă.", 60px divider, paragraph "Artisan Dolls este un atelier dedicat experiențelor premium, unde fiecare model este selectat, pregătit și prezentat cu atenție pentru a oferi un nivel ridicat de realism, confort și discreție. De la evaluarea inițială până la livrarea finală, fiecare etapă urmează standarde clare de calitate și pregătire." Then 3 stacked "value-card" (536x79 each, 30px vertical gap). A primary button (227x54) at the bottom-right.`,
  },
  {
    name: 'PrivacySection',
    node: '12738-2538',
    files: ['components/landing/PrivacySection.tsx'],
    expect: `CENTERED header: H2 "Discreția este prioritatea nostră" (NOTE: Figma copy literally says "nostră" — flag if code says "noastră" only as a low-severity copy note, mention which is grammatically correct). Centered paragraph "Înțelegem că intimitatea ta este esențială. Fiecare aspect al procesului nostru este proiectat pentru confidențialitate completă." A 2x2 grid of 4 "trust-card" (350.5x221, ~40px gaps). Screenshot to read card copy.`,
  },
  {
    name: 'HygieneCallout',
    node: '12738-2499',
    files: ['components/landing/HygieneCallout.tsx'],
    expect: `TEXT on the LEFT, image on the RIGHT (633x959). eyebrow "protocol de igienă", H2 "Siguranță garantată.", 60px divider, paragraph "Între fiecare închiriere aplicăm un protocol documentat pentru curățare, dezinfecție, sterilizare și pregătire finală." A 5-item checklist (icon+text). A primary button (240x54).`,
  },
  {
    name: 'HowItWorksSection',
    node: '12738-2539',
    files: ['components/landing/HowItWorksSection.tsx'],
    expect: `CENTERED header: H2 "Simplu. Discret." + centered paragraph "De la prima vizită până la livrare, fiecare pas este proiectat pentru confort și confidențialitate." Below: a row of 5 "step-card" (254x245) connected by short 60px horizontal divider lines between adjacent cards. Screenshot to read each step's number/title/copy.`,
  },
  {
    name: 'FAQ',
    node: '12750-1364',
    files: ['components/landing/FAQ.tsx'],
    expect: `Left column: H2 "Întrebări frecvente", 60px divider, paragraph "Informațiile pe care clienții noștri le solicită cel mai des înainte de o închiriere sau achiziție.", a set of ~5 small category tags ("FAQ-items"), and a SECONDARY button (233x54). Right column: an accordion of 6 "faq-question" rows (612x132 each, stacked). FAQ copy is dynamic CMS content — judge structure/layout/count and the static labels, not specific Q/A text.`,
  },
  {
    name: 'FinalCta',
    node: '12738-3083',
    files: ['components/landing/FinalCta.tsx'],
    expect: `A full-bleed CTA band (1807x700), very dark bg (#060000). Content (headline + button, possibly a background image/overlay) is not in metadata — SCREENSHOT to read the exact headline, sub-copy, and button label/style, then compare.`,
  },
  {
    name: 'Footer',
    node: '12761-1589',
    files: ['components/Footer.tsx'],
    expect: `Left block: the ARTISAN DOLLS logo + tagline "Atelier dedicat companionilor premium pentru închiriere și achiziție, construit în jurul discreției, calității și atenției la detalii." Right: 3 "footer card" link columns. Bottom bar: left "© 2026 Arstisan dolls. Toate drepturile rezervate." (NOTE: Figma has a typo "Arstisan" — code should say "Artisan"; flag only as a note), right "Site destinat exclusiv persoanelor cu vârsta de 18+ ani." Fonts: footer-heading = Inter Bold 16 (ls 1), footer-navigation = Inter Light 14 (lh 22). Screenshot to read the 3 columns' headings + links.`,
  },
]

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['section', 'figmaToolsAvailable', 'overallMatch', 'summary', 'discrepancies'],
  properties: {
    section: { type: 'string' },
    figmaToolsAvailable: { type: 'boolean', description: 'true if you successfully fetched the Figma screenshot/metadata' },
    overallMatch: { type: 'string', enum: ['exact', 'close', 'diverges', 'missing', 'unable'] },
    summary: { type: 'string', description: 'one-paragraph verdict on how closely the code matches the Figma section' },
    discrepancies: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'figma', 'code', 'severity', 'confidence', 'detail'],
        properties: {
          category: { type: 'string', enum: ['text', 'color', 'typography', 'spacing', 'layout', 'missing-element', 'extra-element', 'image', 'interaction', 'other'] },
          figma: { type: 'string', description: 'what the Figma design specifies' },
          code: { type: 'string', description: 'what the code actually does (cite file:line or class)' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          detail: { type: 'string' },
        },
      },
    },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['section', 'sectionVerdict', 'verdicts', 'missed'],
  properties: {
    section: { type: 'string' },
    sectionVerdict: { type: 'string', enum: ['matches', 'minor-gaps', 'major-gaps', 'unable'] },
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['claim', 'verdict', 'reason'],
        properties: {
          claim: { type: 'string', description: 'short restatement of the reviewer claim' },
          verdict: { type: 'string', enum: ['confirmed', 'false-positive', 'uncertain'] },
          reason: { type: 'string' },
        },
      },
    },
    missed: {
      type: 'array',
      description: 'significant (high/medium) discrepancies the reviewer missed and you independently confirmed',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'figma', 'code', 'severity', 'detail'],
        properties: {
          category: { type: 'string' },
          figma: { type: 'string' },
          code: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          detail: { type: 'string' },
        },
      },
    },
  },
}

const figmaHowto = (node) => `
Pull the Figma reference for node ${node} in file ${FILE_KEY}:
1. ToolSearch with query "select:mcp__plugin_figma_figma__get_screenshot,mcp__plugin_figma_figma__get_metadata" to load the tools.
2. Call get_screenshot { fileKey: "${FILE_KEY}", nodeId: "${node}", maxDimension: 1400 }. It returns JSON with an "image_url". Then run \`curl -s -o /tmp/fig_${node}.png "<image_url>"\` and Read /tmp/fig_${node}.png to SEE the design (colors, exact layout, card copy).
3. Call get_metadata { fileKey: "${FILE_KEY}", nodeId: "${node}" } for exact text strings, element sizes and x/y positions (positions encode spacing/gaps/alignment).
If a Figma tool errors or is unavailable, set figmaToolsAvailable=false and audit using the EXPECTED CONTENT + TOKENS below as the spec.`

const rubric = `
Compare the CODE against the Figma DESIGN across every dimension:
- Copy: exact text of eyebrows, headings, paragraphs, button labels, card titles, footer links. Flag any wording/diacritics/casing difference.
- Typography: font family/size/weight/style per the token system (H2=Cormorant 60, eyebrow=Cormorant SemiBold 20, paragraph=Inter 18/14, card-headline=Nunito 18, btn=Cormorant 17, etc.). Flag wrong family or clearly-wrong size.
- Color: background, text, accent (gold #C9A15A), divider (#6A5330), paragraph (#B9B2AA). Token-equivalent near-matches (e.g. code gold #C9A24A vs figma #C9A15A) → LOW severity note, not a real defect.
- Spacing/layout: column order, which side the image is on, alignment (left vs centered), grid columns, gaps, dividers, card counts and order.
- Elements: anything in Figma missing from code, or extra in code not in Figma.

FAIRNESS RULES (do not raise these as defects):
- The code is RESPONSIVE; Figma is a fixed 1440px desktop frame. Compare against the desktop layout only.
- Doll names/images, featured cards, and FAQ Q&A are DYNAMIC CMS content. Judge structure/style/count, never specific dynamic values.
- Near-equivalent color tokens and sub-pixel spacing → low severity at most.
Report only real, defensible discrepancies with a clear figma-vs-code contrast. Cite code as file:line or the Tailwind class when possible.`

phase('Audit sections')

const results = await pipeline(
  SECTIONS,
  // Stage 1 — audit
  (s) => agent(
    `You audit whether a coded React/Tailwind section matches its Figma design 1:1.

SECTION: ${s.name}  (Figma node ${s.node})
CODE FILE(S): ${s.files.join(', ')}  — Read them fully. Also Read any section-specific sub-components/cards/buttons they import (grep if needed) so you can compare card and button internals.
${figmaHowto(s.node)}

EXPECTED CONTENT / LAYOUT (authoritative, from Figma metadata):
${s.expect}

GLOBAL DESIGN TOKENS (Figma): ${TOKENS}
${rubric}

Return structured findings for section "${s.name}".`,
    { label: `audit:${s.name}`, phase: 'Audit sections', schema: REVIEW_SCHEMA },
  ),
  // Stage 2 — adversarial verify
  (review, s) => agent(
    `You are an ADVERSARIAL verifier. A reviewer audited section "${s.name}" (Figma node ${s.node}) against code ${s.files.join(', ')}. Independently re-derive the Figma spec and re-read the code, then judge each claim.

${figmaHowto(s.node)}

EXPECTED CONTENT / LAYOUT: ${s.expect}
GLOBAL DESIGN TOKENS: ${TOKENS}
${rubric}

For EACH reviewer claim below: verdict = confirmed (you independently reproduced it), false-positive (you could not reproduce it, or it violates a fairness rule), or uncertain. Default to false-positive if you cannot reproduce it. Then list any SIGNIFICANT (high/medium) discrepancy the reviewer MISSED and that you independently confirmed.

REVIEWER FINDINGS (JSON):
${JSON.stringify(review)}

Return the verification for section "${s.name}".`,
    { label: `verify:${s.name}`, phase: 'Verify findings', schema: VERIFY_SCHEMA },
  ).then((v) => ({ section: s.name, node: s.node, files: s.files, review, verify: v })),
)

return { auditedSections: results.filter(Boolean).length, total: SECTIONS.length, results: results.filter(Boolean) }
