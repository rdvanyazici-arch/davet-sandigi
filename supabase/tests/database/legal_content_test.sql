begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values (
  '77777777-7777-7777-7777-777777777775',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'legal-owner@example.test',
  '',
  now(),
  now(),
  now()
);

insert into public.admin_profiles (user_id, display_name, role, is_active)
values ('77777777-7777-7777-7777-777777777775', 'Legal Owner', 'owner', true);

-- The approved legal-content migration seeds this key. Isolate the publication
-- guard scenario inside the transaction without changing persisted seed data.
delete from public.content_sections where section_key = 'legal_privacy';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777775","aal":"aal2","role":"authenticated"}',
  true
);

select lives_ok(
  $$insert into public.content_sections (section_key, title, body, content_json, is_active)
    values ('legal_privacy', 'Gizlilik Politikası', 'Hukuk danışmanı onayı bekliyor. [TAMAMLANACAK]',
      '{"legal_document":true,"legal_review_approved":false,"legal_status":"draft"}', false)$$,
  'legal draft can be saved inactive'
);

select throws_ok(
  $$update public.content_sections set is_active = true where section_key = 'legal_privacy'$$,
  '23514', null, 'unapproved legal draft cannot be published'
);

select throws_ok(
  $$update public.content_sections
    set content_json = '{"legal_document":true,"legal_review_approved":true,"legal_status":"lawyer_approved"}',
        is_active = true
    where section_key = 'legal_privacy'$$,
  '23514', null, 'placeholder legal text cannot be published'
);

select lives_ok(
  $$update public.content_sections
    set body = 'Hukuk danışmanı tarafından onaylanan son metin.',
        content_json = '{"legal_document":true,"legal_review_approved":true,"legal_status":"lawyer_approved"}',
        is_active = true
    where section_key = 'legal_privacy'$$,
  'approved complete legal text can be published'
);

set local role anon;
select is(
  (select count(*) from public.content_sections where section_key = 'legal_privacy'),
  1::bigint,
  'anon can read approved active legal text'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777775","aal":"aal2","role":"authenticated"}',
  true
);
update public.content_sections set is_active = false where section_key = 'legal_privacy';

set local role anon;
select is(
  (select count(*) from public.content_sections where section_key = 'legal_privacy'),
  0::bigint,
  'anon cannot read inactive legal text'
);
select ok(
  not has_table_privilege('anon', 'public.content_sections', 'INSERT')
  and not has_table_privilege('anon', 'public.content_sections', 'UPDATE')
  and not has_table_privilege('anon', 'public.content_sections', 'DELETE'),
  'anon cannot write legal content'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777775","aal":"aal2","role":"authenticated"}',
  true
);
select throws_ok(
  $$insert into public.content_sections (section_key, title) values ('legal_unknown', 'Unknown')$$,
  '23514', null, 'unknown legal section key is rejected'
);

select * from finish();
rollback;
