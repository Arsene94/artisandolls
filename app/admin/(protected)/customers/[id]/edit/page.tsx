import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/customers";
import CustomerForm from "@/components/admin/customers/CustomerForm";
import { updateCustomerAction } from "@/app/admin/(protected)/customers/actions";
import styles from "../../../page.module.css";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await updateCustomerAction(customer!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>Client</span>
                <h1>Editează clientul</h1>
                <p>Modifică datele de contact, adresa, notele interne sau statusul.</p>
            </section>

            <CustomerForm customer={customer} action={action} />
        </main>
    );
}
