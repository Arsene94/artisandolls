-- ───────────────────────────────────────────────────────────────────
-- faq_items — întrebări frecvente cu categorii și conținut multilingv.
-- Sursa actuală e hardcodată în messages/{locale}.json sub `home.faq.items`,
-- folosită doar pe pagina de start. Mutăm în DB ca să putem:
--   1. construi /faq dedicat cu search și grupare pe categorii,
--   2. lăsa admin-ul să adauge întrebări fără rebuild,
--   3. seed-ul de mai jos (`20260531121500_seed_faq.sql`) împachetează
--      cele 10 Q&A existente, mapate pe categorii.
-- Pattern de coloane traduse: la fel ca shop_categories — bază RO,
-- variante `_en` / `_nl` opționale.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.faq_items (
    id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    -- Categorie taxonomică. Lista e închisă; pentru a o extinde, alter la
    -- check și updatează mesajele i18n cu noile labels.
    category text not null check (category in (
        'delivery', 'hygiene', 'payment', 'materials',
        'legal', 'rental', 'purchase', 'general'
    )),

    question text not null,
    question_en text,
    question_nl text,
    answer text not null,
    answer_en text,
    answer_nl text,

    -- `show_on_home` permite să marcăm un subset pe care îl mai afișăm și pe
    -- /home (componenta FAQ.tsx existentă), preservând UX-ul curent.
    show_on_home boolean not null default true,
    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists faq_items_slug_idx on public.faq_items(slug);
create index if not exists faq_items_active_idx on public.faq_items(is_active);
create index if not exists faq_items_category_idx on public.faq_items(category);
create index if not exists faq_items_home_idx
    on public.faq_items(show_on_home) where show_on_home = true;

drop trigger if exists faq_items_set_updated_at on public.faq_items;
create trigger faq_items_set_updated_at
    before update on public.faq_items
    for each row
    execute function public.set_updated_at();

alter table public.faq_items enable row level security;

drop policy if exists "Public can read active faq items" on public.faq_items;
drop policy if exists "Admins manage faq items" on public.faq_items;

create policy "Public can read active faq items"
    on public.faq_items
    for select
    using (is_active = true);

create policy "Admins manage faq items"
    on public.faq_items
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
