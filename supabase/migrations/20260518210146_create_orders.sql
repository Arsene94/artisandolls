create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_mode') then
create type public.order_mode as enum ('rent', 'buy');
end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
create type public.order_status as enum (
      'new',
      'in_review',
      'confirmed',
      'completed',
      'cancelled'
    );
end if;
end $$;

create table if not exists public.orders (
                                             id uuid primary key default gen_random_uuid(),

    order_number text not null unique default (
                                                  'AD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    ),

    mode public.order_mode not null,
    status public.order_status not null default 'new',

    doll_id uuid references public.dolls(id) on delete set null,
    doll_slug text not null,
    doll_name text not null,

    start_date date,
    end_date date,
    rental_days integer,

    outfit_id text,
    selected_options text[] not null default '{}',

    customer_name text not null,
    customer_email text not null,
    customer_phone text not null,
    delivery_address text not null,
    delivery_time text not null,
    return_time text,
    notes text,

    total_amount integer not null default 0,
    total_label text not null default 'Se confirmă după verificare',

    whatsapp_notified boolean not null default false,
    whatsapp_error text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

create index if not exists orders_mode_idx on public.orders(mode);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_doll_id_idx on public.orders(doll_id);

drop trigger if exists orders_set_updated_at on public.orders;

create trigger orders_set_updated_at
    before update on public.orders
    for each row
    execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Admins can read orders" on public.orders;
drop policy if exists "Admins can insert orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Admins can read orders"
on public.orders
for select
                                   using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert orders"
on public.orders
for insert
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update orders"
on public.orders
for update
                      using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete orders"
on public.orders
for delete
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
