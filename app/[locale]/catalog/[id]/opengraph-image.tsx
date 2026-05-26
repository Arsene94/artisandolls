import { ImageResponse } from "next/og";
import { getDollBySlug } from "@/lib/dolls";
import { getSupabaseImageUrlServer } from "@/lib/supabase/images-server";
import { CANONICAL_BRAND } from "@/lib/site";

export const alt = `${CANONICAL_BRAND} — companion premium`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id } = await params;
    const doll = await getDollBySlug(id).catch(() => null);

    const dollImageUrl = doll?.image
        ? await getSupabaseImageUrlServer(doll.image, "gallery")
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
                        position: "relative",
                        background:
                            "linear-gradient(180deg, #1A0A0D 0%, #0F0406 100%)",
                    }}
                >
                    {dollImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={dollImageUrl}
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
                        {CANONICAL_BRAND}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                            style={{
                                fontSize: 64,
                                fontStyle: "italic",
                                lineHeight: 1.05,
                                fontWeight: 500,
                            }}
                        >
                            {doll?.name ?? "Companion premium"}
                        </span>
                        {doll?.collection ? (
                            <span
                                style={{
                                    marginTop: 16,
                                    fontSize: 22,
                                    color: "#E9D5A8",
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {doll.collection}
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
                        18+ · Închiriere & achiziție · Livrare neutră
                    </div>
                </div>
            </div>
        ),
        { ...size },
    );
}
