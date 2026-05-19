insert into storage.buckets (id, name, public)
values ('doll-images', 'doll-images', true)
    on conflict (id) do update set public = true;
