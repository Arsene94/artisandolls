"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AdminLoginForm.module.css";

export default function AdminLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const errorFromUrl = searchParams.get("error");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSubmitting(true);
        setMessage("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setIsSubmitting(false);
            setMessage("Email sau parolă incorectă.");
            return;
        }

        const role = data.user?.app_metadata?.role;

        if (role !== "admin") {
            await supabase.auth.signOut();
            setIsSubmitting(false);
            setMessage("Contul există, dar nu are rol de admin.");
            return;
        }

        router.replace("/admin");
        router.refresh();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.header}>
                <span>Admin</span>
                <h1>Autentificare</h1>
                <p>Acces permis doar conturilor cu rol de admin în Supabase.</p>
            </div>

            {errorFromUrl === "not_admin" && (
                <div className={styles.error}>
                    Contul tău nu are permisiuni de admin.
                </div>
            )}

            {message && <div className={styles.error}>{message}</div>}

            <label className={styles.field}>
                Email
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@email.com"
                    autoComplete="email"
                    required
                />
            </label>

            <label className={styles.field}>
                Parolă
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                />
            </label>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Se conectează..." : "Intră în admin"}
            </button>
        </form>
    );
}
