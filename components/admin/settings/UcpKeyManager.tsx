"use client";

import { useState, useTransition } from "react";
import {
    clearUcpApiKeyAction,
    rotateUcpApiKeyAction,
} from "@/app/admin/(protected)/settings/actions";

type Props = {
    hasKey: boolean;
};

export default function UcpKeyManager({ hasKey }: Props) {
    const [pending, startTransition] = useTransition();
    const [revealed, setRevealed] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const rotate = () => {
        setError(null);
        startTransition(async () => {
            try {
                const result = await rotateUcpApiKeyAction();
                setRevealed(result.key);
            } catch (err) {
                setError(err instanceof Error ? err.message : "rotate_failed");
            }
        });
    };

    const clear = () => {
        if (!window.confirm("Sigur revoci cheia UCP? Agenții vor primi 401 imediat.")) {
            return;
        }
        setError(null);
        setRevealed(null);
        startTransition(async () => {
            try {
                await clearUcpApiKeyAction();
            } catch (err) {
                setError(err instanceof Error ? err.message : "clear_failed");
            }
        });
    };

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <p
                style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    lineHeight: 1.55,
                }}
            >
                Cheia API se foloseste de agenții UCP în header-ul{" "}
                <code>X-API-Key</code> (sau <code>Authorization: Bearer …</code>).
                Persistăm doar hash-ul SHA-256; valoarea curată este afișată o
                singură dată, la generare.
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    type="button"
                    onClick={rotate}
                    disabled={pending}
                    style={{
                        minHeight: 38,
                        background: "var(--color-gold)",
                        color: "#0F0406",
                        border: 0,
                        borderRadius: 999,
                        padding: "0 18px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        cursor: pending ? "not-allowed" : "pointer",
                    }}
                >
                    {pending ? "…" : hasKey ? "Rotește cheia" : "Generează cheia"}
                </button>

                {hasKey ? (
                    <button
                        type="button"
                        onClick={clear}
                        disabled={pending}
                        style={{
                            minHeight: 38,
                            background: "transparent",
                            color: "#f4b5b5",
                            border: "1px solid rgba(178, 58, 58, 0.45)",
                            borderRadius: 999,
                            padding: "0 18px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            cursor: pending ? "not-allowed" : "pointer",
                        }}
                    >
                        Revocă
                    </button>
                ) : null}
            </div>

            {revealed ? (
                <div
                    style={{
                        background: "rgba(201, 162, 74, 0.08)",
                        border: "1px solid rgba(201, 162, 74, 0.45)",
                        borderRadius: 12,
                        padding: 14,
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 6px",
                            fontSize: "0.68rem",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--color-gold-light)",
                        }}
                    >
                        Cheie nouă — copiaz-o acum
                    </p>
                    <code
                        style={{
                            display: "block",
                            wordBreak: "break-all",
                            fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
                            fontSize: "0.85rem",
                            color: "var(--color-silk)",
                        }}
                    >
                        {revealed}
                    </code>
                    <p
                        style={{
                            margin: "8px 0 0",
                            fontSize: "0.74rem",
                            color: "rgba(255, 255, 255, 0.55)",
                        }}
                    >
                        Nu mai apare după ce ieși din pagină. Stochează valoarea
                        într-un secret manager.
                    </p>
                </div>
            ) : null}

            {error ? (
                <p
                    role="alert"
                    style={{
                        margin: 0,
                        color: "#f4b5b5",
                        fontSize: "0.82rem",
                    }}
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}
