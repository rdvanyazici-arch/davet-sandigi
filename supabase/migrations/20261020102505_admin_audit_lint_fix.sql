create or replace function private.audit_build_changes(
  p_table_name text,
  p_old jsonb,
  p_new jsonb
)
returns jsonb
language plpgsql
stable
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
      'customer_display_name', 'event_name', 'created_by', 'file_hash'
    ) or (
      p_table_name = 'site_settings'
      and v_key in ('email', 'phone', 'whatsapp_number')
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
stable
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

revoke all on function private.audit_build_changes(text, jsonb, jsonb) from public, anon, authenticated;
revoke all on function private.audit_merge_changes(jsonb, jsonb) from public, anon, authenticated;
