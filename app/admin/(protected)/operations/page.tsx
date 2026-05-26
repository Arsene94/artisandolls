import Link from "next/link";
import { IconLanguage } from "@tabler/icons-react";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

const operations = [
    {
        href: "/admin/operations/translations",
        title: "Traduceri automate",
        description:
            "Pune la coadă auto-traducerea RO → EN/NL pentru tot ce există: produse, păpuși, FAQ, blog, colecții, customizări. Worker-ul rulează asincron prin QStash.",
        icon: IconLanguage,
    },
];

export default function OperationsHubPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Admin</span>
                <h1>Operațiuni</h1>
                <p>
                    Acțiuni bulk care rulează în background. Pune un job la coadă,
                    închide pagina, întoarce-te când vrei pentru progres.
                </p>
            </section>

            <section className={styles.dashboardGrid}>
                {operations.map((op) => {
                    const Icon = op.icon;
                    return (
                        <Link key={op.href} href={op.href} className={styles.panelWide}>
                            <div className={styles.panelHeader}>
                                <span>Acțiune</span>
                                <h2>
                                    <Icon size={20} stroke={1.7} aria-hidden="true" />
                                    {op.title}
                                </h2>
                            </div>
                            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                                {op.description}
                            </p>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
}
