import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getCustomizationGroupBySlug,
    getCustomizationOptionsByGroup,
} from "@/lib/customizations";
import CustomizationGroupForm from "@/components/admin/customizations/CustomizationGroupForm";
import CustomizationIcon from "@/components/icons/CustomizationIcon";
import { updateCustomizationGroupAction } from "@/app/admin/(protected)/customizations/actions";
import styles from "../../../page.module.css";
import customStyles from "@/components/admin/customizations/AdminCustomizations.module.css";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function EditCustomizationGroupPage({ params }: Props) {
    const { slug } = await params;
    const group = await getCustomizationGroupBySlug(slug);

    if (!group) {
        notFound();
    }

    const options = await getCustomizationOptionsByGroup(group.id, true);

    async function action(formData: FormData) {
        "use server";
        await updateCustomizationGroupAction(group!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Customizări</span>
                <h1>Editează grupul</h1>
                <p>Modifică grupul și gestionează valorile/opțiunile lui.</p>
            </section>

            <CustomizationGroupForm group={group} action={action} />

            <section className={customStyles.panel}>
                <div className={customStyles.toolbar}>
                    <div>
                        <span>Opțiuni</span>
                        <h2>Valorile grupului</h2>
                        <p>Aici apar valorile selectabile pe pagina păpușii.</p>
                    </div>

                    <Link
                        href={`/admin/customizations/${group.slug}/options/new`}
                        className={customStyles.primaryButton}
                    >
                        Adaugă opțiune
                    </Link>
                </div>

                <div className={customStyles.optionGrid}>
                    {options.map((option) => (
                        <article key={option.id} className={customStyles.optionCard}>
                            <span className={customStyles.iconPreview}>
                                <CustomizationIcon
                                    name={option.icon_name}
                                    color={option.icon_color}
                                />
                            </span>

                            <div>
                                <strong>{option.label}</strong>
                                <small>
                                    +{option.price.toLocaleString("ro-RO")} lei ·{" "}
                                    {option.is_active ? "Activă" : "Inactivă"} · {option.slug}
                                </small>
                            </div>

                            {option.swatch_color && (
                                <span
                                    className={customStyles.swatch}
                                    style={{ background: option.swatch_color }}
                                />
                            )}

                            <div className={customStyles.rowActions}>
                                <Link href={`/admin/customizations/${group.slug}/options/${option.id}/edit`}>
                                    Editează
                                </Link>
                            </div>
                        </article>
                    ))}

                    {options.length === 0 && (
                        <div className={customStyles.emptyState}>
                            Nu există încă opțiuni pentru acest grup.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
