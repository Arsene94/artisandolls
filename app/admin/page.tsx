import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import styles from "./page.module.css";

export default async function AdminPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
        redirect("/admin/login");
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <span>Admin panel</span>
                <h1>Bine ai venit în admin</h1>
                <p>
                    Ești conectat ca <strong>{user.email}</strong>. De aici poți începe să construiești managementul pentru păpuși, comenzi și customizări.
                </p>
            </section>
        </main>
    );
}
