begin;

create extension if not exists pgtap with schema extensions;

select plan(15);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values (
  '77777777-7777-7777-7777-777777777777',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'product-owner@example.test', '',
  now(), now(), now()
);

insert into public.admin_profiles (user_id, display_name, role, is_active)
values ('77777777-7777-7777-7777-777777777777', 'Product Owner', 'owner', true);

insert into public.categories (id, slug, name, code_prefix, sort_order, is_active)
overriding system value
values (9701, 'test-category', 'Test Category', 'TST', 1, true);

insert into public.media_assets (
  id, storage_path, original_name, mime_type, file_size,
  width, height, alt_text, usage_type, status
) overriding system value
values (
  9701, 'products/test/product.webp', 'product.webp', 'image/webp', 1024,
  800, 1000, 'Test ana görseli', 'product', 'active'
);

select ok(
  not has_table_privilege('anon', 'public.product_drafts', 'SELECT'),
  'anon cannot read product drafts'
);

select ok(
  not has_table_privilege('anon', 'public.product_drafts', 'INSERT'),
  'anon cannot write product drafts'
);

select ok(
  not has_function_privilege('anon', 'public.save_product_draft(bigint,jsonb)', 'EXECUTE'),
  'anon cannot call the draft writer'
);

select ok(
  not has_function_privilege('anon', 'public.publish_product_draft(bigint)', 'EXECUTE'),
  'anon cannot call the publisher'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777777","aal":"aal2","role":"authenticated"}',
  true
);

create temporary table saved_draft as
select * from public.save_product_draft(
  null,
  '{
    "name":"Taslak Ürün",
    "slug":"taslak-urun",
    "sku":"TST-001",
    "category_id":9701,
    "short_description":"Kısa açıklama",
    "description":"Açıklama",
    "price":49.90,
    "is_price_visible":true,
    "is_quote_only":false,
    "min_quantity":25,
    "quantity_step":25,
    "is_featured":true,
    "sort_order":1,
    "collection_ids":[],
    "images":[{"media_id":9701,"alt_text":"Test ana görseli"}]
  }'::jsonb
);

select set_config('test.product_id', (select product_id::text from saved_draft), true);

select is((select count(*) from saved_draft), 1::bigint, 'admin can save a product draft');
select is((select count(*) from public.product_drafts), 1::bigint, 'saved draft is visible to admin');
select is((select count(*) from public.products where is_active), 0::bigint, 'draft product is not public');

select lives_ok(
  format('select public.publish_product_draft(%s)', (select draft_id from saved_draft)),
  'admin can publish the approved draft atomically'
);

select is((select count(*) from public.product_drafts), 0::bigint, 'published draft is removed');
select is((select count(*) from public.products where is_active and archived_at is null), 1::bigint, 'published product is active');
select is((select count(*) from public.product_images where is_primary), 1::bigint, 'published product has exactly one primary image');

select lives_ok(
  format(
    $$select * from public.save_product_draft(%s, '{"name":"Başarısız Değişiklik","slug":"taslak-urun","sku":"TST-001","category_id":9701,"price":49.90,"is_price_visible":true,"is_quote_only":false,"min_quantity":25,"quantity_step":25,"is_featured":true,"sort_order":1,"collection_ids":[],"images":[]}'::jsonb)$$,
    (select product_id from saved_draft)
  ),
  'admin can stage changes without touching the live product'
);

select throws_ok(
  format('select public.publish_product_draft(%s)', (select id from public.product_drafts limit 1)),
  '23514',
  null,
  'invalid publication fails'
);

select is(
  (select name from public.products where id = (select product_id from saved_draft)),
  'Taslak Ürün',
  'failed publication preserves the current live product'
);

update public.products
set is_active = false
where id = (select product_id from saved_draft);

reset role;
set local role anon;

select is(
  (select count(*) from public.products where id = current_setting('test.product_id')::bigint),
  0::bigint,
  'anon cannot see an inactive product'
);

select * from finish();
rollback;
