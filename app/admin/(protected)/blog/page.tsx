import Link from "next/link";
import { getBlogPostsForAdmin } from "@/lib/blog/posts";
import { deleteBlogPostAction } from "./actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_LABELS = {
    active: "Activ",
    scheduled: "Programat",
    draft: "Inactiv",
} as const;

type Status = keyof typeof STATUS_LABELS;

function deriveStatus(row: { is_active: boolean; publish_at: string }): Status {
    if (!row.is_active) return "draft";
    if (new Date(row.publish_at).getTime() > Date.now()) return "scheduled";
    return "active";
}

export default async function AdminBlogIndexPage() {
    const posts = await getBlogPostsForAdmin();

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                        Conținut
                    </p>
                    <h1 className="font-display italic text-3xl text-silk mt-2">
                        Blog
                    </h1>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="inline-flex items-center bg-gold hover:bg-gold-light text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
                >
                    + Articol nou
                </Link>
            </header>

            {posts.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nu există articole. Creează unul pentru a începe.
                </div>
            ) : (
                <ul className="space-y-3 list-none p-0">
                    {posts.map((p) => {
                        const status = deriveStatus(p);
                        return (
                            <li
                                key={p.id}
                                className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-silk/55">
                                        <span
                                            className={`inline-flex w-1.5 h-1.5 rounded-full ${
                                                status === "active"
                                                    ? "bg-success"
                                                    : status === "scheduled"
                                                      ? "bg-warning"
                                                      : "bg-silk/30"
                                            }`}
                                        />
                                        {STATUS_LABELS[status]} · {p.category} ·{" "}
                                        {new Date(p.publish_at).toLocaleDateString("ro-RO", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <h2 className="font-display italic text-xl text-silk mt-1.5">
                                        {p.title}
                                    </h2>
                                    <p className="text-[0.7rem] tracking-[0.14em] text-silk/55 mt-1">
                                        /blog/{p.slug}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Link
                                        href={`/admin/blog/${p.id}/edit`}
                                        className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light"
                                    >
                                        Edit
                                    </Link>
                                    <DeleteButton
                                        confirmMessage={`Ștergi articolul „${p.title}"?`}
                                        onDelete={async () => {
                                            "use server";
                                            await deleteBlogPostAction(p.id);
                                        }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
