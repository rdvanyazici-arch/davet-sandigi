begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

select is(
  (select public from storage.buckets where id = 'site-media'),
  true,
  'site-media bucket is public'
);

select is(
  (select file_size_limit from storage.buckets where id = 'site-media'),
  6291456::bigint,
  'site-media bucket has a 6 MiB limit'
);

select results_eq(
  $$select unnest(allowed_mime_types) from storage.buckets where id = 'site-media' order by 1$$,
  $$values ('image/jpeg'::text), ('image/png'::text), ('image/webp'::text)$$,
  'site-media allows only JPEG, PNG and WebP'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'storage-admin@example.test', '',
    now(), now(), now()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'storage-inactive@example.test', '',
    now(), now(), now()
  );

insert into public.admin_profiles (user_id, display_name, role, is_active)
values
  ('55555555-5555-5555-5555-555555555555', 'Storage Admin', 'owner', true),
  ('66666666-6666-6666-6666-666666666666', 'Inactive Storage Admin', 'editor', false);

insert into storage.objects (bucket_id, name, metadata)
values (
  'site-media',
  'archive/tests/existing.webp',
  '{"mimetype":"image/webp","size":128}'::jsonb
);

set local role anon;

select results_eq(
  $$select count(*) from storage.objects where bucket_id = 'site-media'$$,
  array[0::bigint],
  'anon cannot list bucket contents'
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name) values
    ('site-media', 'products/1/anon.webp')$$,
  '42501',
  null,
  'anon cannot upload'
);

reset role;

select is(
  (
    select count(*) from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'DELETE'
      and ('anon' = any (roles) or 'public' = any (roles))
  ),
  0::bigint,
  'anon has no delete policy'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '66666666-6666-6666-6666-666666666666',
  true
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name) values
    ('site-media', 'products/1/inactive.webp')$$,
  '42501',
  null,
  'inactive admin cannot upload'
);

select set_config(
  'request.jwt.claim.sub',
  '55555555-5555-5555-5555-555555555555',
  true
);

select lives_ok(
  $$insert into storage.objects (bucket_id, name, metadata) values
    ('site-media', 'products/1/admin.webp', '{"mimetype":"image/webp","size":128}'::jsonb)$$,
  'active admin can upload to an allowed folder'
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name) values
    ('site-media', 'unknown/admin.webp')$$,
  '42501',
  null,
  'admin cannot upload outside approved folders'
);

reset role;

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'site_media_admin_delete_archive'
      and cmd = 'DELETE'
      and 'authenticated' = any (roles)
      and qual like '%archive%'
  ),
  'only authenticated admins receive the archive delete policy'
);

select * from finish();
rollback;
