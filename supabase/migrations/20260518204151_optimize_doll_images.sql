alter table public.dolls
    add column if not exists main_image_path text,
    add column if not exists image_paths text[] not null default '{}';

update public.dolls
set
    main_image_path = coalesce(main_image_path, main_image_url),
    image_paths = case
                      when image_paths = '{}'::text[] then coalesce(image_urls, '{}'::text[])
                      else image_paths
        end;

alter table public.dolls
    alter column main_image_path set not null;
