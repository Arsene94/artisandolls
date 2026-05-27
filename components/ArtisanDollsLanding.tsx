import { getLocale, getTranslations } from "next-intl/server";
import { getHomeFaqItems } from "@/lib/faq/queries";
import type { Locale } from "@/i18n/routing";
import CompanionCollection, {
    type CompanionCard,
} from "@/components/landing/CompanionCollection";
import ContactSection from "@/components/landing/ContactSection";
import ExperiencePackages from "@/components/landing/ExperiencePackages";
import FAQ from "@/components/landing/FAQ";
import Hero from "@/components/landing/Hero";
import HygieneCallout from "@/components/landing/HygieneCallout";
import SensoryBenefits from "@/components/landing/SensoryBenefits";
import TrustRibbon from "@/components/landing/TrustRibbon";
import type { Doll } from "@/lib/dolls";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";

type ArtisanDollsLandingProps = {
    settings: PublicPlatformSettings;
    galleryDolls: Doll[];
    heroDoll: Doll | null;
};

function brandedPlaceholder(text: string, size: { w: number; h: number }) {
    const safe = encodeURIComponent(text.slice(0, 32));
    return `https://placehold.co/${size.w}x${size.h}/0F0406/C9A24A?font=montserrat&text=${safe}`;
}

function fallbackHero(text: string) {
    return brandedPlaceholder(text, { w: 960, h: 1200 });
}

function fallbackCard(name: string) {
    return brandedPlaceholder(name, { w: 600, h: 720 });
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
        })),
    );

    const locale = (await getLocale()) as Locale;
    const faqRows = await getHomeFaqItems(locale).catch(() => []);
    const faqItems = faqRows.map((row) => ({ q: row.question, a: row.answer }));

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
            <CompanionCollection
                dolls={cardDolls}
                currency={settings.currency}
                whatsappPhone={settings.whatsapp_phone}
                contactPhone={settings.contact_phone}
                contactEmail={settings.contact_email}
            />
            <ExperiencePackages
                catalogEnabled={settings.catalog_enabled}
                rentEnabled={settings.rent_enabled}
                buyEnabled={settings.buy_enabled}
            />
            <TrustRibbon />
            <HygieneCallout />
            <SensoryBenefits />
            <ContactSection
                contactPhone={settings.contact_phone}
                whatsappPhone={settings.whatsapp_phone}
                contactEmail={settings.contact_email}
            />
            <FAQ items={faqItems.length > 0 ? faqItems : undefined} />
        </>
    );
}
