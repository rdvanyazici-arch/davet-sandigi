-- analytics_daily.product_id üzerindeki "on delete set null" davranışı,
-- analytics_daily_product_event_check kısıtıyla çelişiyordu: ürün olaylarında
-- (product_view, add_to_cart) product_id'nin dolu olması zorunlu. Bir ürün
-- silindiğinde foreign key eylemi sütunu null yapar, check kısıtı devreye girer
-- ve silme anlaşılmaz bir hatayla başarısız olur.
--
-- Silinmiş bir ürünün olay sayaçları anlamsız olduğu için doğru davranış cascade.
-- Kısıt adı satır içi tanımdan üretildiği için adı aramak yerine katalogdan bulunur.

do $$
declare
  v_constraint text;
begin
  select con.conname into v_constraint
  from pg_catalog.pg_constraint con
  join pg_catalog.pg_class rel on rel.oid = con.conrelid
  join pg_catalog.pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'analytics_daily'
    and con.contype = 'f'
    and con.conkey = array[
      (select attnum from pg_catalog.pg_attribute
        where attrelid = rel.oid and attname = 'product_id')
    ]::smallint[];

  if v_constraint is null then
    raise exception 'analytics_daily.product_id foreign key not found.';
  end if;

  execute format(
    'alter table public.analytics_daily drop constraint %I',
    v_constraint
  );
end;
$$;

alter table public.analytics_daily
  add constraint analytics_daily_product_id_fkey
  foreign key (product_id) references public.products(id) on delete cascade;

comment on constraint analytics_daily_product_id_fkey on public.analytics_daily is
  'Cascade: silinen ürünün toplam sayaçları da silinir. "set null" product_event_check ile çakışır.';
