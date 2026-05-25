-- ───────────────────────────────────────────────────────────────────
-- platform_settings — new columns for online payment provider toggle
-- ───────────────────────────────────────────────────────────────────

do $$
begin
    if not exists (select 1 from pg_type where typname = 'shop_payment_provider') then
        create type public.shop_payment_provider as enum ('stripe', 'netopia');
    end if;
end $$;

alter table public.platform_settings
    add column if not exists online_payment_enabled boolean not null default false,
    add column if not exists online_payment_provider public.shop_payment_provider not null default 'netopia',
    add column if not exists stripe_account_id text,
    add column if not exists stripe_publishable_key text,
    add column if not exists netopia_pos_signature text,
    add column if not exists netopia_live_mode boolean not null default false;

-- ───────────────────────────────────────────────────────────────────
-- shop_orders — payment lifecycle columns
-- ───────────────────────────────────────────────────────────────────

do $$
begin
    if not exists (select 1 from pg_type where typname = 'shop_payment_method') then
        create type public.shop_payment_method as enum ('cash', 'card_online');
    end if;
    if not exists (select 1 from pg_type where typname = 'shop_payment_status') then
        create type public.shop_payment_status as enum (
            'not_required',
            'pending',
            'authorised',
            'paid',
            'failed',
            'refunded',
            'voided'
        );
    end if;
end $$;

alter table public.shop_orders
    add column if not exists payment_method public.shop_payment_method not null default 'cash',
    add column if not exists payment_status public.shop_payment_status not null default 'not_required',
    add column if not exists payment_provider public.shop_payment_provider,
    add column if not exists payment_external_id text,
    add column if not exists payment_redirect_url text,
    add column if not exists payment_initiated_at timestamptz,
    add column if not exists paid_at timestamptz,
    add column if not exists payment_failure_reason text;

create index if not exists shop_orders_payment_external_idx
    on public.shop_orders(payment_provider, payment_external_id);
create index if not exists shop_orders_payment_status_idx
    on public.shop_orders(payment_status);

-- ───────────────────────────────────────────────────────────────────
-- shop_payment_events — webhook idempotency + audit trail
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.shop_payment_events (
    id uuid primary key default gen_random_uuid(),
    provider public.shop_payment_provider not null,
    external_id text not null,
    order_id uuid references public.shop_orders(id) on delete set null,
    event_type text,
    status public.shop_payment_status,
    raw jsonb,
    created_at timestamptz not null default now(),

    unique (provider, external_id)
);

create index if not exists shop_payment_events_order_idx
    on public.shop_payment_events(order_id);

alter table public.shop_payment_events enable row level security;

drop policy if exists "Admins manage payment events" on public.shop_payment_events;
create policy "Admins manage payment events"
    on public.shop_payment_events
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
