import { getTranslations } from "next-intl/server";
import CompanionCollection, {
    type CompanionCard,
} from "@/components/landing/CompanionCollection";
import ContactSection from "@/components/landing/ContactSection";
import Customizer from "@/components/landing/Customizer";
import ExperiencePackages from "@/components/landing/ExperiencePackages";
import FAQ from "@/components/landing/FAQ";
import Hero from "@/components/landing/Hero";
import HygieneCallout from "@/components/landing/HygieneCallout";
import SensoryBenefits from "@/components/landing/SensoryBenefits";
import type { Doll } from "@/lib/dolls";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";

type ArtisanDollsLandingProps = {
    settings: PublicPlatformSettings;
    galleryDolls: Doll[];
    heroDoll: Doll | null;
};

function fallbackHero(text: string) {
    void text;
    return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
}

function fallbackCard(name: string) {
    const fallbacks: Record<string, string> = {
        Serena: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        Aria: "https://images.unsplash.com/photo-1615486171448-4fdcb54c4897?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        Elena: "https://images.unsplash.com/photo-1512413914486-1eb8a614d35e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    };

    return fallbacks[name] ?? `https://placehold.co/600x600/0F0406/D4AF37?text=${encodeURIComponent(name)}`;
}

function extractHeight(doll: Doll): string | undefined {
    return doll.tags?.find((tag) => /\d+\s*cm/i.test(tag));
}

export default async function ArtisanDollsLanding({
    settings,
    galleryDolls,
    heroDoll,
}: ArtisanDollsLandingProps) {
    const t = await getTranslations("home.hero");

    const heroImage = heroDoll?.image
        ? await getSupabaseImageUrlServer(heroDoll.image, "hero")
        : fallbackHero(t("fallbackImageText"));

    const cardDolls: CompanionCard[] = await Promise.all(
        galleryDolls.slice(0, 3).map(async (doll) => ({
            ...doll,
            imageUrl: doll.image
                ? await getSupabaseImageUrlServer(doll.image, "card")
                : fallbackCard(doll.name),
        }))
    );

    return (
        <>
            <Hero
                heroDoll={
                    heroDoll
                        ? {
                              name: heroDoll.name,
                              image: heroImage,
                              height: extractHeight(heroDoll),
                              description: heroDoll.description,
                          }
                        : null
                }
                fallbackImage={heroImage}
                catalogEnabled={settings.catalog_enabled}
                rentEnabled={settings.rent_enabled}
                buyEnabled={settings.buy_enabled}
            />
            <SensoryBenefits />
            <Customizer />
            <CompanionCollection dolls={cardDolls} />
            <ExperiencePackages
                catalogEnabled={settings.catalog_enabled}
                rentEnabled={settings.rent_enabled}
                buyEnabled={settings.buy_enabled}
            />
            <HygieneCallout />
            <ContactSection
                contactPhone={settings.contact_phone}
                whatsappPhone={settings.whatsapp_phone}
                contactEmail={settings.contact_email}
            />
            <FAQ />
        </>
    );
}
