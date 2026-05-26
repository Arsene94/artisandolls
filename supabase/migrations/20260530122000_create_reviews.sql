-- ───────────────────────────────────────────────────────────────────
-- reviews — feedback de la clienți după livrare. Polimorfic: același tabel
-- gestionează atât review-uri pentru doll-uri (rental + buy), cât și pentru
-- produsele din shop. Fără foreign key spre tabela țintă; integritatea
-- referențială e validată în cod, la moment de submit.
--
-- Flux:
--   1. Admin generează un review_token din UI-ul de comenzi (după ce statusul
--      e `completed`/`delivered`).
--   2. Admin trimite manual către client URL-ul `/review/<token>` prin WhatsApp.
--   3. Clientul completează formul public — status devine `pending`.
--   4. Admin moderează în `/admin/reviews` (approve / reject cu admin_note).
--   5. Review-urile aprobate sunt afișate pe pagina țintă + injectate în JSON-LD.
-- ───────────────────────────────────────────────────────────────────

create type review_status as enum ('invited', 'pending', 'approved', 'rejected');
create type review_target_type as enum ('doll', 'shop_product');

create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),

    target_type review_target_type not null,
    target_id uuid not null,

    -- Tokenul generat de admin pentru invitație. Unic, public-safe (un UUID
    -- aleator pe 128 biți, nepredictibil). Restricționăm submit-ul la un
    -- token valid și fie `invited`, fie `pending` (resubmit înainte de
    -- moderare e permis).
    review_token text not null unique,

    -- Sursa comenzii — `orders` (doll) sau `shop_orders` (shop). Fără FK
    -- explicit pentru flexibilitate.
    order_type text check (order_type in ('doll_rental', 'doll_purchase', 'shop_order')),
    order_id uuid,

    rating smallint check (rating is null or (rating between 1 and 5)),
    title text,
    body text,
    customer_name text,
    customer_initials text,
    locale text check (locale is null or (locale in ('ro', 'en', 'nl'))),

    status review_status not null default 'invited',
    admin_note text,

    invited_at timestamptz not null default now(),
    submitted_at timestamptz,
    moderated_at timestamptz,
    moderated_by uuid,

    expires_at timestamptz not null default (now() + interval '60 days'),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists reviews_target_idx
    on public.reviews(target_type, target_id) where status = 'approved';
create index if not exists reviews_status_idx on public.reviews(status, created_at desc);
create index if not exists reviews_token_idx on public.reviews(review_token);
create index if not exists reviews_expires_idx on public.reviews(expires_at);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
    before update on public.reviews
    for each row
    execute function public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Admins manage reviews" on public.reviews;

-- Citirea publică e limitată la review-urile aprobate. Tot ce e `invited`,
-- `pending` sau `rejected` rămâne ascuns clientului. Token-ul individual e
-- accesat doar prin Service Role (formul public folosește server action,
-- nu PostgREST direct).
create policy "Public can read approved reviews"
    on public.reviews
    for select
    using (status = 'approved');

create policy "Admins manage reviews"
    on public.reviews
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
