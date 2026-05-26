import type { Locale } from "@/i18n/routing";

export type BlogCategory = "guide" | "comparison" | "legal" | "culture";

export type BlogPostRow = {
    id: string;
    slug: string;
    category: BlogCategory;
    cover_image_path: string | null;
    author_name: string;
    author_role: string | null;
    reading_minutes: number;

    title: string;
    title_en: string | null;
    title_nl: string | null;
    excerpt: string;
    excerpt_en: string | null;
    excerpt_nl: string | null;
    body: string;
    body_en: string | null;
    body_nl: string | null;

    seo_title: string | null;
    seo_title_en: string | null;
    seo_title_nl: string | null;
    seo_description: string | null;
    seo_description_en: string | null;
    seo_description_nl: string | null;

    tags: string[];
    related_slugs: string[];

    is_featured: boolean;
    is_active: boolean;
    publish_at: string;
    display_order: number;
    created_at: string;
    updated_at: string;
};

/** Forma livrată în UI public — câmpurile sunt deja rezolvate pe locale-ul cerut. */
export type BlogPost = {
    id: string;
    slug: string;
    category: BlogCategory;
    coverImagePath: string | null;
    authorName: string;
    authorRole: string | null;
    readingMinutes: number;
    publishAt: string;
    tags: string[];
    relatedSlugs: string[];
    isFeatured: boolean;

    title: string;
    excerpt: string;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
};

function pickLocalised(
    locale: Locale,
    base: string,
    en: string | null,
    nl: string | null,
): string {
    if (locale === "en") return (en ?? base).trim() || base;
    if (locale === "nl") return (nl ?? base).trim() || base;
    return base;
}

function pickNullableLocalised(
    locale: Locale,
    base: string | null,
    en: string | null,
    nl: string | null,
): string | null {
    if (locale === "en") return en ?? base;
    if (locale === "nl") return nl ?? base;
    return base;
}

export function mapBlogPostRowToPost(row: BlogPostRow, locale: Locale): BlogPost {
    return {
        id: row.id,
        slug: row.slug,
        category: row.category,
        coverImagePath: row.cover_image_path,
        authorName: row.author_name,
        authorRole: row.author_role,
        readingMinutes: row.reading_minutes,
        publishAt: row.publish_at,
        tags: row.tags,
        relatedSlugs: row.related_slugs,
        isFeatured: row.is_featured,
        title: pickLocalised(locale, row.title, row.title_en, row.title_nl),
        excerpt: pickLocalised(locale, row.excerpt, row.excerpt_en, row.excerpt_nl),
        body: pickLocalised(locale, row.body, row.body_en, row.body_nl),
        seoTitle: pickNullableLocalised(locale, row.seo_title, row.seo_title_en, row.seo_title_nl),
        seoDescription: pickNullableLocalised(
            locale,
            row.seo_description,
            row.seo_description_en,
            row.seo_description_nl,
        ),
    };
}

export const BLOG_CATEGORIES: BlogCategory[] = ["guide", "comparison", "legal", "culture"];

export function isBlogCategory(value: unknown): value is BlogCategory {
    return typeof value === "string" && (BLOG_CATEGORIES as string[]).includes(value);
}
