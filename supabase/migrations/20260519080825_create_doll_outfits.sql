create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'outfit_mode') then
create type public.outfit_mode as enum ('rent', 'buy', 'both');
end if;
end $$;

create table if not exists public.doll_outfits (
                                                   id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    label text not null,
    description text,

    mode public.outfit_mode not null default 'both',
    price integer not null default 0,

    image_path text,
    image_url text,

    icon_name text not null default 'hanger',

    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists doll_outfits_mode_idx on public.doll_outfits(mode);
create index if not exists doll_outfits_active_idx on public.doll_outfits(is_active);
create index if not exists doll_outfits_slug_idx on public.doll_outfits(slug);

drop trigger if exists doll_outfits_set_updated_at on public.doll_outfits;

create trigger doll_outfits_set_updated_at
    before update on public.doll_outfits
    for each row
    execute function public.set_updated_at();

alter table public.doll_outfits enable row level security;

drop policy if exists "Public can read active doll outfits" on public.doll_outfits;
drop policy if exists "Admins can read doll outfits" on public.doll_outfits;
drop policy if exists "Admins can insert doll outfits" on public.doll_outfits;
drop policy if exists "Admins can update doll outfits" on public.doll_outfits;
drop policy if exists "Admins can delete doll outfits" on public.doll_outfits;

create policy "Public can read active doll outfits"
on public.doll_outfits
for select
                                        using (is_active = true);

create policy "Admins can read doll outfits"
on public.doll_outfits
for select
               using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert doll outfits"
on public.doll_outfits
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update doll outfits"
on public.doll_outfits
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete doll outfits"
on public.doll_outfits
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

alter table public.orders
    add column if not exists outfit_label text,
    add column if not exists outfit_price integer not null default 0,
    add column if not exists outfit_image text;
