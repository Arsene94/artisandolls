import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { cached, CACHE_KEYS } from "@/lib/upstash/cache";
import {
    mapBlogPostRowToPost,
    type BlogPost,
    type BlogPostRow,
    type BlogCategory,
} from "@/lib/blog/shared";
import type { Locale } from "@/i18n/routing";

const PUBLIC_TTL = 300;

function selectColumns() {
    // Listăm coloanele explicit ca să prindem la build dacă schema migrează
    // (TypeScript ne semnalează absența pe BlogPostRow); plus, e mai ieftin
    // decât `select("*")` când vom adăuga blob-uri viitoare (PDF/audio).
    return `
        id,
        slug,
        category,
        cover_image_path,
        author_name,
        author_role,
        reading_minutes,
        title, title_en, title_nl,
        excerpt, excerpt_en, excerpt_nl,
        body, body_en, body_nl,
        seo_title, seo_title_en, seo_title_nl,
        seo_description, seo_description_en, seo_description_nl,
        tags,
        related_slugs,
        is_featured,
        is_active,
        publish_at,
        display_order,
        created_at,
        updated_at
    `;
}

export async function getBlogPosts(locale: Locale): Promise<BlogPost[]> {
    const rows = await cached(CACHE_KEYS.blogPosts, PUBLIC_TTL, async () => {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("blog_posts")
            .select(selectColumns())
            .eq("is_active", true)
            .lte("publish_at", new Date().toISOString())
            .order("publish_at", { ascending: false })
            .order("display_order", { ascending: true });
        if (error || !data) return [] as BlogPostRow[];
        return data as unknown as BlogPostRow[];
    });
    return rows.map((row) => mapBlogPostRowToPost(row, locale));
}

export async function getBlogPostBySlug(
    slug: string,
    locale: Locale,
): Promise<BlogPost | null> {
    const row = await cached(CACHE_KEYS.blogPostBySlug(slug), PUBLIC_TTL, async () => {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("blog_posts")
            .select(selectColumns())
            .eq("slug", slug)
            .eq("is_active", true)
            .lte("publish_at", new Date().toISOString())
            .maybeSingle();
        if (error || !data) return null;
        return data as unknown as BlogPostRow;
    });
    return row ? mapBlogPostRowToPost(row, locale) : null;
}

export async function getRelatedBlogPosts(
    post: BlogPost,
    locale: Locale,
    limit = 3,
): Promise<BlogPost[]> {
    if (post.relatedSlugs.length === 0) {
        // Fallback: alte articole din aceeași categorie.
        const all = await getBlogPosts(locale);
        return all
            .filter((p) => p.slug !== post.slug && p.category === post.category)
            .slice(0, limit);
    }
    const all = await getBlogPosts(locale);
    const bySlug = new Map(all.map((p) => [p.slug, p] as const));
    return post.relatedSlugs
        .map((slug) => bySlug.get(slug))
        .filter((p): p is BlogPost => Boolean(p))
        .slice(0, limit);
}

export async function getAllBlogPostSlugs(): Promise<{ slug: string; updated_at: string }[]> {
    // Folosit de sitemap — nu trecem prin cache pentru că rulează rar.
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("is_active", true)
        .lte("publish_at", new Date().toISOString());
    return (data ?? []).filter((row): row is { slug: string; updated_at: string } =>
        typeof row.slug === "string" && row.slug.length > 0,
    );
}

/** Admin-only: bypass RLS, vede toate posturile inclusiv draft + scheduled. */
export async function getBlogPostsForAdmin(): Promise<BlogPostRow[]> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("blog_posts")
        .select(selectColumns())
        .order("publish_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as BlogPostRow[];
}

export async function getBlogPostRowByIdForAdmin(id: string): Promise<BlogPostRow | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from("blog_posts")
        .select(selectColumns())
        .eq("id", id)
        .maybeSingle();
    if (error || !data) return null;
    return data as unknown as BlogPostRow;
}

export function categoryLabelKey(category: BlogCategory): string {
    return `category.${category}`;
}
