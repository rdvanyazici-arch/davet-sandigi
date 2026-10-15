create or replace function public.save_product_draft(
  p_product_id bigint,
  p_payload jsonb
)
returns table (draft_id bigint, product_id bigint)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_product_id bigint := p_product_id;
begin
  if jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Product draft payload must be an object.' using errcode = '22023';
  end if;

  if v_product_id is null then
    insert into public.products (
      category_id, slug, sku, name, short_description, description, price,
      is_price_visible, is_quote_only, min_quantity, quantity_step,
      is_featured, is_active, sort_order, seo_title, seo_description
    ) values (
      nullif(p_payload ->> 'category_id', '')::bigint,
      nullif(btrim(p_payload ->> 'slug'), ''),
      nullif(btrim(p_payload ->> 'sku'), ''),
      nullif(btrim(p_payload ->> 'name'), ''),
      nullif(btrim(p_payload ->> 'short_description'), ''),
      nullif(btrim(p_payload ->> 'description'), ''),
      nullif(p_payload ->> 'price', '')::numeric,
      coalesce((p_payload ->> 'is_price_visible')::boolean, true),
      coalesce((p_payload ->> 'is_quote_only')::boolean, false),
      greatest(coalesce((p_payload ->> 'min_quantity')::integer, 1), 1),
      greatest(coalesce((p_payload ->> 'quantity_step')::integer, 1), 1),
      coalesce((p_payload ->> 'is_featured')::boolean, false),
      false,
      coalesce((p_payload ->> 'sort_order')::integer, 0),
      nullif(btrim(p_payload ->> 'seo_title'), ''),
      nullif(btrim(p_payload ->> 'seo_description'), '')
    )
    returning id into v_product_id;
  elsif not exists (select 1 from public.products where id = v_product_id) then
    raise exception 'Product not found.' using errcode = 'P0002';
  end if;

  insert into public.product_drafts (product_id, payload, created_by)
  values (v_product_id, p_payload, (select auth.uid()))
  on conflict on constraint product_drafts_product_id_key do update
    set payload = excluded.payload,
        created_by = excluded.created_by
  returning public.product_drafts.id, public.product_drafts.product_id
  into draft_id, product_id;

  return next;
end;
$$;

revoke all on function public.save_product_draft(bigint, jsonb) from public, anon;
grant execute on function public.save_product_draft(bigint, jsonb) to authenticated;
