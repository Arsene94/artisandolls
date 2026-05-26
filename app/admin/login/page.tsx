import { Suspense } from "react";
import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Admin Login — Velvet Companions",
    description: "Autentificare admin Velvet Companions.",
    robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
    return (
        <main className={styles.page}>
            <div className={styles.pattern} />

            <section className={styles.content}>
                <Suspense fallback={null}>
                    <AdminLoginForm />
                </Suspense>
            </section>
        </main>
    );
}
