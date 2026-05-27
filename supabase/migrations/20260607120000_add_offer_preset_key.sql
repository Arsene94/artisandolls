-- Predefined commercial banner presets.
--
-- An offer can point at a ready-made commercial message (preset) instead of
-- authoring its own copy. The preset text lives in the app i18n catalogs
-- (messages/{ro,en,nl}.json under `offers.presets`), so official presets are
-- translated by hand per locale and never go through the AI pipeline. When the
-- operator types custom badge/title/subtitle, those override the preset and
-- (RO only) get auto-translated as before.
alter table public.site_offers
    add column if not exists preset_key text;
