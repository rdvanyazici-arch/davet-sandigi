begin;

create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('a1000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','audit-owner@example.test','',now(),now(),now()),
  ('a1000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','audit-editor@example.test','',now(),now(),now());

insert into public.admin_profiles (user_id, display_name, role, is_active)
values
  ('a1000000-0000-4000-8000-000000000001','Audit Owner','owner',true),
  ('a1000000-0000-4000-8000-000000000002','Audit Editor','editor',true);

select ok(has_table_privilege('authenticated','public.admin_audit_log','SELECT'),'authenticated has audit SELECT privilege');
select ok(not has_table_privilege('authenticated','public.admin_audit_log','INSERT'),'authenticated has no audit INSERT privilege');
select ok(not has_table_privilege('authenticated','public.admin_audit_log','UPDATE'),'authenticated has no audit UPDATE privilege');
select ok(not has_table_privilege('authenticated','public.admin_audit_log','DELETE'),'authenticated has no audit DELETE privilege');

set local role anon;
select throws_ok($$select * from public.admin_audit_log$$,'42501',null,'anon cannot read audit log');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000002","aal":"aal1","role":"authenticated"}',true);

select lives_ok($$select count(*) from public.admin_audit_log$$,'active editor can read audit log');
select throws_ok($$insert into public.admin_audit_log(table_name,row_id,action,summary) values('x','1','insert','forged')$$,'42501',null,'editor cannot forge audit rows');

insert into public.categories (slug,name,code_prefix,is_active)
values ('audit-category','Audit Category','AUD',false);

select results_eq(
  $$select count(*) from public.admin_audit_log where table_name='categories' and summary='Kategori: Audit Category' and action='insert'$$,
  array[1::bigint],
  'insert trigger writes an audit row'
);

update public.categories set description='A long description', archived_at=now(), is_active=false where slug='audit-category';

select results_eq(
  $$select count(*) from public.admin_audit_log where table_name='categories' and action='archive' and changes ? 'archived_at'$$,
  array[1::bigint],
  'archive transition is classified as archive'
);

select is(
  (select changes->'description' from public.admin_audit_log where table_name='categories' and action='archive' order by id desc limit 1),
  '{"changed":true}'::jsonb,
  'large text is masked in audit changes'
);

update public.site_settings set phone='+90 555 000 00 00' where id=1;
select is(
  (select changes->'phone' from public.admin_audit_log where table_name='site_settings' order by id desc limit 1),
  '{"changed":true}'::jsonb,
  'phone value is never copied into audit changes'
);

insert into public.media_assets (storage_path,original_name,mime_type,file_size,width,height,alt_text,usage_type,status)
values ('products/audit/product.webp','product.webp','image/webp',100,100,100,'Audit image','product','active');

create temporary table audit_draft_result as
select * from public.save_product_draft(null, jsonb_build_object(
  'name','Audit Product','slug','audit-product','sku','AUD-001','category_id',(select id from public.categories where slug='audit-category'),
  'price',10,'is_price_visible',true,'is_quote_only',false,'min_quantity',1,'quantity_step',1,'is_featured',false,'sort_order',0,
  'collection_ids','[]'::jsonb,'images',jsonb_build_array(jsonb_build_object('media_id',(select id from public.media_assets where storage_path='products/audit/product.webp'),'alt_text','Audit image'))
));

select results_eq($$select count(*) from public.admin_audit_log where table_name='product_drafts'$$,array[0::bigint],'saving a draft does not write product_drafts audit');
select lives_ok($$select public.publish_product_draft((select draft_id from audit_draft_result))$$,'draft can be published');
select results_eq($$select count(*) from public.admin_audit_log where table_name='product_drafts' and action='update' and summary='Ürün taslağı yayınlandı'$$,array[1::bigint],'product_drafts is audited only at publication');

select * from finish();
rollback;
