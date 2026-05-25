create extension if not exists pgcrypto;

-- ───────────────────────────────────────────────────────────────────
-- shop_categories
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.shop_categories (
    id uuid primary key default gen_random_uuid(),

    slug text not null unique,
    name text not null,
    name_en text,
    name_nl text,
    description text,
    description_en text,
    description_nl text,
    badge text,
    image_path text,

    display_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists shop_categories_slug_idx on public.shop_categories(slug);
create index if not exists shop_categories_active_idx on public.shop_categories(is_active);

drop trigger if exists shop_categories_set_updated_at on public.shop_categories;
create trigger shop_categories_set_updated_at
    before update on public.shop_categories
    for each row
    execute function public.set_updated_at();

alter table public.shop_categories enable row level security;

drop policy if exists "Public can read active shop categories" on public.shop_categories;
drop policy if exists "Admins manage shop categories" on public.shop_categories;

create policy "Public can read active shop categories"
    on public.shop_categories
    for select
    using (is_active = true);

create policy "Admins manage shop categories"
    on public.shop_categories
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- shop_products
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.shop_products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid references public.shop_categories(id) on delete set null,

    slug text not null unique,
    sku text unique,
    name text not null,
    short_description text,
    description text,
    brand text,

    main_image_path text,
    image_paths text[] not null default '{}',

    price integer not null default 0,             -- minor units (bani)
    compare_at_price integer,                     -- pre-discount, optional
    currency text not null default 'RON',

    stock_quantity integer not null default 0 check (stock_quantity >= 0),
    low_stock_threshold integer not null default 5,
    track_stock boolean not null default true,

    weight_grams integer,
    tags text[] not null default '{}',

    -- Cross-sell hint: which doll modes is this product relevant to.
    doll_modes text[] not null default '{rent,buy}',

    age_restricted boolean not null default true,
    is_featured boolean not null default false,
    is_active boolean not null default true,
    display_order integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists shop_products_slug_idx on public.shop_products(slug);
create index if not exists shop_products_category_idx on public.shop_products(category_id);
create index if not exists shop_products_active_idx on public.shop_products(is_active);
create index if not exists shop_products_featured_idx on public.shop_products(is_featured) where is_featured = true;
create index if not exists shop_products_tags_gin on public.shop_products using gin (tags);
create index if not exists shop_products_doll_modes_gin on public.shop_products using gin (doll_modes);

drop trigger if exists shop_products_set_updated_at on public.shop_products;
create trigger shop_products_set_updated_at
    before update on public.shop_products
    for each row
    execute function public.set_updated_at();

alter table public.shop_products enable row level security;

drop policy if exists "Public can read active shop products" on public.shop_products;
drop policy if exists "Admins manage shop products" on public.shop_products;

create policy "Public can read active shop products"
    on public.shop_products
    for select
    using (is_active = true);

create policy "Admins manage shop products"
    on public.shop_products
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- shop_orders
-- ───────────────────────────────────────────────────────────────────

do $$
begin
    if not exists (select 1 from pg_type where typname = 'shop_order_status') then
        create type public.shop_order_status as enum (
            'new',
            'in_review',
            'confirmed',
            'packing',
            'shipped',
            'delivered',
            'completed',
            'cancelled',
            'refunded'
        );
    end if;
end $$;

create table if not exists public.shop_orders (
    id uuid primary key default gen_random_uuid(),

    order_number text not null unique default (
        'VS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    ),

    status public.shop_order_status not null default 'new',

    customer_id uuid references public.customers(id) on delete set null,
    customer_name text not null,
    customer_email text,
    customer_phone text not null,
    normalized_phone text not null,

    delivery_address text not null,
    delivery_city text,
    delivery_county text,
    contact_method text,
    contact_window_start text,
    contact_window_end text,

    shipping_method text not null default 'courier',
    shipping_fee integer not null default 0,

    subtotal integer not null default 0,
    discount_amount integer not null default 0,
    total_amount integer not null default 0,
    total_label text,

    currency text not null default 'RON',

    notes text,
    age_confirmed boolean not null default false,
    privacy_accepted boolean not null default false,

    whatsapp_notified boolean not null default false,
    whatsapp_error text,
    whatsapp_debug jsonb,

    confirmation_email_sent_at timestamptz,
    followup_sent_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists shop_orders_status_idx on public.shop_orders(status);
create index if not exists shop_orders_created_at_idx on public.shop_orders(created_at desc);
create index if not exists shop_orders_customer_idx on public.shop_orders(customer_id);
create index if not exists shop_orders_phone_idx on public.shop_orders(normalized_phone);

drop trigger if exists shop_orders_set_updated_at on public.shop_orders;
create trigger shop_orders_set_updated_at
    before update on public.shop_orders
    for each row
    execute function public.set_updated_at();

alter table public.shop_orders enable row level security;

drop policy if exists "Admins manage shop orders" on public.shop_orders;

create policy "Admins manage shop orders"
    on public.shop_orders
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- shop_order_items
-- ───────────────────────────────────────────────────────────────────

create table if not exists public.shop_order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.shop_orders(id) on delete cascade,
    product_id uuid references public.shop_products(id) on delete set null,

    product_slug text not null,
    product_sku text,
    product_name text not null,
    product_image_path text,

    unit_price integer not null,
    quantity integer not null check (quantity > 0),
    line_total integer not null,
    currency text not null default 'RON',

    created_at timestamptz not null default now()
);

create index if not exists shop_order_items_order_idx on public.shop_order_items(order_id);
create index if not exists shop_order_items_product_idx on public.shop_order_items(product_id);

alter table public.shop_order_items enable row level security;

drop policy if exists "Admins manage shop order items" on public.shop_order_items;

create policy "Admins manage shop order items"
    on public.shop_order_items
    for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ───────────────────────────────────────────────────────────────────
-- atomic stock decrement helper (used by the public checkout server action)
-- ───────────────────────────────────────────────────────────────────

create or replace function public.shop_decrement_stock(
    p_product_id uuid,
    p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_updated integer;
begin
    update public.shop_products
       set stock_quantity = stock_quantity - p_quantity
     where id = p_product_id
       and (track_stock = false or stock_quantity >= p_quantity);

    get diagnostics v_updated = row_count;
    return v_updated > 0;
end;
$$;

grant execute on function public.shop_decrement_stock(uuid, integer) to service_role;
