-- ───────────────────────────────────────────────────────────────────
-- Suport pentru variante de produs (mărime, culoare, mărimi multiple).
-- Strategie: `variant_group_id` identifică grupul; produsele cu același
-- `variant_group_id` sunt variante una a celeilalte. `variant_axes` jsonb
-- mapează `{"size":"L","color":"red"}` — fiecare axă o cheie, valoare string.
-- `variant_label` rămâne ca shortcut afișaj („Mărimea L"); dacă lipsește,
-- UI-ul construiește label-ul din axe.
--
-- Schema rămâne backwards-compatible: produsele existente au toate trei
-- câmpurile null → comportament standalone neschimbat.
-- ───────────────────────────────────────────────────────────────────

alter table public.shop_products
    add column if not exists variant_group_id uuid,
    add column if not exists variant_axes jsonb,
    add column if not exists variant_label text;

create index if not exists shop_products_variant_group_idx
    on public.shop_products(variant_group_id)
    where variant_group_id is not null;
