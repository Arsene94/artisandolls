import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBlogPosts } from "@/lib/blog/posts";
import { getPublicPlatformSettings } from "@/lib/settings";
import { getSupabaseImageUrl } from "@/lib/supabase/images";
import {
    CANONICAL_BRAND,
    getSiteUrl,
    localeAlternates,
    localeUrl,
} from "@/lib/site";
import type { BlogCategory, BlogPost } from "@/lib/blog/shared";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const [t, settings] = await Promise.all([
        getTranslations({ locale, namespace: "blog" }),
        getPublicPlatformSettings().catch(() => null),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const canonical = localeUrl(siteUrl, locale, "/blog");

    return {
        title: t("indexTitle"),
        description: t("indexDescription"),
        alternates: {
            canonical,
            languages: localeAlternates(siteUrl, "/blog"),
        },
        openGraph: {
            type: "website",
            url: canonical,
            title: t("indexTitle"),
            description: t("indexDescription"),
            locale: locale === "ro" ? "ro_RO" : locale === "nl" ? "nl_NL" : "en_GB",
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

function groupByCategory(posts: BlogPost[]) {
    const groups = new Map<BlogCategory, BlogPost[]>();
    for (const post of posts) {
        const bucket = groups.get(post.category);
        if (bucket) bucket.push(post);
        else groups.set(post.category, [post]);
    }
    return groups;
}

const CATEGORY_ORDER: BlogCategory[] = ["guide", "comparison", "legal", "culture"];

export default async function BlogIndexPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const [t, settings, posts] = await Promise.all([
        getTranslations({ locale, namespace: "blog" }),
        getPublicPlatformSettings().catch(() => null),
        getBlogPosts(locale),
    ]);
    const siteUrl = getSiteUrl(settings?.public_site_url ?? null);
    const baseUrl = localeUrl(siteUrl, locale, "/blog");

    const featured = posts.filter((p) => p.isFeatured).slice(0, 1)[0] ?? posts[0];
    const restGroups = groupByCategory(posts.filter((p) => p.id !== featured?.id));

    const blogLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${baseUrl}#blog`,
        url: baseUrl,
        name: t("indexTitle"),
        description: t("indexDescription"),
        inLanguage: locale === "ro" ? "ro-RO" : locale === "nl" ? "nl-NL" : "en-GB",
        publisher: { "@id": `${siteUrl}/#org` },
        blogPost: posts.slice(0, 30).map((p) => ({
            "@type": "BlogPosting",
            url: localeUrl(siteUrl, locale, `/blog/${p.slug}`),
            headline: p.title,
            datePublished: p.publishAt,
            author: { "@type": "Person", name: p.authorName },
        })),
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
                item: baseUrl,
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
            />
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-16 max-w-3xl">
                    <p className="text-[0.72rem] uppercase tracking-[0.32em] text-gold">
                        {t("eyebrow")}
                    </p>
                    <h1 className="mt-4 font-display italic font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
                        {t("indexTitle")}
                    </h1>
                    <p className="mt-6 text-base sm:text-lg text-silk/75 leading-relaxed">
                        {t("indexLede")}
                    </p>
                </header>

                {posts.length === 0 ? (
                    <div className="max-w-2xl mx-auto py-20 text-center border border-velvet-800 rounded-3xl">
                        <p className="font-display italic text-2xl">{t("emptyTitle")}</p>
                        <p className="mt-3 text-silk/70">{t("emptyDescription")}</p>
                    </div>
                ) : null}

                {featured ? (
                    <section
                        aria-labelledby="featured-post"
                        className="mb-20 border-b border-velvet-800 pb-12"
                    >
                        <Link
                            href={`/blog/${featured.slug}`}
                            className="group grid lg:grid-cols-12 gap-8 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl"
                        >
                            <div className="lg:col-span-7 relative aspect-[5/3] overflow-hidden rounded-2xl border border-gold/15">
                                {featured.coverImagePath ? (
                                    <Image
                                        src={getSupabaseImageUrl(featured.coverImagePath, "gallery")}
                                        alt={featured.title}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 motion-reduce:transition-none"
                                    />
                                ) : (
                                    <div
                                        aria-hidden="true"
                                        className="absolute inset-0 bg-gradient-to-br from-velvet-800 to-velvet-950"
                                    />
                                )}
                            </div>
                            <div className="lg:col-span-5">
                                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-gold-light/85">
                                    {t(`category.${featured.category}`)} · {t("readingTime", { minutes: featured.readingMinutes })}
                                </p>
                                <h2
                                    id="featured-post"
                                    className="mt-3 font-display italic text-3xl sm:text-4xl leading-tight group-hover:text-gold-light motion-reduce:group-hover:text-silk"
                                >
                                    {featured.title}
                                </h2>
                                <p className="mt-4 text-base text-silk/80 leading-relaxed">
                                    {featured.excerpt}
                                </p>
                                <p className="mt-6 text-sm text-silk/60">
                                    {formatDate(featured.publishAt, locale)} · {featured.authorName}
                                </p>
                                <p className="mt-6 inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.18em] text-gold">
                                    {t("readMore")}
                                    <span aria-hidden="true">→</span>
                                </p>
                            </div>
                        </Link>
                    </section>
                ) : null}

                {CATEGORY_ORDER.filter((cat) => (restGroups.get(cat)?.length ?? 0) > 0).map((cat) => {
                    const list = restGroups.get(cat) ?? [];
                    return (
                        <section
                            key={cat}
                            aria-labelledby={`section-${cat}`}
                            className="mb-16"
                        >
                            <div className="mb-6 flex items-baseline justify-between gap-4">
                                <h2
                                    id={`section-${cat}`}
                                    className="font-display italic text-2xl sm:text-3xl text-silk"
                                >
                                    {t(`category.${cat}`)}
                                </h2>
                                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-silk/55">
                                    {t("countLabel", { count: list.length })}
                                </p>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
                                {list.map((post) => (
                                    <li key={post.id}>
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="group flex flex-col h-full bg-velvet-950 border border-gold/15 hover:border-gold/40 rounded-2xl overflow-hidden transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                        >
                                            <div className="relative aspect-[5/3] bg-velvet-900">
                                                {post.coverImagePath ? (
                                                    <Image
                                                        src={getSupabaseImageUrl(post.coverImagePath, "card")}
                                                        alt={post.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-gold-light/85">
                                                    {t(`category.${post.category}`)} · {t("readingTime", { minutes: post.readingMinutes })}
                                                </p>
                                                <h3 className="mt-2 font-display italic text-xl text-silk leading-tight">
                                                    {post.title}
                                                </h3>
                                                <p className="mt-3 text-sm text-silk/70 leading-relaxed line-clamp-3">
                                                    {post.excerpt}
                                                </p>
                                                <p className="mt-auto pt-4 text-xs text-silk/55">
                                                    {formatDate(post.publishAt, locale)}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </main>
    );
}
