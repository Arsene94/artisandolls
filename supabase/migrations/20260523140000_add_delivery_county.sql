-- Store the delivery county (judet) separately from the locality so we can
-- filter/group orders by region.

alter table public.orders
    add column if not exists delivery_county text;

alter table public.customers
    add column if not exists last_delivery_county text;
