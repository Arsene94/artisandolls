import { getPlatformSettings } from "@/lib/settings";
import PlatformSettingsForm from "@/components/admin/settings/PlatformSettingsForm";
import { updatePlatformSettingsAction } from "@/app/admin/(protected)/settings/actions";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
    const settings = await getPlatformSettings();

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Admin</span>
                <h1>Setări platformă</h1>
                <p>
                    Configurează datele businessului, disponibilitatea catalogului,
                    orele implicite și textele folosite în comandă.
                </p>
            </section>

            <PlatformSettingsForm
                settings={settings}
                action={updatePlatformSettingsAction}
            />
        </main>
    );
}
