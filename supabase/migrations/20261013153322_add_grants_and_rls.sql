create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = (select auth.uid())
      and ap.is_active
      and ap.role in ('owner', 'editor')
  );
$$;

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = (select auth.uid())
      and ap.is_active
      and ap.role = 'owner'
  );
$$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_owner() to authenticated;

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;
alter table public.media_assets enable row level security;
alter table public.product_images enable row level security;
alter table public.banners enable row level security;
alter table public.content_sections enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;

grant select on public.site_settings_public to anon, authenticated;

grant select on
  public.categories,
  public.collections,
  public.products,
  public.product_collections,
  public.media_assets,
  public.product_images,
  public.banners,
  public.content_sections,
  public.testimonials,
  public.faqs
to anon, authenticated;

grant select, insert, update, delete on public.admin_profiles to authenticated;
grant select, update on public.site_settings to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.collections to authenticated;
grant select, insert, update on public.products to authenticated;
grant select, insert, update, delete on public.product_collections to authenticated;
grant select, insert, update on public.media_assets to authenticated;
grant select, insert, update, delete on public.product_images to authenticated;
grant select, insert, update, delete on public.banners to authenticated;
grant select, insert, update, delete on public.content_sections to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;
grant select, insert, update, delete on public.faqs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy admin_profiles_select_self_or_owner
on public.admin_profiles
for select
to authenticated
using (user_id = (select auth.uid()) or (select private.is_owner()));

create policy admin_profiles_insert_owner
on public.admin_profiles
for insert
to authenticated
with check ((select private.is_owner()));

create policy admin_profiles_update_owner
on public.admin_profiles
for update
to authenticated
using ((select private.is_owner()))
with check ((select private.is_owner()));

create policy admin_profiles_delete_owner
on public.admin_profiles
for delete
to authenticated
using ((select private.is_owner()));

create policy site_settings_select_admin
on public.site_settings
for select
to authenticated
using ((select private.is_admin()));

create policy site_settings_update_admin
on public.site_settings
for update
to authenticated
using ((select private.is_admin()))
with check (id = 1 and (select private.is_admin()));

create policy categories_select_public
on public.categories
for select
to anon, authenticated
using (is_active);

create policy categories_select_admin
on public.categories
for select
to authenticated
using ((select private.is_admin()));

create policy categories_insert_admin
on public.categories
for insert
to authenticated
with check ((select private.is_admin()));

create policy categories_update_admin
on public.categories
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy categories_delete_admin
on public.categories
for delete
to authenticated
using ((select private.is_admin()));

create policy collections_select_public
on public.collections
for select
to anon, authenticated
using (is_active);

create policy collections_select_admin
on public.collections
for select
to authenticated
using ((select private.is_admin()));

create policy collections_insert_admin
on public.collections
for insert
to authenticated
with check ((select private.is_admin()));

create policy collections_update_admin
on public.collections
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy collections_delete_admin
on public.collections
for delete
to authenticated
using ((select private.is_admin()));

create policy products_select_public
on public.products
for select
to anon, authenticated
using (is_active and archived_at is null);

create policy products_select_admin
on public.products
for select
to authenticated
using ((select private.is_admin()));

create policy products_insert_admin
on public.products
for insert
to authenticated
with check ((select private.is_admin()));

create policy products_update_admin
on public.products
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy product_collections_select_public
on public.product_collections
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id
      and p.is_active
      and p.archived_at is null
  )
  and exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.is_active
  )
);

create policy product_collections_select_admin
on public.product_collections
for select
to authenticated
using ((select private.is_admin()));

create policy product_collections_insert_admin
on public.product_collections
for insert
to authenticated
with check ((select private.is_admin()));

create policy product_collections_update_admin
on public.product_collections
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy product_collections_delete_admin
on public.product_collections
for delete
to authenticated
using ((select private.is_admin()));

create policy media_assets_select_public
on public.media_assets
for select
to anon, authenticated
using (
  status = 'active'
  and archived_at is null
);

create policy media_assets_select_admin
on public.media_assets
for select
to authenticated
using ((select private.is_admin()));

create policy media_assets_insert_admin
on public.media_assets
for insert
to authenticated
with check ((select private.is_admin()));

create policy media_assets_update_admin
on public.media_assets
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy product_images_select_public
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id
      and p.is_active
      and p.archived_at is null
  )
  and exists (
    select 1
    from public.media_assets ma
    where ma.id = media_id
      and ma.status = 'active'
      and ma.archived_at is null
  )
);

create policy product_images_select_admin
on public.product_images
for select
to authenticated
using ((select private.is_admin()));

create policy product_images_insert_admin
on public.product_images
for insert
to authenticated
with check ((select private.is_admin()));

create policy product_images_update_admin
on public.product_images
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy product_images_delete_admin
on public.product_images
for delete
to authenticated
using ((select private.is_admin()));

create policy banners_select_public
on public.banners
for select
to anon, authenticated
using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

create policy banners_select_admin
on public.banners
for select
to authenticated
using ((select private.is_admin()));

create policy banners_insert_admin
on public.banners
for insert
to authenticated
with check ((select private.is_admin()));

create policy banners_update_admin
on public.banners
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy banners_delete_admin
on public.banners
for delete
to authenticated
using ((select private.is_admin()));

create policy content_sections_select_public
on public.content_sections
for select
to anon, authenticated
using (is_active);

create policy content_sections_select_admin
on public.content_sections
for select
to authenticated
using ((select private.is_admin()));

create policy content_sections_insert_admin
on public.content_sections
for insert
to authenticated
with check ((select private.is_admin()));

create policy content_sections_update_admin
on public.content_sections
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy content_sections_delete_admin
on public.content_sections
for delete
to authenticated
using ((select private.is_admin()));

create policy testimonials_select_public
on public.testimonials
for select
to anon, authenticated
using (is_published and consent_confirmed);

create policy testimonials_select_admin
on public.testimonials
for select
to authenticated
using ((select private.is_admin()));

create policy testimonials_insert_admin
on public.testimonials
for insert
to authenticated
with check ((select private.is_admin()));

create policy testimonials_update_admin
on public.testimonials
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy testimonials_delete_admin
on public.testimonials
for delete
to authenticated
using ((select private.is_admin()));

create policy faqs_select_public
on public.faqs
for select
to anon, authenticated
using (is_active);

create policy faqs_select_admin
on public.faqs
for select
to authenticated
using ((select private.is_admin()));

create policy faqs_insert_admin
on public.faqs
for insert
to authenticated
with check ((select private.is_admin()));

create policy faqs_update_admin
on public.faqs
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy faqs_delete_admin
on public.faqs
for delete
to authenticated
using ((select private.is_admin()));

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;
