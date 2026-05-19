create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'customization_mode') then
create type public.customization_mode as enum ('rent', 'buy', 'both');
end if;

  if not exists (select 1 from pg_type where typname = 'customization_selection_type') then
create type public.customization_selection_type as enum ('single', 'multiple');
end if;
end $$;

create table if not exists public.doll_customization_groups (
                                                                id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    title text not null,
    description text,
    mode public.customization_mode not null default 'both',
    selection_type public.customization_selection_type not null default 'multiple',

    icon_name text not null default 'sparkles',

    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create table if not exists public.doll_customization_options (
                                                                 id uuid primary key default gen_random_uuid(),

    group_id uuid not null references public.doll_customization_groups(id) on delete cascade,

    slug text not null,
    label text not null,
    description text,

    price integer not null default 0,

    icon_name text not null default 'circle',
    icon_color text,
    swatch_color text,

    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique(group_id, slug)
    );

create index if not exists doll_customization_groups_mode_idx
    on public.doll_customization_groups(mode);

create index if not exists doll_customization_groups_active_idx
    on public.doll_customization_groups(is_active);

create index if not exists doll_customization_options_group_idx
    on public.doll_customization_options(group_id);

create index if not exists doll_customization_options_active_idx
    on public.doll_customization_options(is_active);

drop trigger if exists doll_customization_groups_set_updated_at on public.doll_customization_groups;

create trigger doll_customization_groups_set_updated_at
    before update on public.doll_customization_groups
    for each row
    execute function public.set_updated_at();

drop trigger if exists doll_customization_options_set_updated_at on public.doll_customization_options;

create trigger doll_customization_options_set_updated_at
    before update on public.doll_customization_options
    for each row
    execute function public.set_updated_at();

alter table public.doll_customization_groups enable row level security;
alter table public.doll_customization_options enable row level security;

drop policy if exists "Public can read active customization groups" on public.doll_customization_groups;
drop policy if exists "Admins can read customization groups" on public.doll_customization_groups;
drop policy if exists "Admins can insert customization groups" on public.doll_customization_groups;
drop policy if exists "Admins can update customization groups" on public.doll_customization_groups;
drop policy if exists "Admins can delete customization groups" on public.doll_customization_groups;

create policy "Public can read active customization groups"
on public.doll_customization_groups
for select
                                        using (is_active = true);

create policy "Admins can read customization groups"
on public.doll_customization_groups
for select
               using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert customization groups"
on public.doll_customization_groups
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update customization groups"
on public.doll_customization_groups
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete customization groups"
on public.doll_customization_groups
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read active customization options" on public.doll_customization_options;
drop policy if exists "Admins can read customization options" on public.doll_customization_options;
drop policy if exists "Admins can insert customization options" on public.doll_customization_options;
drop policy if exists "Admins can update customization options" on public.doll_customization_options;
drop policy if exists "Admins can delete customization options" on public.doll_customization_options;

create policy "Public can read active customization options"
on public.doll_customization_options
for select
                                        using (is_active = true);

create policy "Admins can read customization options"
on public.doll_customization_options
for select
               using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert customization options"
on public.doll_customization_options
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update customization options"
on public.doll_customization_options
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete customization options"
on public.doll_customization_options
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
