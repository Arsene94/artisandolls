"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { invalidateFaq } from "@/lib/upstash/cache";
import { isFaqCategory } from "@/lib/faq/shared";

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user)) redirect("/admin/login");
    return supabase;
}

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}
function getNullableString(formData: FormData, key: string) {
    return getString(formData, key) || null;
}
function getBoolean(formData: FormData, key: string) {
    return formData.get(key) === "on";
}
function getNumber(formData: FormData, key: string, fallback = 0) {
    const raw = getString(formData, key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}

async function revalidate() {
    revalidatePath("/faq");
    revalidatePath("/en/faq");
    revalidatePath("/nl/faq");
    revalidatePath("/");
    revalidatePath("/en");
    revalidatePath("/nl");
    revalidatePath("/admin/faq");
    await invalidateFaq();
}

function payload(formData: FormData) {
    const question = getString(formData, "question");
    const customSlug = getString(formData, "slug");
    const categoryRaw = getString(formData, "category");
    const category = isFaqCategory(categoryRaw) ? categoryRaw : "general";
    return {
        slug: slugify(customSlug || question.slice(0, 60)),
        category,
        question,
        question_en: getNullableString(formData, "question_en"),
        question_nl: getNullableString(formData, "question_nl"),
        answer: getString(formData, "answer"),
        answer_en: getNullableString(formData, "answer_en"),
        answer_nl: getNullableString(formData, "answer_nl"),
        show_on_home: getBoolean(formData, "show_on_home"),
        display_order: getNumber(formData, "display_order"),
        is_active: getBoolean(formData, "is_active"),
    };
}

export async function createFaqItemAction(formData: FormData) {
    const supabase = await requireAdmin();
    const data = payload(formData);
    if (!data.question || !data.answer) {
        throw new Error("Întrebarea și răspunsul sunt obligatorii.");
    }
    const { error } = await supabase.from("faq_items").insert(data);
    if (error) throw new Error(error.message);
    await revalidate();
    redirect("/admin/faq");
}

export async function updateFaqItemAction(id: string, formData: FormData) {
    const supabase = await requireAdmin();
    const data = payload(formData);
    if (!data.question || !data.answer) {
        throw new Error("Întrebarea și răspunsul sunt obligatorii.");
    }
    const { error } = await supabase.from("faq_items").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    await revalidate();
    redirect("/admin/faq");
}

export async function deleteFaqItemAction(id: string) {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await revalidate();
}
