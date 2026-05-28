import { ImageResponse } from "next/og";
import { getShopProductBySlug } from "@/lib/shop/products";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";
import { CANONICAL_BRAND } from "@/lib/site";
import { formatMoney } from "@/lib/shop/format";

export const alt = `${CANONICAL_BRAND} — produs premium`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string; locale: "ro" | "en" | "nl" | "de" }>;
}) {
    const { slug, locale } = await params;
    const product = await getShopProductBySlug(slug).catch(() => null);
    const imageUrl = product?.image
        ? await getSupabaseImageUrlServer(product.image, "gallery")
        : null;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: "#0F0406",
                    color: "#F5EDE0",
                    fontFamily: "Inter, system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        width: "55%",
                        height: "100%",
                        display: "flex",
                    }}
                >
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt=""
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : null}
                </div>

                <div
                    style={{
                        width: "45%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "60px",
                        background:
                            "linear-gradient(135deg, #1A0A0D 0%, #2A1316 100%)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 18,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            color: "#C9A24A",
                        }}
                    >
                        {CANONICAL_BRAND} · Shop
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                            style={{
                                fontSize: 52,
                                fontStyle: "italic",
                                lineHeight: 1.1,
                                fontWeight: 500,
                            }}
                        >
                            {product?.name ?? "Produs premium"}
                        </span>
                        {product ? (
                            <span
                                style={{
                                    marginTop: 24,
                                    fontSize: 36,
                                    color: "#C9A24A",
                                }}
                            >
                                {formatMoney(product.price, locale, product.currency)}
                            </span>
                        ) : null}
                    </div>

                    <div
                        style={{
                            fontSize: 18,
                            color: "#A89578",
                            letterSpacing: "0.12em",
                        }}
                    >
                        18+ · Livrare neutră · Discreet billing
                    </div>
                </div>
            </div>
        ),
        { ...size },
    );
}
