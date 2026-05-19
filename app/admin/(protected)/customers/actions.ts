"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";

async function requireAdminSupabase() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user)) {
        redirect("/admin/login");
    }

    return supabase;
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string) {
    const value = getString(formData, key);
    return value || null;
}

function normalizePhone(value: string) {
    return value.replace(/[^\d+]/g, "");
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
    const supabase = await requireAdminSupabase();

    const phone = getString(formData, "phone");

    const { error } = await supabase
        .from("customers")
        .update({
            full_name: getString(formData, "full_name"),
            email: getString(formData, "email").toLowerCase(),
            phone,
            normalized_phone: normalizePhone(phone),
            last_delivery_address: getNullableString(formData, "last_delivery_address"),
            notes: getNullableString(formData, "notes"),
            is_blocked: formData.get("is_blocked") === "on",
        })
        .eq("id", customerId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
    redirect(`/admin/customers/${customerId}`);
}

export async function deleteCustomerAction(customerId: string) {
    const supabase = await requireAdminSupabase();

    const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/customers");
    redirect("/admin/customers");
}
