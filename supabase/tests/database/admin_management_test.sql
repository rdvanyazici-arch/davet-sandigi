begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('a2000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','manager-owner@example.test','',now(),now(),now()),
  ('a2000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','manager-editor@example.test','',now(),now(),now()),
  ('a2000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','manager-new@example.test','',now(),now(),now()),
  ('a2000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','manager-owner2@example.test','',now(),now(),now());

insert into public.admin_profiles (user_id,display_name,role,is_active)
values
  ('a2000000-0000-4000-8000-000000000001','Manager Owner','owner',true),
  ('a2000000-0000-4000-8000-000000000002','Manager Editor','editor',true);

select ok(not has_table_privilege('authenticated','public.admin_profiles','DELETE'),'authenticated cannot permanently delete admin profiles');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000002","aal":"aal1","role":"authenticated"}',true);

select throws_ok(
  $$select public.set_admin_status('a2000000-0000-4000-8000-000000000001','editor',true)$$,
  '42501',null,'editor cannot change admin profiles through RPC'
);
select results_eq(
  $$update public.admin_profiles set is_active=false where user_id='a2000000-0000-4000-8000-000000000001' returning user_id$$,
  array[]::uuid[],
  'editor cannot update admin_profiles directly'
);
select throws_ok(
  $$select public.add_admin_profile('a2000000-0000-4000-8000-000000000003','New Admin','editor')$$,
  '42501',null,'editor cannot add an admin profile'
);

select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select throws_ok(
  $$select public.set_admin_status('a2000000-0000-4000-8000-000000000002','editor',false)$$,
  '42501',null,'owner without aal2 cannot manage admins'
);

select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',true);
select lives_ok(
  $$select public.add_admin_profile('a2000000-0000-4000-8000-000000000003','New Admin','editor')$$,
  'owner with aal2 can add an existing Auth user profile'
);
select results_eq(
  $$select role||':'||is_active::text from public.admin_profiles where user_id='a2000000-0000-4000-8000-000000000003'$$,
  array['editor:true'::text],
  'new admin profile has the requested role and active status'
);
select lives_ok(
  $$select public.set_admin_status('a2000000-0000-4000-8000-000000000003','editor',false)$$,
  'owner with aal2 can deactivate another admin'
);
select throws_ok(
  $$select public.set_admin_status('a2000000-0000-4000-8000-000000000001','editor',true)$$,
  '42501',null,'owner cannot demote their own role'
);
select lives_ok(
  $$select public.add_admin_profile('a2000000-0000-4000-8000-000000000004','Second Owner','owner')$$,
  'owner can add a second owner'
);
select lives_ok(
  $$select public.set_admin_status('a2000000-0000-4000-8000-000000000004','owner',true)$$,
  'second owner remains active'
);

reset role;
select set_config('request.jwt.claims','{}',true);
update public.admin_profiles set is_active=false where user_id='a2000000-0000-4000-8000-000000000001';
select throws_ok(
  $$update public.admin_profiles set is_active=false where user_id='a2000000-0000-4000-8000-000000000004'$$,
  '23514',null,'last active owner is protected at database level'
);

select results_eq(
  $$select count(*) from public.admin_audit_log where table_name='admin_profiles' and action in ('insert','update')$$,
  array[6::bigint],
  'admin profile changes are audited'
);

select * from finish();
rollback;
