"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AdminSignOutButton.module.css";

export default function AdminSignOutButton() {
    const router = useRouter();

    async function handleSignOut() {
        const supabase = createSupabaseBrowserClient();

        await supabase.auth.signOut();

        router.replace("/admin/login");
        router.refresh();
    }

    return (
        <button type="button" className={styles.button} onClick={handleSignOut}>
            Ieșire
        </button>
    );
}
