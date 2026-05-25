-- Extend orders/customers tables with the new checkout form fields introduced
-- by the velvet checkout redesign (preferred contact method/window, separate
-- city, explicit age + privacy consent, optional email).

alter table public.orders
    add column if not exists contact_method text,
    add column if not exists contact_window_start text,
    add column if not exists contact_window_end text,
    add column if not exists delivery_city text,
    add column if not exists age_confirmed boolean not null default false,
    add column if not exists privacy_accepted boolean not null default false;

-- Email is now optional on the new checkout form.
alter table public.orders
    alter column customer_email drop not null;

alter table public.customers
    add column if not exists preferred_contact_method text,
    add column if not exists contact_window_start text,
    add column if not exists contact_window_end text,
    add column if not exists last_delivery_city text;

-- Allow customers without email so we can store phone-only contacts.
alter table public.customers
    alter column email drop not null;
