begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
('66666666-6666-6666-6666-666666666661','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hierarchy-owner@example.test','',now(),now(),now()),
('66666666-6666-6666-6666-666666666662','00000000-0000-0000-0000-000000000000','authenticated','authenticated','hierarchy-user@example.test','',now(),now(),now());

insert into public.admin_profiles (user_id, display_name, role, is_active)
values ('66666666-6666-6666-6666-666666666661','Hierarchy Owner','owner',true);

insert into public.categories (id, slug, name, code_prefix, is_active) overriding system value
values (9901,'hierarchy-active','Hierarchy Active','HRA',true),(9902,'hierarchy-hidden','Hierarchy Hidden','HRH',false);
insert into public.collections (id, slug, name, is_active) overriding system value
values (9901,'hierarchy-live','Hierarchy Live',true),(9902,'hierarchy-hidden','Hierarchy Hidden',false);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"66666666-6666-6666-6666-666666666661","aal":"aal2","role":"authenticated"}',true);
select lives_ok($$insert into public.category_collections(category_id,collection_id) values (9901,9901),(9902,9901),(9901,9902)$$,'admin links categories and collections');

set local role anon;
select is((select count(*) from public.category_collections where category_id in (9901,9902) and collection_id in (9901,9902)),1::bigint,'anon sees only active category and collection relation');
select ok(not has_table_privilege('anon','public.category_collections','INSERT'),'anon cannot insert hierarchy');
select ok(not has_table_privilege('anon','public.category_collections','UPDATE'),'anon cannot update hierarchy');
select ok(not has_table_privilege('anon','public.category_collections','DELETE'),'anon cannot delete hierarchy');

reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"66666666-6666-6666-6666-666666666662","aal":"aal2","role":"authenticated"}',true);
select throws_ok($$insert into public.category_collections(category_id,collection_id) values (9902,9902)$$,'42501',null,'non-admin cannot link hierarchy');
select lives_ok($$delete from public.category_collections where category_id=9901 and collection_id=9901$$,'non-admin unlink attempt is safely ignored');

reset role;
select is((select count(*) from public.category_collections where category_id=9901 and collection_id=9901),1::bigint,'non-admin cannot unlink hierarchy');
select ok((select relrowsecurity from pg_class where oid='public.category_collections'::regclass),'hierarchy table has RLS enabled');
select * from finish();
rollback;
