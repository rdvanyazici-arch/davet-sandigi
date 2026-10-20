create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id text not null,
  action text not null check (action in ('insert', 'update', 'archive', 'delete')),
  actor_id uuid,
  summary text not null,
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index admin_audit_log_record_idx
  on public.admin_audit_log (table_name, row_id);

create index admin_audit_log_actor_idx
  on public.admin_audit_log (actor_id);

alter table public.admin_audit_log enable row level security;

revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create policy admin_audit_log_select_admin
on public.admin_audit_log
for select
to authenticated
using ((select private.is_admin()));

create or replace function private.audit_build_changes(
  p_table_name text,
  p_old jsonb,
  p_new jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_changes jsonb := '{}'::jsonb;
  v_key text;
  v_old_value jsonb;
  v_new_value jsonb;
  v_masked boolean;
begin
  for v_key in
    select key
    from (
      select jsonb_object_keys(coalesce(p_old, '{}'::jsonb)) as key
      union
      select jsonb_object_keys(coalesce(p_new, '{}'::jsonb)) as key
    ) keys
    order by key
  loop
    if v_key in ('created_at', 'updated_at', 'updated_by') then
      continue;
    end if;

    v_old_value := coalesce(p_old -> v_key, 'null'::jsonb);
    v_new_value := coalesce(p_new -> v_key, 'null'::jsonb);

    if v_old_value = v_new_value then
      continue;
    end if;

    v_masked := v_key in (
      'description', 'body', 'content_json', 'payload', 'review_text',
      'email', 'phone', 'whatsapp_number', 'customer_display_name',
      'event_name', 'created_by', 'file_hash'
    );

    if v_masked then
      v_changes := v_changes || jsonb_build_object(v_key, jsonb_build_object('changed', true));
    else
      v_changes := v_changes || jsonb_build_object(
        v_key,
        jsonb_build_object('old', v_old_value, 'new', v_new_value)
      );
    end if;
  end loop;

  return v_changes;
end;
$$;

create or replace function private.audit_merge_changes(
  p_existing jsonb,
  p_incoming jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_result jsonb := coalesce(p_existing, '{}'::jsonb);
  v_key text;
  v_value jsonb;
  v_old jsonb;
  v_new jsonb;
begin
  for v_key, v_value in select key, value from jsonb_each(coalesce(p_incoming, '{}'::jsonb))
  loop
    if v_result ? v_key
      and (v_result -> v_key) ? 'old'
      and v_value ? 'new' then
      v_old := v_result #> array[v_key, 'old'];
      v_new := v_value -> 'new';
      if v_old = v_new then
        v_result := v_result - v_key;
      else
        v_result := v_result || jsonb_build_object(
          v_key,
          jsonb_build_object('old', v_old, 'new', v_new)
        );
      end if;
    else
      v_result := v_result || jsonb_build_object(v_key, v_value);
    end if;
  end loop;
  return v_result;
end;
$$;

create or replace function private.audit_summary(
  p_table_name text,
  p_row jsonb
)
returns text
language sql
immutable
set search_path = ''
as $$
  select left(
    case p_table_name
      when 'products' then concat('Ürün: ', coalesce(nullif(p_row ->> 'name', ''), nullif(p_row ->> 'sku', ''), '#' || (p_row ->> 'id')))
      when 'categories' then concat('Kategori: ', coalesce(nullif(p_row ->> 'name', ''), '#' || (p_row ->> 'id')))
      when 'collections' then concat('Koleksiyon: ', coalesce(nullif(p_row ->> 'name', ''), '#' || (p_row ->> 'id')))
      when 'banners' then concat('Banner: ', coalesce(nullif(p_row ->> 'title', ''), '#' || (p_row ->> 'id')))
      when 'content_sections' then concat('İçerik: ', coalesce(nullif(p_row ->> 'title', ''), p_row ->> 'section_key'))
      when 'faqs' then concat('SSS: ', coalesce(nullif(p_row ->> 'question', ''), '#' || (p_row ->> 'id')))
      when 'testimonials' then concat('Yorum #', (p_row ->> 'id'))
      when 'site_settings' then 'Site ayarları'
      when 'media_assets' then concat('Görsel: ', coalesce(nullif(p_row ->> 'original_name', ''), '#' || (p_row ->> 'id')))
      when 'product_images' then concat('Ürün görseli #', (p_row ->> 'id'))
      when 'admin_profiles' then concat('Yönetici: ', coalesce(nullif(p_row ->> 'display_name', ''), p_row ->> 'user_id'))
      else concat(p_table_name, ' #', coalesce(p_row ->> 'id', p_row ->> 'user_id'))
    end,
    200
  );
$$;

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  v_new jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_row_id text;
  v_action text := lower(tg_op);
  v_actor_id uuid := auth.uid();
  v_summary text;
  v_changes jsonb;
  v_existing_id bigint;
  v_existing_changes jsonb;
begin
  v_row_id := coalesce(v_row ->> 'id', v_row ->> 'user_id');
  v_summary := private.audit_summary(tg_table_name, v_row);
  v_changes := private.audit_build_changes(tg_table_name, v_old, v_new);

  if tg_op = 'UPDATE'
    and coalesce(v_old ->> 'archived_at', '') = ''
    and coalesce(v_new ->> 'archived_at', '') <> '' then
    v_action := 'archive';
  end if;

  if v_changes = '{}'::jsonb then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'UPDATE' then
    select id, changes
      into v_existing_id, v_existing_changes
    from public.admin_audit_log
    where table_name = tg_table_name
      and row_id = v_row_id
      and actor_id is not distinct from v_actor_id
      and created_at = transaction_timestamp()
      and action in ('update', 'archive')
    order by id desc
    limit 1
    for update;

    if found then
      v_changes := private.audit_merge_changes(v_existing_changes, v_changes);
      if v_changes = '{}'::jsonb then
        delete from public.admin_audit_log where id = v_existing_id;
      else
        update public.admin_audit_log
        set action = v_action,
            summary = v_summary,
            changes = v_changes
        where id = v_existing_id;
      end if;
      return new;
    end if;
  end if;

  insert into public.admin_audit_log (
    table_name, row_id, action, actor_id, summary, changes, created_at
  ) values (
    tg_table_name, v_row_id, v_action, v_actor_id, v_summary, v_changes, transaction_timestamp()
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function private.audit_product_draft_publish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.products p
    where p.id = old.product_id
      and p.is_active
      and p.archived_at is null
  ) then
    insert into public.admin_audit_log (
      table_name, row_id, action, actor_id, summary, changes
    ) values (
      'product_drafts',
      old.id::text,
      'update',
      auth.uid(),
      'Ürün taslağı yayınlandı',
      jsonb_build_object(
        'published_product_id',
        jsonb_build_object('old', 'null'::jsonb, 'new', to_jsonb(old.product_id))
      )
    );
  end if;
  return old;
end;
$$;

create trigger audit_products
after insert or update or delete on public.products
for each row execute function private.audit_row_change();

create trigger audit_categories
after insert or update or delete on public.categories
for each row execute function private.audit_row_change();

create trigger audit_collections
after insert or update or delete on public.collections
for each row execute function private.audit_row_change();

create trigger audit_banners
after insert or update or delete on public.banners
for each row execute function private.audit_row_change();

create trigger audit_content_sections
after insert or update or delete on public.content_sections
for each row execute function private.audit_row_change();

create trigger audit_testimonials
after insert or update or delete on public.testimonials
for each row execute function private.audit_row_change();

create trigger audit_faqs
after insert or update or delete on public.faqs
for each row execute function private.audit_row_change();

create trigger audit_site_settings
after insert or update or delete on public.site_settings
for each row execute function private.audit_row_change();

create trigger audit_media_assets
after insert or update or delete on public.media_assets
for each row execute function private.audit_row_change();

create trigger audit_product_images
after insert or update or delete on public.product_images
for each row execute function private.audit_row_change();

create trigger audit_admin_profiles
after insert or update or delete on public.admin_profiles
for each row execute function private.audit_row_change();

create trigger audit_product_draft_publication
after delete on public.product_drafts
for each row execute function private.audit_product_draft_publish();

create or replace function private.cleanup_admin_audit_log()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted bigint;
begin
  delete from public.admin_audit_log
  where created_at < now() - interval '180 days';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function private.audit_build_changes(text, jsonb, jsonb) from public, anon, authenticated;
revoke all on function private.audit_merge_changes(jsonb, jsonb) from public, anon, authenticated;
revoke all on function private.audit_summary(text, jsonb) from public, anon, authenticated;
revoke all on function private.audit_row_change() from public, anon, authenticated;
revoke all on function private.audit_product_draft_publish() from public, anon, authenticated;
revoke all on function private.cleanup_admin_audit_log() from public, anon, authenticated;

comment on function private.cleanup_admin_audit_log() is
  'Deletes audit rows older than 180 days. Scheduling is intentionally not configured by this migration.';
