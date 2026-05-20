import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArtisanDollsLanding from "@/components/ArtisanDollsLanding";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import { getCollectionRows } from "@/lib/collections";
import { getHomepageHeroDoll } from "@/lib/dolls";
import { getPublicPlatformSettings } from "@/lib/settings";
import type { Locale } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tNotice = await getTranslations({ locale, namespace: "notice" });

  const [settings, collections, heroDoll] = await Promise.all([
    getPublicPlatformSettings(),
    getCollectionRows(false),
    getHomepageHeroDoll(),
  ]);

  if (settings.maintenance_mode) {
    return (
        <PublicUnavailableNotice
            title={tNotice("maintenanceTitle")}
            description={tNotice("maintenanceDescription")}
            settings={settings}
        />
    );
  }

  return (
      <ArtisanDollsLanding
          settings={settings}
          collections={collections}
          heroDoll={heroDoll}
      />
  );
}
