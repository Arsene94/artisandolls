import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getReviewByToken } from "@/lib/reviews/queries";
import { getDollBySlug } from "@/lib/dolls";
import { getShopProductBySlug } from "@/lib/shop/products";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; token: string }> };

export const metadata: Metadata = {
    title: "Recenzie",
    robots: { index: false, follow: false },
};

async function resolveTargetLabel(
    targetType: "doll" | "shop_product",
    targetId: string,
): Promise<string> {
    // Tabela `dolls`/`shop_products` se interoghează după id. Folosim service
    // client direct, pentru că nu vrem să trecem prin slug (token-ul nu îl știe).
    const supabase = createSupabaseServiceClient();
    if (targetType === "doll") {
        const { data } = await supabase
            .from("dolls")
            .select("name, slug")
            .eq("id", targetId)
            .maybeSingle();
        if (data?.slug) {
            const full = await getDollBySlug(data.slug).catch(() => null);
            return full?.name ?? data.name ?? "Companion";
        }
        return "Companion";
    }
    const { data } = await supabase
        .from("shop_products")
        .select("name, slug")
        .eq("id", targetId)
        .maybeSingle();
    if (data?.slug) {
        const product = await getShopProductBySlug(data.slug).catch(() => null);
        return product?.name ?? data.name ?? "Produs";
    }
    return "Produs";
}

export default async function ReviewPage({ params }: Props) {
    const { locale, token } = await params;
    setRequestLocale(locale);

    const review = await getReviewByToken(token);
    if (!review) notFound();

    if (new Date(review.expires_at).getTime() < Date.now()) {
        notFound();
    }

    const tReviews = await getTranslations({ locale, namespace: "reviews" });

    if (review.status === "approved" || review.status === "rejected") {
        // Token-ul a fost deja finalizat; afișăm pagina „mulțumim" fără form.
        return (
            <main
                data-surface="dark"
                className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
            >
                <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {tReviews("statusAlreadySubmittedEyebrow")}
                    </p>
                    <h1 className="mt-3 font-display italic text-3xl text-silk">
                        {tReviews("statusAlreadySubmittedHeading")}
                    </h1>
                    <p className="mt-4 text-base text-silk/80 leading-relaxed">
                        {tReviews("statusAlreadySubmittedBody")}
                    </p>
                </div>
            </main>
        );
    }

    const targetLabel = await resolveTargetLabel(
        review.target_type,
        review.target_id,
    );

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <ReviewForm
                    token={token}
                    targetLabel={tReviews("targetLabel", { name: targetLabel })}
                    initialName={review.customer_name}
                    copy={{
                        introHeading: tReviews("introHeading"),
                        introHelp: tReviews("introHelp"),
                        ratingLegend: tReviews("ratingLegend"),
                        ratingLabels: [
                            tReviews("ratingLabels.1"),
                            tReviews("ratingLabels.2"),
                            tReviews("ratingLabels.3"),
                            tReviews("ratingLabels.4"),
                            tReviews("ratingLabels.5"),
                        ],
                        titleLabel: tReviews("titleLabel"),
                        bodyLabel: tReviews("bodyLabel"),
                        bodyHelp: tReviews("bodyHelp"),
                        nameLabel: tReviews("nameLabel"),
                        nameHelp: tReviews("nameHelp"),
                        publicName: tReviews("publicName"),
                        submit: tReviews("submit"),
                        sending: tReviews("sending"),
                        thanksHeading: tReviews("thanksHeading"),
                        thanksBody: tReviews("thanksBody"),
                    }}
                />
            </div>
        </main>
    );
}
