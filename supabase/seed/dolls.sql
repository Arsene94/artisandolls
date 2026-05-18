-- Seed initial dolls from lib/dolls.ts
-- Run this after the dolls migration.
-- Safe to run multiple times because it upserts by slug.

insert into public.dolls (
    slug,
    name,
    collection,
    description,
    main_image_url,
    image_urls,
    badge,
    availability,
    available_for_rent,
    available_for_buy,
    rent_price_per_day,
    buy_price,
    tags,
    display_order,
    is_active
)
values
    (
        'eleonora',
        'Eleonora',
        'Ediții Limitate',
        'Piesă de colecție realizată manual, cu detalii couture și finisaje premium.',
        'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-14.jpg',
        array[
            'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-10.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-11.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-9.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-5.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-2.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/12/Kennedy-Blonde-Big-Boobs-Sex-Doll148-164cm-1.jpg'
            ]::text[],
        'Ediție Limitată',
        'limited'::public.doll_availability,
        true,
        true,
        180,
        3200,
        array['Premium', 'Limitată', 'Disponibilă']::text[],
        10,
        true
    ),
    (
        'seraphine',
        'Séraphine',
        'Seria Anotimpuri',
        'Păpușă artistică inspirată de tonuri calde, textile fine și siluetă elegantă.',
        'https://vsdoll.net/wp-content/uploads/2021/03/AlessandraItalianGirlfriendSexDoll21.jpg',
        array[
            'https://vsdoll.net/wp-content/uploads/2022/01/AlessandraItalianGirlfriendSexDoll25.jpg',
        'https://vsdoll.net/wp-content/uploads/2022/01/AlessandraItalianGirlfriendSexDoll2.jpg',
        'https://vsdoll.net/wp-content/uploads/2022/01/AlessandraItalianGirlfriendSexDoll4.jpg',
        'https://vsdoll.net/wp-content/uploads/2022/01/AlessandraItalianGirlfriendSexDoll5.jpg',
        'https://vsdoll.net/wp-content/uploads/2022/01/AlessandraItalianGirlfriendSexDoll11.jpg'
            ]::text[],
        'Personalizabil',
        'custom'::public.doll_availability,
        true,
        true,
        140,
        2600,
        array['Personalizabilă', 'Couture', 'Toamnă']::text[],
        20,
        true
    ),
    (
        'violetta',
        'Violetta',
        'Seria Clasică',
        'Model vintage couture, cu expresie delicată și accesorii lucrate manual.',
        'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-7.webp',
        array[
            'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-3.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-5.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-9.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-1.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-8.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Libby-Watkins-European-Blonde-sexy-Girl-Love-Doll-with-Big-breast-158cm-4.webp'
            ]::text[],
        'Sold Out',
        'sold_out'::public.doll_availability,
        false,
        false,
        null,
        null,
        array['Vintage', 'Clasică', 'Sold out']::text[],
        30,
        true
    ),
    (
        'isabelle',
        'Isabelle',
        'Colecția Noir',
        'Piesă dramatică, cu styling dark-pink, ideală pentru colecții private.',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-7-1.webp',
        array[
            'https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-8.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-4.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-1.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-9.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kendra-Lust-Pornstar-Sex-Doll-MILF-with-big-breast-12.webp'
            ]::text[],
        'Comandă Specială',
        'custom'::public.doll_availability,
        false,
        true,
        null,
        4100,
        array['Noir', 'Comandă specială', 'Colecție']::text[],
        40,
        true
    ),
    (
        'aurora',
        'Aurora',
        'Seria Anotimpuri',
        'Păpușă luminoasă, cu vestimentație pastelată și detalii fine de primăvară.',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-11-1-1.webp',
        array[
            'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-9.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-13.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-1.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-3.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-4.webp',
        'https://vsdoll.net/wp-content/uploads/2025/07/Kardashian-Thick-Big-BreastTits-Kim-Kardashian-Sex-Doll-14.webp'
            ]::text[],
        'Disponibil',
        'available'::public.doll_availability,
        true,
        true,
        120,
        2400,
        array['Disponibilă', 'Primăvară', 'Elegantă']::text[],
        50,
        true
    ),
    (
        'celeste',
        'Céleste',
        'Seria Fantaisie',
        'Model fantasy realizat manual, cu accesorii miniaturale și styling rafinat.',
        'https://vsdoll.net/wp-content/uploads/2025/03/Parry-rabbit-sex-doll-SY140cm-big-breast-2.jpg',
        array[
            'https://vsdoll.net/wp-content/uploads/2025/03/Parry-rabbit-sex-doll-SY140cm-big-breast-1.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/03/Parry-rabbit-sex-doll-SY140cm-big-breast-3.jpg',
        'https://vsdoll.net/wp-content/uploads/2025/03/Parry-rabbit-sex-doll-SY140cm-big-breast-4.jpg'
            ]::text[],
        'Personalizabil',
        'custom'::public.doll_availability,
        true,
        true,
        150,
        2900,
        array['Fantasy', 'Personalizabilă', 'Artizanal']::text[],
        60,
        true
    )
    on conflict (slug) do update set
    name = excluded.name,
                              collection = excluded.collection,
                              description = excluded.description,
                              main_image_url = excluded.main_image_url,
                              image_urls = excluded.image_urls,
                              badge = excluded.badge,
                              availability = excluded.availability,
                              available_for_rent = excluded.available_for_rent,
                              available_for_buy = excluded.available_for_buy,
                              rent_price_per_day = excluded.rent_price_per_day,
                              buy_price = excluded.buy_price,
                              tags = excluded.tags,
                              display_order = excluded.display_order,
                              is_active = excluded.is_active,
                              updated_at = now();
