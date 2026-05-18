import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Admin Login — Artisan Dolls",
    description: "Autentificare admin Artisan Dolls.",
};

export default function AdminLoginPage() {
    return (
        <main className={styles.page}>
            <div className={styles.pattern} />

            <section className={styles.content}>
                <AdminLoginForm />
            </section>
        </main>
    );
}
