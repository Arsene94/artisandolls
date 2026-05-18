export type CatalogMode = "rent" | "buy";

export type DollAvailability = "available" | "custom" | "limited" | "sold_out";

export type Doll = {
    id: string;
    name: string;
    collection: string;
    description: string;
    image: string;
    badge: string;
    availability: DollAvailability;
    availableForRent: boolean;
    availableForBuy: boolean;
    rentPricePerDay: number | null;
    buyPrice: number | null;
    tags: string[];
};

export const dolls: Doll[] = [
    {
        id: "eleonora",
        name: "Eleonora",
        collection: "Ediții Limitate",
        description: "Piesă de colecție realizată manual, cu detalii couture și finisaje premium.",
        image: "https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-14.jpg",
        badge: "Ediție Limitată",
        availability: "limited",
        availableForRent: true,
        availableForBuy: true,
        rentPricePerDay: 180,
        buyPrice: 3200,
        tags: ["Premium", "Limitată", "Disponibilă"],
    },
    {
        id: "seraphine",
        name: "Séraphine",
        collection: "Seria Anotimpuri",
        description: "Păpușă artistică inspirată de tonuri calde, textile fine și siluetă elegantă.",
        image: "https://vsdoll.net/wp-content/uploads/2021/03/AlessandraItalianGirlfriendSexDoll21.jpg",
        badge: "Personalizabil",
        availability: "custom",
        availableForRent: true,
        availableForBuy: true,
        rentPricePerDay: 140,
        buyPrice: 2600,
        tags: ["Personalizabilă", "Couture", "Toamnă"],
    },
    {
        id: "violetta",
        name: "Violetta",
        collection: "Seria Clasică",
        description: "Model vintage couture, cu expresie delicată și accesorii lucrate manual.",
        image: "https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-7.webp",
        badge: "Sold Out",
        availability: "sold_out",
        availableForRent: false,
        availableForBuy: false,
        rentPricePerDay: null,
        buyPrice: null,
        tags: ["Vintage", "Clasică", "Sold out"],
    },
    {
        id: "isabelle",
        name: "Isabelle",
        collection: "Colecția Noir",
        description: "Piesă dramatică, cu styling dark-pink, ideală pentru colecții private.",
        image: "https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-7-1.webp",
        badge: "Comandă Specială",
        availability: "custom",
        availableForRent: false,
        availableForBuy: true,
        rentPricePerDay: null,
        buyPrice: 4100,
        tags: ["Noir", "Comandă specială", "Colecție"],
    },
    {
        id: "aurora",
        name: "Aurora",
        collection: "Seria Anotimpuri",
        description: "Păpușă luminoasă, cu vestimentație pastelată și detalii fine de primăvară.",
        image: "https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-11-1-1.webp",
        badge: "Disponibil",
        availability: "available",
        availableForRent: true,
        availableForBuy: true,
        rentPricePerDay: 120,
        buyPrice: 2400,
        tags: ["Disponibilă", "Primăvară", "Elegantă"],
    },
    {
        id: "celeste",
        name: "Céleste",
        collection: "Seria Fantaisie",
        description: "Model fantasy realizat manual, cu accesorii miniaturale și styling rafinat.",
        image: "https://vsdoll.net/wp-content/uploads/2025/03/Parry-rabbit-sex-doll-SY140cm-big-breast-2.jpg",
        badge: "Personalizabil",
        availability: "custom",
        availableForRent: true,
        availableForBuy: true,
        rentPricePerDay: 150,
        buyPrice: 2900,
        tags: ["Fantasy", "Personalizabilă", "Artizanal"],
    },
];

export const collections = Array.from(new Set(dolls.map((doll) => doll.collection)));
