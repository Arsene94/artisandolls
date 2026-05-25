-- Persist the raw WhatsApp notification debug payload so we can audit failures
-- without re-running the request.

alter table public.orders
    add column if not exists whatsapp_debug jsonb;
