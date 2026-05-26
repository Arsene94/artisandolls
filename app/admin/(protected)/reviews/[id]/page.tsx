import Link from "next/link";
import { notFound } from "next/navigation";
import { getReviewByIdForAdmin } from "@/lib/reviews/queries";
import {
    approveReviewAction,
    rejectReviewAction,
    deleteReviewAction,
} from "../actions";
import DeleteButton from "@/components/admin/shop/DeleteButton";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

function ratingStars(rating: number | null) {
    if (rating === null) return "—";
    return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

export default async function AdminReviewDetailPage({ params }: Props) {
    const { id } = await params;
    const review = await getReviewByIdForAdmin(id);
    if (!review) notFound();

    const siteUrl = getSiteUrl();
    const reviewUrl = `${siteUrl}/review/${review.review_token}`;
    const approve = approveReviewAction.bind(null, id);
    const reject = rejectReviewAction.bind(null, id);

    const input =
        "w-full bg-velvet-950 border border-velvet-700 rounded-lg px-3 py-2.5 text-silk focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold text-sm";
    const label =
        "block text-[0.72rem] uppercase tracking-[0.18em] text-silk/70 mb-1.5";

    return (
        <main className="px-6 sm:px-10 py-10 max-w-4xl">
            <Link
                href="/admin/reviews"
                className="inline-flex items-center text-[0.72rem] uppercase tracking-[0.16em] text-silk/65 hover:text-gold mb-6"
            >
                ← Înapoi la recenzii
            </Link>

            <header className="mb-8">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-silk/55">
                    {review.status} · {review.target_type} · token expiră{" "}
                    {new Date(review.expires_at).toLocaleDateString("ro-RO")}
                </p>
                <h1 className="font-display italic text-3xl text-silk mt-2">
                    {review.title ?? "(fără titlu)"}
                </h1>
                <p className="mt-3 text-2xl text-gold">{ratingStars(review.rating)}</p>
            </header>

            <section className="mb-10 p-6 bg-velvet-900/40 border border-velvet-800 rounded-2xl">
                <h2 className="font-display italic text-xl text-silk mb-3">Link invitație</h2>
                <p className="text-[0.7rem] tracking-[0.14em] text-silk/55 break-all">
                    {reviewUrl}
                </p>
                <p className="mt-3 text-sm text-silk/65 leading-relaxed">
                    Copiază link-ul și trimite-l manual clientului prin canalul preferat (WhatsApp,
                    Telegram). Link-ul expiră în 60 de zile sau după prima trimitere acceptată.
                </p>
            </section>

            {review.body ? (
                <section className="mb-10">
                    <h2 className="font-display italic text-xl text-silk mb-3">Conținut recenzie</h2>
                    <p className="text-base text-silk/85 leading-relaxed whitespace-pre-line">
                        {review.body}
                    </p>
                    <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-silk/75">
                        <div>
                            <dt className="text-silk/55 text-[0.7rem] uppercase tracking-[0.16em]">Nume publicat</dt>
                            <dd>{review.customer_name ?? review.customer_initials ?? "anonim"}</dd>
                        </div>
                        <div>
                            <dt className="text-silk/55 text-[0.7rem] uppercase tracking-[0.16em]">Locale</dt>
                            <dd>{review.locale ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-silk/55 text-[0.7rem] uppercase tracking-[0.16em]">Trimis la</dt>
                            <dd>
                                {review.submitted_at
                                    ? new Date(review.submitted_at).toLocaleString("ro-RO")
                                    : "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-silk/55 text-[0.7rem] uppercase tracking-[0.16em]">Comandă sursă</dt>
                            <dd>{review.order_id ?? "—"}</dd>
                        </div>
                    </dl>
                </section>
            ) : null}

            {review.status === "pending" || review.status === "invited" ? (
                <div className="grid sm:grid-cols-2 gap-6">
                    <form action={approve} className="space-y-3 p-6 border border-success/30 bg-success/5 rounded-2xl">
                        <label className={label} htmlFor="approve-note">
                            Notă de moderare (privat)
                        </label>
                        <textarea
                            id="approve-note"
                            name="admin_note"
                            rows={2}
                            className={`${input} resize-y`}
                            placeholder="opțional"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center bg-success/90 hover:bg-success text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.16em] transition-colors"
                        >
                            Aprobă & publică
                        </button>
                    </form>
                    <form action={reject} className="space-y-3 p-6 border border-danger/30 bg-danger/5 rounded-2xl">
                        <label className={label} htmlFor="reject-note">
                            Motivul respingerii (privat)
                        </label>
                        <textarea
                            id="reject-note"
                            name="admin_note"
                            rows={2}
                            className={`${input} resize-y`}
                            placeholder="opțional"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center bg-danger/85 hover:bg-danger text-velvet-950 font-semibold px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.16em] transition-colors"
                        >
                            Respinge
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-6 border border-velvet-800 rounded-2xl text-silk/75">
                    <p>
                        Recenzia este {review.status}. Modificările de status se fac manual din
                        baza de date dacă e necesar.
                    </p>
                </div>
            )}

            {review.admin_note ? (
                <div className="mt-8 p-5 border border-velvet-800 rounded-2xl bg-velvet-900/40">
                    <p className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/55 mb-2">
                        Notă de moderare
                    </p>
                    <p className="text-sm text-silk/80 whitespace-pre-line">{review.admin_note}</p>
                </div>
            ) : null}

            <div className="mt-10 pt-6 border-t border-velvet-800/60">
                <DeleteButton
                    confirmMessage="Ștergi această recenzie definitiv?"
                    onDelete={async () => {
                        "use server";
                        await deleteReviewAction(id);
                    }}
                />
            </div>
        </main>
    );
}
