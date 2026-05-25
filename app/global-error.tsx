"use client";

import { useEffect } from "react";
import Link from "next/link";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            console.error(error);
        }
    }, [error]);

    return (
        <html lang="ro">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    background: "#0F0406",
                    color: "#FCFAF7",
                    fontFamily:
                        "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    display: "grid",
                    placeItems: "center",
                    padding: "1.5rem",
                }}
            >
                <main role="main" style={{ maxWidth: "34rem", textAlign: "center" }}>
                    <p
                        style={{
                            letterSpacing: "0.32em",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            color: "#C9A24A",
                            margin: "0 0 1.5rem",
                        }}
                    >
                        500 · error
                    </p>
                    <h1
                        style={{
                            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                            lineHeight: 1.2,
                            margin: "0 0 1rem",
                            fontWeight: 600,
                        }}
                    >
                        Ceva nu a funcționat
                    </h1>
                    <p
                        style={{
                            opacity: 0.78,
                            margin: "0 0 1.75rem",
                            lineHeight: 1.6,
                        }}
                    >
                        Am întâmpinat o problemă neașteptată. Reîncărcați pagina sau
                        reveniți la prima pagină. Dacă problema persistă, ne puteți
                        contacta direct cu referința de mai jos.
                    </p>
                    {error.digest ? (
                        <p
                            style={{
                                opacity: 0.55,
                                margin: "0 0 1.75rem",
                                fontSize: "0.78rem",
                                letterSpacing: "0.06em",
                                fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
                            }}
                        >
                            ref: {error.digest}
                        </p>
                    ) : null}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => unstable_retry()}
                            style={{
                                background: "#C9A24A",
                                color: "#0F0406",
                                border: 0,
                                borderRadius: "999px",
                                padding: "0.875rem 1.75rem",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                            }}
                        >
                            Încearcă din nou
                        </button>
                        <Link
                            href="/"
                            style={{
                                background: "transparent",
                                color: "#FCFAF7",
                                border: "1px solid rgba(252, 250, 247, 0.4)",
                                borderRadius: "999px",
                                padding: "0.875rem 1.75rem",
                                fontSize: "0.8rem",
                                fontWeight: 500,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                textDecoration: "none",
                            }}
                        >
                            Înapoi acasă
                        </Link>
                    </div>
                </main>
            </body>
        </html>
    );
}
