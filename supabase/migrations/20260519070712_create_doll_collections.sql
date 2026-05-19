create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'doll_collection_type') then
create type public.doll_collection_type as enum ('category', 'series');
end if;
end $$;

create table if not exists public.doll_collections (
                                                       id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    name text not null,
    type public.doll_collection_type not null default 'category',

    description text,
    badge text,

    image_path text,
    image_url text,

    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists doll_collections_slug_idx on public.doll_collections(slug);
create index if not exists doll_collections_type_idx on public.doll_collections(type);
create index if not exists doll_collections_is_active_idx on public.doll_collections(is_active);

drop trigger if exists doll_collections_set_updated_at on public.doll_collections;

create trigger doll_collections_set_updated_at
    before update on public.doll_collections
    for each row
    execute function public.set_updated_at();

alter table public.doll_collections enable row level security;

drop policy if exists "Public can read active doll collections" on public.doll_collections;
drop policy if exists "Admins can read doll collections" on public.doll_collections;
drop policy if exists "Admins can insert doll collections" on public.doll_collections;
drop policy if exists "Admins can update doll collections" on public.doll_collections;
drop policy if exists "Admins can delete doll collections" on public.doll_collections;

create policy "Public can read active doll collections"
on public.doll_collections
for select
                                        using (is_active = true);

create policy "Admins can read doll collections"
on public.doll_collections
for select
               using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert doll collections"
on public.doll_collections
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update doll collections"
on public.doll_collections
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete doll collections"
on public.doll_collections
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

alter table public.dolls
    add column if not exists collection_id uuid references public.doll_collections(id) on delete set null;

create index if not exists dolls_collection_id_idx on public.dolls(collection_id);

insert into public.doll_collections (
    slug,
    name,
    type,
    description,
    badge,
    display_order,
    is_active
)
values
    (
        'editii-limitate',
        'Ediții Limitate',
        'category',
        'Piese rare sau disponibile în număr limitat.',
        'Premium',
        10,
        true
    ),
    (
        'seria-anotimpuri',
        'Seria Anotimpuri',
        'series',
        'Modele inspirate de tonuri, texturi și atmosferă sezonieră.',
        'Serie',
        20,
        true
    ),
    (
        'seria-clasica',
        'Seria Clasică',
        'series',
        'Modele cu estetică elegantă, vintage și atemporală.',
        'Clasic',
        30,
        true
    ),
    (
        'colectia-noir',
        'Colecția Noir',
        'category',
        'Modele dramatice, dark, premium și cu styling intens.',
        'Noir',
        40,
        true
    ),
    (
        'seria-fantaisie',
        'Seria Fantaisie',
        'series',
        'Modele fantasy, expresive și personalizabile.',
        'Fantasy',
        50,
        true
    )
    on conflict (slug) do update set
    name = excluded.name,
                              type = excluded.type,
                              description = excluded.description,
                              badge = excluded.badge,
                              display_order = excluded.display_order,
                              is_active = excluded.is_active,
                              updated_at = now();

update public.dolls d
set collection_id = c.id
    from public.doll_collections c
where d.collection_id is null
  and lower(d.collection) = lower(c.name);

create or replace function public.sync_doll_collection_fields()
returns trigger
language plpgsql
as $$
declare
collection_name text;
  matched_collection_id uuid;
begin
  if new.collection_id is not null then
select name into collection_name
from public.doll_collections
where id = new.collection_id;

if collection_name is not null then
      new.collection = collection_name;
end if;

return new;
end if;

  if new.collection is not null and length(trim(new.collection)) > 0 then
select id into matched_collection_id
from public.doll_collections
where lower(name) = lower(new.collection)
order by is_active desc, display_order asc
    limit 1;

if matched_collection_id is not null then
      new.collection_id = matched_collection_id;
end if;
end if;

return new;
end;
$$;

drop trigger if exists dolls_sync_collection_fields on public.dolls;

create trigger dolls_sync_collection_fields
    before insert or update of collection_id, collection on public.dolls
    for each row
    execute function public.sync_doll_collection_fields();
