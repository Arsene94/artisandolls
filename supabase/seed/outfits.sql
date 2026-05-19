insert into public.doll_outfits (
    slug,
    label,
    description,
    mode,
    price,
    image_url,
    icon_name,
    display_order,
    is_active
)
values
    (
        'rent-outfit-classic',
        'Ținută elegantă clasică',
        'Look rafinat pentru prezentare, decor sau sesiuni foto simple.',
        'rent',
        120,
        'https://placehold.co/420x520/130713/ff9bd0?text=Classic+Outfit',
        'hanger',
        10,
        true
    ),
    (
        'rent-outfit-evening',
        'Ținută de seară',
        'Styling mai dramatic, potrivit pentru evenimente și cadre premium.',
        'rent',
        180,
        'https://placehold.co/420x520/24051c/ff4fa3?text=Evening+Outfit',
        'hanger',
        20,
        true
    ),
    (
        'rent-outfit-photo',
        'Ținută foto premium',
        'Ținută cu impact vizual ridicat pentru shooting sau vitrină.',
        'rent',
        240,
        'https://placehold.co/420x520/2a0821/ffc1df?text=Photo+Outfit',
        'camera',
        30,
        true
    ),
    (
        'buy-outfit-couture',
        'Ținută couture personalizată',
        'Materiale premium, croială dedicată și accesorii potrivite colecției.',
        'buy',
        650,
        'https://placehold.co/420x520/130713/ff9bd0?text=Couture',
        'hanger',
        40,
        true
    ),
    (
        'buy-outfit-royal',
        'Ținută royal collection',
        'Ținută amplă, cu detalii decorative și finisaj de colecție.',
        'buy',
        890,
        'https://placehold.co/420x520/24051c/ff4fa3?text=Royal',
        'crown',
        50,
        true
    ),
    (
        'buy-outfit-noir',
        'Ținută Noir premium',
        'Styling dark, elegant, cu accente dramatice și prezentare premium.',
        'buy',
        760,
        'https://placehold.co/420x520/090009/ffc1df?text=Noir',
        'sparkles',
        60,
        true
    )
    on conflict (slug) do update set
    label = excluded.label,
                              description = excluded.description,
                              mode = excluded.mode,
                              price = excluded.price,
                              image_url = excluded.image_url,
                              icon_name = excluded.icon_name,
                              display_order = excluded.display_order,
                              is_active = excluded.is_active,
                              updated_at = now();
