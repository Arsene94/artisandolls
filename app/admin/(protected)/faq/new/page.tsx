import Link from "next/link";
import FaqItemForm from "@/components/admin/faq/FaqItemForm";
import { createFaqItemAction } from "../actions";

export default function NewFaqItemPage() {
    return (
        <main className="px-6 sm:px-10 py-10 max-w-4xl">
            <Link
                href="/admin/faq"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la FAQ
            </Link>
            <h1 className="font-display italic text-3xl text-silk mb-8">
                Întrebare nouă
            </h1>
            <FaqItemForm action={createFaqItemAction} submitLabel="Publică" />
        </main>
    );
}
