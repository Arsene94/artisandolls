import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/orders";
import { getDollRows } from "@/lib/dolls";
import { updateOrderAction } from "@/app/admin/(protected)/orders/actions";
import OrderEditForm from "@/components/admin/orders/OrderEditForm";
import styles from "../../../page.module.css";

type EditOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditOrderPage({ params }: EditOrderPageProps) {
    const { id } = await params;

    const [order, dolls] = await Promise.all([
        getAdminOrderById(id),
        getDollRows(true),
    ]);

    if (!order) {
        notFound();
    }

    async function action(formData: FormData) {
        "use server";
        await updateOrderAction(order!.id, formData);
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <span>{order.order_number}</span>
                <h1>Editează rezervarea</h1>
                <p>
                    Poți schimba păpușa, datele clientului, perioada, prețul custom și discountul.
                </p>
            </section>

            <OrderEditForm order={order} dolls={dolls} action={action} />
        </main>
    );
}
