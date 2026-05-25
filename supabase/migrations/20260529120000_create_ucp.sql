-- ───────────────────────────────────────────────────────────────────
-- platform_settings — UCP toggle + API key
-- ───────────────────────────────────────────────────────────────────

do $$
begin
    if not exists (select 1 from pg_type where typname = 'shop_checkout_mode') then
        create type public.shop_checkout_mode as enum ('own', 'ucp');
    end if;
end $$;

alter table public.platform_settings
    add column if not exists shop_checkout_mode public.shop_checkout_mode not null default 'own',
    add column if not exists ucp_enabled boolean not null default false,
    add column if not exists ucp_api_key_hash text;

-- ───────────────────────────────────────────────────────────────────
-- ucp_checkout_sessions — durable mapping between a UCP session id and
-- the local shop_order it eventually produces.
-- ───────────────────────────────────────────────────────────────────

do $$
begin
    if not exists (select 1 from pg_type where typname = 'ucp_session_status') then
        create type public.ucp_session_status as enum (
            'incomplete',
            'requires_escalation',
            'ready_for_complete',
            'complete_in_progress',
            'completed',
            'canceled'
        );
    end if;
end $$;

create table if not exists public.ucp_checkout_sessions (
    id text primary key,                       -- the public `chk_*` id we return to agents
    status public.ucp_session_status not null default 'incomplete',
    currency text not null default 'RON',

    order_id uuid references public.shop_orders(id) on delete set null,
    cart_id text,

    state jsonb not null,                      -- full UCP session document (RFC 8259)
    request_profile text,                       -- value of the UCP-Agent header at last write

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    expires_at timestamptz not null default now() + interval '6 hours',
    completed_at timestamptz,

    last_idempotency_key text
);

create index if not exists ucp_sessions_status_idx
    on public.ucp_checkout_sessions(status);
create index if not exists ucp_sessions_order_idx
    on public.ucp_checkout_sessions(order_id);
create index if not exists ucp_sessions_created_idx
    on public.ucp_checkout_sessions(created_at desc);

drop trigger if exists ucp_sessions_set_updated_at on public.ucp_checkout_sessions;
create trigger ucp_sessions_set_updated_at
    before update on public.ucp_checkout_sessions
    for each row
    execute function public.set_updated_at();

alter table public.ucp_checkout_sessions enable row level security;

drop policy if exists "Admins read UCP sessions" on public.ucp_checkout_sessions;
create policy "Admins read UCP sessions"
    on public.ucp_checkout_sessions
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Service role bypasses RLS in our SECURITY DEFINER paths.

-- ───────────────────────────────────────────────────────────────────
-- ucp_idempotency — short-lived response cache so retried POSTs return
-- the same bytes within the 24h window required by the REST binding.
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.ucp_idempotency (
    key text primary key,
    response jsonb not null,
    status_code integer not null,
    created_at timestamptz not null default now()
);

create index if not exists ucp_idempotency_created_idx
    on public.ucp_idempotency(created_at);

alter table public.ucp_idempotency enable row level security;

drop policy if exists "Admins manage UCP idempotency" on public.ucp_idempotency;
create policy "Admins manage UCP idempotency"
    on public.ucp_idempotency
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
