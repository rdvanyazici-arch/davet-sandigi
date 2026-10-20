begin;

create extension if not exists pgtap with schema extensions;
select plan(16);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  'd1000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','dashboard-editor@example.test','',now(),now(),now()
);

insert into public.admin_profiles (user_id, display_name, role, is_active)
values ('d1000000-0000-4000-8000-000000000001','Dashboard Editor','editor',true);

insert into public.categories (slug, name, code_prefix, is_active)
values ('dashboard-category','Dashboard Category','DSH',true);

insert into public.collections (slug, name, is_active)
values ('dashboard-collection','Dashboard Collection',true);

insert into public.media_assets (
  storage_path, original_name, mime_type, file_size, width, height,
  alt_text, usage_type, status
) values
  ('products/dashboard/primary.webp','primary.webp','image/webp',100,100,100,'Ana görsel','product','active'),
  ('products/dashboard/unused.webp','unused.webp','image/webp',100,100,100,'Kullanılmayan görsel','product','active');

insert into public.products (
  category_id, slug, sku, name, price, is_price_visible, is_quote_only,
  min_quantity, quantity_step, is_active
) values (
  (select id from public.categories where slug='dashboard-category'),
  'dashboard-healthy','DSH-001','Sağlıklı Ürün',10,true,false,1,1,false
);

insert into public.product_images (product_id, media_id, alt_text, is_primary)
select p.id, ma.id, null, true
from public.products p
join public.media_assets ma on ma.storage_path='products/dashboard/primary.webp'
where p.slug='dashboard-healthy';

insert into public.product_collections (product_id, collection_id)
select p.id, c.id
from public.products p
join public.collections c on c.slug='dashboard-collection'
where p.slug='dashboard-healthy';

update public.products set is_active=true where slug='dashboard-healthy';

alter table public.products disable trigger validate_product_publication;
insert into public.products (
  slug, sku, name, price, is_price_visible, is_quote_only,
  min_quantity, quantity_step, is_active
) values ('dashboard-problem','DSH-002','Sorunlu Ürün',null,true,false,1,1,true);
alter table public.products enable trigger validate_product_publication;

insert into public.product_drafts (product_id, payload, created_by)
select id, jsonb_build_object('name','Sorunlu Ürün'), 'd1000000-0000-4000-8000-000000000001'
from public.products where slug='dashboard-problem';

insert into public.products (
  slug, sku, name, price, is_price_visible, is_quote_only,
  min_quantity, quantity_step, is_active
) values
  ('dashboard-off','DSH-003','Yayında Olmayan',10,true,false,1,1,false),
  ('dashboard-archive','DSH-004','Arşiv Ürün',10,true,false,1,1,false);

update public.products set archived_at=now() where slug='dashboard-archive';

set local role anon;
select throws_ok(
  $$select public.admin_dashboard_summary()$$,
  '42501', null,
  'anon cannot execute dashboard summary'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"d1000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',
  true
);

select lives_ok($$select public.admin_dashboard_summary()$$,'active editor can execute dashboard summary');
select is((public.admin_dashboard_summary()->'products'->>'published')::integer,2,'published product count matches fixture');
select is((public.admin_dashboard_summary()->'products'->>'drafts')::integer,1,'draft count matches fixture');
select is((public.admin_dashboard_summary()->'products'->>'unpublished')::integer,1,'unpublished count matches fixture');
select is((public.admin_dashboard_summary()->'products'->>'archived')::integer,1,'archived count matches fixture');
select is((public.admin_dashboard_summary()->'products'->>'total')::integer,4,'total product count matches fixture');
select is((public.admin_dashboard_summary()->'health'->>'percentage')::integer,50,'catalog health percentage matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'missing_primary'->>'count')::integer,1,'missing primary count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'missing_alt'->>'count')::integer,1,'missing alt count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'pending_drafts'->>'count')::integer,1,'pending draft count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'unused_media'->>'count')::integer,1,'unused media count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'categoryless'->>'count')::integer,1,'categoryless count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'missing_price'->>'count')::integer,1,'missing price count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'no_collection'->>'count')::integer,1,'no collection count matches fixture');
select is((public.admin_dashboard_summary()->'health'->'issues'->'missing_primary'->'records'->0->>'name'),'Sorunlu Ürün','issue record identifies the product');

select * from finish();
rollback;
