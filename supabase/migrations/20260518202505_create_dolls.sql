create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'doll_availability') then
create type public.doll_availability as enum (
      'available',
      'custom',
      'limited',
      'sold_out'
    );
end if;
end $$;

create table if not exists public.dolls (
                                            id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    name text not null,
    collection text not null,
    description text not null,

    main_image_url text not null,
    image_urls text[] not null default '{}',

    badge text not null,
    availability public.doll_availability not null default 'available',

    available_for_rent boolean not null default false,
    available_for_buy boolean not null default true,

    rent_price_per_day integer,
    buy_price integer,

    tags text[] not null default '{}',

    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists dolls_slug_idx on public.dolls(slug);
create index if not exists dolls_collection_idx on public.dolls(collection);
create index if not exists dolls_availability_idx on public.dolls(availability);
create index if not exists dolls_is_active_idx on public.dolls(is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
return new;
end;
$$;

drop trigger if exists dolls_set_updated_at on public.dolls;

create trigger dolls_set_updated_at
    before update on public.dolls
    for each row
    execute function public.set_updated_at();

alter table public.dolls enable row level security;

drop policy if exists "Public can read active dolls" on public.dolls;
drop policy if exists "Admins can read dolls" on public.dolls;
drop policy if exists "Admins can insert dolls" on public.dolls;
drop policy if exists "Admins can update dolls" on public.dolls;
drop policy if exists "Admins can delete dolls" on public.dolls;

create policy "Public can read active dolls"
on public.dolls
for select
                                        using (is_active = true);

create policy "Admins can read dolls"
on public.dolls
for select
               using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert dolls"
on public.dolls
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update dolls"
on public.dolls
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete dolls"
on public.dolls
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('doll-images', 'doll-images', true)
    on conflict (id) do update set public = true;

drop policy if exists "Public can read doll images" on storage.objects;
drop policy if exists "Admins can upload doll images" on storage.objects;
drop policy if exists "Admins can update doll images" on storage.objects;
drop policy if exists "Admins can delete doll images" on storage.objects;

create policy "Public can read doll images"
on storage.objects
for select
                                   using (bucket_id = 'doll-images');

create policy "Admins can upload doll images"
on storage.objects
for insert
with check (
  bucket_id = 'doll-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins can update doll images"
on storage.objects
for update
                      using (
                      bucket_id = 'doll-images'
                      and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                      )
    with check (
                      bucket_id = 'doll-images'
                      and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
                      );

create policy "Admins can delete doll images"
on storage.objects
for delete
using (
  bucket_id = 'doll-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
