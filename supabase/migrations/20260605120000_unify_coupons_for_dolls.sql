-- Unify the coupon system across the two product surfaces (shop + dolls).
--
-- The single source of truth stays `shop_coupons`. We add a `applies_to`
-- scope so each code is usable on shop only, dolls only, or both, plus two
-- doll-specific knobs: which rental modes it covers and what part of a doll
-- order the discount bites into.
--
-- Shop redemptions keep their own audit table (`shop_coupon_redemptions`,
-- FK → shop_orders). Doll redemptions get a parallel table
-- (`doll_coupon_redemptions`, FK → orders) because the two order surfaces are
-- separate tables. Both increment the shared `redemptions_count`, so the
-- `max_redemptions` cap is honoured across surfaces.

-- ───────────────────────────────────────────────────────────────────
-- shop_coupons → scope + doll knobs
-- ───────────────────────────────────────────────────────────────────

alter table public.shop_coupons
    add column if not exists applies_to text not null default 'shop',
    add column if not exists doll_modes text[] not null default '{}',
    add column if not exists doll_discount_base text not null default 'total';

alter table public.shop_coupons
    drop constraint if exists shop_coupons_applies_to_check;
alter table public.shop_coupons
    add constraint shop_coupons_applies_to_check
        check (applies_to in ('shop', 'dolls', 'both'));

alter table public.shop_coupons
    drop constraint if exists shop_coupons_doll_discount_base_check;
alter table public.shop_coupons
    add constraint shop_coupons_doll_discount_base_check
        check (doll_discount_base in ('total', 'base', 'extras'));

-- doll_modes, when non-empty, must be a subset of {rent, buy}. Empty means
-- "all doll modes".
alter table public.shop_coupons
    drop constraint if exists shop_coupons_doll_modes_check;
alter table public.shop_coupons
    add constraint shop_coupons_doll_modes_check
        check (doll_modes <@ array['rent', 'buy']::text[]);

create index if not exists shop_coupons_applies_to_idx
    on public.shop_coupons (applies_to);

-- ───────────────────────────────────────────────────────────────────
-- orders → coupon traceability (mirror of shop_orders)
-- ───────────────────────────────────────────────────────────────────

alter table public.orders
    add column if not exists coupon_id uuid references public.shop_coupons(id) on delete set null,
    add column if not exists coupon_code text;

create index if not exists orders_coupon_idx
    on public.orders(coupon_id);

-- ───────────────────────────────────────────────────────────────────
-- doll_coupon_redemptions — append-only audit trail for doll orders
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.doll_coupon_redemptions (
    id uuid primary key default gen_random_uuid(),
    coupon_id uuid not null references public.shop_coupons(id) on delete restrict,
    order_id uuid not null references public.orders(id) on delete cascade,
    code text not null,
    amount integer not null check (amount >= 0),
    customer_phone text,
    created_at timestamptz not null default now()
);

create index if not exists doll_coupon_redemptions_coupon_idx
    on public.doll_coupon_redemptions(coupon_id);
create index if not exists doll_coupon_redemptions_order_idx
    on public.doll_coupon_redemptions(order_id);

alter table public.doll_coupon_redemptions enable row level security;

drop policy if exists "Admins manage doll coupon redemptions" on public.doll_coupon_redemptions;
create policy "Admins manage doll coupon redemptions"
    on public.doll_coupon_redemptions
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- shop_validate_coupon — now respects `applies_to`
-- ───────────────────────────────────────────────────────────────────
-- A dolls-only coupon must not validate in the shop cart. We treat an
-- out-of-scope code exactly like a missing one ('not_found') so the public
-- UI gives no hint that the code exists for the other surface.

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

    if v_row.applies_to not in ('shop', 'both') then
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
-- validate_doll_coupon — read-only validation for a single doll order
-- ───────────────────────────────────────────────────────────────────
-- p_base   = base price (rental tier price or buy price), minor units
-- p_extras = outfit + customizations, minor units
-- The discount target depends on `doll_discount_base`:
--   total  → p_base + p_extras
--   base   → p_base
--   extras → p_extras
-- `min_subtotal` is always checked against the full order value (base + extras).

create or replace function public.validate_doll_coupon(
    p_code text,
    p_mode text,
    p_base integer,
    p_extras integer default 0
)
returns table (
    id uuid,
    code text,
    type public.shop_coupon_type,
    value integer,
    max_discount integer,
    description text,
    discount_base text,
    discount_amount integer,
    error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_row public.shop_coupons%rowtype;
    v_base integer := greatest(0, coalesce(p_base, 0));
    v_extras integer := greatest(0, coalesce(p_extras, 0));
    v_order_total integer;
    v_target integer;
    v_discount integer := 0;
begin
    v_order_total := v_base + v_extras;

    select * into v_row
      from public.shop_coupons
     where lower(code) = lower(p_code)
       and is_active = true;

    if not found then
        return query select null::uuid, p_code, null::public.shop_coupon_type,
                            null::integer, null::integer, null::text,
                            null::text, 0, 'not_found';
        return;
    end if;

    if v_row.applies_to not in ('dolls', 'both') then
        return query select null::uuid, p_code, null::public.shop_coupon_type,
                            null::integer, null::integer, null::text,
                            null::text, 0, 'not_found';
        return;
    end if;

    -- free_shipping is meaningless for dolls (no shipping fee). Refuse it.
    if v_row.type = 'free_shipping' then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            v_row.doll_discount_base, 0, 'not_found';
        return;
    end if;

    if array_length(v_row.doll_modes, 1) is not null
       and array_length(v_row.doll_modes, 1) > 0
       and not (p_mode = any(v_row.doll_modes)) then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            v_row.doll_discount_base, 0, 'mode_mismatch';
        return;
    end if;

    if v_row.starts_at is not null and v_row.starts_at > now() then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            v_row.doll_discount_base, 0, 'not_started';
        return;
    end if;

    if v_row.expires_at is not null and v_row.expires_at < now() then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            v_row.doll_discount_base, 0, 'expired';
        return;
    end if;

    if v_row.max_redemptions is not null
       and v_row.redemptions_count >= v_row.max_redemptions then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            v_row.doll_discount_base, 0, 'exhausted';
        return;
    end if;

    if v_order_total < v_row.min_subtotal then
        return query select v_row.id, v_row.code, v_row.type,
                            v_row.value, v_row.max_discount, v_row.description,
                            v_row.doll_discount_base, 0, 'subtotal_too_low';
        return;
    end if;

    if v_row.doll_discount_base = 'base' then
        v_target := v_base;
    elsif v_row.doll_discount_base = 'extras' then
        v_target := v_extras;
    else
        v_target := v_order_total;
    end if;

    if v_row.type = 'percentage' then
        v_discount := (v_target * v_row.value) / 100;
    elsif v_row.type = 'fixed' then
        v_discount := v_row.value;
    else
        v_discount := 0;
    end if;

    if v_row.max_discount is not null and v_discount > v_row.max_discount then
        v_discount := v_row.max_discount;
    end if;

    -- Never discount more than the targeted amount, and never below zero.
    v_discount := greatest(0, least(v_discount, v_target));

    return query select v_row.id, v_row.code, v_row.type,
                        v_row.value, v_row.max_discount, v_row.description,
                        v_row.doll_discount_base, v_discount, null::text;
end;
$$;

grant execute on function public.validate_doll_coupon(text, text, integer, integer)
    to anon, authenticated, service_role;

-- ───────────────────────────────────────────────────────────────────
-- redeem_doll_coupon — atomic; called from the doll checkout server action
-- ───────────────────────────────────────────────────────────────────

create or replace function public.redeem_doll_coupon(
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

    if v_row.applies_to not in ('dolls', 'both') then
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

    insert into public.doll_coupon_redemptions
        (coupon_id, order_id, code, amount, customer_phone)
    values
        (v_row.id, p_order_id, v_row.code, greatest(0, p_amount), p_customer_phone);

    return true;
end;
$$;

grant execute on function public.redeem_doll_coupon(uuid, uuid, integer, text)
    to service_role;
