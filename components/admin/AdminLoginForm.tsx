"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import {
    signInAdminAction,
    type AdminLoginState,
} from "@/app/admin/login/actions";
import styles from "./AdminLoginForm.module.css";

const INITIAL_STATE: AdminLoginState = { status: "idle", message: null };

export default function AdminLoginForm() {
    const searchParams = useSearchParams();
    const [state, formAction, isPending] = useActionState(
        signInAdminAction,
        INITIAL_STATE,
    );

    const errorFromUrl = searchParams.get("error");
    const message = state.message;

    return (
        <form className={styles.form} action={formAction}>
            <div className={styles.header}>
                <span>Admin</span>
                <h1>Autentificare</h1>
                <p>Acces permis doar conturilor cu rol de admin în Supabase.</p>
            </div>

            {errorFromUrl === "not_admin" && !message && (
                <div className={styles.error}>
                    Contul tău nu are permisiuni de admin.
                </div>
            )}

            {message && <div className={styles.error}>{message}</div>}

            <label className={styles.field}>
                Email
                <input
                    type="email"
                    name="email"
                    placeholder="admin@email.com"
                    autoComplete="email"
                    required
                />
            </label>

            <label className={styles.field}>
                Parolă
                <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                />
            </label>

            <button type="submit" disabled={isPending}>
                {isPending ? "Se conectează..." : "Intră în admin"}
            </button>
        </form>
    );
}
