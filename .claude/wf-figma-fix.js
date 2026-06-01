export const meta = {
  name: 'figma-landing-fix',
  description: 'Refactor landing sections to match Figma 1:1 (shared Eyebrow/PrimaryButton, fonts, gold, upright names, card fidelity) while preserving responsive behaviour',
  phases: [
    { title: 'Refactor', detail: 'one agent per section file applies the Figma fixes' },
    { title: 'Re-verify', detail: 'adversarial reviewer re-checks each edited section against Figma' },
  ],
}

const FILE_KEY = 'c5CJ2u3K9WunvURp6wslBn'

const RULES = `
SHARED COMPONENTS (already created — import and use them):
- import Eyebrow from "@/components/landing/Eyebrow";  → <Eyebrow className="<margins only>">TEXT</Eyebrow>. Renders Inter Medium 15px, uppercase, letter-spacing 1px, champagne-gold #c9a15a. REPLACE every existing eyebrow <p> (the old font-heading/Montserrat uppercase ~11.5px gold label) with it. Keep the surrounding margin/spacing by passing it via className.
- import PrimaryButton from "@/components/landing/PrimaryButton";  → <PrimaryButton href="/x" variant="solid" ariaLabel="..." className="<layout only: self-start, lg:self-center, mt-*, w-full sm:w-auto>">LABEL</PrimaryButton>. variant="solid" = filled champagne-gold→ivory gradient, dark text, Cormorant Bold 17, rounded-[20px], plain arrow (NO ring). variant="outline" = transparent gold-bordered pill, same type. REPLACE the existing hand-rolled CTA <Link> buttons (the ones with font-heading uppercase, border border-gold/60 ghost fill, rounded-full, and an arrow wrapped in a bordered circle). Preserve the original href and any conditional wrapper (e.g. {catalogEnabled && ...}). Drop the now-redundant inline arrow + its circle.

DESIGN TOKENS (now exact in globals.css): champagne-gold = text-gold / #c9a15a; warm-ivory = text-ivory / #f3eee7; paragraph color = #b9b2aa (use text-[#b9b2aa] for body copy, NOT text-silk/xx opacity); Primary bg = bg-velvet-950 (#12070B). Fonts: Cormorant = font-display, Inter = font-sans, Nunito = font-nav.

HARD RULES — do not violate:
1. PRESERVE EVERY RESPONSIVE CLASS. Keep all sm:/md:/lg:/xl: variants, clamp() values, flex-col→lg:flex-row stacking, grid column counts, max-w-*, w-[..vw], hidden/block toggles, object-* and image sizing. When a Figma desktop value is BIGGER than is sensible on mobile (e.g. 18px body, 50px card name, 24px card title), apply it at the lg: breakpoint and keep a smaller mobile value — e.g. text-base lg:text-[18px], or a clamp whose MAX equals the Figma value. NEVER enlarge mobile text/spacing in a way that could break the mobile layout.
2. Only change the divergences listed in this brief. Make surgical edits; do not reformat or touch unrelated code.
3. Do NOT touch dynamic content (doll names/images, CMS FAQ text, featured-cards data, settings flags).
4. Keep all a11y (aria-*, id, role, data-surface, focus-visible) and motion-reduce classes.
5. Replace text-gold-light accents with text-gold ONLY where this brief says the accent should be champagne-gold (emphasis words, serif card names/numbers).
6. Remove forced italic on serif model/card NAMES and NUMBERS that Figma renders upright (per brief). Keep italic only where the brief explicitly says Figma is italic.
7. Read the file(s) fully before editing. Then make the edits with the Edit tool.

After editing, report exactly what you changed (file + before→after summary) and anything you intentionally left and why.`

const SECTIONS = [
  {
    name: 'TrustRibbon',
    node: '10770-10140',
    files: ['components/landing/TrustRibbon.tsx'],
    brief: `Fixes:
- Card TITLE: should be Nunito Bold 18 (font-nav text-[18px] font-bold), color text-ivory (#f3eee7). Currently font-display (Cormorant) font-medium text-silk → change family to font-nav, weight bold, color text-ivory.
- Card BODY: should be Inter 14px solid #b9b2aa. Currently ~12.5px (text-[0.78rem]) text-silk/65 → use text-sm (14px) text-[#b9b2aa].
- The HYGIENE card icon currently duplicates the delivery "cube" glyph. Figma uses a distinct sparkle/stars (4-point) glyph for the hygiene card — replace that one card's inline SVG with a sparkle/stars icon. Leave the other 3 icons.
- These are small cards; 14px/18px are fine on all breakpoints, but keep any existing responsive grid/stacking.`,
  },
  {
    name: 'RentSection',
    node: '10791-10817',
    files: ['components/landing/RentSection.tsx'],
    brief: `Fixes:
- Eyebrow "COLECȚIA ARTISAN" → use <Eyebrow>.
- Primary CTA → use <PrimaryButton variant="solid"> (keep its href). Remove the old ghost-pill classes + circled arrow.
- Intro paragraph + the 4 feature-list item texts: should be Inter 18px #b9b2aa. Currently text-sm (~14px) text-silk/70 → make text-base lg:text-[18px] and text-[#b9b2aa] (keep responsive: smaller on mobile, 18px at lg).
- The 60px divider should be brown #6a5330, not gold. Change bg-gold/60 → bg-[#6a5330] (keep w-[60px] h-px).
- Feature bullets: Figma shows PLAIN checkmarks (no enclosing circle). The code's Check() draws a circle + check — remove the circle, keep the checkmark stroke in text-gold.
- H3 "Închiriere" stays Cormorant (font-display); ensure its accent is champagne gold (text-gold), not gold-light, if applicable.`,
  },
  {
    name: 'BuySection',
    node: '12707-947',
    files: ['components/landing/BuySection.tsx'],
    brief: `Mirror of Rent (image LEFT, text RIGHT) — keep that layout. Fixes:
- Eyebrow "ACHIZIȚIE premium" → <Eyebrow>.
- Primary CTA → <PrimaryButton variant="solid"> (keep href). Remove ghost classes, the circled arrow, and rounded-full (component handles rounded-[20px]).
- H3 "Achiziție companion": keep font-display; change text-gold-light → text-gold (champagne).
- Intro paragraph + bullet texts: Inter 18px #b9b2aa (text-base lg:text-[18px] text-[#b9b2aa]); currently text-sm text-silk/70 and text-silk/85.
- Check icons: align to ~24px and remove the extra circle if present (plain check), keep responsive spacing.`,
  },
  {
    name: 'FeaturedSection',
    node: '12707-1344',
    files: ['components/landing/FeaturedSection.tsx', 'components/landing/FeaturedCarousel.tsx'],
    brief: `Fixes:
- Eyebrow "SELECȚIE EXCLUSIVĂ" → <Eyebrow>.
- Top-right CTA "Vezi colecția completă" → <PrimaryButton variant="solid"> (keep href). Remove ghost/uppercase/Montserrat classes.
- Card NAME (e.g. doll name): Figma is UPRIGHT Cormorant SemiBold ~50px. Code forces italic at ~32px. Remove italic; bump the clamp max toward ~50px at desktop, e.g. text-[clamp(1.75rem,3vw,3rem)] (keep responsive — do not force 50px on mobile). Keep font-display, color stays.
- Card tag line ("COLECȚIA ELITE · SILICON MEDICAL"): should be Inter Medium 15 (font-sans text-[15px] font-medium, keep uppercase tracking ~1px). Currently font-heading ~10px.
- Card buttons HIERARCHY: "Închiriază" = OUTLINE (gold border, transparent), "Cumpără" = SOLID filled gold. Code renders both outlined → make Cumpără a solid filled gold button. (You may use <PrimaryButton variant="solid"/"outline"> if it fits the card layout, otherwise restyle inline to match: solid = gradient fill dark text, outline = gold border.) Keep them responsive.
- Keep the responsive card width (lg:w-[540px]) and gap as-is (responsive adaptation — do NOT force 616px/50px).`,
  },
  {
    name: 'QualitySection',
    node: '12734-1339',
    files: ['components/landing/QualitySection.tsx'],
    brief: `Centered header layout stays. Fixes:
- Card NUMBER: Figma upright Cormorant Light ~40px, champagne-gold (ideally gold→ivory gradient). Code is italic ~30px text-gold/70 → remove italic, increase toward 40px at lg (responsive), use text-gold (or the gold→ivory gradient text).
- Card TITLE: Figma Nunito Bold 18 #f3eee7. Code font-heading (Montserrat) text-base font-semibold text-silk → font-nav text-[18px] font-bold text-ivory.
- Intro paragraph: Inter 18px #b9b2aa centered. Code text-sm text-silk/70 → text-base lg:text-[18px] text-[#b9b2aa] (keep centered + responsive).
- Card body: Inter 14px #b9b2aa. Code ~13px text-silk/65 → text-sm text-[#b9b2aa].
- Card radius: Figma rounded-[10px] (code rounded-[20px]) — change to rounded-[10px].
- Keep the responsive grid (lg:grid-cols-4) and gap.`,
  },
  {
    name: 'AboutSection',
    node: '12738-1601',
    files: ['components/landing/AboutSection.tsx'],
    brief: `Image LEFT / text RIGHT layout stays. Fixes:
- Eyebrow "Despre artisan dolls" → <Eyebrow>.
- CTA → <PrimaryButton variant="solid"> (label now "Vezi procesul complet" via t('cta'); keep href).
- Headline: the ENTIRE second line "O experiență completă." should be italic + champagne-gold; line 1 "Mai mult decât un catalog" upright ivory with NO trailing period. Adjust so the whole 2nd line is italic gold (not just the last word).
- value-card TITLES: Figma Cormorant SemiBold 20 ivory. Code font-heading (Montserrat) text-base → font-display font-semibold text-[20px] text-ivory.
- value-card NUMBER: Figma upright Cormorant Light ~40px champagne-gold. Code text-2xl italic text-gold/70 → remove italic, larger (lg), text-gold.
- value-card body: Inter 14 #b9b2aa. Code ~13px text-silk/65 → text-sm text-[#b9b2aa].
- value cards: remove the added gold left-border (border-l border-gold/20 pl-5) and use ~30px vertical gap (space-y); Figma cards have no left border.`,
  },
  {
    name: 'PrivacySection',
    node: '12738-2538',
    files: ['components/landing/PrivacySection.tsx'],
    brief: `Centered header + 2x2 card grid stays. Fixes:
- Card TITLE: Figma Cormorant SemiBold 24 ivory. Code font-heading text-base text-silk → font-display font-semibold text-[24px] text-ivory.
- Card style: Figma cards have a THIN champagne-gold border (~border + border-gold) and TRANSPARENT fill, content CENTER-aligned. Code uses border-velvet-800/60 + dark gradient fill + hover gold + LEFT alignment. → change to: border border-gold/60 (or /50), bg-transparent, items-center text-center. Remove the dark gradient fill.
- Card ICON: Figma is a ~60px gold icon with NO ring. Code wraps a 26px svg in a 48px gold-bordered circle → remove the ring container; render the icon larger (e.g. h-12 w-12) in gold, centered.
- Emphasis word in the H2 ("prioritatea noastră"): change text-gold-light → text-gold (champagne). KEEP the code spelling "noastră" (correct Romanian; Figma's "nostră" is a typo).
- Header supporting paragraph: Inter 18 #b9b2aa. Code text-sm text-silk/70 → text-base lg:text-[18px] text-[#b9b2aa] (centered, responsive).
- Card body: text-[0.82rem] text-silk/65 → text-sm text-[#b9b2aa].
- Card corners: Figma square-ish; code rounded-[20px] — reduce to rounded-[10px] (or rounded-none if it reads square in the screenshot).`,
  },
  {
    name: 'HygieneCallout',
    node: '12738-2499',
    files: ['components/landing/HygieneCallout.tsx'],
    brief: `Text LEFT / image RIGHT stays. Fixes:
- Eyebrow "protocol de igienă" → <Eyebrow>.
- TITLE "Siguranță garantată.": Figma renders the WHOLE phrase upright in ivory (NOT split). Code splits titleLine1 (white) + "garantată." italic gold-light → make the whole title one upright ivory Cormorant phrase (font-display, text-ivory, not italic). Keep its responsive clamp.
- Checklist MARKERS: Figma uses small FILLED champagne-gold circular dots, not checkmarks. Replace the Check() SVG with a small filled gold dot (e.g. a 6px rounded-full bg-gold span) before each item. Keep 5 items + responsive.
- CTA → <PrimaryButton variant="solid"> (label now "Vezi protocolul complet" via t('cta'); keep href).
- Body paragraph: Inter 18 #b9b2aa. Code text-sm text-silk/70 → text-base lg:text-[18px] text-[#b9b2aa].
- (Bullet copy is already corrected in i18n.)`,
  },
  {
    name: 'HowItWorksSection',
    node: '12738-2539',
    files: ['components/landing/HowItWorksSection.tsx'],
    brief: `Centered header + 5 step-cards row stays. Fixes:
- H2 emphasis "Discret." AND the 5 card titles: change text-gold-light → text-gold (champagne #c9a15a).
- Card TITLES: Figma upright Cormorant Light 24. Code text-xl italic → remove italic, font-display, ~text-[24px] at lg (responsive), keep gold per above.
- Icon CONTAINER: Figma 64px squircle rounded-[32px] with a #2a0d12→#1a0508 vertical gradient and full-opacity gold border. Code h-14 w-14 rounded-full border-gold/40 → make it ~64px (h-16 w-16) rounded-[20px]/[32px] squircle, bg-gradient-to-b from-[#2a0d12] to-[#1a0508], border border-gold (full opacity). Keep responsive.
- CONNECTORS between steps: Figma solid 1px gold hairlines. Code border-t border-dashed border-gold/30 → make solid (remove dashed), gold. Keep them hidden on mobile if they already are.
- Card BODY: Inter 14 warm-ivory #f3eee7 (full opacity). Code text-[0.78rem] text-silk/65 → text-sm text-ivory. Keep any max-w clamp.`,
  },
  {
    name: 'FAQ',
    node: '12750-1364',
    files: ['components/landing/FAQ.tsx'],
    brief: `Two-column layout stays. Fixes:
- Accordion QUESTION titles: Figma Cormorant SemiBold 20 UPRIGHT champagne-gold #c9a15a. Code font-display text-lg italic text-gold-light → remove italic, ~text-[20px], text-gold.
- Category CHIPS (left "FAQ-items"): Figma Inter Medium 15 letter-spacing 1px uppercase warm-ivory. Code font-heading semibold uppercase tracking-0.22em silk/70 → font-sans text-[15px] font-medium uppercase tracking-[0.067em] text-ivory.
- SECONDARY button "Contactează-ne discret" → <PrimaryButton variant="outline"> (keep href). Removes the Montserrat uppercase styling.
- Left subtitle paragraph: Inter 18 #b9b2aa (code text-sm max-w-md text-silk/70 → text-base lg:text-[18px] text-[#b9b2aa]; you may widen max-w toward the ~527px Figma width via max-w-lg, keep responsive).
- Row SEPARATORS: Figma gold-brown rgba(106,83,48,0.2) = #6a5330 @20%. Code divide-velvet-800/70 → divide-[#6a5330]/20 (or border-[#6a5330]/20).
- Answer text color: text-silk/65 → text-[#b9b2aa] (size ~14px is fine).`,
  },
  {
    name: 'FinalCta',
    node: '12738-3083',
    files: ['components/landing/FinalCta.tsx'],
    brief: `Image-right CTA band stays. Fixes:
- Eyebrow → <Eyebrow> (label now "Artisan Dolls" via t('eyebrow'), renders uppercase). Figma also flanks the eyebrow with a short ~80px gold divider line on EACH side — add a thin gold rule (h-px w-[60px] bg-gold/60 or #6a5330) before and after the eyebrow text (e.g. wrap in a flex items-center gap-3 row). Keep left-aligned on the desktop column.
- PRIMARY button → <PrimaryButton variant="solid"> (label "Explorează modelele" via t('ctaPrimary'); keep href, keep {catalogEnabled && ...}).
- SECONDARY button → <PrimaryButton variant="outline"> (label via t('ctaSecondary'); keep href). Remove the bg-velvet-950/40 backdrop-blur and the circled arrows.
- Section background: Figma final-cta bg = #060000. Change bg-velvet-950 → bg-[#060000] (the cover image + gradient still sits on top).
- Headline: keep font-display; it's fine, but if trivial, cap the clamp max nearer 60–64px and relax the very-tight leading-[1.05] slightly toward the design. Keep responsive clamp. (Low priority — don't over-engineer.)`,
  },
  {
    name: 'Footer',
    node: '12761-1589',
    files: ['components/Footer.tsx'],
    brief: `KEEP the legal/contact/ANPC/SAL/SOL/payments band — it is legally required for RO e-commerce and intentionally not in Figma. Fixes:
- LOGO: code renders a tiny 34x34 inline diamond SVG + wordmark. Figma uses the full ARTISAN DOLLS emblem (137x137 stacked). Replace the diamond with the real asset: next/image src="/logo-artisan-dolls.png" (it exists in /public), shown at a tall size (e.g. h-20 lg:h-24 w-auto), with the tagline below it. Keep it responsive.
- Column HEADINGS: Figma footer-heading = Inter Bold 16, letter-spacing 1px, uppercase. Code uses font-heading (Montserrat) text-[0.72rem] font-semibold → font-sans text-[16px] font-bold uppercase tracking-[0.06em]. (If 16px is too large for the layout on mobile, use text-sm lg:text-[16px].)
- Column LINKS: Figma footer-navigation = Inter Light 14, line-height 22. Code text-sm with normal weight → keep font-sans text-sm, add font-light, and use leading-[22px] (or leading-relaxed). Keep responsive.
- KEEP the correct "ARTISAN DOLLS" spelling (Figma's "Arstisan" is a typo).`,
  },
]

const EDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['section', 'changes', 'responsivePreserved', 'skipped'],
  properties: {
    section: { type: 'string' },
    changes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['file', 'what'], properties: { file: { type: 'string' }, what: { type: 'string' } } } },
    skipped: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['item', 'reason'], properties: { item: { type: 'string' }, reason: { type: 'string' } } } },
    responsivePreserved: { type: 'boolean' },
    notes: { type: 'string' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['section', 'status', 'responsiveOk', 'remaining'],
  properties: {
    section: { type: 'string' },
    status: { type: 'string', enum: ['fixed', 'partial', 'regressed', 'unable'] },
    responsiveOk: { type: 'boolean', description: 'true if responsive classes were preserved (no mobile-breaking changes)' },
    remaining: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['issue', 'severity', 'detail'], properties: { issue: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] }, detail: { type: 'string' } } } },
    notes: { type: 'string' },
  },
}

phase('Refactor')

const results = await pipeline(
  SECTIONS,
  (s) => agent(
    `Refactor a landing section to match its Figma design 1:1, preserving responsive behaviour.

SECTION: ${s.name}
FILE(S) TO EDIT: ${s.files.join(', ')}

${RULES}

SECTION-SPECIFIC BRIEF:
${s.brief}

Read the file(s), apply the edits with the Edit tool, then report your changes.`,
    { label: `fix:${s.name}`, phase: 'Refactor', schema: EDIT_SCHEMA },
  ),
  (edit, s) => agent(
    `Adversarially re-verify that section "${s.name}" now matches Figma node ${s.node} after edits, and that responsive behaviour was preserved.

1. Read the CURRENT (edited) file(s): ${s.files.join(', ')}.
2. Pull the Figma reference: ToolSearch "select:mcp__plugin_figma_figma__get_screenshot", then get_screenshot { fileKey: "${FILE_KEY}", nodeId: "${s.node}", maxDimension: 1400 }, curl the image_url to /tmp/fix_${s.node}.png and Read it.
3. Check the brief was satisfied AND no responsive class was lost. Report status + any remaining real gaps (high/medium only — ignore near-equivalent token deltas).

The brief that was supposed to be applied:
${s.brief}

Editor's reported changes: ${JSON.stringify(edit)}

Return the verification for "${s.name}".`,
    { label: `review:${s.name}`, phase: 'Re-verify', schema: REVIEW_SCHEMA },
  ).then((r) => ({ section: s.name, files: s.files, edit, review: r })),
)

return { total: SECTIONS.length, done: results.filter(Boolean).length, results: results.filter(Boolean) }
