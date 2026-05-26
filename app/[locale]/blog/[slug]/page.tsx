import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog/posts";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";
import {
    CANONICAL_BRAND,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import { safeLdJson } from "@/lib/seo/ld-json";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const [post, settings] = await Promise.all([
        getBlogPostBySlug(slug, locale),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);

    if (!post) {
        return { robots: { index: false, follow: true } };
    }

    const canonical = localeUrl(siteUrl, locale, `/blog/${post.slug}`);
    const imageUrl = post.coverImagePath
        ? getSupabaseImageUrl(post.coverImagePath, "gallery")
        : undefined;

    return {
        title: post.seoTitle ?? post.title,
        description: post.seoDescription ?? post.excerpt,
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, `/blog/${post.slug}`),
        },
        openGraph: {
            type: "article",
            url: canonical,
            title: post.title,
            description: post.excerpt,
            images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
            publishedTime: post.publishAt,
            authors: [post.authorName],
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: imageUrl ? [imageUrl] : undefined,
        },
        robots: { index: true, follow: true },
    };
}

function formatDate(iso: string, locale: Locale): string {
    return new Date(iso).toLocaleDateString(
        locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" },
    );
}

export default async function BlogPostPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const post = await getBlogPostBySlug(slug, locale);
    if (!post) notFound();

    const [t, settings, related] = await Promise.all([
        getTranslations({ locale, namespace: "blog" }),
        getPublicPlatformSettings().catch(() => null),
        getRelatedBlogPosts(post, locale, 3),
    ]);

    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, `/blog/${post.slug}`);
    const imageUrl = post.coverImagePath
        ? getSupabaseImageUrl(post.coverImagePath, "gallery")
        : null;
    const headings = extractHeadings(post.body);

    const articleLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        mainEntityOfPage: canonical,
        url: canonical,
        headline: post.title,
        description: post.excerpt,
        image: imageUrl ? [imageUrl] : undefined,
        datePublished: post.publishAt,
        dateModified: post.publishAt,
        author: {
            "@type": "Person",
            name: post.authorName,
            jobTitle: post.authorRole ?? undefined,
        },
        publisher: { "@id": `${siteUrl}/#org` },
        articleSection: post.category,
        keywords: post.tags.join(", ") || undefined,
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        wordCount: post.body.split(/\s+/).filter(Boolean).length,
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: CANONICAL_BRAND,
                item: localeUrl(siteUrl, locale, "/"),
            },
            {
                "@type": "ListItem",
                position: 2,
                name: t("indexTitle"),
                item: localeUrl(siteUrl, locale, "/blog"),
            },
            {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: canonical,
            },
        ],
    };

    return (
        <main
            data-surface="dark"
            className="bg-velvet-950 text-silk min-h-screen pt-32 pb-24"
        >
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(articleLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: safeLdJson(breadcrumbLd) }}
            />

            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav
                    aria-label="Breadcrumb"
                    className="mb-8 text-[0.78rem] tracking-[0.18em] uppercase text-silk/60"
                >
                    <Link
                        href="/blog"
                        className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                    >
                        {t("indexTitle")}
                    </Link>
                    <span aria-hidden="true" className="mx-2">/</span>
                    <span className="text-gold" aria-current="page">{post.title}</span>
                </nav>

                <header className="mb-10">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold-light/85">
                        {t(`category.${post.category}`)} · {t("readingTime", { minutes: post.readingMinutes })}
                    </p>
                    <h1 className="mt-3 font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                        {post.title}
                    </h1>
                    <p className="mt-6 text-lg text-silk/85 leading-relaxed">
                        {post.excerpt}
                    </p>
                    <p className="mt-6 text-sm text-silk/65">
                        <span className="text-silk">{post.authorName}</span>
                        {post.authorRole ? <> · {post.authorRole}</> : null}
                        <> · {formatDate(post.publishAt, locale)}</>
                    </p>
                </header>

                {imageUrl ? (
                    <div className="relative aspect-[16/9] mb-12 overflow-hidden rounded-3xl border border-gold/15">
                        <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover object-center"
                        />
                    </div>
                ) : null}

                {headings.length >= 3 ? (
                    <aside
                        aria-labelledby="toc-heading"
                        className="mb-12 p-5 border border-velvet-800 rounded-2xl bg-velvet-900/40"
                    >
                        <h2
                            id="toc-heading"
                            className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/70 mb-3"
                        >
                            {t("tableOfContents")}
                        </h2>
                        <ol className="space-y-1.5 list-decimal pl-5 marker:text-gold/60 text-sm text-silk/80">
                            {headings.map((h) => (
                                <li key={h.id}>
                                    <a
                                        href={`#${h.id}`}
                                        className="hover:text-gold focus-visible:outline-none focus-visible:underline"
                                    >
                                        {h.text}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </aside>
                ) : null}

                <div className="prose-blog">
                    {renderMarkdown(post.body)}
                </div>

                {post.tags.length > 0 ? (
                    <div className="mt-12 pt-10 border-t border-velvet-800">
                        <p className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/55 mb-3">
                            {t("tagsLabel")}
                        </p>
                        <ul className="flex flex-wrap gap-2 list-none p-0">
                            {post.tags.map((tag) => (
                                <li
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-full border border-velvet-800 text-xs text-silk/75"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {related.length > 0 ? (
                    <aside
                        aria-labelledby="related-heading"
                        className="mt-16 pt-10 border-t border-velvet-800"
                    >
                        <h2
                            id="related-heading"
                            className="font-display italic text-xl sm:text-2xl text-silk mb-6"
                        >
                            {t("relatedHeading")}
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                            {related.map((p) => (
                                <li key={p.id}>
                                    <Link
                                        href={`/blog/${p.slug}`}
                                        className="block p-5 rounded-2xl border border-velvet-800 hover:border-gold/40 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                    >
                                        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-gold-light/80">
                                            {t(`category.${p.category}`)} · {t("readingTime", { minutes: p.readingMinutes })}
                                        </p>
                                        <p className="mt-2 font-display italic text-lg text-silk">
                                            {p.title}
                                        </p>
                                        <p className="mt-2 text-sm text-silk/65 line-clamp-2">
                                            {p.excerpt}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </aside>
                ) : null}
            </article>
        </main>
    );
}
