"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { invalidateBlog } from "@/lib/upstash/cache";
import { isBlogCategory } from "@/lib/blog/shared";
import { enqueueEntityTranslations } from "@/lib/translations/queue";

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
function getNumber(formData: FormData, key: string, fallback = 0) {
    const raw = getString(formData, key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function getBoolean(formData: FormData, key: string) {
    return formData.get(key) === "on";
}
function getCsvArray(formData: FormData, key: string) {
    const raw = getString(formData, key);
    if (!raw) return [];
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function parsePublishAt(raw: string): string {
    if (!raw) return new Date().toISOString();
    // datetime-local nu trimite zona orară; presupunem ora locală a serverului
    const dt = new Date(raw);
    if (!Number.isFinite(dt.getTime())) return new Date().toISOString();
    return dt.toISOString();
}

async function revalidateBlogPaths() {
    revalidatePath("/blog");
    revalidatePath("/en/blog");
    revalidatePath("/nl/blog");
    revalidatePath("/admin/blog");
    await invalidateBlog();
}

function payload(formData: FormData) {
    const title = getString(formData, "title");
    const slugInput = getString(formData, "slug");
    const slug = slugify(slugInput || title);
    const categoryRaw = getString(formData, "category");
    const category = isBlogCategory(categoryRaw) ? categoryRaw : "guide";

    return {
        slug,
        category,
        cover_image_path: getNullableString(formData, "cover_image_path"),
        author_name: getString(formData, "author_name") || "Velvet Companions",
        author_role: getNullableString(formData, "author_role"),
        reading_minutes: Math.max(1, getNumber(formData, "reading_minutes", 5)),
        title,
        title_en: getNullableString(formData, "title_en"),
        title_nl: getNullableString(formData, "title_nl"),
        excerpt: getString(formData, "excerpt"),
        excerpt_en: getNullableString(formData, "excerpt_en"),
        excerpt_nl: getNullableString(formData, "excerpt_nl"),
        body: getString(formData, "body"),
        body_en: getNullableString(formData, "body_en"),
        body_nl: getNullableString(formData, "body_nl"),
        seo_title: getNullableString(formData, "seo_title"),
        seo_title_en: getNullableString(formData, "seo_title_en"),
        seo_title_nl: getNullableString(formData, "seo_title_nl"),
        seo_description: getNullableString(formData, "seo_description"),
        seo_description_en: getNullableString(formData, "seo_description_en"),
        seo_description_nl: getNullableString(formData, "seo_description_nl"),
        tags: getCsvArray(formData, "tags"),
        related_slugs: getCsvArray(formData, "related_slugs"),
        is_active: getBoolean(formData, "is_active"),
        is_featured: getBoolean(formData, "is_featured"),
        publish_at: parsePublishAt(getString(formData, "publish_at")),
        display_order: getNumber(formData, "display_order"),
    };
}

function blogTranslatableFields(data: ReturnType<typeof payload>) {
    return [
        { key: "title", value: data.title },
        { key: "excerpt", value: data.excerpt },
        { key: "body", value: data.body },
        { key: "seo_title", value: data.seo_title },
        { key: "seo_description", value: data.seo_description },
    ];
}

export async function createBlogPostAction(formData: FormData) {
    const supabase = await requireAdmin();
    const data = payload(formData);
    if (!data.title || !data.body || !data.excerpt) {
        throw new Error("Titlul, excerpt-ul și body sunt obligatorii.");
    }
    const { data: inserted, error } = await supabase
        .from("blog_posts")
        .insert(data)
        .select("id")
        .single();
    if (error) throw new Error(error.message);
    await revalidateBlogPaths();
    if (inserted?.id) {
        await enqueueEntityTranslations({
            entity: "blog_post",
            entityId: inserted.id as string,
            fields: blogTranslatableFields(data),
        });
    }
    redirect("/admin/blog");
}

export async function updateBlogPostAction(id: string, formData: FormData) {
    const supabase = await requireAdmin();
    const data = payload(formData);
    if (!data.title || !data.body || !data.excerpt) {
        throw new Error("Titlul, excerpt-ul și body sunt obligatorii.");
    }
    const { error } = await supabase.from("blog_posts").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    await revalidateBlogPaths();
    await enqueueEntityTranslations({
        entity: "blog_post",
        entityId: id,
        fields: blogTranslatableFields(data),
    });
    redirect("/admin/blog");
}

export async function deleteBlogPostAction(id: string) {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await revalidateBlogPaths();
}
