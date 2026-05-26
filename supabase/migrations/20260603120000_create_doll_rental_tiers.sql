-- Per-doll rental pricing tiers. Each tier is a duration band (a range of
-- hours or days) with its own flat price. The customer picks a quantity + unit
-- and we match it to the band whose [min_qty, max_qty] contains it.

create extension if not exists pgcrypto;

create table if not exists public.doll_rental_tiers (
    id uuid primary key default gen_random_uuid(),

    doll_id uuid not null references public.dolls(id) on delete cascade,

    label text,
    unit text not null,
    min_qty integer not null,
    max_qty integer not null,
    price integer not null default 0,

    display_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint doll_rental_tiers_unit_check check (unit in ('hour', 'day')),
    constraint doll_rental_tiers_qty_check check (min_qty >= 1 and max_qty >= min_qty),
    constraint doll_rental_tiers_price_check check (price >= 0)
);

create index if not exists doll_rental_tiers_doll_idx
    on public.doll_rental_tiers(doll_id);
create index if not exists doll_rental_tiers_order_idx
    on public.doll_rental_tiers(doll_id, display_order);

drop trigger if exists doll_rental_tiers_set_updated_at on public.doll_rental_tiers;

create trigger doll_rental_tiers_set_updated_at
    before update on public.doll_rental_tiers
    for each row
    execute function public.set_updated_at();

alter table public.doll_rental_tiers enable row level security;

drop policy if exists "Public can read tiers of active dolls" on public.doll_rental_tiers;
drop policy if exists "Admins can read doll rental tiers" on public.doll_rental_tiers;
drop policy if exists "Admins can insert doll rental tiers" on public.doll_rental_tiers;
drop policy if exists "Admins can update doll rental tiers" on public.doll_rental_tiers;
drop policy if exists "Admins can delete doll rental tiers" on public.doll_rental_tiers;

create policy "Public can read tiers of active dolls"
on public.doll_rental_tiers
for select
using (
    exists (
        select 1 from public.dolls d
        where d.id = doll_id and d.is_active = true
    )
);

create policy "Admins can read doll rental tiers"
on public.doll_rental_tiers
for select
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert doll rental tiers"
on public.doll_rental_tiers
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update doll rental tiers"
on public.doll_rental_tiers
for update
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete doll rental tiers"
on public.doll_rental_tiers
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Order snapshot of the chosen rental tier. The legacy start_date / end_date /
-- rental_days / delivery_time / return_time columns are still populated (derived
-- from the start datetime + duration) so existing admin, email and workflow code
-- keeps working unchanged.
alter table public.orders
    add column if not exists rental_unit text,
    add column if not exists rental_quantity integer,
    add column if not exists rental_tier_id uuid,
    add column if not exists rental_tier_label text,
    add column if not exists rental_start_at timestamptz,
    add column if not exists rental_end_at timestamptz,
    add column if not exists rental_price integer;

alter table public.orders
drop constraint if exists orders_rental_unit_check;

alter table public.orders
    add constraint orders_rental_unit_check
        check (rental_unit is null or rental_unit in ('hour', 'day'));
