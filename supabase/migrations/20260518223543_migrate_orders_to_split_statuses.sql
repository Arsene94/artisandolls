update public.orders
set status = case
                 when mode = 'rent' and status = 'new' then 'rent_new'::public.order_status
  when mode = 'rent' and status = 'in_review' then 'rent_in_review'::public.order_status
  when mode = 'rent' and status = 'confirmed' then 'rent_confirmed'::public.order_status
  when mode = 'rent' and status = 'completed' then 'rent_completed'::public.order_status
  when mode = 'rent' and status = 'cancelled' then 'rent_cancelled'::public.order_status

  when mode = 'buy' and status = 'new' then 'buy_new'::public.order_status
  when mode = 'buy' and status = 'in_review' then 'buy_in_review'::public.order_status
  when mode = 'buy' and status = 'confirmed' then 'buy_confirmed'::public.order_status
  when mode = 'buy' and status = 'completed' then 'buy_completed'::public.order_status
  when mode = 'buy' and status = 'cancelled' then 'buy_cancelled'::public.order_status

  else status
end;

alter table public.orders
drop constraint if exists orders_status_matches_mode;

alter table public.orders
    add constraint orders_status_matches_mode
        check (
            (
                mode = 'rent'
                    and status in (
                                   'rent_new',
                                   'rent_in_review',
                                   'rent_confirmed',
                                   'rent_preparing',
                                   'rent_out_for_delivery',
                                   'rent_delivered',
                                   'rent_active',
                                   'rent_return_scheduled',
                                   'rent_returned',
                                   'rent_completed',
                                   'rent_cancelled'
                    )
                )
                or
            (
                mode = 'buy'
                    and status in (
                                   'buy_new',
                                   'buy_in_review',
                                   'buy_confirmed',
                                   'buy_preparing',
                                   'buy_out_for_delivery',
                                   'buy_delivered',
                                   'buy_completed',
                                   'buy_cancelled',
                                   'buy_refunded'
                    )
                )
            );
