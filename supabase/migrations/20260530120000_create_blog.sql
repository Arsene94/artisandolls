-- ───────────────────────────────────────────────────────────────────
-- blog_posts — content marketing pillar pentru SEO + GEO + AI search.
-- Suprafața publică: /blog (index) + /blog/[slug] (detaliu).
-- Câmpurile traduse urmează convenția `shop_categories`: coloana de bază
-- e RO, iar variantele EN/NL stau în coloane sufixate `_en` și `_nl`.
-- Body-ul se stochează ca markdown-light și se randează server-side
-- printr-un parser intern (vezi lib/markdown.ts).
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.blog_posts (
    id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    -- Categoria taxonomică e folosită pentru grupare în index și pentru
    -- internal linking pe pagina detaliu. Listă închisă, nu free-form.
    category text not null check (category in ('guide', 'comparison', 'legal', 'culture')),
    cover_image_path text,
    author_name text not null default 'Velvet Companions',
    author_role text,
    reading_minutes integer not null default 3 check (reading_minutes > 0),

    title text not null,
    title_en text,
    title_nl text,
    excerpt text not null,
    excerpt_en text,
    excerpt_nl text,
    body text not null,
    body_en text,
    body_nl text,

    -- SEO overrides — opționale; dacă lipsesc, folosim title/excerpt.
    seo_title text,
    seo_title_en text,
    seo_title_nl text,
    seo_description text,
    seo_description_en text,
    seo_description_nl text,

    -- Etichete libere pentru navigare laterală și pentru cross-link cu
    -- glosarul (slug-uri de termeni ajung aici și sunt rezolvate la randare).
    tags text[] not null default '{}',
    -- Slug-uri de articole înrudite, ordonate. Goal: 2-4 link-uri „read next"
    -- consistente între articole.
    related_slugs text[] not null default '{}',

    is_featured boolean not null default false,
    is_active boolean not null default true,

    publish_at timestamptz not null default now(),
    display_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_active_pub_idx
    on public.blog_posts(is_active, publish_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts(category);
create index if not exists blog_posts_featured_idx
    on public.blog_posts(is_featured) where is_featured = true;
create index if not exists blog_posts_tags_idx on public.blog_posts using gin(tags);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
    before update on public.blog_posts
    for each row
    execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
drop policy if exists "Admins manage blog posts" on public.blog_posts;

create policy "Public can read published blog posts"
    on public.blog_posts
    for select
    using (is_active = true and publish_at <= now());

create policy "Admins manage blog posts"
    on public.blog_posts
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
