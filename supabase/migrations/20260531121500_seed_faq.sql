-- Seed FAQ items din messages/{ro,en,nl}.json. Idempotent prin slug.

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'delivery-packaging', 'delivery',
    'Cum arată pachetul la livrare?', 'What does the parcel look like on delivery?', 'Hoe ziet het pakket eruit bij levering?',
    'Livrarea se face într-o cutie opacă, robustă, complet neutră — fără logo, fără siglă, fără text care să sugereze conținutul. Pe documentele de transport apare doar denumirea operatorului juridic (Velvet Studio SRL), iar curierul nu cunoaște ce se află în interior.', 'Deliveries arrive in an opaque, robust, completely neutral box — no logo, no insignia, no copy that hints at the contents. Shipping documents show only the legal operator name (Velvet Studio SRL); the courier never knows what is inside.', 'De bezorging gebeurt in een ondoorzichtige, stevige, volledig neutrale doos — zonder logo, zonder embleem, zonder verwijzing naar de inhoud. Op de transportdocumenten staat enkel de juridische operator (Velvet Studio SRL); de koerier weet niet wat erin zit.',
    true, 1
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'hygiene-rental-protocol', 'hygiene',
    'Cum se garantează igiena pentru închirieri?', 'How do you guarantee hygiene for rentals?', 'Hoe wordt hygiëne bij verhuur gegarandeerd?',
    'Între închirieri aplicăm un protocol clinic în cinci etape: spălare cu detergent profesional, dezinfecție medicală cu agenți antibacterieni de spectru larg, sterilizare UV-C 15 minute, uscare în mediu controlat și ambalare sigilată. Fiecare companion este resigilat înainte de fiecare nouă livrare.', 'Between rentals we run a five-stage clinical protocol: professional detergent wash, medical-grade broad-spectrum disinfection, 15-minute UV-C sterilisation, controlled drying, and sealed packaging. Each companion is re-sealed before each new delivery.', 'Tussen verhuringen passen we een klinisch protocol in vijf stappen toe: wasbeurt met professioneel reinigingsmiddel, medische desinfectie, 15 minuten UV-C-sterilisatie, gecontroleerd drogen en verzegelde verpakking. Elk model wordt opnieuw verzegeld voor elke nieuwe levering.',
    true, 2
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'customise-purchase', 'purchase',
    'Pot personaliza complet o păpușă pentru achiziție?', 'Can I fully customise a doll for purchase?', 'Kan ik een pop volledig op maat laten maken?',
    'Da. Pentru comenzile de achiziție alegeți între formă, înălțime, ten, culoare ochi, păr, machiaj, sâni, șolduri, opțiuni de schelet articulat, modul termic și modul vocal. Consilierul vă trimite pre-vizualizări înainte de aprobarea finală.', 'Yes. Purchase orders let you choose shape, height, skin tone, eye colour, hair, makeup, bust, hips, articulated skeleton, thermal module, and reactive voice module. Your advisor sends previews before final approval.', 'Ja. Bij aankoop kiest u vorm, lengte, huidskleur, oogkleur, haar, make-up, buste, heupen, type skelet, thermische module en stemmodule. De adviseur stuurt previews vóór de definitieve goedkeuring.',
    true, 3
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'materials-used', 'materials',
    'Ce materiale folosiți?', 'What materials do you use?', 'Welke materialen gebruikt u?',
    'Folosim silicon medical platinum-cure sau TPE de clasă chirurgicală, ambele hipoalergenice, fără ftalați și fără latex. Scheletul intern este din aliaj de titan și aluminiu, cu articulații articulate biomecanic. Lista completă de materiale este disponibilă la cerere.', 'Medical-grade platinum-cure silicone or surgical-grade TPE — both hypoallergenic, phthalate-free, latex-free. The internal skeleton is a titanium-aluminium alloy with biomechanically articulated joints. Full material datasheet available on request.', 'Medisch platinum-cure silicone of chirurgisch TPE — beide hypoallergeen, vrij van ftalaten en latex. Het interne skelet is een titanium-aluminiumlegering met biomechanisch geleed gewrichten. Volledige materiaalfiche op aanvraag.',
    true, 4
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'payment-options', 'payment',
    'Cum se face plata?', 'How does payment work?', 'Hoe werkt de betaling?',
    'Nu solicităm date de card pe site. După ce trimiteți cererea, un consilier vă contactează discret și stabilim împreună modalitatea — numerar la livrare sau card prin terminal mobil. Pe extras factura apare ca „Velvet Studio SRL”, fără referință la conținut.', 'We do not request card details on the site. After you submit your request a private advisor contacts you and you agree the method together — cash on delivery or card via mobile terminal. The statement reads “Velvet Studio SRL” with no reference to the content.', 'We vragen geen kaartgegevens via de website. Na uw aanvraag neemt een adviseur discreet contact op en bepalen we samen de methode — contant bij levering of kaart via mobiele terminal. Op het uittreksel verschijnt “Velvet Studio SRL”, zonder verwijzing naar de inhoud.',
    true, 5
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'purchase-return', 'legal',
    'Se poate returna un companion achiziționat?', 'Can a purchased companion be returned?', 'Kan een aangekochte pop geretourneerd worden?',
    'Conform Directivei UE 2011/83/UE art. 16(e), produsele intime desigilate nu sunt eligibile pentru dreptul de retur de 14 zile, din motive de igienă și protecția sănătății. În cazul unui defect de fabricație, contactați-ne în 24 de ore — vă reparăm sau înlocuim piesa.', 'Per EU Directive 2011/83 art. 16(e), unsealed intimate goods are excluded from the 14-day right of withdrawal for hygiene reasons. In case of manufacturing defect, contact us within 24 hours and we will repair or replace the piece.', 'Volgens EU-richtlijn 2011/83 art. 16(e) zijn ontzegelde intieme producten uitgesloten van het herroepingsrecht van 14 dagen om hygiënische redenen. Bij een fabricagefout neemt u binnen 24 uur contact op — wij herstellen of vervangen het stuk.',
    false, 6
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'warranty-purchase', 'purchase',
    'Există o garanție pentru achiziții?', 'Is there a warranty on purchases?', 'Is er garantie op een aankoop?',
    'Da. Toate companionii achiziționați includ 12 luni asistență tehnică pentru schelet și module electronice. Pielea exterioară este garantată 6 luni împotriva defectelor de fabricație în condiții de utilizare normală.', 'Yes. Every purchased companion includes 12 months of technical support for the skeleton and electronic modules. The outer skin is warranted for 6 months against manufacturing defects under normal use.', 'Ja. Elke aangekochte pop krijgt 12 maanden technische ondersteuning voor het skelet en de elektronische modules. De buitenste huid is 6 maanden gewaarborgd tegen fabricagefouten bij normaal gebruik.',
    false, 7
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'rental-flow', 'rental',
    'Cum funcționează închirierea?', 'How does the rental work?', 'Hoe werkt de verhuur?',
    'Alegeți un interval (4 ore – 7 zile), confirmați adresa și ora, iar noi vă livrăm companionul sigilat în fereastra orară agreată. La sfârșitul perioadei trimitem un curier pentru ridicare — într-o pungă opacă. Toată procedura este non-verbală pe partea curierului.', 'Pick an interval (4 hours to 7 days), confirm address and time, and we deliver the sealed companion within the agreed window. At the end of the period a courier collects it back inside an opaque bag. The courier interaction is non-verbal.', 'Kies een interval (4 uur tot 7 dagen), bevestig adres en tijdstip, en wij leveren de verzegelde pop in het afgesproken tijdvenster. Aan het einde van de periode stuurt een koerier voor ophaling — in een ondoorzichtige zak. Voor de koerier is alles non-verbaal.',
    true, 8
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'rental-deposit', 'rental',
    'Există un depozit / cauțiune?', 'Is there a deposit?', 'Is er een waarborg/borg?',
    'Pentru închirieri colectăm o cauțiune refundabilă, stabilită cu consilierul în funcție de modelul ales (de obicei 500–1500 RON). Cauțiunea se returnează integral la finalul perioadei, după verificarea integrității.', 'Rentals require a refundable deposit set with your advisor based on the model (typically 100–300 EUR). The deposit is fully refunded at the end of the period after an integrity check.', 'Voor verhuringen vragen we een terugbetaalbare waarborg, afgesproken met uw adviseur op basis van het model (doorgaans 100–300 EUR). De waarborg wordt volledig terugbetaald aan het einde na een integriteitscontrole.',
    true, 9
) on conflict (slug) do nothing;

insert into public.faq_items (
    slug, category,
    question, question_en, question_nl,
    answer, answer_en, answer_nl,
    show_on_home, display_order
) values (
    'gdpr-data-retention', 'legal',
    'Ce se întâmplă cu datele mele după colaborare?', 'What happens to my data after we finish?', 'Wat gebeurt er met mijn gegevens na de samenwerking?',
    'Numele, adresa și telefonul sunt criptate și păstrate strict pentru logistica comenzii. La maxim 30 zile după finalizarea livrării/returului, datele sunt șterse din baza activă. Putem furniza o confirmare scrisă a ștergerii la cerere (scrieți la dpo@velvet-companions.com).', 'Your name, address and phone are encrypted and kept strictly for the logistics of the order. Within 30 days of delivery/return at the latest, the data is purged from the active database. We can issue a written confirmation on request (dpo@velvet-companions.com).', 'Uw naam, adres en telefoon zijn versleuteld en worden uitsluitend bewaard voor de logistiek van uw bestelling. Binnen maximaal 30 dagen na levering/retour worden de gegevens uit de actieve database verwijderd. Een schriftelijke bevestiging is op verzoek beschikbaar (dpo@velvet-companions.com).',
    false, 10
) on conflict (slug) do nothing;

