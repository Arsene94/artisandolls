import { bucuresti } from "./bucuresti";
import type { CityPillar } from "./types";

// Înregistrul orașelor pe care le deservim ca pagini SEO dedicate. Adăugarea
// unui oraș nou înseamnă:
//   1. fișier nou `lib/cities/<slug>.ts` cu obiect `CityPillar`,
//   2. adaugă-l în array-ul de mai jos,
//   3. completează `messages/ro.json` namespace `cityPillar.<slug>` cu titluri/meta.
// Restul (rută, schemă, sitemap) se derivă automat din metadate.
export const CITY_PILLARS: CityPillar[] = [bucuresti];

export const CITY_SLUGS = CITY_PILLARS.map((c) => c.slug);

export function getCityPillarBySlug(slug: string): CityPillar | null {
    return CITY_PILLARS.find((c) => c.slug === slug) ?? null;
}

export type { CityPillar } from "./types";
