import ArtisanDollsLanding from "@/components/ArtisanDollsLanding";
import PublicUnavailableNotice from "@/components/PublicUnavailableNotice";
import { getPublicPlatformSettings } from "@/lib/settings";

export default async function Home() {
  const settings = await getPublicPlatformSettings();

  if (settings.maintenance_mode) {
    return (
        <PublicUnavailableNotice
            title="Site temporar în mentenanță"
            description="Lucrăm la configurarea platformei. Revino în curând sau contactează-ne direct."
            settings={settings}
        />
    );
  }

  return <ArtisanDollsLanding settings={settings} />;
}
