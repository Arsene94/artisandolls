-- Storage RLS: upload-urile în `doll-images` se fac din browser direct cu
-- sesiunea de admin (vezi components/admin/shared/AdminImageUploadField.tsx),
-- după ce trec prin `optimizeImageBeforeUpload` care forțează .webp. Dar
-- `file.type` și extensia sunt sub controlul clientului; un admin compromis
-- (sau cineva care ocolește optimizarea în DevTools) ar putea încărca HTML
-- polyglot. Adăugăm constraint hard pe nume: doar .webp acceptat la insert
-- și update. Cititul rămâne public — fișierele existente nu sunt afectate
-- (presupunem că toate au deja .webp; dacă nu, le redenumiți cu un script
-- one-off înainte de migrare).

drop policy if exists "Admins can upload doll images" on storage.objects;
drop policy if exists "Admins can update doll images" on storage.objects;

create policy "Admins can upload doll images"
on storage.objects
for insert
with check (
    bucket_id = 'doll-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and lower(right(name, 5)) = '.webp'
);

create policy "Admins can update doll images"
on storage.objects
for update
using (
    bucket_id = 'doll-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
    bucket_id = 'doll-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and lower(right(name, 5)) = '.webp'
);
