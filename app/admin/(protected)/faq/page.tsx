import Link from "next/link";
import { getFaqItemsForAdmin } from "@/lib/faq/queries";
import { deleteFaqItemAction } from "./actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminFaqIndexPage() {
    const items = await getFaqItemsForAdmin();

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        Conținut
                    </p>
                    <h1 className="font-display italic text-3xl text-silk mt-2">
                        FAQ
                    </h1>
                </div>
                <Link
                    href="/admin/faq/new"
                    className="inline-flex items-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    + Întrebare nouă
                </Link>
            </header>

            {items.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există întrebări. Creează una pentru a începe.
                </div>
            ) : (
                <ul className="space-y-3 list-none p-0">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-silk/55">
                                    <span
                                        className={`inline-flex w-1.5 h-1.5 rounded-full ${
                                            item.is_active ? "bg-success" : "bg-silk/30"
                                        }`}
                                    />
                                    {item.category} ·{" "}
                                    {item.show_on_home ? "home + /faq" : "doar /faq"} ·
                                    ordine {item.display_order}
                                </div>
                                <p className="mt-2 font-display italic text-lg text-silk">
                                    {item.question}
                                </p>
                                <p className="mt-1 text-[0.7rem] tracking-[0.14em] text-silk/55">
                                    /faq#{item.slug}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/faq/${item.id}/edit`}
                                    className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light"
                                >
                                    Edit
                                </Link>
                                <DeleteButton
                                    confirmMessage={`Ștergi „${item.question.slice(0, 60)}"?`}
                                    onDelete={async () => {
                                        "use server";
                                        await deleteFaqItemAction(item.id);
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
