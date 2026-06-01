import { getLocale } from "next-intl/server";
import { getHomeFaqItems } from "@/lib/faq/queries";
import type { Locale } from "@/i18n/routing";
import AboutSection from "@/components/landing/AboutSection";
import BuySection from "@/components/landing/BuySection";
import FAQ from "@/components/landing/FAQ";
import FeaturedSection, {
    type FeaturedCard,
} from "@/components/landing/FeaturedSection";
import FinalCta from "@/components/landing/FinalCta";
import Hero from "@/components/landing/Hero";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import HygieneCallout from "@/components/landing/HygieneCallout";
import PrivacySection from "@/components/landing/PrivacySection";
import QualitySection from "@/components/landing/QualitySection";
import RentSection from "@/components/landing/RentSection";
import TrustRibbon from "@/components/landing/TrustRibbon";
import type { Doll } from "@/lib/dolls";
import type { PublicPlatformSettings } from "@/lib/settings/shared";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";

type ArtisanDollsLandingProps = {
    settings: PublicPlatformSettings;
    galleryDolls: Doll[];
};

function brandedPlaceholder(text: string, size: { w: number; h: number }) {
    const safe = encodeURIComponent(text.slice(0, 32));
    return `https://placehold.co/${size.w}x${size.h}/0F0406/C9A24A?font=montserrat&text=${safe}`;
}

async function buildDollImage(doll: Doll, variant: "card") {
    if (!doll.image) {
        return brandedPlaceholder(doll.name, { w: 600, h: 720 });
    }
    return getSupabaseImageUrlServer(doll.image, variant);
}

export default async function ArtisanDollsLanding({
    settings,
    galleryDolls,
}: ArtisanDollsLandingProps) {
    const cardDolls = await Promise.all(
        galleryDolls.slice(0, 5).map(async (doll) => ({
            ...doll,
            imageUrl: await buildDollImage(doll, "card"),
        })),
    );

    const rentDoll = cardDolls[0] ?? null;
    const buyDoll = cardDolls[1] ?? cardDolls[0] ?? null;
    const featuredCards: FeaturedCard[] = cardDolls.map((d) => ({
        id: d.id,
        name: d.name,
        imageUrl: d.imageUrl,
        tags: d.tags ?? [],
    }));

    const locale = (await getLocale()) as Locale;
    const faqRows = await getHomeFaqItems(locale).catch(() => []);
    const faqItems = faqRows.map((row) => ({ q: row.question, a: row.answer }));

    return (
        <>
            <Hero catalogEnabled={settings.catalog_enabled} />
            <TrustRibbon />
            <RentSection
                doll={
                    rentDoll
                        ? {
                              name: rentDoll.name,
                              imageUrl: rentDoll.imageUrl,
                              description: rentDoll.description,
                              badge: rentDoll.badge || undefined,
                          }
                        : null
                }
                rentEnabled={settings.rent_enabled}
            />
            <BuySection
                doll={
                    buyDoll
                        ? {
                              name: buyDoll.name,
                              imageUrl: buyDoll.imageUrl,
                              description: buyDoll.description,
                              badge: buyDoll.badge || undefined,
                          }
                        : null
                }
                buyEnabled={settings.buy_enabled}
            />
            <FeaturedSection
                cards={featuredCards}
                rentEnabled={settings.rent_enabled}
                buyEnabled={settings.buy_enabled}
            />
            <QualitySection />
            <AboutSection />
            <PrivacySection />
            <HygieneCallout />
            <HowItWorksSection />
            <FAQ items={faqItems.length > 0 ? faqItems : undefined} />
            <FinalCta catalogEnabled={settings.catalog_enabled} />
        </>
    );
}
