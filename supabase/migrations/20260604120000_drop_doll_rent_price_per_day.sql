-- Prețul de închiriere vine acum exclusiv din doll_rental_tiers (treapta cea
-- mai ieftină pentru afișaje „de la"). Coloana de fallback rent_price_per_day
-- nu mai e citită sau scrisă de aplicație. Comenzile păstrează propriul snapshot
-- de preț (orders.rental_price / subtotal_amount), deci eliminarea coloanei nu
-- afectează rezervările existente.

alter table public.dolls
    drop column if exists rent_price_per_day;
