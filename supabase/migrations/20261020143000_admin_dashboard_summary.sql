create index if not exists banners_active_starts_at_idx
  on public.banners (starts_at)
  where is_active and starts_at is not null;

create index if not exists banners_active_ends_at_idx
  on public.banners (ends_at)
  where is_active and ends_at is not null;

create or replace function public.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not private.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  with
  active_products as (
    select p.*
    from public.products p
    where p.is_active and p.archived_at is null
  ),
  missing_primary as (
    select p.id, coalesce(nullif(btrim(p.name), ''), nullif(btrim(p.sku), ''), 'İsimsiz ürün') as name
    from active_products p
    where not exists (
      select 1
      from public.product_images pi
      join public.media_assets ma on ma.id = pi.media_id
      where pi.product_id = p.id
        and pi.is_primary
        and ma.status = 'active'
        and ma.archived_at is null
    )
  ),
  missing_alt as (
    select ma.id, ma.original_name as name
    from public.media_assets ma
    where ma.status = 'active'
      and ma.archived_at is null
      and (
        btrim(coalesce(ma.alt_text, '')) = ''
        or exists (
          select 1
          from public.product_images pi
          where pi.media_id = ma.id
            and btrim(coalesce(pi.alt_text, '')) = ''
        )
      )
  ),
  pending_drafts as (
    select p.id, coalesce(nullif(btrim(p.name), ''), nullif(btrim(p.sku), ''), 'Boş taslak') as name
    from public.product_drafts pd
    join public.products p on p.id = pd.product_id
  ),
  unused_media as (
    select ma.id, ma.original_name as name
    from public.media_assets ma
    where ma.status = 'active'
      and ma.archived_at is null
      and not exists (select 1 from public.product_images pi where pi.media_id = ma.id)
      and not exists (select 1 from public.collections c where c.cover_media_id = ma.id)
      and not exists (select 1 from public.banners b where b.media_id = ma.id)
      and not exists (select 1 from public.content_sections cs where cs.media_id = ma.id)
      and not exists (select 1 from public.testimonials t where t.media_id = ma.id)
  ),
  categoryless as (
    select p.id, coalesce(nullif(btrim(p.name), ''), nullif(btrim(p.sku), ''), 'İsimsiz ürün') as name
    from active_products p
    where p.category_id is null
  ),
  missing_price as (
    select p.id, coalesce(nullif(btrim(p.name), ''), nullif(btrim(p.sku), ''), 'İsimsiz ürün') as name
    from active_products p
    where p.is_price_visible and p.price is null
  ),
  no_collection as (
    select p.id, coalesce(nullif(btrim(p.name), ''), nullif(btrim(p.sku), ''), 'İsimsiz ürün') as name
    from active_products p
    where not exists (
      select 1 from public.product_collections pc where pc.product_id = p.id
    )
  ),
  healthy_products as (
    select p.id
    from active_products p
    where p.category_id is not null
      and (not p.is_price_visible or p.price is not null)
      and exists (select 1 from public.product_collections pc where pc.product_id = p.id)
      and not exists (select 1 from public.product_drafts pd where pd.product_id = p.id)
      and exists (
        select 1
        from public.product_images pi
        join public.media_assets ma on ma.id = pi.media_id
        where pi.product_id = p.id
          and pi.is_primary
          and ma.status = 'active'
          and ma.archived_at is null
          and btrim(coalesce(nullif(pi.alt_text, ''), ma.alt_text, '')) <> ''
      )
  ),
  category_counts as (
    select c.id, c.name, count(p.id)::integer as product_count
    from public.categories c
    left join public.products p on p.category_id = c.id and p.archived_at is null
    where c.archived_at is null
    group by c.id, c.name
    order by count(p.id) desc, c.name
  ),
  collection_counts as (
    select c.id, c.name, count(p.id)::integer as product_count
    from public.collections c
    left join public.product_collections pc on pc.collection_id = c.id
    left join public.products p on p.id = pc.product_id and p.archived_at is null
    where c.archived_at is null
    group by c.id, c.name
    order by count(p.id) desc, c.name
  ),
  recent_changes as (
    select aal.id, aal.table_name, aal.row_id, aal.action, aal.summary,
           aal.created_at, aal.actor_id, ap.display_name as actor_name
    from public.admin_audit_log aal
    left join public.admin_profiles ap on ap.user_id = aal.actor_id
    order by aal.created_at desc, aal.id desc
    limit 10
  ),
  scheduled_banners as (
    select b.id, coalesce(nullif(btrim(b.title), ''), 'Başlıksız banner') as name,
           b.starts_at, b.ends_at
    from public.banners b
    where b.is_active
      and (
        b.starts_at between now() and now() + interval '7 days'
        or b.ends_at between now() and now() + interval '7 days'
      )
    order by least(coalesce(b.starts_at, 'infinity'::timestamptz), coalesce(b.ends_at, 'infinity'::timestamptz))
    limit 5
  )
  select jsonb_build_object(
    'products', jsonb_build_object(
      'published', (select count(*) from active_products),
      'drafts', (select count(*) from public.product_drafts),
      'unpublished', (select count(*) from public.products p where not p.is_active and p.archived_at is null),
      'archived', (select count(*) from public.products p where p.archived_at is not null),
      'total', (select count(*) from public.products)
    ),
    'health', jsonb_build_object(
      'percentage', case
        when (select count(*) from active_products) = 0 then 100
        else round(100.0 * (select count(*) from healthy_products) / (select count(*) from active_products))::integer
      end,
      'healthy_active', (select count(*) from healthy_products),
      'total_active', (select count(*) from active_products),
      'issues', jsonb_build_object(
        'missing_primary', jsonb_build_object(
          'count', (select count(*) from missing_primary),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from missing_primary order by id limit 5) x), '[]'::jsonb)
        ),
        'missing_alt', jsonb_build_object(
          'count', (select count(*) from missing_alt),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from missing_alt order by id limit 5) x), '[]'::jsonb)
        ),
        'pending_drafts', jsonb_build_object(
          'count', (select count(*) from pending_drafts),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from pending_drafts order by id limit 5) x), '[]'::jsonb)
        ),
        'unused_media', jsonb_build_object(
          'count', (select count(*) from unused_media),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from unused_media order by id limit 5) x), '[]'::jsonb)
        ),
        'categoryless', jsonb_build_object(
          'count', (select count(*) from categoryless),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from categoryless order by id limit 5) x), '[]'::jsonb)
        ),
        'missing_price', jsonb_build_object(
          'count', (select count(*) from missing_price),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from missing_price order by id limit 5) x), '[]'::jsonb)
        ),
        'no_collection', jsonb_build_object(
          'count', (select count(*) from no_collection),
          'records', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name) order by x.id) from (select * from no_collection order by id limit 5) x), '[]'::jsonb)
        )
      )
    ),
    'recent_changes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'table_name', r.table_name, 'row_id', r.row_id,
        'action', r.action, 'summary', r.summary, 'created_at', r.created_at,
        'actor_id', r.actor_id, 'actor_name', r.actor_name
      ) order by r.created_at desc, r.id desc)
      from recent_changes r
    ), '[]'::jsonb),
    'categories', jsonb_build_object(
      'total', (select count(*) from category_counts),
      'top', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'product_count', x.product_count) order by x.product_count desc, x.name) from (select * from category_counts limit 5) x), '[]'::jsonb)
    ),
    'collections', jsonb_build_object(
      'total', (select count(*) from collection_counts),
      'top', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'product_count', x.product_count) order by x.product_count desc, x.name) from (select * from collection_counts limit 5) x), '[]'::jsonb)
    ),
    'scheduled_banners', coalesce((
      select jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name, 'starts_at', b.starts_at, 'ends_at', b.ends_at) order by least(coalesce(b.starts_at, 'infinity'::timestamptz), coalesce(b.ends_at, 'infinity'::timestamptz)))
      from scheduled_banners b
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_dashboard_summary() from public, anon;
grant execute on function public.admin_dashboard_summary() to authenticated;
