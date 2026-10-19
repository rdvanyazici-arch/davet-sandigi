-- Keep public image metadata readable without exposing uploader identity or file hashes.
revoke select on public.media_assets from anon;
grant select (
  id, storage_path, original_name, mime_type, file_size, width, height,
  alt_text, usage_type, status, created_at, updated_at, archived_at
) on public.media_assets to anon;

create or replace function public.delete_empty_product_draft(p_product_id bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
begin
  if not (select private.is_owner()) then
    raise exception 'Owner permission required.' using errcode = '42501';
  end if;

  select pd.payload into v_payload
  from public.product_drafts pd
  join public.products p on p.id = pd.product_id
  where pd.product_id = p_product_id
    and not p.is_active
    and p.archived_at is null
    and nullif(btrim(p.name), '') is null
    and nullif(btrim(p.sku), '') is null
    and nullif(btrim(p.slug), '') is null
    and not exists (
      select 1 from public.product_images pi where pi.product_id = p_product_id
    )
  for update of pd, p;

  if not found
    or nullif(btrim(v_payload ->> 'name'), '') is not null
    or nullif(btrim(v_payload ->> 'sku'), '') is not null
    or jsonb_typeof(coalesce(v_payload -> 'images', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(v_payload -> 'images', '[]'::jsonb)) > 0 then
    raise exception 'Only an unpublished empty draft can be deleted.' using errcode = '23514';
  end if;

  delete from public.product_drafts where product_id = p_product_id;
  delete from public.products where id = p_product_id;
  return true;
end;
$$;

revoke all on function public.delete_empty_product_draft(bigint) from public, anon;
grant execute on function public.delete_empty_product_draft(bigint) to authenticated;

comment on function public.delete_empty_product_draft(bigint) is
  'Owner-only cleanup for never-published placeholder rows with no name, SKU, slug or images. Published and meaningful products remain archive-only.';
