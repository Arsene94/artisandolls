-- Automatic offers / promotions engine.
--
-- Distinct from coupons (which are manual codes): offers apply automatically
-- when their conditions are met and are promoted across the site (homepage
-- banner, product badges, checkout progress "spend X more to get Y").
--
-- One table covers both surfaces (shop + dolls) and every offer type. The
-- behaviour (auto-discount vs display-only) follows from `type`:
--   threshold_percent / threshold_fixed → auto % / fixed off once subtotal ≥ threshold
--   threshold_gift                       → free gift product once subtotal ≥ threshold
--   buy_x_get_y                          → buy X units, get Y cheapest at Z% off (shop cart)
--   collection_percent                   → % off items in targeted categories/collections
--   promo                                → display-only (badge + banner), no auto discount
--
-- Money fields use the same integer scale the rest of the app displays
-- (formatPrice / formatMoney render the stored integer directly).

create extension if not exists pgcrypto;

create table if not exists public.site_offers (
    id uuid primary key default gen_random_uuid(),

    name text not null,                          -- internal admin label
    type text not null default 'threshold_percent',
    is_active boolean not null default true,
    priority integer not null default 0,         -- higher wins when several match

    starts_at timestamptz,
    expires_at timestamptz,

    -- scope
    applies_to text not null default 'shop',     -- shop | dolls | both
    doll_modes text[] not null default '{}',     -- rent/buy subset for dolls; empty = all

    -- threshold (for threshold_* types)
    threshold_amount integer check (threshold_amount is null or threshold_amount >= 0),

    -- reward
    reward_percent integer check (reward_percent is null or (reward_percent >= 0 and reward_percent <= 100)),
    reward_amount integer check (reward_amount is null or reward_amount >= 0),
    reward_max_discount integer check (reward_max_discount is null or reward_max_discount > 0),
    gift_product_id uuid references public.shop_products(id) on delete set null,

    -- buy X get Y
    buy_quantity integer check (buy_quantity is null or buy_quantity >= 1),
    get_quantity integer check (get_quantity is null or get_quantity >= 1),
    get_percent integer check (get_percent is null or (get_percent >= 0 and get_percent <= 100)),

    -- targeting (empty arrays = whole surface)
    applies_to_categories uuid[] not null default '{}',   -- shop categories
    applies_to_collections uuid[] not null default '{}',  -- doll collections

    -- display (multilingual: base column = RO, _en / _nl overrides)
    badge_label text,
    badge_label_en text,
    badge_label_nl text,
    title text,
    title_en text,
    title_nl text,
    subtitle text,
    subtitle_en text,
    subtitle_nl text,
    accent text,                                 -- optional hex accent for banner/badge
    show_on_homepage boolean not null default true,
    show_badge boolean not null default true,

    currency text not null default 'RON',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint site_offers_applies_to_check
        check (applies_to in ('shop', 'dolls', 'both')),
    constraint site_offers_type_check
        check (type in (
            'threshold_percent', 'threshold_fixed', 'threshold_gift',
            'buy_x_get_y', 'collection_percent', 'promo'
        )),
    constraint site_offers_doll_modes_check
        check (doll_modes <@ array['rent', 'buy']::text[])
);

create index if not exists site_offers_active_idx
    on public.site_offers (is_active);
create index if not exists site_offers_applies_to_idx
    on public.site_offers (applies_to);
create index if not exists site_offers_priority_idx
    on public.site_offers (priority desc);

drop trigger if exists site_offers_set_updated_at on public.site_offers;
create trigger site_offers_set_updated_at
    before update on public.site_offers
    for each row
    execute function public.set_updated_at();

alter table public.site_offers enable row level security;

drop policy if exists "Public can read active offers" on public.site_offers;
create policy "Public can read active offers"
    on public.site_offers
    for select
    using (is_active = true);

drop policy if exists "Admins manage offers" on public.site_offers;
create policy "Admins manage offers"
    on public.site_offers
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- Order traceability — which offer (if any) priced the order
-- ───────────────────────────────────────────────────────────────────

alter table public.orders
    add column if not exists offer_id uuid references public.site_offers(id) on delete set null,
    add column if not exists offer_label text;

alter table public.shop_orders
    add column if not exists offer_id uuid references public.site_offers(id) on delete set null,
    add column if not exists offer_label text;

create index if not exists orders_offer_idx on public.orders(offer_id);
create index if not exists shop_orders_offer_idx on public.shop_orders(offer_id);
