alter table public.dolls
    add column if not exists show_on_home_hero boolean not null default false;

create unique index if not exists dolls_single_home_hero_idx
    on public.dolls (show_on_home_hero)
    where show_on_home_hero;

create index if not exists dolls_show_on_home_hero_idx
    on public.dolls (show_on_home_hero)
    where show_on_home_hero;
