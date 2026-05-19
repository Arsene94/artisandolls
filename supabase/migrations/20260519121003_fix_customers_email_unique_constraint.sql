update public.customers
set email = lower(trim(email))
where email is not null;

drop index if exists public.customers_email_unique_idx;

alter table public.customers
drop constraint if exists customers_email_unique;

alter table public.customers
    add constraint customers_email_unique unique (email);
