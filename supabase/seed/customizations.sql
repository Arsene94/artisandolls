with groups as (
insert into public.doll_customization_groups (
    slug,
    title,
    description,
    mode,
    selection_type,
    icon_name,
    display_order,
    is_active
)
values
    ('eye-color', 'Culoare ochi', 'Alege culoarea ochilor.', 'buy', 'single', 'eye', 10, true),
    ('skin-color', 'Culoare piele', 'Alege tonul pielii.', 'buy', 'single', 'palette', 20, true),
    ('breast-size', 'Dimensiune sâni', 'Alege dimensiunea bustului.', 'buy', 'single', 'body-scan', 30, true),
    ('posterior-size', 'Dimensiune posterior', 'Alege proporția posteriorului.', 'buy', 'single', 'body-scan', 40, true),
    ('height', 'Înălțime', 'Alege înălțimea modelului.', 'buy', 'single', 'ruler-measure', 50, true),
    ('weight', 'Greutate', 'Alege intervalul de greutate.', 'buy', 'single', 'scale', 60, true),
    ('hair-color', 'Culoare păr', 'Alege culoarea părului.', 'buy', 'single', 'brush', 70, true),
    ('hair-style', 'Stil păr', 'Alege stilul părului.', 'buy', 'single', 'scissors', 80, true),
    ('makeup', 'Machiaj', 'Alege nivelul de machiaj.', 'buy', 'single', 'sparkles', 90, true),
    ('nails', 'Unghii', 'Alege finisajul unghiilor.', 'buy', 'single', 'hand-finger', 100, true),
    ('body-finish', 'Finisaj corp', 'Detalii de finisare și aspect.', 'buy', 'multiple', 'stars', 110, true),
    ('presentation', 'Prezentare & colecție', 'Ambalare, certificat și display.', 'buy', 'multiple', 'certificate', 120, true),
    ('rental-care', 'Pregătire & igienizare', 'Opțiuni extra pentru predare și protecție.', 'rent', 'multiple', 'shield-check', 130, true),
    ('rental-experience', 'Experiență', 'Opțiuni pentru evenimente, decor sau sesiuni foto.', 'rent', 'multiple', 'camera', 140, true)
on conflict (slug) do update set
    title = excluded.title,
                          description = excluded.description,
                          mode = excluded.mode,
                          selection_type = excluded.selection_type,
                          icon_name = excluded.icon_name,
                          display_order = excluded.display_order,
                          is_active = excluded.is_active,
                          updated_at = now()
                          returning id, slug
                          )
                      insert into public.doll_customization_options (
    group_id,
    slug,
    label,
    description,
    price,
    icon_name,
    icon_color,
    swatch_color,
    display_order,
    is_active
)
select g.id, o.slug, o.label, o.description, o.price, o.icon_name, o.icon_color, o.swatch_color, o.display_order, true
from public.doll_customization_groups g
         join (
    values
        ('eye-color', 'blue-eyes', 'Albastru', 'Ochi albaștri expresivi.', 120, 'eye', '#60a5fa', '#60a5fa', 10),
        ('eye-color', 'green-eyes', 'Verde', 'Ochi verzi cu aspect natural.', 120, 'eye', '#34d399', '#34d399', 20),
        ('eye-color', 'brown-eyes', 'Căprui', 'Ochi căprui clasici.', 90, 'eye', '#92400e', '#92400e', 30),
        ('eye-color', 'grey-eyes', 'Gri', 'Ochi gri premium.', 140, 'eye', '#94a3b8', '#94a3b8', 40),

        ('skin-color', 'fair-skin', 'Deschisă', 'Ton deschis de piele.', 0, 'palette', '#f8d7c0', '#f8d7c0', 10),
        ('skin-color', 'medium-skin', 'Medie', 'Ton mediu de piele.', 0, 'palette', '#d39b72', '#d39b72', 20),
        ('skin-color', 'tan-skin', 'Bronzată', 'Ton bronzat.', 80, 'palette', '#a96f4a', '#a96f4a', 30),
        ('skin-color', 'dark-skin', 'Închisă', 'Ton închis de piele.', 120, 'palette', '#6b3f2a', '#6b3f2a', 40),

        ('breast-size', 'breast-small', 'Mică', 'Bust mic, proporție discretă.', 0, 'body-scan', null, null, 10),
        ('breast-size', 'breast-medium', 'Medie', 'Bust mediu, proporție echilibrată.', 150, 'body-scan', null, null, 20),
        ('breast-size', 'breast-large', 'Mare', 'Bust mare, impact vizual ridicat.', 280, 'body-scan', null, null, 30),
        ('breast-size', 'breast-xl', 'Extra mare', 'Bust extra mare.', 420, 'body-scan', null, null, 40),

        ('posterior-size', 'posterior-small', 'Mic', 'Posterior discret.', 0, 'body-scan', null, null, 10),
        ('posterior-size', 'posterior-medium', 'Mediu', 'Posterior echilibrat.', 150, 'body-scan', null, null, 20),
        ('posterior-size', 'posterior-large', 'Mare', 'Posterior mare.', 280, 'body-scan', null, null, 30),
        ('posterior-size', 'posterior-xl', 'Extra mare', 'Posterior extra mare.', 420, 'body-scan', null, null, 40),

        ('height', 'height-150', '150 cm', 'Model compact.', 0, 'ruler-measure', null, null, 10),
        ('height', 'height-160', '160 cm', 'Înălțime medie.', 180, 'ruler-measure', null, null, 20),
        ('height', 'height-170', '170 cm', 'Model înalt.', 320, 'ruler-measure', null, null, 30),

        ('weight', 'weight-light', 'Ușoară', 'Greutate redusă, manevrare mai simplă.', 0, 'scale', null, null, 10),
        ('weight', 'weight-standard', 'Standard', 'Greutate standard.', 0, 'scale', null, null, 20),
        ('weight', 'weight-heavy', 'Premium heavy', 'Greutate mai mare, senzație solidă.', 220, 'scale', null, null, 30),

        ('hair-color', 'hair-blonde', 'Blond', 'Păr blond.', 90, 'brush', '#facc15', '#facc15', 10),
        ('hair-color', 'hair-brown', 'Șaten', 'Păr șaten.', 90, 'brush', '#92400e', '#92400e', 20),
        ('hair-color', 'hair-black', 'Negru', 'Păr negru.', 90, 'brush', '#111827', '#111827', 30),
        ('hair-color', 'hair-red', 'Roșcat', 'Păr roșcat.', 120, 'brush', '#dc2626', '#dc2626', 40),

        ('hair-style', 'hair-straight', 'Drept', 'Păr drept.', 80, 'scissors', null, null, 10),
        ('hair-style', 'hair-wavy', 'Ondulat', 'Păr ondulat.', 100, 'scissors', null, null, 20),
        ('hair-style', 'hair-curly', 'Creț', 'Păr creț.', 140, 'scissors', null, null, 30),

        ('makeup', 'makeup-natural', 'Natural', 'Machiaj discret.', 90, 'sparkles', null, null, 10),
        ('makeup', 'makeup-glam', 'Glam', 'Machiaj accentuat.', 180, 'sparkles', null, null, 20),
        ('makeup', 'makeup-noir', 'Noir', 'Machiaj dark premium.', 220, 'sparkles', null, null, 30),

        ('nails', 'nails-natural', 'Natural', 'Unghii naturale.', 0, 'hand-finger', null, null, 10),
        ('nails', 'nails-french', 'French', 'Finisaj french.', 80, 'hand-finger', null, null, 20),
        ('nails', 'nails-red', 'Roșu', 'Unghii roșii.', 90, 'hand-finger', '#dc2626', '#dc2626', 30),

        ('body-finish', 'finish-realistic', 'Finisaj realist', 'Finisaj extra pentru detalii realiste.', 260, 'stars', null, null, 10),
        ('body-finish', 'finish-soft-touch', 'Soft touch', 'Finisaj tactil premium.', 320, 'stars', null, null, 20),

        ('presentation', 'buy-display-box', 'Cutie de prezentare', 'Ambalaj rigid și prezentare premium.', 280, 'box', null, null, 10),
        ('presentation', 'buy-certificate', 'Certificat extins', 'Fișă detaliată cu număr de serie.', 120, 'certificate', null, null, 20),

        ('rental-care', 'rent-premium-cleaning', 'Igienizare premium', 'Curățare detaliată înainte de predare.', 90, 'shield-check', null, null, 10),
        ('rental-care', 'rent-protective-case', 'Cutie transport premium', 'Cutie rigidă pentru transport mai sigur.', 60, 'box', null, null, 20),

        ('rental-experience', 'rent-photo-ready', 'Pregătire pentru ședință foto', 'Styling rapid și verificare vizuală înainte de livrare.', 120, 'camera', null, null, 10)
) as o(group_slug, slug, label, description, price, icon_name, icon_color, swatch_color, display_order)
              on g.slug = o.group_slug
    on conflict (group_id, slug) do update set
    label = excluded.label,
                                        description = excluded.description,
                                        price = excluded.price,
                                        icon_name = excluded.icon_name,
                                        icon_color = excluded.icon_color,
                                        swatch_color = excluded.swatch_color,
                                        display_order = excluded.display_order,
                                        is_active = excluded.is_active,
                                        updated_at = now();
