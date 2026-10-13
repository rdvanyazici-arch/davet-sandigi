begin;

create extension if not exists pgtap with schema extensions;

select plan(24);

select is(
  (
    select count(*)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any (array[
        'admin_profiles', 'site_settings', 'categories', 'collections',
        'products', 'product_collections', 'media_assets', 'product_images',
        'banners', 'content_sections', 'testimonials', 'faqs'
      ])
      and c.relrowsecurity
  ),
  12::bigint,
  'RLS is enabled on every application table'
);

select is(
  (
    select count(*)
    from unnest(array[
      'admin_profiles', 'site_settings', 'categories', 'collections',
      'products', 'product_collections', 'media_assets', 'product_images',
      'banners', 'content_sections', 'testimonials', 'faqs'
    ]) as table_names(table_name)
    where has_table_privilege('anon', 'public.' || table_name, 'INSERT')
  ),
  0::bigint,
  'anon has no INSERT privilege on application tables'
);

select is(
  (
    select count(*)
    from unnest(array[
      'admin_profiles', 'site_settings', 'categories', 'collections',
      'products', 'product_collections', 'media_assets', 'product_images',
      'banners', 'content_sections', 'testimonials', 'faqs'
    ]) as table_names(table_name)
    where has_table_privilege('anon', 'public.' || table_name, 'UPDATE')
  ),
  0::bigint,
  'anon has no UPDATE privilege on application tables'
);

select is(
  (
    select count(*)
    from unnest(array[
      'admin_profiles', 'site_settings', 'categories', 'collections',
      'products', 'product_collections', 'media_assets', 'product_images',
      'banners', 'content_sections', 'testimonials', 'faqs'
    ]) as table_names(table_name)
    where has_table_privilege('anon', 'public.' || table_name, 'DELETE')
  ),
  0::bigint,
  'anon has no DELETE privilege on application tables'
);

select ok(
  not has_table_privilege('anon', 'public.admin_profiles', 'SELECT'),
  'anon cannot read admin_profiles'
);

select ok(
  not has_table_privilege('authenticated', 'public.products', 'DELETE'),
  'products cannot be deleted directly'
);

select ok(
  has_table_privilege('authenticated', 'public.media_assets', 'DELETE'),
  'media asset delete is delegated to owner-only archive RLS'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'owner@example.test', '',
    now(), now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'editor@example.test', '',
    now(), now(), now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'inactive@example.test', '',
    now(), now(), now()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'regular@example.test', '',
    now(), now(), now()
  );

insert into public.admin_profiles (user_id, display_name, role, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Owner', 'owner', true),
  ('22222222-2222-2222-2222-222222222222', 'Editor', 'editor', true),
  ('33333333-3333-3333-3333-333333333333', 'Inactive', 'editor', false);

insert into public.categories (id, slug, name, sort_order, is_active)
overriding system value
values
  (9001, 'active-category', 'Active Category', 1, true),
  (9002, 'inactive-category', 'Inactive Category', 2, false);

insert into public.media_assets (
  id, storage_path, original_name, mime_type, file_size,
  width, height, alt_text, usage_type, status
)
overriding system value
values (
  9001, 'products/9001/product.webp', 'product.webp', 'image/webp', 1024,
  800, 800, 'Test product', 'product', 'active'
);

insert into public.products (
  id, category_id, slug, sku, name, price, min_quantity,
  quantity_step, is_active, sort_order
)
overriding system value
values (
  9001, 9001, 'active-product', 'TEST-001', 'Active Product',
  10.00, 1, 1, false, 1
);

insert into public.product_images (
  id, product_id, media_id, alt_text, sort_order, is_primary
)
overriding system value
values (9001, 9001, 9001, 'Test product', 1, true);

update public.products set is_active = true where id = 9001;

set local role anon;

select results_eq(
  $$select count(*) from public.categories$$,
  array[1::bigint],
  'anon can read only the active category'
);

select results_eq(
  $$select count(*) from public.categories where slug = 'inactive-category'$$,
  array[0::bigint],
  'anon cannot read an inactive category'
);

select results_eq(
  $$select count(*) from public.products where slug = 'active-product'$$,
  array[1::bigint],
  'anon can read an active non-archived product'
);

select results_eq(
  $$select count(*) from public.site_settings_public where id = 1$$,
  array[1::bigint],
  'anon can read the public site settings projection'
);

select throws_ok(
  $$insert into public.categories (slug, name) values ('anon-write', 'Anon Write')$$,
  '42501',
  null,
  'anon cannot write to categories'
);

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '44444444-4444-4444-4444-444444444444',
  true
);

select throws_ok(
  $$insert into public.categories (slug, name) values ('regular-write', 'Regular Write')$$,
  '42501',
  null,
  'authenticated non-admin cannot write'
);

select is(
  (select private.is_admin()),
  false,
  'authenticated non-admin is not an admin'
);

select set_config(
  'request.jwt.claim.sub',
  '33333333-3333-3333-3333-333333333333',
  true
);

select throws_ok(
  $$insert into public.categories (slug, name) values ('inactive-write', 'Inactive Write')$$,
  '42501',
  null,
  'inactive admin cannot write'
);

select is(
  (select private.is_admin()),
  false,
  'inactive admin fails the active-admin check'
);

select set_config(
  'request.jwt.claim.sub',
  '22222222-2222-2222-2222-222222222222',
  true
);

select lives_ok(
  $$insert into public.categories (slug, name) values ('editor-write', 'Editor Write')$$,
  'active editor can manage content'
);

select throws_ok(
  $$insert into public.admin_profiles (user_id, display_name, role) values
    ('44444444-4444-4444-4444-444444444444', 'Managed User', 'editor')$$,
  '42501',
  null,
  'editor cannot manage admin profiles'
);

select is(
  (select private.is_admin()),
  true,
  'active editor passes the admin check'
);

select is(
  (select private.is_owner()),
  false,
  'editor does not pass the owner check'
);

select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-1111-1111-111111111111',
  true
);

select lives_ok(
  $$insert into public.admin_profiles (user_id, display_name, role) values
    ('44444444-4444-4444-4444-444444444444', 'Managed User', 'editor')$$,
  'owner can manage admin profiles'
);

select is(
  (select private.is_owner()),
  true,
  'active owner passes the owner check'
);

reset role;

select throws_ok(
  $$insert into public.testimonials
    (customer_display_name, review_text, rating, consent_confirmed, is_published)
    values ('No Consent', 'Test', 5, false, true)$$,
  '23514',
  null,
  'a testimonial cannot be published without consent'
);

select ok(
  not has_function_privilege('anon', 'private.is_admin()', 'EXECUTE'),
  'anon cannot execute the admin helper'
);

select * from finish();
rollback;
