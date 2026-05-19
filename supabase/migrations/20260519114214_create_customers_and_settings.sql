create extension if not exists pgcrypto;

create table if not exists public.customers (
                                                id uuid primary key default gen_random_uuid(),

    full_name text not null,
    email text not null,
    phone text not null,
    normalized_phone text,

    last_delivery_address text,
    notes text,

    total_orders integer not null default 0,
    rent_orders integer not null default 0,
    buy_orders integer not null default 0,
    total_spent integer not null default 0,
    last_order_at timestamptz,

    is_blocked boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create unique index if not exists customers_email_unique_idx
    on public.customers (lower(email));

create index if not exists customers_phone_idx on public.customers(normalized_phone);
create index if not exists customers_last_order_at_idx on public.customers(last_order_at desc);

alter table public.orders
    add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists orders_customer_id_idx on public.orders(customer_id);

drop trigger if exists customers_set_updated_at on public.customers;

create trigger customers_set_updated_at
    before update on public.customers
    for each row
    execute function public.set_updated_at();

create or replace function public.refresh_customer_order_stats(customer_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  if customer_uuid is null then
    return;
end if;

update public.customers c
set
    total_orders = (
        select count(*)::integer
        from public.orders o
        where o.customer_id = customer_uuid
    ),
    rent_orders = (
        select count(*)::integer
        from public.orders o
        where o.customer_id = customer_uuid and o.mode = 'rent'
    ),
    buy_orders = (
        select count(*)::integer
        from public.orders o
        where o.customer_id = customer_uuid and o.mode = 'buy'
    ),
    total_spent = (
        select coalesce(sum(o.total_amount), 0)::integer
        from public.orders o
        where o.customer_id = customer_uuid
    ),
    last_order_at = (
        select max(o.created_at)
        from public.orders o
        where o.customer_id = customer_uuid
    ),
    updated_at = now()
where c.id = customer_uuid;
end;
$$;

create or replace function public.sync_customer_stats_from_order()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    perform public.refresh_customer_order_stats(new.customer_id);
return new;
end if;

  if tg_op = 'UPDATE' then
    perform public.refresh_customer_order_stats(old.customer_id);

    if old.customer_id is distinct from new.customer_id then
      perform public.refresh_customer_order_stats(new.customer_id);
else
      perform public.refresh_customer_order_stats(new.customer_id);
end if;

return new;
end if;

  if tg_op = 'DELETE' then
    perform public.refresh_customer_order_stats(old.customer_id);
return old;
end if;

return null;
end;
$$;

drop trigger if exists orders_sync_customer_stats on public.orders;

create trigger orders_sync_customer_stats
    after insert or update or delete on public.orders
    for each row
    execute function public.sync_customer_stats_from_order();

alter table public.customers enable row level security;

drop policy if exists "Admins can read customers" on public.customers;
drop policy if exists "Admins can insert customers" on public.customers;
drop policy if exists "Admins can update customers" on public.customers;
drop policy if exists "Admins can delete customers" on public.customers;

create policy "Admins can read customers"
on public.customers
for select
                                   using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert customers"
on public.customers
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update customers"
on public.customers
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete customers"
on public.customers
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.platform_settings (
                                                        id text primary key default 'default',

                                                        business_name text not null default 'Artisan Dolls',
                                                        public_site_url text,
                                                        contact_email text,
                                                        contact_phone text,
                                                        whatsapp_phone text,

                                                        currency text not null default 'RON',
                                                        locale text not null default 'ro-RO',

                                                        catalog_enabled boolean not null default true,
                                                        rent_enabled boolean not null default true,
                                                        buy_enabled boolean not null default true,
                                                        maintenance_mode boolean not null default false,

                                                        default_delivery_start_time time,
                                                        default_delivery_end_time time,
                                                        default_return_start_time time,
                                                        default_return_end_time time,

                                                        order_terms text,
                                                        privacy_note text,

                                                        admin_notes text,

                                                        created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint platform_settings_singleton check (id = 'default')
    );

insert into public.platform_settings (id, business_name, currency, locale)
values ('default', 'Artisan Dolls', 'RON', 'ro-RO')
    on conflict (id) do nothing;

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;

create trigger platform_settings_set_updated_at
    before update on public.platform_settings
    for each row
    execute function public.set_updated_at();

alter table public.platform_settings enable row level security;

drop policy if exists "Admins can read platform settings" on public.platform_settings;
drop policy if exists "Admins can update platform settings" on public.platform_settings;

create policy "Admins can read platform settings"
on public.platform_settings
for select
                         using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update platform settings"
on public.platform_settings
for update
               using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
