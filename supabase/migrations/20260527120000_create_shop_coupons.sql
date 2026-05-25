do $$
begin
    if not exists (select 1 from pg_type where typname = 'shop_coupon_type') then
        create type public.shop_coupon_type as enum (
            'percentage',
            'fixed',
            'free_shipping'
        );
    end if;
end $$;

-- ───────────────────────────────────────────────────────────────────
-- shop_coupons
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.shop_coupons (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,
    type public.shop_coupon_type not null default 'percentage',

    /**
     * `value` semantics depend on `type`:
     *   - percentage    → 0..100, the % discount applied to the subtotal
     *   - fixed         → minor units (bani / cents) subtracted from subtotal
     *   - free_shipping → ignored; coupon zeroes shipping fee instead
     */
    value integer not null default 0 check (value >= 0),
    max_discount integer check (max_discount is null or max_discount > 0),

    min_subtotal integer not null default 0 check (min_subtotal >= 0),
    currency text not null default 'RON',

    description text,

    starts_at timestamptz,
    expires_at timestamptz,

    max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
    redemptions_count integer not null default 0 check (redemptions_count >= 0),

    /** When non-empty, the coupon only applies to orders that contain at
     *  least one line from these categories. */
    applies_to_categories uuid[] not null default '{}',

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- case-insensitive lookup by code
create unique index if not exists shop_coupons_code_lower_uidx
    on public.shop_coupons (lower(code));
create index if not exists shop_coupons_active_idx
    on public.shop_coupons (is_active);

drop trigger if exists shop_coupons_set_updated_at on public.shop_coupons;
create trigger shop_coupons_set_updated_at
    before update on public.shop_coupons
    for each row
    execute function public.set_updated_at();

alter table public.shop_coupons enable row level security;

drop policy if exists "Admins manage shop coupons" on public.shop_coupons;
create policy "Admins manage shop coupons"
    on public.shop_coupons
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Public callers (anon / authenticated customers) get validated lookups via
-- the SECURITY DEFINER function below; no direct table access is granted.

-- ───────────────────────────────────────────────────────────────────
-- shop_coupon_redemptions — append-only audit trail
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.shop_coupon_redemptions (
    id uuid primary key default gen_random_uuid(),
    coupon_id uuid not null references public.shop_coupons(id) on delete restrict,
    order_id uuid not null references public.shop_orders(id) on delete cascade,
    code text not null,
    amount integer not null check (amount >= 0),
    customer_phone text,
    created_at timestamptz not null default now()
);

create index if not exists shop_coupon_redemptions_coupon_idx
    on public.shop_coupon_redemptions(coupon_id);
create index if not exists shop_coupon_redemptions_order_idx
    on public.shop_coupon_redemptions(order_id);

alter table public.shop_coupon_redemptions enable row level security;

drop policy if exists "Admins manage coupon redemptions" on public.shop_coupon_redemptions;
create policy "Admins manage coupon redemptions"
    on public.shop_coupon_redemptions
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- shop_orders → add coupon traceability columns
-- ───────────────────────────────────────────────────────────────────

alter table public.shop_orders
    add column if not exists coupon_id uuid references public.shop_coupons(id) on delete set null,
    add column if not exists coupon_code text;

create index if not exists shop_orders_coupon_idx
    on public.shop_orders(coupon_id);

-- ───────────────────────────────────────────────────────────────────
-- shop_validate_coupon — read-only validation
-- ───────────────────────────────────────────────────────────────────

create or replace function public.shop_validate_coupon(
    p_code text,
    p_subtotal integer,
    p_category_ids uuid[] default '{}'::uuid[]
)
returns table (
    id uuid,
    code text,
    type public.shop_coupon_type,
    value integer,
    max_discount integer,
    description text,
    discount_amount integer,
    error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_row public.shop_coupons%rowtype;
    v_discount integer := 0;
    v_subtotal integer := coalesce(p_subtotal, 0);
begin
    select * into v_row
      from public.shop_coupons
     where lower(code) = lower(p_code)
       and is_active = true;

    if not found then
        return query select null::uuid, p_code, null::public.shop_coupon_type,
                            null::integer, null::integer, null::text,
                            0, 'not_found';
        return;
    end if;

    if v_row.starts_at is not null and v_row.starts_at > now() then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            0, 'not_started';
        return;
    end if;

    if v_row.expires_at is not null and v_row.expires_at < now() then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            0, 'expired';
        return;
    end if;

    if v_row.max_redemptions is not null
       and v_row.redemptions_count >= v_row.max_redemptions then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            0, 'exhausted';
        return;
    end if;

    if v_subtotal < v_row.min_subtotal then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            0, 'subtotal_too_low';
        return;
    end if;

    if array_length(v_row.applies_to_categories, 1) is not null
       and array_length(v_row.applies_to_categories, 1) > 0 then
        if not exists (
            select 1
              from unnest(p_category_ids) as cat
             where cat = any(v_row.applies_to_categories)
        ) then
            return query select v_row.id, v_row.code, v_row.type,
                                v_row.value, v_row.max_discount, v_row.description,
                                0, 'category_mismatch';
            return;
        end if;
    end if;

    if v_row.type = 'percentage' then
        v_discount := (v_subtotal * v_row.value) / 100;
    elsif v_row.type = 'fixed' then
        v_discount := v_row.value;
    else
        v_discount := 0;
    end if;

    if v_row.max_discount is not null and v_discount > v_row.max_discount then
        v_discount := v_row.max_discount;
    end if;

    v_discount := least(v_discount, v_subtotal);

    return query select v_row.id, v_row.code, v_row.type,
                        v_row.value, v_row.max_discount, v_row.description,
                        v_discount, null::text;
end;
$$;

grant execute on function public.shop_validate_coupon(text, integer, uuid[])
    to anon, authenticated, service_role;

-- ───────────────────────────────────────────────────────────────────
-- shop_redeem_coupon — atomic; called from the checkout server action
-- ───────────────────────────────────────────────────────────────────

create or replace function public.shop_redeem_coupon(
    p_coupon_id uuid,
    p_order_id uuid,
    p_amount integer,
    p_customer_phone text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_row public.shop_coupons%rowtype;
begin
    select * into v_row
      from public.shop_coupons
     where id = p_coupon_id
       and is_active = true
       for update;

    if not found then
        return false;
    end if;

    if v_row.expires_at is not null and v_row.expires_at < now() then
        return false;
    end if;

    if v_row.max_redemptions is not null
       and v_row.redemptions_count >= v_row.max_redemptions then
        return false;
    end if;

    update public.shop_coupons
       set redemptions_count = redemptions_count + 1
     where id = v_row.id;

    insert into public.shop_coupon_redemptions
        (coupon_id, order_id, code, amount, customer_phone)
    values
        (v_row.id, p_order_id, v_row.code, greatest(0, p_amount), p_customer_phone);

    return true;
end;
$$;

grant execute on function public.shop_redeem_coupon(uuid, uuid, integer, text)
    to service_role;
