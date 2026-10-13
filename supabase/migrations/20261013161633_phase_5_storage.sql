insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-media',
  'site-media',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.media_assets
  drop constraint if exists media_assets_mime_type_check;

alter table public.media_assets
  add constraint media_assets_mime_type_check
  check (mime_type in ('image/jpeg', 'image/png', 'image/webp'));

alter table public.media_assets
  add column if not exists file_hash text;

alter table public.media_assets
  add constraint media_assets_file_hash_format_check
  check (file_hash is null or file_hash ~ '^[0-9a-f]{64}$');

alter table public.media_assets
  add constraint media_assets_alt_text_required_check
  check (length(btrim(coalesce(alt_text, ''))) > 0);

alter table public.media_assets
  add constraint media_assets_storage_root_check
  check (
    split_part(storage_path, '/', 1) in (
      'products', 'collections', 'banners', 'story',
      'testimonials', 'campaigns', 'brand', 'archive'
    )
  );

alter table public.media_assets
  add constraint media_assets_archive_path_check
  check (
    (status = 'active' and split_part(storage_path, '/', 1) <> 'archive')
    or (status = 'archived' and split_part(storage_path, '/', 1) = 'archive')
  );

create unique index media_assets_file_hash_idx
  on public.media_assets (file_hash)
  where file_hash is not null;

create or replace function private.prevent_unsafe_media_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status <> 'archived' or old.archived_at is null then
    raise exception 'Media must be archived before permanent deletion'
      using errcode = '23514';
  end if;

  if exists (
    select 1 from public.product_images pi where pi.media_id = old.id
  ) or exists (
    select 1 from public.collections c where c.cover_media_id = old.id
  ) or exists (
    select 1 from public.banners b where b.media_id = old.id
  ) or exists (
    select 1 from public.content_sections cs where cs.media_id = old.id
  ) or exists (
    select 1 from public.testimonials t where t.media_id = old.id
  ) then
    raise exception 'Media is still in use'
      using errcode = '23503';
  end if;

  return old;
end;
$$;

create trigger media_assets_prevent_unsafe_delete
before delete on public.media_assets
for each row execute function private.prevent_unsafe_media_delete();

revoke execute on function private.prevent_unsafe_media_delete()
from public, anon, authenticated, service_role;

grant delete on public.media_assets to authenticated;

create policy media_assets_delete_archived_owner
on public.media_assets
for delete
to authenticated
using (
  status = 'archived'
  and archived_at is not null
  and (select private.is_owner())
);

drop policy if exists site_media_admin_select on storage.objects;
drop policy if exists site_media_admin_insert on storage.objects;
drop policy if exists site_media_admin_update on storage.objects;
drop policy if exists site_media_admin_delete_archive on storage.objects;

create policy site_media_admin_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-media'
  and (select private.is_admin())
);

create policy site_media_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) in (
    'products', 'collections', 'banners', 'story',
    'testimonials', 'campaigns', 'brand', 'archive'
  )
  and (select private.is_admin())
);

create policy site_media_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and (select private.is_admin())
)
with check (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) in (
    'products', 'collections', 'banners', 'story',
    'testimonials', 'campaigns', 'brand', 'archive'
  )
  and (select private.is_admin())
);

create policy site_media_admin_delete_archive
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and split_part(name, '/', 1) = 'archive'
  and (select private.is_admin())
);

comment on table public.media_assets is
  'SVG is intentionally disabled for showroom media. If vector logos become necessary, use a separate admin-only bucket after security review.';
