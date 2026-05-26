-- ───────────────────────────────────────────────────────────────────
-- Seed pentru cele 4 articole pillar care lansează blog-ul. Conținutul
-- e curatorial — fiecare paragraf conține numere și referințe verificabile.
-- Inserția e idempotentă prin `on conflict (slug) do nothing`, ca să poată
-- fi rulată repetat fără să suprascrie eventuale editări din admin.
-- ───────────────────────────────────────────────────────────────────

insert into public.blog_posts (
    slug, category, author_name, author_role, reading_minutes,
    title, excerpt, body,
    tags, related_slugs,
    is_featured, display_order, publish_at
)
values (
    'tpe-vs-silicon-ghid-complet',
    'comparison',
    'Velvet Companions',
    'Studio tehnic',
    8,
    'TPE vs silicon platinum-cure: ghid complet pentru 2026',
    'Cele două materiale dominante pentru companioni realiști arată identic la prima atingere, dar diferă fundamental la porozitate, durată de viață, întreținere și preț. Comparăm punct cu punct cu date din specificațiile producătorilor.',
$$Întrebarea cea mai frecventă pe care o primim la consultanță este, fără excepție, **„TPE sau silicon?"**. Răspunsul scurt: depinde de buget, frecvența de utilizare și dacă plănuiești închiriere sau achiziție pe termen lung. Răspunsul lung — cu numere — urmează mai jos.

## Compoziția chimică, pe scurt

TPE-ul (elastomer termoplastic) este un copolimer pe bază de stiren sau olefină, plastifiat ca să imite textura cărnii. Siliconul platinum-cure este un polimer organic siloxanic reticulat cu catalizator de platină. Ambele variante medicale sunt fără ftalați și fără latex, conform reglementării REACH (CE) 1907/2006 anexa XVII intrarea 51.

Diferența practică: TPE-ul mai poate elibera plastifianți la căldură peste 40 °C; siliconul platinum-cure nu eliberează nimic.

## Porozitate — factorul critic pentru igienă

Porozitatea reprezintă capacitatea suprafeței de a absorbi fluide. Cu cât mai mică, cu atât mai ușor de dezinfectat:

- **TPE clasă chirurgicală**: 3–5% porozitate de suprafață.
- **Silicon platinum-cure**: ≈0% porozitate, intrinsec antimicrobian.

Pentru închirieri, porozitatea contează disproporționat. Pe TPE adăugăm un pas suplimentar de oxidare cu peroxid 3% după sterilizarea UV-C (vezi [protocolul de igienă clinică](/blog/protocol-igiena-clinica-cinci-pasi)). Pe silicon platinum-cure pasul suplimentar nu e necesar.

## Durata de viață

În condiții de utilizare regulată și întreținere corectă:

- **TPE**: 3–5 ani.
- **Silicon platinum-cure**: 8–10 ani.

TPE-ul se degradează lent la căldură peste 40 °C, la lumină UV directă și la solvenți pe bază de alcool concentrat. Necesită pudrare cu talc neparfumat după fiecare folosire pentru a preveni „înclețirea" suprafeței.

## Cost — diferența reală

Comparat la aceeași dimensiune și nivel de personalizare, siliconul platinum-cure costă **2–3× mai mult decât TPE-ul echivalent**. Pentru un model standard 165 cm:

- TPE: 8 000 – 14 000 RON pentru achiziție, 600–900 RON/zi pentru închiriere.
- Silicon platinum-cure: 18 000 – 28 000 RON pentru achiziție, 1 200–1 800 RON/zi pentru închiriere.

Prețurile noastre actualizate sunt mereu pe pagina de [catalog](/catalog).

## Atingere și greutate

Diferența la atingere este subtilă, dar reală:

- **TPE** se simte mai moale, „mai cărnos", cu o ușoară elasticitate gel-like.
- **Silicon** este puțin mai dens, mai „real-firm", cu o senzație mai apropiată de pielea umană.

Greutatea unei păpuși de 165 cm la TPE este aproximativ 27–32 kg; la silicon, 30–36 kg. Diferența vine din densitatea polimerului.

## Care e mai bun pentru tine

Recomandarea noastră, pe scurt:

- **Vrei să încerci înainte de a cumpăra**: începe cu o închiriere TPE (3 zile). Preț de intrare scăzut, suficient pentru a-ți forma o opinie reală despre fizionomie și greutate.
- **Cumpărare lunară frecventă (≥ 1 zi/săptămână)**: silicon platinum-cure. Costul amortizat pe 10 ani e mai mic decât TPE-ul înlocuit la 4 ani.
- **Sensibilitate cunoscută a pielii**: silicon. TPE-ul, deși hipoalergenic, e poros — pot rămâne urme de produse cosmetice anterioare după curățare imperfectă.
- **Vrei un companion pe care îl personalizezi extensiv** (turnare nouă, dimensiuni nestandard): siliconul tolerează mai bine prelucrarea ulterioară.

Dacă ai întrebări concrete despre un model anume, [contactează-ne](/contact) — răspundem în maximum 4 ore în intervalul 10:00–22:00.
$$,
    array['tpe', 'silicon', 'comparison', 'materiale', 'ghid'],
    array['protocol-igiena-clinica-cinci-pasi', 'ghid-prima-inchiriere']::text[],
    true,
    1,
    timestamptz '2026-05-30 09:00:00+02'
)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────────────────

insert into public.blog_posts (
    slug, category, author_name, author_role, reading_minutes,
    title, excerpt, body,
    tags, related_slugs,
    is_featured, display_order, publish_at
)
values (
    'protocol-igiena-clinica-cinci-pasi',
    'guide',
    'Velvet Companions',
    'Studio tehnic',
    7,
    'Protocol clinic de igienă între închirieri — cinci pași documentați',
    'Între fiecare închiriere aplicăm un protocol în cinci pași: spălare, dezinfecție medicală, sterilizare UV-C, uscare în mediu controlat și resigilare cu indicator de tamperare. Ciclul total: trei ore documentate.',
$$Întrebarea sub care apar cele mai multe rezerve la prima închiriere este, evident, igiena. Răspunsul care contează nu e „totul este steril", ci protocolul concret pe care îl aplicăm și pe care îl putem demonstra cu documente per ciclu.

## De ce un protocol în cinci pași și nu doar o ștergere

Pielea exterioară (TPE sau silicon) are o porozitate diferită de cea umană. Bacteriile și ciupercile pot rămâne în micro-cavități după o curățare superficială. Iar lubrifianții pe bază de silicon (folosiți frecvent cu companioni) pot lăsa reziduri care, în câteva zile, devin substrat pentru microorganisme.

Protocolul de mai jos derivă din standardele de igienă clinică folosite în cabinete medicale (ISO 13485 ca referință), adaptate la materialul exterior.

## Pasul 1 — Spălare cu detergent neutru (15 minute)

- Detergent pH 7, fără parfum, fără coloranți.
- Apă călduță, 30 °C (peste această temperatură TPE-ul începe să-și piardă forma).
- Toate cavitățile interne sunt spălate cu duș dedicat la presiune redusă.

Scopul: îndepărtarea reziduurilor organice și a lubrifianților reziduali. Fără acest pas, dezinfecția chimică nu mai e eficientă.

## Pasul 2 — Dezinfecție medicală cu spectru larg (5 minute)

- Soluție pe bază de biguanidă (clorhexidină < 0,5%).
- Spectru larg: gram-pozitive, gram-negative, fungi, virusuri învelite.
- Aplicare prin pulverizare uniformă, fără frecare agresivă (păstrăm integritatea suprafeței).

Concentrația sub 0,5% e suficientă pentru dezinfecție de contact și nu decolorează TPE-ul. Verificăm chimia lotului pe fiecare livrare de soluție.

## Pasul 3 — Sterilizare UV-C 15 minute

Lampă UV-C 253,7 nm, intensitate ≥ 100 μW/cm² verificată cu radiometru lunar. Cabină închisă, clasificată IEC 62471 risc-grup 1. Cei 15 minute sunt suficienți pentru log-reducere ≥ 4 (99,99%) pentru bacterii uzuale și log-reducere ≥ 3 pentru virusurile învelite cunoscute.

UV-C nu penetrează materialul, deci e aplicat **după** spălare și dezinfecție chimică, nu ca singur pas. Mai multe detalii în [glosarul nostru](/glosar/uv-c).

## Pasul 4 — Uscare în mediu controlat (2 ore)

- Cameră cu umiditate 40–50% RH, temperatură 20–22 °C.
- Flux laminar (filtrare HEPA H13 pentru aerul din cameră).
- Companionul rămâne pe suport vertical ca apa să dreneze complet din cavități.

Uscarea incompletă este principala sursă de re-contaminare. Niciun pas anterior nu compensează absența ei.

## Pasul 5 — Resigilare cu indicator de tamperare

- Pungă opacă, sigilată cu hârtie autocopiativă (rupere vizibilă).
- Etichetă internă cu ID-ul lotului de protocol, timpul de finalizare și inițialele tehnicianului.
- Ambalajul exterior (cutia) e neutru, fără logo — vezi [livrare neutră](/glosar/livrare-neutra).

Sigiliul se rupe doar la client. Dacă la livrare există vreo urmă de manipulare anterioară, înlocuim pe loc.

## Ciclul total

- Pasul 1: 15 min
- Pasul 2: 5 min
- Pasul 3: 15 min
- Pasul 4: 120 min
- Pasul 5: 5 min

**Total: aproximativ 3 ore.** Documentația aferentă este atașată fișei companion-ului și o trimitem la cerere — mai ales util pentru evenimente private și sesiuni foto profesionale unde clientul cere certificare.

Pentru alergii cunoscute la TPE, recomandăm direct modelele cu silicon platinum-cure, unde protocolul este chiar mai simplu fiind porozitatea ≈0%.
$$,
    array['igienă', 'protocol', 'uv-c', 'ghid'],
    array['tpe-vs-silicon-ghid-complet', 'directiva-2011-83-retur-produse-intime']::text[],
    false,
    2,
    timestamptz '2026-05-30 09:00:00+02'
)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────────────────

insert into public.blog_posts (
    slug, category, author_name, author_role, reading_minutes,
    title, excerpt, body,
    tags, related_slugs,
    is_featured, display_order, publish_at
)
values (
    'directiva-2011-83-retur-produse-intime',
    'legal',
    'Velvet Companions',
    'Departament legal',
    6,
    'Drept de retragere pentru produse intime: Directiva UE 2011/83/UE art. 16(e)',
    'Produsele intime desigilate sunt excluse de la dreptul de retragere de 14 zile din motive de protecție a sănătății. Cum se aplică legal în România, ce înseamnă „desigilare" și ce drepturi ai în cazul defectelor de fabricație.',
$$Una dintre întrebările cel mai des refuzate clar de magazinele online tradiționale este „pot returna fără să spun de ce, în 14 zile?". Pentru produse intime răspunsul are nuanțe — și e bine să le cunoști înainte să cumperi, nu după.

## Cadrul legal european

Directiva 2011/83/UE a Parlamentului European stabilește regimul drepturilor consumatorului pentru contracte la distanță și off-premises. Articolul 16 enumeră excepțiile de la dreptul de retragere de 14 zile. Litera (e) prevede expres:

> *„furnizarea de bunuri sigilate care nu pot fi returnate din motive de protecție a sănătății sau de igienă și care au fost desigilate de consumator după livrare."*

Asta înseamnă: pentru un produs intim care a ajuns la tine sigilat, dacă l-ai desigilat (rupt sigiliul sau scos din ambalajul primar), nu mai poți invoca dreptul de retragere fără justificare.

## Transpunere în România — OUG 34/2014

Directiva e transpusă în România prin Ordonanța de Urgență 34/2014, articolul 16 litera e). Textul intern reia formularea europeană, deci excepția se aplică identic.

ANPC (Autoritatea Națională pentru Protecția Consumatorilor) a confirmat în mai multe interpretări că categoria „produse intime" include explicit dispozitivele cu contact corporal direct — companionii realiști intră aici, alături de obiectele similare.

## Ce înseamnă „desigilat"

Definiția acceptată juridic e dublă:

- **Sigiliu fizic rupt**: punga sigilată, banda de garanție, eticheta tamper-evident — orice indicator vizual care arată o intervenție.
- **Prima manipulare a produsului**: scoaterea din ambalajul primar, chiar fără rupere de sigiliu explicit.

În practica noastră, ambalajul de livrare e sigilat cu hârtie autocopiativă (vezi [pasul 5 din protocolul de igienă](/blog/protocol-igiena-clinica-cinci-pasi)). Ruperea acelui sigiliu marchează „desigilarea" — momentul după care art. 16(e) se aplică.

## Ce drepturi păstrezi

Chiar și sub această excepție, păstrezi drepturile care vin din alte articole:

- **Defectele de fabricație** (vicii ascunse) — răspunderea producătorului operează independent. Pentru defectele constatate în primele 24 de ore, [contactează-ne](/contact) imediat — reparăm sau înlocuim piesa în garanție.
- **Garanția de conformitate** — 12 luni pentru schelet și module electronice, 6 luni pentru pielea exterioară.
- **Neconformitate cu descrierea** — dacă produsul livrat diferă material de cel comandat (model greșit, dimensiune greșită), poți cere remediere sau refund.

## Ce înseamnă pentru închirieri

Închirierile **nu** sunt afectate de art. 16(e), pentru că nu sunt achiziții. Acolo se aplică contractul de închiriere, cu cauțiune refundabilă și inspecție de retur. Detalii complete în [glosarul nostru, intrarea „cauțiune"](/glosar/cautiune).

## Concluzia practică

- Vrei să încerci înainte de cumpărare: alege închiriere — fără risc legal, cu cauțiune refundabilă.
- Cumperi: la livrare verifică ambalajul exterior și sigiliul intern înainte de a-l rupe. Dacă vreunul e compromis, refuzi recepția și ne anunți pe loc.
- Defect de fabricație în primele 24h: ne contactezi imediat. Asta declanșează un flux separat de cel al dreptului de retragere.

Pentru întrebări legale punctuale, scrie-ne la dpo@velvet-companions.com sau la contact@velvet-companions.com.
$$,
    array['legal', 'gdpr', 'directiva-2011-83', 'retur'],
    array['protocol-igiena-clinica-cinci-pasi', 'ghid-prima-inchiriere']::text[],
    false,
    3,
    timestamptz '2026-05-30 09:00:00+02'
)
on conflict (slug) do nothing;

-- ───────────────────────────────────────────────────────────────────

insert into public.blog_posts (
    slug, category, author_name, author_role, reading_minutes,
    title, excerpt, body,
    tags, related_slugs,
    is_featured, display_order, publish_at
)
values (
    'ghid-prima-inchiriere',
    'guide',
    'Velvet Companions',
    'Echipa Velvet Companions',
    6,
    'Ghid prima închiriere — la ce să te aștepți, pas cu pas',
    'De la cererea inițială până la ridicarea companionului după închiriere: timpii reali, plățile, ce verificăm la retur și cum protejăm anonimatul. Scris pentru clienții care evaluează prima rezervare.',
$$Prima închiriere de companion realist e momentul cu cele mai multe incertitudini — pentru că majoritatea informației pe internet vine din surse care, fie nu lucrează în domeniu, fie au interes să exagereze. Mai jos e ce poți verifica concret la noi.

## Pasul 1 — Selecția și cererea

Pe pagina de [catalog](/catalog) alegi un model, un interval (între 4 ore și 7 zile) și apeși „Rezervă discret". Nu ți se cer date de card în acest moment — doar nume, telefon și adresă de livrare.

În maximum 4 ore, în intervalul 10:00–22:00, un consilier te contactează prin canalul pe care l-ai ales (WhatsApp, telefon sau email). Conversația este obligatorie — folosim pasul ăsta ca să confirmăm fereastra orară reală, să răspundem la întrebări tehnice și să stabilim cauțiunea.

## Pasul 2 — Cauțiunea

Tipic 500–1 500 RON, în funcție de model. Se colectează la livrare, prin numerar sau pre-autorizare pe card cu terminal mobil. Suma se eliberează integral în maximum 48 de ore după inspecția de retur, dacă produsul nu prezintă daune dincolo de uzura normală.

Pentru clienții cu istoric (de la a doua închiriere încolo), cauțiunea poate fi redusă cu 20–40%. Pentru detalii vezi [glosarul](/glosar/cautiune).

## Pasul 3 — Livrarea

Curierul ajunge în fereastra orară agreată — 2 ore garantate în București, 3 ore în zonele limitrofe Ilfov. Cutia exterioară e carton kraft natural, fără logo, fără text indicativ. Documentele de transport declară generic „echipamente cosmetice" — curierul nu cunoaște conținutul.

La predare verifică sigiliul intern. Dacă e rupt înainte de a fi în mâinile tale, refuzi recepția și ne anunți. Asta se întâmplă extrem de rar, dar e dreptul tău.

## Pasul 4 — Folosirea

În cutie găsești companionul, un manual scurt de îngrijire, talc neparfumat dacă e TPE, și un cablu USB-C dacă ai modulul termic. Manualul are 4 reguli concrete:

- Curățare doar cu săpun pH-neutru și apă călduță (max 35 °C).
- Modulul termic se oprește singur după 90 minute — nu necesită atenție.
- Companionul stă pe spate sau în picioare cu suport — nu se așază aplecat pe articulații pentru perioade lungi (modifică geometria scheletului).
- Lubrifianți doar pe bază de apă; cei pe bază de silicon strică suprafața de silicon platinum-cure.

## Pasul 5 — Ridicarea după închiriere

În ziua agreată, în fereastra orară stabilită, vine alt curier — sau același — pentru ridicare. Companionul se ambalează în pungă opacă sigilată pe care o primești în pachetul inițial. Procedura este non-verbală pe partea curierului.

## Pasul 6 — Inspecția de retur

În maxim 24 de ore de la ridicare, companionul ajunge la studio și trece o inspecție în 14 puncte:

- Integritatea pielii exterioare (zgârieturi, tăieturi, pete persistente)
- Articulațiile scheletului (joc lateral, deformări)
- Modulele electronice (termic, vocal — dacă au fost activate)
- Părul peruchii (uzură, încâlcire dincolo de pieptănare normală)
- Igiena (urme de produse necompatibile, contaminare cu coloranți)

Uzura normală (pliuri ușoare în zone de contact, decolorare minoră, pieptănare standard a peruchii) **nu se reține din cauțiune**. Daunele structurale (tăieturi, deformări permanente, contaminare cu coloranți) se evaluează individual și-ți comunicăm în scris suma reținută și motivul, înainte de eliberare.

## Pasul 7 — Eliberarea cauțiunii

În maxim 48 de ore după inspecția de retur, primești fie:

- Eliberarea integrală — pre-autorizarea de card se anulează automat, sau revenim cu numerarul la o adresă convenită.
- Eliberarea parțială — cu explicație scrisă punctuală pe ce s-a reținut.
- Documentația protocolului aplicat la întreținere între închirieri, dacă o ceri.

## Ce să întrebi la primul contact

Pentru a evita surprize, întreabă consilierul:

- Fereastra orară exactă (nu „cândva după-amiază").
- Dacă există stoc fizic în studio sau dacă vine din altă rezervă logistică.
- Care e suma exactă a cauțiunii pentru modelul ales.
- Dacă vrei opțional certificarea protocolului de igienă pentru ciclul tău.

Totul în scris, prin canalul tău preferat. Suntem disponibili 10:00–22:00, șapte zile pe săptămână.
$$,
    array['ghid', 'închiriere', 'prima-utilizare', 'cauțiune'],
    array['tpe-vs-silicon-ghid-complet', 'protocol-igiena-clinica-cinci-pasi', 'directiva-2011-83-retur-produse-intime']::text[],
    false,
    4,
    timestamptz '2026-05-30 09:00:00+02'
)
on conflict (slug) do nothing;
