import Link from "next/link";
import { getReviewsForAdmin } from "@/lib/reviews/queries";
import type { ReviewStatus } from "@/lib/reviews/shared";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const STATUSES: ReviewStatus[] = ["pending", "invited", "approved", "rejected"];

function parseStatus(value: string | undefined): ReviewStatus | undefined {
    if (!value) return undefined;
    return (STATUSES as string[]).includes(value) ? (value as ReviewStatus) : undefined;
}

function ratingStars(rating: number | null) {
    if (rating === null) return "—";
    return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export default async function AdminReviewsPage(props: { searchParams: SearchParams }) {
    const { status } = await props.searchParams;
    const filter = parseStatus(status);
    const reviews = await getReviewsForAdmin(filter);

    return (
        <main className="px-6 sm:px-10 py-10 max-w-6xl">
            <header className="mb-8">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold">
                    Moderare
                </p>
                <h1 className="font-display italic text-3xl text-silk mt-2">
                    Recenzii clienți
                </h1>
                <p className="mt-3 text-sm text-silk/65 max-w-2xl">
                    Toate recenziile trec prin moderare manuală înainte de publicare. Aprobările apar pe
                    pagina țintă (doll sau produs) și sunt injectate în JSON-LD pentru rich results.
                </p>
            </header>

            <nav aria-label="Filtre status" className="mb-6 flex flex-wrap gap-2">
                <Link
                    href="/admin/reviews"
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] border ${
                        !filter
                            ? "border-gold text-gold"
                            : "border-velvet-700 text-silk/75 hover:text-silk hover:border-velvet-600"
                    }`}
                >
                    Toate ({reviews.length})
                </Link>
                {STATUSES.map((s) => (
                    <Link
                        key={s}
                        href={`/admin/reviews?status=${s}`}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-[0.72rem] uppercase tracking-[0.16em] border ${
                            filter === s
                                ? "border-gold text-gold"
                                : "border-velvet-700 text-silk/75 hover:text-silk hover:border-velvet-600"
                        }`}
                    >
                        {s}
                    </Link>
                ))}
            </nav>

            {reviews.length === 0 ? (
                <div className="border border-velvet-800 rounded-2xl p-12 text-center text-silk/70">
                    Nicio recenzie pentru filtrul selectat.
                </div>
            ) : (
                <ul className="space-y-3 list-none p-0">
                    {reviews.map((r) => (
                        <li
                            key={r.id}
                            className="bg-velvet-900/40 border border-velvet-800/60 rounded-2xl p-5 flex items-start justify-between gap-4 flex-wrap"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.16em] text-silk/55">
                                    <span
                                        className={`inline-flex w-1.5 h-1.5 rounded-full ${
                                            r.status === "approved"
                                                ? "bg-success"
                                                : r.status === "rejected"
                                                  ? "bg-danger"
                                                  : r.status === "pending"
                                                    ? "bg-warning"
                                                    : "bg-silk/30"
                                        }`}
                                    />
                                    {r.status} · {r.target_type} · {new Date(r.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                                </div>
                                <p className="mt-2 font-display italic text-lg text-silk">
                                    {r.title ?? <span className="text-silk/55">(fără titlu)</span>}
                                </p>
                                <p className="text-base text-gold mt-1">{ratingStars(r.rating)}</p>
                                {r.body ? (
                                    <p className="mt-2 text-sm text-silk/75 line-clamp-3">
                                        {r.body}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm text-silk/55 italic">Invitație în așteptare — clientul nu a completat încă.</p>
                                )}
                                <p className="mt-2 text-[0.7rem] tracking-[0.14em] text-silk/55">
                                    {r.customer_name ?? r.customer_initials ?? "Anonim"} · {r.locale ?? "—"}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <Link
                                    href={`/admin/reviews/${r.id}`}
                                    className="text-[0.72rem] uppercase tracking-[0.16em] text-gold hover:text-gold-light"
                                >
                                    Deschide
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
