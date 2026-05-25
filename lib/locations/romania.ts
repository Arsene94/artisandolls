export type RomanianCountyCode = "B" | "IF";

export type RomanianLocalityGroup = {
    label: string;
    localities: string[];
};

export type RomanianCounty = {
    code: RomanianCountyCode;
    name: string;
    groups: RomanianLocalityGroup[];
};

export const romanianCounties: RomanianCounty[] = [
    {
        code: "B",
        name: "București",
        groups: [
            {
                label: "Sectoare",
                localities: [
                    "Sectorul 1",
                    "Sectorul 2",
                    "Sectorul 3",
                    "Sectorul 4",
                    "Sectorul 5",
                    "Sectorul 6",
                ],
            },
        ],
    },
    {
        code: "IF",
        name: "Ilfov",
        groups: [
            {
                label: "Orașe",
                localities: [
                    "Bragadiru",
                    "Buftea",
                    "Chitila",
                    "Rudeni (Chitila)",
                    "Măgurele",
                    "Alunișu (Măgurele)",
                    "Dumitrana (Măgurele)",
                    "Pruni (Măgurele)",
                    "Vârteju (Măgurele)",
                    "Otopeni",
                    "Odăile (Otopeni)",
                    "Pantelimon",
                    "Popești-Leordeni",
                    "Voluntari",
                ],
            },
            {
                label: "Comuna 1 Decembrie",
                localities: ["1 Decembrie"],
            },
            {
                label: "Comuna Afumați",
                localities: ["Afumați"],
            },
            {
                label: "Comuna Balotești",
                localities: ["Balotești", "Dumbrăveni", "Săftica"],
            },
            {
                label: "Comuna Berceni",
                localities: ["Berceni"],
            },
            {
                label: "Comuna Brănești",
                localities: ["Brănești", "Islaz", "Pasărea", "Vadu Anei"],
            },
            {
                label: "Comuna Cernica",
                localities: [
                    "Cernica",
                    "Bălăceanca",
                    "Căldăraru",
                    "Poșta",
                    "Tânganu",
                ],
            },
            {
                label: "Comuna Chiajna",
                localities: ["Chiajna", "Dudu", "Roșu"],
            },
            {
                label: "Comuna Ciolpani",
                localities: ["Ciolpani", "Izvorani", "Lupăria", "Piscu"],
            },
            {
                label: "Comuna Ciorogârla",
                localities: ["Ciorogârla", "Dârvari"],
            },
            {
                label: "Comuna Clinceni",
                localities: ["Clinceni", "Olteni", "Ordoreanu"],
            },
            {
                label: "Comuna Copăceni",
                localities: ["Copăceni"],
            },
            {
                label: "Comuna Corbeanca",
                localities: ["Corbeanca", "Ostratu", "Petrești", "Tamași"],
            },
            {
                label: "Comuna Cornetu",
                localities: ["Cornetu", "Buda"],
            },
            {
                label: "Comuna Dărăști-Ilfov",
                localities: ["Dărăști-Ilfov"],
            },
            {
                label: "Comuna Dascălu",
                localities: ["Dascălu", "Creața", "Gagu", "Runcu"],
            },
            {
                label: "Comuna Dobroești",
                localities: ["Dobroești", "Fundeni"],
            },
            {
                label: "Comuna Domnești",
                localities: ["Domnești", "Țegheș"],
            },
            {
                label: "Comuna Dragomirești-Vale",
                localities: [
                    "Dragomirești-Vale",
                    "Dragomirești-Deal",
                    "Zurbaua",
                ],
            },
            {
                label: "Comuna Găneasa",
                localities: [
                    "Găneasa",
                    "Cozieni",
                    "Moara Domnească",
                    "Piteasca",
                    "Șindrilița",
                ],
            },
            {
                label: "Comuna Glina",
                localities: ["Glina", "Cățelu", "Manolache"],
            },
            {
                label: "Comuna Grădiștea",
                localities: ["Grădiștea", "Sitaru"],
            },
            {
                label: "Comuna Gruiu",
                localities: [
                    "Gruiu",
                    "Lipia",
                    "Șanțu-Florești",
                    "Siliștea Snagovului",
                ],
            },
            {
                label: "Comuna Jilava",
                localities: ["Jilava"],
            },
            {
                label: "Comuna Moara Vlăsiei",
                localities: ["Moara Vlăsiei", "Căciulați"],
            },
            {
                label: "Comuna Mogoșoaia",
                localities: ["Mogoșoaia"],
            },
            {
                label: "Comuna Nuci",
                localities: [
                    "Nuci",
                    "Merii Petchii",
                    "Micșuneștii Mari",
                    "Micșuneștii-Moara",
                ],
            },
            {
                label: "Comuna Periș",
                localities: ["Periș", "Bălteni", "Burias"],
            },
            {
                label: "Comuna Petrăchioaia",
                localities: [
                    "Petrăchioaia",
                    "Maineasca",
                    "Surlari",
                    "Vânători",
                ],
            },
            {
                label: "Comuna Snagov",
                localities: [
                    "Snagov",
                    "Ghermănești",
                    "Tâncăbești",
                    "Vlădiceasca",
                ],
            },
            {
                label: "Comuna Ștefăneștii de Jos",
                localities: [
                    "Ștefăneștii de Jos",
                    "Ștefăneștii de Sus",
                    "Crețuleasca",
                ],
            },
            {
                label: "Comuna Tunari",
                localities: ["Tunari", "Dimieni"],
            },
            {
                label: "Comuna Vidra",
                localities: ["Vidra", "Crețești", "Sintești"],
            },
        ],
    },
];

export function getCountyByCode(code: string): RomanianCounty | null {
    return (
        romanianCounties.find((county) => county.code === code) ?? null
    );
}
