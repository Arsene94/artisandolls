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
        image: "https://placehold.co/480x580/120612/ff9bd0?text=Eleonora",
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
        image: "https://placehold.co/480x580/1a0716/ff4fa3?text=Seraphine",
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
        image: "https://placehold.co/480x580/22091c/ffc1df?text=Violetta",
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
        image: "https://placehold.co/480x580/090009/ff4fa3?text=Isabelle",
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
        image: "https://placehold.co/480x580/130713/ff9bd0?text=Aurora",
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
        image: "https://placehold.co/480x580/2a0821/ff9bd0?text=Celeste",
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
