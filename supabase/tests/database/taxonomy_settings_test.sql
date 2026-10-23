begin;

create extension if not exists pgtap with schema extensions;

select plan(26);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values
  ('88888888-8888-8888-8888-888888888881', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'taxonomy-owner@example.test', '', now(), now(), now()),
  ('88888888-8888-8888-8888-888888888882', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'taxonomy-inactive@example.test', '', now(), now(), now()),
  ('88888888-8888-8888-8888-888888888883', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'taxonomy-user@example.test', '', now(), now(), now());

insert into public.admin_profiles (user_id, display_name, role, is_active)
values
  ('88888888-8888-8888-8888-888888888881', 'Taxonomy Owner', 'owner', true),
  ('88888888-8888-8888-8888-888888888882', 'Inactive Editor', 'editor', false);

insert into public.categories (id, slug, name, code_prefix, sort_order, is_active, archived_at)
overriding system value
values
  (9801, 'active-category', 'Active Category', 'ACT', 1, true, null),
  (9802, 'archived-category', 'Archived Category', 'ARC', 2, false, now());

insert into public.media_assets (
  id, storage_path, original_name, mime_type, file_size,
  width, height, alt_text, usage_type, status
) overriding system value
values (9801, 'collections/test/cover.webp', 'cover.webp', 'image/webp', 1024, 800, 1000, 'Collection cover', 'collection', 'active');

insert into public.collections (id, slug, name, short_description, cover_media_id, sort_order, is_active, archived_at)
overriding system value
values
  (9801, 'active-collection', 'Active Collection', 'Active', 9801, 1, true, null),
  (9802, 'archived-collection', 'Archived Collection', 'Archived', null, 2, false, now());

insert into public.products (
  id, category_id, slug, sku, name, min_quantity, quantity_step,
  is_active, sort_order
) overriding system value
values (9801, 9801, 'linked-product', 'LNK-001', 'Linked Product', 1, 1, false, 1);

insert into public.product_collections (product_id, collection_id)
values (9801, 9801);

select ok(not has_table_privilege('anon', 'public.categories', 'INSERT'), 'anon cannot insert categories');
select ok(not has_table_privilege('anon', 'public.categories', 'UPDATE'), 'anon cannot update categories');
select ok(not has_table_privilege('authenticated', 'public.categories', 'DELETE'), 'authenticated cannot permanently delete categories');
select ok(not has_table_privilege('anon', 'public.collections', 'INSERT'), 'anon cannot insert collections');
select ok(not has_table_privilege('anon', 'public.collections', 'UPDATE'), 'anon cannot update collections');
select ok(not has_table_privilege('authenticated', 'public.collections', 'DELETE'), 'authenticated cannot permanently delete collections');
select ok(not has_table_privilege('anon', 'public.site_settings', 'UPDATE'), 'anon cannot update site settings');

set local role anon;
select is((select count(*) from public.categories where id = 9801), 1::bigint, 'anon can see an active category');
select is((select count(*) from public.categories where id = 9802), 0::bigint, 'anon cannot see an archived category');
select is((select count(*) from public.collections where id = 9801), 1::bigint, 'anon can see an active collection');
select is((select count(*) from public.collections where id = 9802), 0::bigint, 'anon cannot see an archived collection');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888881","aal":"aal2","role":"authenticated"}', true);

select lives_ok(
  $$insert into public.categories (slug, name, code_prefix, is_active) values ('owner-category', 'Owner Category', 'OWN', false)$$,
  'active admin can insert a category'
);
select lives_ok(
  $$insert into public.collections (slug, name, is_active) values ('owner-collection', 'Owner Collection', false)$$,
  'active admin can insert a collection'
);
select lives_ok(
  $$update public.site_settings set whatsapp_number = '905399999999', default_min_quantity = 10, default_quantity_step = 5 where id = 1$$,
  'active admin can update site settings'
);
select is((select count(*) from public.categories where archived_at is not null), 1::bigint, 'admin can see archived categories');
select throws_ok(
  $$update public.site_settings set whatsapp_number = '+90 539 999 99 99' where id = 1$$,
  '23514',
  null,
  'database rejects a formatted WhatsApp number'
);

select set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888882","aal":"aal2","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.categories (slug, name, code_prefix) values ('inactive-category', 'Inactive Category', 'INA')$$,
  '42501',
  null,
  'inactive admin cannot insert a category'
);

select set_config('request.jwt.claims', '{"sub":"88888888-8888-8888-8888-888888888883","aal":"aal2","role":"authenticated"}', true);
update public.site_settings
set delivery_text = 'Unauthorized'
where id = 1;

reset role;
select isnt(
  (select delivery_text from public.site_settings where id = 1),
  'Unauthorized'::text,
  'authenticated non-admin cannot change site settings'
);
select is((select count(*) from public.products where category_id = 9801), 1::bigint, 'category usage count finds linked products');
select is((select count(*) from public.product_collections where collection_id = 9801), 1::bigint, 'collection usage count finds linked products');

-- İl/ilçe: anonim ziyaretçi görmeli, sokak adresi diye tam adres girilememeli.
select has_column('public', 'site_settings_public', 'address_locality',
  'public settings view exposes the district');
select has_column('public', 'site_settings_public', 'address_region',
  'public settings view exposes the province');

update public.site_settings set address_locality = 'Nilüfer', address_region = 'Bursa' where id = 1;
select is((select address_locality || ' / ' || address_region from public.site_settings_public),
  'Nilüfer / Bursa', 'public view returns the stored district and province');

select throws_ok(
  $$update public.site_settings set address_locality = 'A' where id = 1$$,
  '23514',
  null,
  'district shorter than two characters is rejected'
);

-- Ziyaretçi görünümü gerçekten okuyabilmeli. Sütun yetkisi verilmeden
-- görünüme sütun eklenirse buradan patlar: yetkisiz tek sütun görünümün
-- tamamını okunamaz yapar ve site tüm ayarlarını kaybeder.
set local role anon;
select lives_ok(
  $$select * from public.site_settings_public$$,
  'anonymous visitor can read every column of the public settings view'
);
select is(
  (select address_locality from public.site_settings_public),
  'Nilüfer',
  'anonymous visitor reads the district'
);
reset role;

select * from finish();
rollback;
