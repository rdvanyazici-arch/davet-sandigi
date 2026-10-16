begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values
  ('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pages-owner@example.test', '', now(), now(), now()),
  ('77777777-7777-7777-7777-777777777772', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pages-inactive@example.test', '', now(), now(), now());

insert into public.admin_profiles (user_id, display_name, role, is_active)
values
  ('77777777-7777-7777-7777-777777777771', 'Pages Owner', 'owner', true),
  ('77777777-7777-7777-7777-777777777772', 'Inactive Editor', 'editor', false);

insert into public.media_assets (
  id, storage_path, original_name, mime_type, file_size, width, height, alt_text, usage_type, status
) overriding system value
values (9701, 'banners/test/hero.webp', 'hero.webp', 'image/webp', 1024, 1600, 700, 'Hero', 'banner', 'active');

insert into public.banners (id, title, media_id, is_active, starts_at, ends_at)
overriding system value
values
  (9701, 'Live', 9701, true, now() - interval '1 day', now() + interval '1 day'),
  (9702, 'Expired', 9701, true, now() - interval '3 day', now() - interval '1 day'),
  (9703, 'Future', 9701, true, now() + interval '1 day', now() + interval '3 day'),
  (9704, 'Draft', 9701, false, null, null);

insert into public.content_sections (section_key, title, content_json, is_active)
values
  ('process', 'Process', '{"steps":[{"title":"A","description":"B"}]}', true),
  ('story', 'Draft story', '{}', false);

insert into public.testimonials (id, customer_display_name, review_text, rating, consent_confirmed, is_published)
overriding system value
values
  (9701, 'Consented', 'Great', 5, true, true),
  (9702, 'No consent', 'Pending', 4, false, false);

insert into public.faqs (id, question, answer, is_active)
overriding system value
values (9701, 'Q1', 'A1', true), (9702, 'Q2', 'A2', false);

select ok(not has_table_privilege('authenticated', 'public.banners', 'DELETE'), 'banners cannot be permanently deleted');
select ok(not has_table_privilege('authenticated', 'public.content_sections', 'DELETE'), 'content sections cannot be permanently deleted');
select ok(not has_table_privilege('authenticated', 'public.testimonials', 'DELETE'), 'testimonials cannot be permanently deleted');
select ok(not has_table_privilege('authenticated', 'public.faqs', 'DELETE'), 'faqs cannot be permanently deleted');
select ok(not has_table_privilege('anon', 'public.banners', 'INSERT')
  and not has_table_privilege('anon', 'public.testimonials', 'UPDATE')
  and not has_table_privilege('anon', 'public.faqs', 'INSERT')
  and not has_table_privilege('anon', 'public.content_sections', 'UPDATE'), 'anon has no write privileges on page content');

set local role anon;
select is((select count(*) from public.banners where id in (9701, 9702, 9703, 9704)), 1::bigint, 'anon sees only the currently scheduled active banner');
select is((select count(*) from public.content_sections where section_key in ('process', 'story')), 1::bigint, 'anon sees only active content sections');
select is((select count(*) from public.testimonials where id in (9701, 9702)), 1::bigint, 'anon sees only consented published testimonials');
select is((select count(*) from public.faqs where id in (9701, 9702)), 1::bigint, 'anon sees only active FAQs');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777771","aal":"aal2","role":"authenticated"}', true);

select is((select count(*) from public.banners where id in (9701, 9702, 9703, 9704)), 4::bigint, 'admin sees every banner');
select lives_ok(
  $$insert into public.faqs (question, answer, is_active) values ('New?', 'Yes.', false)$$,
  'admin can insert a FAQ'
);
select lives_ok(
  $$insert into public.testimonials (customer_display_name, review_text, rating, consent_confirmed, is_published) values ('Okay', 'Nice', 5, true, true)$$,
  'admin can publish a consented testimonial'
);
select throws_ok(
  $$insert into public.testimonials (customer_display_name, review_text, rating, consent_confirmed, is_published) values ('X', 'Nice', 5, false, true)$$,
  '23514', null, 'testimonial cannot be published without consent'
);
select throws_ok(
  $$insert into public.testimonials (customer_display_name, review_text, rating) values ('X', 'Nice', 6)$$,
  '23514', null, 'testimonial rating must be 1 to 5'
);
select throws_ok(
  $$insert into public.banners (title, is_active, media_id, starts_at, ends_at) values ('Bad', true, 9701, now() + interval '2 day', now() + interval '1 day')$$,
  '23514', null, 'banner end must be after start'
);
select throws_ok(
  $$insert into public.banners (title, is_active) values ('No image', true)$$,
  '23514', null, 'active banner requires an image'
);
select throws_ok(
  $$insert into public.banners (title, primary_button_url) values ('Bad link', 'javascript:alert(1)')$$,
  '23514', null, 'banner rejects javascript links'
);
select throws_ok(
  $$insert into public.content_sections (section_key, content_json) values ('process', '{}')$$,
  '23514', null, 'process section requires a steps array'
);
select throws_ok(
  $$insert into public.content_sections (section_key) values ('unknown')$$,
  '23514', null, 'unknown section key is rejected'
);

select set_config('request.jwt.claims', '{"sub":"77777777-7777-7777-7777-777777777772","aal":"aal2","role":"authenticated"}', true);
select throws_ok(
  $$insert into public.faqs (question, answer) values ('Inactive?', 'No.')$$,
  '42501', null, 'inactive admin cannot insert a FAQ'
);

select * from finish();
rollback;
