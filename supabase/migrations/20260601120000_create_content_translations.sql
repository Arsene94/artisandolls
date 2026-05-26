-- ───────────────────────────────────────────────────────────────────
-- content_translations — coadă + cache pentru traducerile automate.
--
-- Sursa fiecărei traduceri rămâne RO pe rândul original (dolls, shop_products,
-- doll_collections etc.). Worker-ul QStash din /api/qstash/translate
-- populează acest tabel pentru fiecare (entitate, locale, câmp) și pagina
-- aplică overlay-ul prin `applyTranslations()` din lib/translations/store.
--
-- Schema generică ne ferește de a aglomera fiecare tabel cu coloane _en/_nl
-- și permite adăugarea de noi entități fără ALTER TABLE.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.content_translations (
    id uuid primary key default gen_random_uuid(),

    entity_type text not null,
    entity_id uuid not null,
    locale text not null check (locale in ('en', 'nl')),
    field text not null,

    -- Textul tradus. Lăsăm null cât timp jobul rulează — UI-ul fallback-uiește la RO.
    value text,

    -- Sursa RO la momentul jobului. Detectează stale (admin schimbă RO, vrem retraducere).
    source_value text,

    -- 'pending' la enqueue, 'ready' după worker, 'failed' la eroare definitivă.
    status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
    error text,
    attempts integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (entity_type, entity_id, locale, field)
);

create index if not exists content_translations_entity_idx
    on public.content_translations(entity_type, entity_id);

create index if not exists content_translations_locale_idx
    on public.content_translations(entity_type, locale);

create index if not exists content_translations_status_idx
    on public.content_translations(status)
    where status = 'pending';

drop trigger if exists content_translations_set_updated_at on public.content_translations;
create trigger content_translations_set_updated_at
    before update on public.content_translations
    for each row
    execute function public.set_updated_at();

alter table public.content_translations enable row level security;

drop policy if exists "Public can read ready translations" on public.content_translations;
drop policy if exists "Admins manage translations" on public.content_translations;

-- Public citește doar traducerile finalizate; rândurile pending/failed nu sunt
-- expuse anonimilor pentru a evita scurgeri de jumătate-stări.
create policy "Public can read ready translations"
    on public.content_translations
    for select
    using (status = 'ready');

create policy "Admins manage translations"
    on public.content_translations
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
