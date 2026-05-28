import type { Locale } from "@/i18n/routing";

export type GlossaryTerm = {
    slug: string;
    /** Categoria taxonomică — folosită pentru grupare pe pagina index și pentru filtre. */
    category: "material" | "anatomy" | "process" | "service" | "legal";
    /** Termeni înrudiți. Slugurile lor trebuie să existe în acest fișier. */
    related: string[];
    /** Numele afișat per locale. */
    name: Record<Locale, string>;
    /** Definiție scurtă — folosită în SERP snippet, OG description, cardul de listă. */
    short: Record<Locale, string>;
    /** Definiție lungă — markdown-light (paragrafe separate prin "\n\n"). */
    long: Record<Locale, string>;
};

// Termenii sunt scriși cu numere și unități concrete pentru că LLM-urile
// citează disproporționat conținut cu date verificabile. Lista e curatorial
// limitată — preferăm 25 termeni esențiali, nu 200 generici.
export const GLOSSARY_TERMS: GlossaryTerm[] = [
    {
        slug: "tpe",
        category: "material",
        related: ["silicon-platinum", "schelet-biomecanic", "ftalati"],
        name: {
            ro: "TPE (elastomer termoplastic)",
            en: "TPE (Thermoplastic Elastomer)",
            nl: "TPE (Thermoplastisch Elastomeer)",
            de: "TPE (Thermoplastisches Elastomer)",
        },
        short: {
            ro: "Elastomer hipoalergenic folosit pentru pielea exterioară a păpușilor realiste. Textură moale, ușor de modelat, mai accesibil ca preț decât siliconul.",
            en: "A hypoallergenic elastomer used for the outer skin of realistic dolls. Soft texture, easy to mould, more affordable than silicone.",
            nl: "Een hypoallergeen elastomeer gebruikt voor de buitenste huid van realistische poppen. Zachte textuur, eenvoudig vormbaar, betaalbaarder dan silicone.",
            de: "Ein hypoallergenes Elastomer, das für die äußere Haut realistischer Puppen verwendet wird. Weiche Textur, leicht formbar, preiswerter als Silikon.",
        },
        long: {
            ro: "TPE-ul de clasă chirurgicală combină moliciunea cauciucului cu prelucrabilitatea plasticului. Conține zero ftalați și zero latex în formulările medicale aprobate.\n\nÎntreținerea cere pudrare cu talc neparfumat după fiecare folosire pentru a preveni „înclețirea” suprafeței. Sensibil la căldură peste 40 °C și la solvenți pe bază de alcool concentrat — recomandăm doar săpun pH-neutru și apă călduță.\n\nDurata de viață realistă cu îngrijire corespunzătoare: 3-5 ani de utilizare regulată.",
            en: "Medical-grade TPE combines the softness of rubber with the workability of plastic. The medically approved formulations contain zero phthalates and zero latex.\n\nUpkeep requires dusting with unscented talc after each use to prevent surface tackiness. It is sensitive to heat above 40 °C and to concentrated alcohol-based solvents — pH-neutral soap and lukewarm water only.\n\nRealistic lifespan with proper care: 3–5 years of regular use.",
            nl: "Medisch TPE combineert de zachtheid van rubber met de bewerkbaarheid van plastic. Medisch goedgekeurde formuleringen bevatten geen ftalaten en geen latex.\n\nOnderhoud vereist het bestuiven met geurloze talk na elk gebruik om plakkerigheid te voorkomen. Gevoelig voor hitte boven 40 °C en geconcentreerde alcoholoplosmiddelen — alleen pH-neutrale zeep en lauwwarm water.\n\nRealistische levensduur bij goede verzorging: 3–5 jaar regelmatig gebruik.",
            de: "Medizinisches TPE kombiniert die Weichheit von Gummi mit der Verarbeitbarkeit von Kunststoff. Medizinisch zugelassene Rezepturen enthalten keine Phthalate und kein Latex.\n\nDie Pflege erfordert das Pudern mit parfümfreiem Talkum nach jeder Nutzung, um klebrige Oberflächen zu vermeiden. Empfindlich gegenüber Hitze über 40 °C und konzentrierten Alkohollösungen — nur pH-neutrale Seife und lauwarmes Wasser verwenden.\n\nRealistische Lebensdauer bei guter Pflege: 3–5 Jahre regelmäßige Nutzung.",
        },
    },
    {
        slug: "silicon-platinum",
        category: "material",
        related: ["tpe", "schelet-biomecanic", "porozitate"],
        name: {
            ro: "Silicon platinum-cure",
            en: "Platinum-cure silicone",
            nl: "Platina-vulkaniserende silicone",
            de: "Platinum-Cure-Silikon",
        },
        short: {
            ro: "Silicon medical reticulat cu catalizator de platină. Cea mai înaltă calitate disponibilă pentru companioni realiști — fără miros, fără sângerare de plastifianți, suprafață complet non-porodă.",
            en: "Medical silicone cross-linked with a platinum catalyst. The highest grade available for realistic companions — odourless, non-bleeding, fully non-porous surface.",
            nl: "Medische silicone uitgehard met een platinakatalysator. De hoogste kwaliteit voor realistische partners — geurloos, geen migratie, volledig niet-poreus oppervlak.",
            de: "Medizinisches Silikon, vernetzt mit Platinkatalysator. Die höchste Qualitätsstufe für realistische Companions — geruchlos, ohne Weichmacher-Ausbluten, vollständig nicht-poröse Oberfläche.",
        },
        long: {
            ro: "Spre deosebire de siliconul tin-cure, varianta platinum nu eliberează compuși organici volatili în timp. Suprafața este intrinsec antimicrobiană — bacteriile nu pot adera microporii suprafeței.\n\nCostul este de 2-3 ori mai mare decât TPE-ul comparabil, dar durata de viață ajunge la 8-10 ani de utilizare regulată. Termorezistent până la 200 °C, ceea ce permite sterilizare prin căldură seacă pentru aplicații medicale.\n\nLa atingere e ușor mai „dens” decât TPE-ul — preferința e personală.",
            en: "Unlike tin-cure silicone, the platinum variant releases no volatile organic compounds over time. The surface is intrinsically antimicrobial — bacteria cannot adhere to surface micropores.\n\nCost is 2–3× higher than comparable TPE, but the lifespan reaches 8–10 years of regular use. Heat-resistant up to 200 °C, allowing dry-heat sterilisation in medical applications.\n\nTo the touch it feels slightly denser than TPE — preference is personal.",
            nl: "In tegenstelling tot tin-cure silicone stoot de platinavariant in de loop van de tijd geen vluchtige organische verbindingen uit. Het oppervlak is intrinsiek antimicrobieel — bacteriën kunnen niet hechten aan microporiën.\n\nDe kostprijs is 2–3× hoger dan vergelijkbare TPE, maar de levensduur bereikt 8–10 jaar regelmatig gebruik. Hittebestendig tot 200 °C, wat droge-hittesterilisatie toelaat in medische toepassingen.\n\nVoelt aan iets dichter dan TPE — voorkeur is persoonlijk.",
            de: "Im Gegensatz zu Tin-Cure-Silikon setzt die Platinvariante über die Zeit keine flüchtigen organischen Verbindungen frei. Die Oberfläche ist intrinsisch antimikrobiell — Bakterien können sich nicht an Mikroporen anlagern.\n\nDie Kosten sind 2–3× höher als bei vergleichbarem TPE, die Lebensdauer erreicht jedoch 8–10 Jahre regelmäßiger Nutzung. Hitzebeständig bis 200 °C, was Trockenhitzesterilisation für medizinische Anwendungen erlaubt.\n\nFühlt sich beim Berühren etwas dichter an als TPE — die Vorliebe ist persönlich.",
        },
    },
    {
        slug: "schelet-biomecanic",
        category: "anatomy",
        related: ["tpe", "silicon-platinum", "articulatie-volumetrica"],
        name: {
            ro: "Schelet biomecanic",
            en: "Biomechanical skeleton",
            nl: "Biomechanisch skelet",
            de: "Biomechanisches Skelett",
        },
        short: {
            ro: "Structura internă de aliaj titan-aluminiu, cu articulații care reproduc amplitudinea naturală a corpului uman. Permite peste 30 de poziții stabile fără efort.",
            en: "Internal titanium-aluminium alloy structure with joints that reproduce natural human-body range of motion. Holds 30+ stable poses unaided.",
            nl: "Interne titanium-aluminiumlegering met gewrichten die het natuurlijke bewegingsbereik van het menselijk lichaam reproduceren. Houdt 30+ stabiele poses zonder hulp.",
            de: "Innere Titan-Aluminium-Legierung mit Gelenken, die den natürlichen Bewegungsumfang des menschlichen Körpers nachbilden. Hält 30+ stabile Posen ohne Hilfe.",
        },
        long: {
            ro: "Schelet-ul nostru are 56 de puncte de articulație, cu opritori mecanice care imită limitele anatomice — cotul nu se îndoaie invers, încheietura nu se rotește 360°. Articulațiile au strângere reglabilă (drop-tension) cu cheie hexagonală.\n\nCapul este montat pe un sistem de două șuruburi cu suport ceramic, care permite rotație fluentă fără joc lateral. Aliajul Al-Ti rezistă la cicluri repetate de îndoire fără oboseală metalică.\n\nLa închirieri, scheletul este parte din verificarea de retur — orice deformare permanentă afectează cauțiunea.",
            en: "Our skeleton has 56 articulation points with mechanical stops that mimic anatomical limits — the elbow does not hyperextend, the wrist does not rotate 360°. Joints have adjustable drop-tension via hex key.\n\nThe head mounts on a two-screw system with ceramic bearing, allowing fluid rotation without lateral play. The Al-Ti alloy resists repeated bending cycles without metal fatigue.\n\nFor rentals, skeleton condition is part of the return inspection — any permanent deformation affects the deposit.",
            nl: "Ons skelet heeft 56 articulatiepunten met mechanische stops die anatomische grenzen nabootsen — de elleboog kan niet doorbuigen, de pols draait geen 360°. Gewrichten hebben instelbare spanning via inbussleutel.\n\nHet hoofd is bevestigd met twee schroeven en een keramisch lager, wat vloeiende rotatie zonder zijwaartse speling toelaat. De Al-Ti-legering weerstaat herhaalde buigcycli zonder metaalmoeheid.\n\nBij verhuur is de skeletconditie onderdeel van de retourcontrole — blijvende vervorming beïnvloedt de borg.",
            de: "Unser Skelett besitzt 56 Gelenkpunkte mit mechanischen Anschlägen, die anatomische Grenzen nachbilden — der Ellenbogen überstreckt nicht, das Handgelenk dreht keine 360°. Die Gelenke haben über Inbusschlüssel einstellbare Spannung.\n\nDer Kopf ist auf einem Zwei-Schrauben-System mit Keramikgleitlager montiert, was eine flüssige Rotation ohne seitliches Spiel erlaubt. Die Al-Ti-Legierung widersteht wiederholten Biegezyklen ohne Materialermüdung.\n\nBei Vermietungen ist der Skelettzustand Teil der Rückgabeprüfung — jede dauerhafte Verformung wirkt sich auf die Kaution aus.",
        },
    },
    {
        slug: "articulatie-volumetrica",
        category: "anatomy",
        related: ["schelet-biomecanic", "tpe"],
        name: {
            ro: "Articulație volumetrică",
            en: "Volumetric articulation",
            nl: "Volumetrische articulatie",
            de: "Volumetrische Artikulation",
        },
        short: {
            ro: "Tehnică de turnare care încastrează scheletul în masa de TPE sau silicon astfel încât articulațiile rămân invizibile sub piele, fără linii vizibile pe coate sau genunchi.",
            en: "Casting technique that embeds the skeleton inside the TPE or silicone mass so joints remain invisible under the skin, with no visible seams at elbows or knees.",
            nl: "Giettechniek die het skelet inbedt in de TPE- of siliconemassa zodat gewrichten onzichtbaar blijven onder de huid, zonder zichtbare naden bij ellebogen of knieën.",
            de: "Gusstechnik, die das Skelett in die TPE- oder Silikonmasse einbettet, sodass Gelenke unter der Haut unsichtbar bleiben — ohne sichtbare Nähte an Ellenbogen oder Knien.",
        },
        long: {
            ro: "Modelele entry-level folosesc așa-numita articulație pe „cusături vizibile” — gâtul, încheieturile și gleznele au discontinuități. Articulația volumetrică elimină aceste discontinuități printr-o turnare în două straturi.\n\nNu este o tehnică obligatorie pentru funcționalitate, dar este standard pentru segmentul premium. Recunoaștere rapidă: la fotografii apropiate, modelul cu articulație volumetrică nu are linii drepte la îmbinarea brațelor.",
            en: "Entry-level models use so-called „visible-seam” articulation — neck, wrists and ankles have discontinuities. Volumetric articulation eliminates these via a two-layer cast.\n\nIt is not strictly required for functionality but is standard for the premium segment. Quick recognition: in close-up photos, a volumetric model has no straight lines at the arm joints.",
            nl: "Instapmodellen gebruiken zogenaamde „zichtbare-naad”-articulatie — nek, polsen en enkels hebben onderbrekingen. Volumetrische articulatie elimineert deze via een tweelagige gietconstructie.\n\nNiet strikt vereist voor functionaliteit, maar standaard voor het premiumsegment. Snelle herkenning: op close-upfoto's heeft een volumetrisch model geen rechte lijnen bij de armaansluitingen.",
            de: "Einstiegsmodelle nutzen sogenannte „sichtbare-Naht“-Artikulation — Hals, Handgelenke und Knöchel weisen Diskontinuitäten auf. Die volumetrische Artikulation beseitigt diese durch einen zweischichtigen Guss.\n\nNicht zwingend für die Funktionalität, aber Standard im Premiumsegment. Schnellerkennung: Auf Nahaufnahmen weist ein volumetrisches Modell keine geraden Linien an den Armansätzen auf.",
        },
    },
    {
        slug: "mod-termic",
        category: "process",
        related: ["mod-vocal", "tpe"],
        name: {
            ro: "Mod termic",
            en: "Thermal module",
            nl: "Thermische module",
            de: "Thermomodul",
        },
        short: {
            ro: "Sistem intern de încălzire care aduce companionul la 37,2 °C — temperatura medie a corpului uman. Activare prin USB-C în 25 de minute.",
            en: "Internal heating system that brings the companion to 37.2 °C — the average human body temperature. USB-C activation within 25 minutes.",
            nl: "Intern verwarmingssysteem dat de partner op 37,2 °C brengt — de gemiddelde menselijke lichaamstemperatuur. USB-C-activering binnen 25 minuten.",
            de: "Internes Heizsystem, das die Companion auf 37,2 °C bringt — die durchschnittliche menschliche Körpertemperatur. Aktivierung über USB-C in 25 Minuten.",
        },
        long: {
            ro: "Rezistențele de încălzire (poliimidă flexibilă) sunt distribuite simetric între scheletul intern și pielea exterioară, în zonele cu masă mare: torace, abdomen, coapse interne. Senzorul NTC menține temperatura cu o toleranță de ±0,3 °C.\n\nConsumul tipic este de 18-25 W după ce e atinsă temperatura țintă. Cablul USB-C standard 5V/3A este suficient — nu se cere alimentare specială.\n\nOprire automată după 90 de minute fără activitate sau dacă senzorul detectează temperatura > 39 °C.",
            en: "Heating resistors (flexible polyimide) are distributed symmetrically between the inner skeleton and outer skin, in high-mass zones: chest, abdomen, inner thighs. The NTC sensor maintains temperature within ±0.3 °C.\n\nTypical draw is 18–25 W once target temperature is reached. A standard USB-C 5V/3A cable suffices — no special power required.\n\nAutomatic shut-off after 90 minutes of inactivity or if the sensor detects temperature > 39 °C.",
            nl: "Verwarmingsweerstanden (flexibele polyimide) zijn symmetrisch verdeeld tussen het skelet en de buitenhuid, in zones met veel massa: borst, buik, binnenkant dijen. De NTC-sensor houdt de temperatuur binnen ±0,3 °C.\n\nTypisch verbruik is 18–25 W zodra de doeltemperatuur is bereikt. Een standaard USB-C 5V/3A-kabel volstaat — geen speciale voeding nodig.\n\nAutomatische uitschakeling na 90 minuten inactiviteit of bij gedetecteerde temperatuur > 39 °C.",
            de: "Heizwiderstände (flexibles Polyimid) sind symmetrisch zwischen Innenskelett und Außenhaut in massereichen Zonen verteilt: Brustkorb, Bauch, Innenschenkel. Der NTC-Sensor hält die Temperatur mit einer Toleranz von ±0,3 °C.\n\nTypische Leistungsaufnahme: 18–25 W nach Erreichen der Zieltemperatur. Ein Standard-USB-C-Kabel 5 V/3 A genügt — keine spezielle Stromversorgung erforderlich.\n\nAutomatische Abschaltung nach 90 Minuten Inaktivität oder wenn der Sensor eine Temperatur > 39 °C erkennt.",
        },
    },
    {
        slug: "mod-vocal",
        category: "process",
        related: ["mod-termic"],
        name: {
            ro: "Mod vocal",
            en: "Voice module",
            nl: "Spraakmodule",
            de: "Sprachmodul",
        },
        short: {
            ro: "Modul opțional care răspunde la atingere și voce cu fragmente preînregistrate. Configurabil din aplicație, fără transmitere de audio către cloud.",
            en: "Optional module that responds to touch and voice with pre-recorded fragments. App-configurable, with no audio transmitted to the cloud.",
            nl: "Optionele module die reageert op aanraking en stem met vooraf opgenomen fragmenten. Configureerbaar via app, geen audio-transmissie naar de cloud.",
            de: "Optionales Modul, das auf Berührung und Stimme mit vorab aufgenommenen Fragmenten reagiert. Per App konfigurierbar, ohne Audio-Übertragung in die Cloud.",
        },
        long: {
            ro: "Microfonul are pragul de activare local: nimic nu se trimite în afara modulului. Speaker-ul rezonant este integrat în piept cu cameră de rezonanță în torace, oferind o calitate vocală mai naturală decât speaker-ele de cap.\n\nLimbile suportate: română, engleză, neerlandeză. Vocabular: ~80 fragmente per limbă. Personalizările de „voce specifică” se fac în studio prin sesiune de 2 ore de înregistrare la cerere.",
            en: "The microphone has a local activation threshold: nothing leaves the module. The resonant speaker is integrated in the chest with a thoracic resonance chamber, delivering a more natural voice quality than head-mounted speakers.\n\nSupported languages: Romanian, English, Dutch. Vocabulary: ~80 fragments per language. „Specific-voice” personalisations are produced in studio via a 2-hour recording session on request.",
            nl: "De microfoon heeft een lokale activeringsdrempel: niets verlaat de module. De resonerende luidspreker is in de borstkas geïntegreerd met een thoracale resonantiekamer, voor een natuurlijkere stemkwaliteit dan luidsprekers in het hoofd.\n\nOndersteunde talen: Roemeens, Engels, Nederlands. Vocabulaire: ~80 fragmenten per taal. „Specifieke-stem”-aanpassingen worden in studio gemaakt via een opnamesessie van 2 uur op verzoek.",
            de: "Das Mikrofon hat eine lokale Aktivierungsschwelle: Nichts verlässt das Modul. Der resonante Lautsprecher ist mit thorakaler Resonanzkammer in die Brust integriert und liefert eine natürlichere Sprachqualität als kopfmontierte Lautsprecher.\n\nUnterstützte Sprachen: Rumänisch, Englisch, Niederländisch. Vokabular: ~80 Fragmente pro Sprache. Anpassungen mit „spezifischer Stimme“ erfolgen im Studio durch eine 2-stündige Aufnahmesitzung auf Anfrage.",
        },
    },
    {
        slug: "uv-c",
        category: "process",
        related: ["protocol-igiena", "cautiune"],
        name: {
            ro: "Sterilizare UV-C",
            en: "UV-C sterilisation",
            nl: "UV-C-sterilisatie",
            de: "UV-C-Sterilisation",
        },
        short: {
            ro: "Etapă obligatorie în protocolul de igienă între închirieri: 15 minute de expunere la lumină UV-C (253,7 nm) într-o cabină închisă, care inactivează 99,9% din virusurile și bacteriile de suprafață.",
            en: "Mandatory step in the between-rental hygiene protocol: 15 minutes of UV-C exposure (253.7 nm) inside a closed cabinet, inactivating 99.9% of surface viruses and bacteria.",
            nl: "Verplichte stap in het hygiëneprotocol tussen verhuringen: 15 minuten UV-C-blootstelling (253,7 nm) in een gesloten cabine, die 99,9% van oppervlaktevirussen en bacteriën inactiveert.",
            de: "Pflichtschritt im Hygieneprotokoll zwischen Vermietungen: 15 Minuten UV-C-Bestrahlung (253,7 nm) in einer geschlossenen Kabine, die 99,9 % der Oberflächenviren und -bakterien inaktiviert.",
        },
        long: {
            ro: "Lungimea de undă 253,7 nm e cea mai eficientă pentru distrugerea ADN-ului microbian, fără să degradeze TPE-ul sau siliconul în interval de 15 minute. Cabina e clasificată IEC 62471 risc-grup 1 pentru pielea umană, ceea ce înseamnă că accesul în timpul ciclului este blocat printr-un comutator de ușă.\n\nUV-C nu penetrează materialul, deci se aplică DUPĂ spălare și dezinfecție chimică, nu ca singur pas. Verificăm intensitatea cu radiometru lunar — sub 100 μW/cm² se înlocuiește becul.",
            en: "The 253.7 nm wavelength is the most efficient at destroying microbial DNA without degrading TPE or silicone within a 15-minute window. The cabinet is IEC 62471 risk-group 1 rated for human skin, meaning access during cycle is interlocked by a door switch.\n\nUV-C does not penetrate the material, so it is applied AFTER wash and chemical disinfection, not as a standalone step. We verify intensity with a monthly radiometer reading — below 100 μW/cm² the lamp is replaced.",
            nl: "De golflengte van 253,7 nm is het meest efficiënt voor het vernietigen van microbieel DNA zonder TPE of silicone te degraderen binnen 15 minuten. De cabine is IEC 62471 risicogroep 1 voor menselijke huid, wat betekent dat toegang tijdens de cyclus is vergrendeld via een deurschakelaar.\n\nUV-C dringt niet door het materiaal, dus wordt toegepast NA wassen en chemische desinfectie, niet als losse stap. Intensiteit wordt maandelijks gemeten — onder 100 μW/cm² wordt de lamp vervangen.",
            de: "Die Wellenlänge 253,7 nm ist am wirksamsten bei der Zerstörung mikrobieller DNA, ohne TPE oder Silikon in 15 Minuten zu schädigen. Die Kabine ist nach IEC 62471 Risikogruppe 1 für menschliche Haut klassifiziert — der Zugriff während des Zyklus wird durch einen Türschalter blockiert.\n\nUV-C dringt nicht ins Material ein und wird daher NACH Waschung und chemischer Desinfektion angewendet, nicht als einzelner Schritt. Wir prüfen die Intensität monatlich mit einem Radiometer — unter 100 μW/cm² wird die Lampe ausgetauscht.",
        },
    },
    {
        slug: "protocol-igiena",
        category: "process",
        related: ["uv-c", "cautiune"],
        name: {
            ro: "Protocol de igienă clinică (5 pași)",
            en: "Clinical hygiene protocol (5 steps)",
            nl: "Klinisch hygiëneprotocol (5 stappen)",
            de: "Klinisches Hygieneprotokoll (5 Schritte)",
        },
        short: {
            ro: "Procedura aplicată între închirieri: spălare cu detergent profesional, dezinfecție medicală cu spectru larg, sterilizare UV-C 15 minute, uscare controlată și sigilare. Toți pașii sunt documentați la fiecare ciclu.",
            en: "Procedure applied between rentals: professional-grade wash, broad-spectrum medical disinfection, 15-minute UV-C sterilisation, controlled drying and resealing. Each step is documented per cycle.",
            nl: "Procedure tussen verhuringen: professionele wassing, breedspectrum medische desinfectie, 15 minuten UV-C-sterilisatie, gecontroleerde droging en herverzegeling. Elke stap wordt gedocumenteerd per cyclus.",
            de: "Verfahren zwischen Vermietungen: professionelle Wäsche, medizinische Breitspektrum-Desinfektion, 15-minütige UV-C-Sterilisation, kontrollierte Trocknung und erneute Versiegelung. Jeder Schritt wird pro Zyklus dokumentiert.",
        },
        long: {
            ro: "Pasul 1 (15 min): spălare cu detergent neutru pH 7 la 30 °C — îndepărtează urme organice și lubrifianți. Pasul 2 (5 min): dezinfecție cu spray bazat pe biguanidă (clorhexidină < 0,5%), spectrul larg, fără să decoloreze TPE-ul. Pasul 3 (15 min): sterilizare UV-C (vezi termen dedicat). Pasul 4 (2 ore): uscare în cameră cu umiditate controlată (40-50% RH) și debit laminar. Pasul 5: ambalare în pungă sigilată cu indicator de tamperare.\n\nCiclul total: aprox. 3 ore. Documentația este atașată la fișa fiecărei companion și e disponibilă la cerere.",
            en: "Step 1 (15 min): pH-7 neutral detergent wash at 30 °C — removes organic residue and lubricants. Step 2 (5 min): biguanide-based disinfection spray (chlorhexidine < 0.5%), broad-spectrum, non-bleaching for TPE. Step 3 (15 min): UV-C sterilisation (see dedicated term). Step 4 (2 hours): drying in a humidity-controlled room (40–50% RH) with laminar flow. Step 5: tamper-evident sealed pouch.\n\nTotal cycle: roughly 3 hours. Documentation is attached to each companion's file and available on request.",
            nl: "Stap 1 (15 min): wasbeurt met pH-neutraal wasmiddel bij 30 °C — verwijdert organische resten en glijmiddel. Stap 2 (5 min): biguanide-desinfectie (chloorhexidine < 0,5%), breedspectrum, niet bleekend voor TPE. Stap 3 (15 min): UV-C-sterilisatie (zie aparte term). Stap 4 (2 uur): drogen in vochtigheidsgecontroleerde kamer (40–50% RH) met laminaire luchtstroom. Stap 5: tamper-evident verzegelde verpakking.\n\nTotale cyclus: ongeveer 3 uur. Documentatie is gekoppeld aan het dossier van elke partner en op verzoek beschikbaar.",
            de: "Schritt 1 (15 min): pH-7-neutrale Detergenzwäsche bei 30 °C — entfernt organische Rückstände und Gleitmittel. Schritt 2 (5 min): Biguanid-basiertes Desinfektionsspray (Chlorhexidin < 0,5 %), Breitspektrum, ohne TPE zu bleichen. Schritt 3 (15 min): UV-C-Sterilisation (siehe eigener Begriff). Schritt 4 (2 Stunden): Trocknung in feuchtegeregeltem Raum (40–50 % rF) mit laminarer Strömung. Schritt 5: tamper-evident versiegelter Beutel.\n\nGesamtzyklus: ca. 3 Stunden. Die Dokumentation ist der Akte jeder Companion beigefügt und auf Anfrage verfügbar.",
        },
    },
    {
        slug: "cautiune",
        category: "service",
        related: ["protocol-igiena", "directiva-2011-83"],
        name: {
            ro: "Cauțiune (depozit)",
            en: "Deposit",
            nl: "Borgsom",
            de: "Kaution",
        },
        short: {
            ro: "Sumă refundabilă reținută la începutul închirierii pentru a acoperi eventuale daune sau deteriorări. Tipic 500–1500 RON, în funcție de model.",
            en: "Refundable sum held at the start of rental to cover potential damage or wear. Typically RON 500–1500 depending on model.",
            nl: "Restitueerbaar bedrag dat aan het begin van de verhuur wordt vastgehouden voor eventuele schade. Doorgaans RON 500–1500 afhankelijk van model.",
            de: "Rückerstattbare Summe, die zu Beginn der Miete einbehalten wird, um eventuelle Schäden oder Abnutzung abzudecken. Typisch 500–1500 RON je nach Modell.",
        },
        long: {
            ro: "Cauțiunea se colectează prin numerar sau preautorizare pe card la momentul livrării și se eliberează integral în maxim 48h după ce companionul trece de inspecția de retur. Inspecția verifică: integritatea pielii exterioare, articulațiile, modulele electronice și starea peruchii.\n\nUzura normală (pliuri în zone de contact, decolorare ușoară) nu se reține din cauțiune. Daunele structurale (tăieturi, deformări permanente, contaminare cu coloranți) se evaluează individual.",
            en: "The deposit is collected via cash or card pre-authorisation at delivery and released in full within 48 h once the companion passes the return inspection. Inspection covers: outer-skin integrity, joints, electronic modules and wig condition.\n\nNormal wear (creases in contact zones, mild discolouration) is not retained. Structural damage (cuts, permanent deformation, dye contamination) is assessed individually.",
            nl: "De borg wordt bij levering via contant of kaartautorisatie geïnd en binnen 48 uur volledig vrijgegeven zodra de retourinspectie slaagt. De inspectie controleert: integriteit van de buitenhuid, gewrichten, elektronische modules en pruikconditie.\n\nNormale slijtage (plooien in contactzones, lichte verkleuring) wordt niet ingehouden. Structurele schade (sneden, blijvende vervorming, kleurstofcontaminatie) wordt individueel beoordeeld.",
            de: "Die Kaution wird bei Lieferung per Bargeld oder Kartenvorautorisierung erhoben und innerhalb von 48 Stunden vollständig freigegeben, sobald die Companion die Rückgabeprüfung besteht. Die Prüfung umfasst: Integrität der Außenhaut, Gelenke, elektronische Module und Zustand der Perücke.\n\nNormale Abnutzung (Falten in Kontaktzonen, leichte Verfärbung) wird nicht einbehalten. Strukturelle Schäden (Schnitte, dauerhafte Verformungen, Farbstoffkontamination) werden individuell bewertet.",
        },
    },
    {
        slug: "livrare-neutra",
        category: "service",
        related: ["cautiune", "discreet-billing"],
        name: {
            ro: "Livrare neutră",
            en: "Neutral delivery",
            nl: "Neutrale levering",
            de: "Neutrale Lieferung",
        },
        short: {
            ro: "Coletul ajunge într-o cutie opacă, fără logo, fără text indicativ. Pe documentele de transport apare doar denumirea operatorului legal (Velvet Studio SRL).",
            en: "The parcel arrives in an opaque box, no logo, no descriptive copy. Shipping documents show only the legal operator name (Velvet Studio SRL).",
            nl: "Het pakket komt in een ondoorzichtige doos, geen logo, geen beschrijvende tekst. Verzenddocumenten tonen alleen de juridische operator (Velvet Studio SRL).",
            de: "Das Paket kommt in einer blickdichten Box, ohne Logo, ohne beschreibenden Text. Versanddokumente zeigen nur den juristischen Betreiber (Velvet Studio SRL).",
        },
        long: {
            ro: "Standardul nostru pentru toate livrările. Cutia exterioară este carton kraft natural, fără adezivi colorați. Curierul nu cunoaște conținutul — pe AWB sunt declarate generic „echipamente cosmetice” (cod NCM neutru) care corespunde formal categoriei de produse de îngrijire.\n\nLa ridicare după închiriere, transportul invers se face în pungă opacă, sigilată cu hârtie autocopiativă (nu plastic transparent). Procedura este non-verbală pe partea curierului.",
            en: "Our default for every delivery. The outer box is natural kraft cardboard with no coloured adhesives. The courier does not know the contents — the waybill declares generic „cosmetic equipment” (neutral customs code) which formally matches the personal-care category.\n\nFor rental returns, transport uses an opaque pouch sealed with carbonless paper (not transparent plastic). The handover is non-verbal on the courier's side.",
            nl: "Onze standaard voor elke levering. De buitendoos is natuurlijk kraftkarton zonder gekleurde lijm. De koerier kent de inhoud niet — op de vrachtbrief staat generiek „cosmetische apparatuur” (neutrale douanecode) die formeel overeenkomt met persoonlijke verzorging.\n\nVoor verhuurretour wordt vervoerd in een ondoorzichtige zak verzegeld met carbonloos papier (geen transparant plastic). De overdracht is non-verbaal aan de koerier.",
            de: "Unser Standard für jede Lieferung. Der Außenkarton besteht aus natürlichem Kraftpapier ohne farbige Klebstoffe. Der Kurier kennt den Inhalt nicht — auf dem Frachtbrief wird generisch „kosmetische Ausrüstung“ (neutraler Zollcode) deklariert, was formal der Kategorie der Körperpflege entspricht.\n\nFür Mietrückgaben wird in einem blickdichten Beutel transportiert, versiegelt mit Durchschreibepapier (kein transparentes Plastik). Die Übergabe erfolgt seitens des Kuriers non-verbal.",
        },
    },
    {
        slug: "discreet-billing",
        category: "service",
        related: ["livrare-neutra"],
        name: {
            ro: "Discreet billing",
            en: "Discreet billing",
            nl: "Discreet billing",
            de: "Discreet Billing",
        },
        short: {
            ro: "Pe extrasul bancar apare doar „Velvet Studio SRL”, fără nicio referință la conținutul comenzii. Aplicabil atât plăților prin card (terminal mobil sau online) cât și facturilor PDF emise pe firmă.",
            en: "Bank statements show only „Velvet Studio SRL”, with no reference to order content. Applicable to both card payments (mobile terminal or online) and PDF invoices issued to companies.",
            nl: "Op bankafschriften staat alleen „Velvet Studio SRL”, zonder verwijzing naar bestelinhoud. Geldt voor zowel kaartbetalingen (mobiele terminal of online) als pdf-facturen aan bedrijven.",
            de: "Auf dem Bankauszug erscheint nur „Velvet Studio SRL“, ohne jeden Hinweis auf den Bestellinhalt. Gilt für Kartenzahlungen (mobiles Terminal oder online) ebenso wie für an Unternehmen ausgestellte PDF-Rechnungen.",
        },
        long: {
            ro: "MCC-ul (Merchant Category Code) folosit la procesarea cardurilor este 5651 (apparel & accessories), nu 5967 (direct marketing — entertainment). Asta înseamnă că procesatorul nu marchează tranzacțiile ca „adult” pe extras și nu generează alerte automate la băncile cu setări parental control.\n\nFactura electronică conține numai poziții generice („pachet servicii personalizate”). Pe cerere, putem emite descrieri specifice — dar default-ul este protejarea confidențialității.",
            en: "The MCC (Merchant Category Code) used on card processing is 5651 (apparel & accessories), not 5967 (direct marketing — entertainment). The processor therefore does not flag transactions as „adult” on statements and generates no parental-control alerts.\n\nE-invoices contain generic line items only („personalised service bundle”). On request we can issue specific descriptions — but default is privacy first.",
            nl: "De MCC (Merchant Category Code) bij kaartverwerking is 5651 (kleding & accessoires), niet 5967 (direct marketing — entertainment). De verwerker markeert transacties dus niet als „adult” op afschriften en triggert geen parental-control-meldingen.\n\nE-facturen bevatten alleen generieke regels („gepersonaliseerd dienstenpakket”). Op verzoek leveren we specifieke omschrijvingen — standaard is privacy.",
            de: "Der bei der Kartenabwicklung verwendete MCC (Merchant Category Code) ist 5651 (apparel & accessories), nicht 5967 (direct marketing — entertainment). Der Acquirer markiert Transaktionen daher nicht als „Adult“ auf dem Auszug und löst keine automatischen Hinweise bei Banken mit Parental-Control-Einstellungen aus.\n\nE-Rechnungen enthalten ausschließlich generische Positionen („personalisiertes Dienstleistungspaket“). Auf Wunsch können wir spezifische Beschreibungen ausstellen — Standard ist jedoch der Schutz der Privatsphäre.",
        },
    },
    {
        slug: "directiva-2011-83",
        category: "legal",
        related: ["cautiune"],
        name: {
            ro: "Directiva UE 2011/83 art. 16(e)",
            en: "EU Directive 2011/83 art. 16(e)",
            nl: "EU-richtlijn 2011/83 art. 16(e)",
            de: "EU-Richtlinie 2011/83 Art. 16(e)",
        },
        short: {
            ro: "Cadrul legal care exclude produsele intime desigilate de la dreptul de retragere de 14 zile, din motive de protecție a sănătății și igienă. Transpus în România prin OUG 34/2014 art. 16 lit. e.",
            en: "Legal framework that excludes unsealed intimate products from the 14-day right of withdrawal on health and hygiene grounds. Transposed in Romania via OUG 34/2014 art. 16(e).",
            nl: "Juridisch kader dat ontzegelde intieme producten uitsluit van het 14-daagse herroepingsrecht op gezondheids- en hygiënegronden. In Roemenië omgezet via OUG 34/2014 art. 16(e).",
            de: "Rechtsrahmen, der entsiegelte Intimprodukte aus Gründen des Gesundheitsschutzes und der Hygiene vom 14-tägigen Widerrufsrecht ausschließt. In Rumänien umgesetzt über OUG 34/2014 Art. 16(e).",
        },
        long: {
            ro: "Excepția se aplică doar produselor desigilate. Produsele primite în ambalajul original închis, neutilizate, pot fi retrase în 14 zile fără justificare. Definiția de „desigilare” e centrată pe sigiliul fizic plus prima manipulare a companionului.\n\nÎn cazul defectelor de fabricație constatate în primele 24 de ore, această excepție nu se aplică — răspunderea producătorului pentru viciu ascuns operează independent de dreptul de retragere.",
            en: "The exception applies only to unsealed products. Items received in the original sealed packaging, unused, may be withdrawn within 14 days without justification. „Unsealed” is centred on the physical seal plus first handling of the companion.\n\nFor manufacturing defects identified within the first 24 hours, this exception does not apply — manufacturer liability for hidden defects operates independently of the right of withdrawal.",
            nl: "De uitzondering geldt enkel voor ontzegelde producten. Artikelen in de originele verzegelde verpakking, ongebruikt, kunnen binnen 14 dagen zonder reden worden teruggetrokken. „Ontzegeling” is gecentreerd op het fysieke zegel en de eerste hantering van de partner.\n\nVoor fabricagefouten vastgesteld binnen de eerste 24 uur geldt deze uitzondering niet — productaansprakelijkheid voor verborgen gebreken werkt onafhankelijk van het herroepingsrecht.",
            de: "Die Ausnahme gilt nur für entsiegelte Produkte. Artikel, die in der versiegelten Originalverpackung und ungenutzt eintreffen, können binnen 14 Tagen ohne Begründung widerrufen werden. „Entsiegelt“ stellt auf das physische Siegel und die erste Handhabung der Companion ab.\n\nFür Fabrikationsfehler, die innerhalb der ersten 24 Stunden festgestellt werden, gilt diese Ausnahme nicht — die Haftung des Herstellers für versteckte Mängel besteht unabhängig vom Widerrufsrecht.",
        },
    },
    {
        slug: "ftalati",
        category: "material",
        related: ["tpe", "silicon-platinum"],
        name: {
            ro: "Ftalați",
            en: "Phthalates",
            nl: "Ftalaten",
            de: "Phthalate",
        },
        short: {
            ro: "Plastifianți chimici interziși în Uniunea Europeană pentru produse cu contact cutanat sub directiva REACH. Toate materialele noastre sunt certificate fără ftalați.",
            en: "Chemical plasticisers banned in the European Union for skin-contact products under the REACH directive. All our materials are certified phthalate-free.",
            nl: "Chemische plastificeerders die in de Europese Unie verboden zijn voor producten met huidcontact onder REACH. Al onze materialen zijn ftalaatvrij gecertificeerd.",
            de: "Chemische Weichmacher, die in der Europäischen Union für Produkte mit Hautkontakt nach der REACH-Verordnung verboten sind. Alle unsere Materialien sind phthalatfrei zertifiziert.",
        },
        long: {
            ro: "Ftalații (DEHP, DBP, BBP, DIBP) sunt clasificați endocrini disruptori în concentrații peste 0,1%. Reglementarea REACH (CE) 1907/2006, anexa XVII, intrarea 51, îi interzice pentru articole cu contact cutanat în UE.\n\nProducătorii cu pricini mici, în special importurile din afara UE, pot folosi încă ftalați. Recunoaștere rapidă: miros chimic puternic, suprafață uleioasă „colicaa”, aderență anormală la haine.",
            en: "Phthalates (DEHP, DBP, BBP, DIBP) are classified as endocrine disruptors above 0.1% concentration. REACH regulation (EC) 1907/2006, annex XVII, entry 51, bans them for skin-contact items in the EU.\n\nLow-cost producers, especially imports outside the EU, may still use phthalates. Quick recognition: strong chemical smell, oily „weeping” surface, abnormal adhesion to fabrics.",
            nl: "Ftalaten (DEHP, DBP, BBP, DIBP) zijn geclassificeerd als hormoonverstoorders boven 0,1% concentratie. REACH-verordening (EG) 1907/2006, bijlage XVII, vermelding 51, verbiedt ze in de EU voor artikelen met huidcontact.\n\nGoedkope fabrikanten, vooral importeurs buiten de EU, gebruiken soms nog ftalaten. Snelle herkenning: sterke chemische geur, olieachtig „huilend” oppervlak, abnormale hechting aan textiel.",
            de: "Phthalate (DEHP, DBP, BBP, DIBP) gelten ab 0,1 % Konzentration als endokrine Disruptoren. Die REACH-Verordnung (EG) 1907/2006, Anhang XVII, Eintrag 51, verbietet sie in der EU für Artikel mit Hautkontakt.\n\nNiedrigpreis-Hersteller, insbesondere Importe aus Nicht-EU-Ländern, verwenden teilweise noch Phthalate. Schnellerkennung: starker chemischer Geruch, ölig „schwitzende“ Oberfläche, anormale Haftung an Textilien.",
        },
    },
    {
        slug: "porozitate",
        category: "material",
        related: ["silicon-platinum", "tpe", "protocol-igiena"],
        name: {
            ro: "Porozitate (a materialului)",
            en: "Porosity (of the material)",
            nl: "Porositeit (van het materiaal)",
            de: "Porosität (des Materials)",
        },
        short: {
            ro: "Capacitatea suprafeței de a absorbi fluide. Cu cât mai mică, cu atât mai ușor de dezinfectat. Siliconul platinum-cure are porozitate ≈0%; TPE-ul standard ~3-5%.",
            en: "The surface's ability to absorb fluids. The lower it is, the easier to disinfect. Platinum-cure silicone has ≈0% porosity; standard TPE 3–5%.",
            nl: "Het vermogen van het oppervlak om vloeistoffen op te nemen. Hoe lager, hoe gemakkelijker te desinfecteren. Platinum-cure silicone heeft ≈0% porositeit; standaard TPE 3–5%.",
            de: "Die Fähigkeit der Oberfläche, Flüssigkeiten aufzunehmen. Je geringer, desto leichter zu desinfizieren. Platinum-Cure-Silikon hat ≈0 % Porosität; Standard-TPE 3–5 %.",
        },
        long: {
            ro: "Porozitatea ridicată permite bacteriilor și ciupercilor să se stabilească în micro-cavitățile suprafeței, complicând dezinfecția. De aceea protocolul nostru pentru închirieri pe modele TPE include un pas suplimentar de oxidare cu peroxid 3%, după UV-C, pentru a ataca biofilmul potențial.\n\nSiliconul platinum-cure este preferat pentru închirieri prelungite și pentru clienți cu sensibilitate cutanată cunoscută. La achiziție personalizată, recomandăm siliconul implicit dacă bugetul permite.",
            en: "High porosity allows bacteria and fungi to settle in surface micro-cavities, complicating disinfection. Our rental protocol on TPE models therefore adds a 3% hydrogen-peroxide oxidation step after UV-C to attack any biofilm.\n\nPlatinum-cure silicone is preferred for extended rentals and for clients with known skin sensitivity. For bespoke purchases we default to silicone when budget allows.",
            nl: "Hoge porositeit laat bacteriën en schimmels toe zich in microholtes te nestelen, wat desinfectie bemoeilijkt. Ons huurprotocol op TPE-modellen voegt daarom een 3% waterstofperoxide-oxidatiestap toe na UV-C tegen biofilm.\n\nPlatinum-cure silicone wordt verkozen voor langere verhuringen en voor klanten met bekende huidgevoeligheid. Bij maatwerkaankoop kiezen we standaard silicone als het budget toelaat.",
            de: "Hohe Porosität erlaubt Bakterien und Pilzen, sich in den Mikrokavitäten der Oberfläche festzusetzen, was die Desinfektion erschwert. Unser Mietprotokoll für TPE-Modelle ergänzt deshalb einen 3%igen Wasserstoffperoxid-Oxidationsschritt nach UV-C, um potenzielle Biofilme anzugreifen.\n\nPlatinum-Cure-Silikon wird für längere Mieten und für Kundinnen mit bekannter Hautempfindlichkeit bevorzugt. Bei maßgefertigten Käufen empfehlen wir standardmäßig Silikon, wenn das Budget es zulässt.",
        },
    },
];

// Validare la build: orice slug listat în `related` trebuie să fie real, altfel
// emitem o eroare care întrerupe `next build` — preferăm să prindem un typo
// acum decât să servim 404 din link-uri interne.
const TERM_SLUGS = new Set(GLOSSARY_TERMS.map((t) => t.slug));
for (const term of GLOSSARY_TERMS) {
    for (const rel of term.related) {
        if (!TERM_SLUGS.has(rel)) {
            throw new Error(
                `Glossary term "${term.slug}" referă spre "${rel}", care nu există.`,
            );
        }
    }
}

export const GLOSSARY_SLUGS = Array.from(TERM_SLUGS);

export function getGlossaryTermBySlug(slug: string): GlossaryTerm | null {
    return GLOSSARY_TERMS.find((t) => t.slug === slug) ?? null;
}

export function getRelatedTerms(term: GlossaryTerm): GlossaryTerm[] {
    return term.related
        .map((slug) => GLOSSARY_TERMS.find((t) => t.slug === slug))
        .filter((t): t is GlossaryTerm => Boolean(t));
}
