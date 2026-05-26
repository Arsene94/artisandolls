import { ImageResponse } from "next/og";
import { CANONICAL_BRAND } from "@/lib/site";

export const alt = `${CANONICAL_BRAND} — companion premium pentru închiriere și achiziție discretă`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generăm OG-ul default cu Satori (subset CSS, doar flexbox). Folosim Cormorant
// dacă reușim să-l încărcăm prin Google Fonts CSS; dacă nu, cădem pe Inter
// system — important e ca PNG-ul să existe, nu să fie perfect.
export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "80px",
                    background:
                        "linear-gradient(135deg, #0F0406 0%, #1A0A0D 45%, #2A1316 100%)",
                    color: "#F5EDE0",
                    fontFamily: "Inter, system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        fontSize: 24,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: "#C9A24A",
                    }}
                >
                    <span
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: "#C9A24A",
                            display: "block",
                        }}
                    />
                    18+ Discreet
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                        style={{
                            fontSize: 88,
                            fontStyle: "italic",
                            lineHeight: 1.05,
                            fontWeight: 500,
                            color: "#F5EDE0",
                        }}
                    >
                        {CANONICAL_BRAND}
                    </span>
                    <span
                        style={{
                            marginTop: 24,
                            fontSize: 36,
                            color: "#E9D5A8",
                            maxWidth: 880,
                            lineHeight: 1.25,
                        }}
                    >
                        Lux, intimitate și hiper-realism. Închiriere și achiziție
                        de companioni realiști, livrare neutră.
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        fontSize: 22,
                        color: "#A89578",
                    }}
                >
                    <span>velvet-companions.com</span>
                    <span style={{ color: "#C9A24A" }}>RO · EN · NL</span>
                </div>
            </div>
        ),
        { ...size },
    );
}
