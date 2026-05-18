alter table public.orders
    add column if not exists subtotal_amount integer not null default 0,
    add column if not exists custom_price_amount integer,
    add column if not exists discount_type text not null default 'none',
    add column if not exists discount_value numeric not null default 0,
    add column if not exists discount_amount integer not null default 0;

alter table public.orders
drop constraint if exists orders_discount_type_check;

alter table public.orders
    add constraint orders_discount_type_check
        check (discount_type in ('none', 'fixed', 'percent'));

update public.orders
set subtotal_amount = total_amount
where subtotal_amount = 0 and total_amount > 0;
