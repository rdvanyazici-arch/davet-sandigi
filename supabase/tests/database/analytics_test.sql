begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

-- Test, daha önce yerel Edge Function ile oluşturulmuş satırlardan bağımsız
-- çalışmalı. Silmeler transaction sonunda geri alınır.
delete from public.analytics_daily;
delete from private.analytics_rate_limits;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values ('a7000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','analytics-editor@example.test','',now(),now(),now());
insert into public.admin_profiles (user_id, display_name, role, is_active)
values ('a7000000-0000-4000-8000-000000000001','Analytics Editor','editor',true);

set local role anon;
select throws_ok(
  $$insert into public.analytics_daily(day,event_type,source,device,count) values(current_date,'page_view','direct','desktop',1)$$,
  '42501', null, 'anon cannot insert analytics rows'
);
select throws_ok($$select * from public.analytics_daily$$,'42501',null,'anon cannot read analytics rows');
select throws_ok($$select public.admin_analytics_summary(30)$$,'42501',null,'anon cannot execute analytics summary');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a7000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select lives_ok($$select public.admin_analytics_summary(30)$$,'active editor can read analytics summary');
select throws_ok(
  $$insert into public.analytics_daily(day,event_type,source,device,count) values(current_date,'page_view','direct','desktop',1)$$,
  '42501', null, 'authenticated admin cannot write analytics rows directly'
);
reset role;

set local role service_role;
select is(
  (public.record_analytics_event('page_view',null,'direct','desktop',repeat('a',64))->>'accepted')::boolean,
  true,
  'server event is accepted'
);
select is((select count from public.analytics_daily where event_type='page_view' and source='direct' and device='desktop'),1,'daily count is written');
select throws_ok(
  $$select public.record_analytics_event('customer_name',null,'direct','desktop',repeat('b',64))$$,
  '22023', null, 'invalid event is rejected'
);
select throws_ok(
  $$select public.record_analytics_event('product_view',999999,'direct','desktop',repeat('c',64))$$,
  '22023', null, 'inactive or missing product is rejected'
);

select public.record_analytics_event('page_view',null,'direct','mobile',repeat('d',64)) from generate_series(1,120);
select is(
  (public.record_analytics_event('page_view',null,'direct','mobile',repeat('d',64))->>'reason'),
  'rate_limited',
  'rate limit rejects request 121'
);
select is((select count from public.analytics_daily where event_type='page_view' and source='direct' and device='mobile'),120,'rate-limited event is not counted');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a7000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select is((public.admin_analytics_summary(30)->'totals'->>'page_view')::bigint,121::bigint,'summary returns aggregate page views');
select throws_ok($$select public.admin_analytics_summary(8)$$,'22023',null,'unsupported date range is rejected');

-- Ürün silinince analiz satırları cascade ile gider; check kısıtı silmeyi engellemez.
reset role;
insert into public.categories(slug,name,is_active)
  values('analytics-cascade-kategori','Analytics Cascade Kategori',false);
insert into public.products(category_id,slug,sku,name,min_quantity,quantity_step,is_active)
  values((select id from public.categories where slug='analytics-cascade-kategori'),
         'analytics-cascade-urun','ANL-CASCADE-1','Analytics Cascade Ürün',1,1,false);
insert into public.analytics_daily(day,event_type,product_id,source,device,count)
  values(current_date,'product_view',
         (select id from public.products where slug='analytics-cascade-urun'),
         'direct','desktop',5);

select lives_ok(
  $$delete from public.products where slug='analytics-cascade-urun'$$,
  'deleting a product cascades its analytics rows instead of failing the check constraint'
);
select is(
  (select count(*) from public.analytics_daily where event_type='product_view'),
  0::bigint,
  'cascade removed the product analytics rows'
);

select * from finish();
rollback;
