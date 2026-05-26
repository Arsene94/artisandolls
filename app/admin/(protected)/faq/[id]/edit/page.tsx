import Link from "next/link";
import { notFound } from "next/navigation";
import FaqItemForm from "@/components/admin/faq/FaqItemForm";
import { getFaqItemRowByIdForAdmin } from "@/lib/faq/queries";
import { updateFaqItemAction } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditFaqItemPage({ params }: Props) {
    const { id } = await params;
    const item = await getFaqItemRowByIdForAdmin(id);
    if (!item) notFound();

    const action = updateFaqItemAction.bind(null, id);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-4xl">
            <Link
                href="/admin/faq"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la FAQ
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-2">
                {item.question}
            </h1>
            <p className="text-sm text-silk/60 mb-8">/faq#{item.slug}</p>
            <FaqItemForm
                action={action}
                initial={item}
                submitLabel="Salvează modificările"
            />
        </main>
    );
}
