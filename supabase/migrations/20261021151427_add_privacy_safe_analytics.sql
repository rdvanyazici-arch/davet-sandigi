alter table public.site_settings
  add column analytics_enabled boolean not null default false;

drop view public.site_settings_public;
create view public.site_settings_public
with (security_barrier = true, security_invoker = true)
as
select
  id,
  brand_name,
  whatsapp_number,
  instagram_url,
  phone,
  email,
  delivery_text,
  currency_code,
  default_min_quantity,
  default_quantity_step,
  quote_threshold,
  shipping_note,
  is_maintenance_mode,
  analytics_enabled,
  updated_at
from public.site_settings
where id = 1;

comment on view public.site_settings_public is
  'Public projection of site settings, including the analytics feature flag. The base table remains admin-managed.';

grant select on public.site_settings_public to anon, authenticated;
grant select (
  id, brand_name, whatsapp_number, instagram_url, phone, email,
  delivery_text, currency_code, default_min_quantity,
  default_quantity_step, quote_threshold, shipping_note,
  is_maintenance_mode, analytics_enabled, updated_at
) on public.site_settings to anon, authenticated;

create table public.analytics_daily (
  id bigint generated always as identity primary key,
  day date not null,
  event_type text not null check (event_type in (
    'product_view', 'add_to_cart', 'whatsapp_request',
    'instagram_click', 'page_view'
  )),
  product_id bigint references public.products(id) on delete set null,
  source text not null check (source in ('instagram', 'google', 'direct', 'other')),
  device text not null check (device in ('mobile', 'desktop')),
  count integer not null default 0 check (count >= 0),
  constraint analytics_daily_dimensions_key
    unique nulls not distinct (day, event_type, product_id, source, device),
  constraint analytics_daily_product_event_check check (
    (event_type in ('product_view', 'add_to_cart') and product_id is not null)
    or (event_type in ('whatsapp_request', 'instagram_click', 'page_view') and product_id is null)
  )
);

create index analytics_daily_day_idx on public.analytics_daily (day desc);
create index analytics_daily_product_id_idx
  on public.analytics_daily (product_id, day desc)
  where product_id is not null;

alter table public.analytics_daily enable row level security;
revoke all on public.analytics_daily from public, anon, authenticated;
revoke all on sequence public.analytics_daily_id_seq from public, anon, authenticated;
grant select on public.analytics_daily to authenticated;

create policy analytics_daily_select_admin
on public.analytics_daily
for select
to authenticated
using ((select private.is_admin()));

create table private.analytics_rate_limits (
  bucket_hash text primary key,
  request_count integer not null default 0 check (request_count >= 0),
  expires_at timestamptz not null
);

create index analytics_rate_limits_expires_at_idx
  on private.analytics_rate_limits (expires_at);

revoke all on private.analytics_rate_limits from public, anon, authenticated;

create or replace function public.record_analytics_event(
  p_event_type text,
  p_product_id bigint,
  p_source text,
  p_device text,
  p_rate_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  rate_count integer;
  active_product boolean;
begin
  if p_event_type not in (
    'product_view', 'add_to_cart', 'whatsapp_request',
    'instagram_click', 'page_view'
  ) then
    raise exception 'Invalid analytics event.' using errcode = '22023';
  end if;

  if p_source not in ('instagram', 'google', 'direct', 'other')
    or p_device not in ('mobile', 'desktop')
    or p_rate_key is null
    or length(p_rate_key) <> 64 then
    raise exception 'Invalid analytics dimensions.' using errcode = '22023';
  end if;

  if p_event_type in ('product_view', 'add_to_cart') then
    if p_product_id is null then
      raise exception 'Product is required for this event.' using errcode = '22023';
    end if;
    select exists (
      select 1 from public.products p
      where p.id = p_product_id and p.is_active and p.archived_at is null
    ) into active_product;
    if not active_product then
      raise exception 'Product is not active.' using errcode = '22023';
    end if;
  elsif p_product_id is not null then
    raise exception 'Product is not accepted for this event.' using errcode = '22023';
  end if;

  delete from private.analytics_rate_limits where expires_at <= now();
  insert into private.analytics_rate_limits (bucket_hash, request_count, expires_at)
  values (p_rate_key, 1, now() + interval '10 minutes')
  on conflict (bucket_hash) do update
    set request_count = least(private.analytics_rate_limits.request_count + 1, 121),
        -- İlk istekte başlayan pencereyi uzatma; aksi halde yoğun trafikte
        -- aynı kimlik süresiz olarak kilitli kalabilir.
        expires_at = private.analytics_rate_limits.expires_at
  returning request_count into rate_count;

  if rate_count > 120 then
    return jsonb_build_object('accepted', false, 'reason', 'rate_limited');
  end if;

  insert into public.analytics_daily (
    day, event_type, product_id, source, device, count
  ) values (
    (now() at time zone 'Europe/Istanbul')::date,
    p_event_type,
    p_product_id,
    p_source,
    p_device,
    1
  )
  on conflict on constraint analytics_daily_dimensions_key do update
    set count = public.analytics_daily.count + 1;

  return jsonb_build_object('accepted', true);
end;
$$;

revoke all on function public.record_analytics_event(text,bigint,text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_analytics_event(text,bigint,text,text,text)
  to service_role;

create or replace function public.admin_analytics_summary(p_days integer default 30)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  start_day date;
  result jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;
  if p_days not in (7, 30, 90) then
    raise exception 'Date range must be 7, 30 or 90 days.' using errcode = '22023';
  end if;

  start_day := (now() at time zone 'Europe/Istanbul')::date - (p_days - 1);

  with filtered as (
    select * from public.analytics_daily where day >= start_day
  ),
  totals as (
    select event_type, coalesce(sum(count), 0)::bigint total
    from filtered group by event_type
  ),
  daily as (
    select day, event_type, sum(count)::bigint total
    from filtered group by day, event_type order by day, event_type
  ),
  sources as (
    select source, sum(count)::bigint total
    from filtered where event_type = 'page_view'
    group by source order by total desc, source
  ),
  devices as (
    select device, sum(count)::bigint total
    from filtered where event_type = 'page_view'
    group by device order by total desc, device
  ),
  product_rows as (
    select p.id, p.name, p.sku,
      coalesce(sum(f.count) filter (where f.event_type = 'product_view'), 0)::bigint views,
      coalesce(sum(f.count) filter (where f.event_type = 'add_to_cart'), 0)::bigint adds
    from public.products p
    join filtered f on f.product_id = p.id
    group by p.id, p.name, p.sku
    order by views desc, adds desc, p.name
    limit 50
  ),
  collection_rows as (
    select c.id, c.name,
      coalesce(sum(f.count) filter (where f.event_type = 'product_view'), 0)::bigint views,
      coalesce(sum(f.count) filter (where f.event_type = 'add_to_cart'), 0)::bigint adds
    from public.collections c
    join public.product_collections pc on pc.collection_id = c.id
    join filtered f on f.product_id = pc.product_id
    group by c.id, c.name
    order by views desc, adds desc, c.name
    limit 20
  )
  select jsonb_build_object(
    'days', p_days,
    'total_events', (select coalesce(sum(total), 0) from totals),
    'totals', coalesce((select jsonb_object_agg(event_type, total) from totals), '{}'::jsonb),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('day',day,'event_type',event_type,'count',total)) from daily), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('source',source,'count',total)) from sources), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('device',device,'count',total)) from devices), '[]'::jsonb),
    'products', coalesce((select jsonb_agg(to_jsonb(product_rows)) from product_rows), '[]'::jsonb),
    'collections', coalesce((select jsonb_agg(to_jsonb(collection_rows)) from collection_rows), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_analytics_summary(integer)
  from public, anon;
grant execute on function public.admin_analytics_summary(integer)
  to authenticated;

create or replace function private.cleanup_analytics_data()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.analytics_daily
  where day < (now() at time zone 'Europe/Istanbul')::date - 400;
  get diagnostics deleted_count = row_count;
  delete from private.analytics_rate_limits where expires_at <= now();
  return deleted_count;
end;
$$;

revoke all on function private.cleanup_analytics_data() from public, anon, authenticated;
grant execute on function private.cleanup_analytics_data() to service_role;
