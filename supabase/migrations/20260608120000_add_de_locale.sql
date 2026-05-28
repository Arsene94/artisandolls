-- Adaugă `de` ca locale acceptat în check-urile pe `reviews.locale` și
-- `content_translations.locale`. UI-ul l-a inclus deja în routing; constrângerea
-- veche ar fi respins orice insert pe coloana respectivă.
--
-- Nu adăugăm coloane _de pe tabelele cu fallback editorial (blog, faq, offers,
-- shop) — content_translations e suficient pentru pipeline-ul auto.

alter table reviews drop constraint if exists reviews_locale_check;
alter table reviews
    add constraint reviews_locale_check
    check (locale is null or (locale in ('ro', 'en', 'nl', 'de')));

alter table content_translations drop constraint if exists content_translations_locale_check;
alter table content_translations
    add constraint content_translations_locale_check
    check (locale in ('en', 'nl', 'de'));
