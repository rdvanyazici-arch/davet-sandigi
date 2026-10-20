create or replace function private.guard_admin_profile_invariants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_removes_active_owner boolean := false;
  v_other_active_owners integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('admin_profiles_owner_guard', 0)
  );

  if tg_op = 'DELETE' then
    v_removes_active_owner := old.role = 'owner' and old.is_active;
  elsif tg_op = 'UPDATE' then
    v_removes_active_owner := old.role = 'owner'
      and old.is_active
      and (new.role <> 'owner' or not new.is_active);
  end if;

  if v_removes_active_owner and v_actor = old.user_id then
    raise exception 'You cannot lower or deactivate your own owner role.'
      using errcode = '42501';
  end if;

  if v_removes_active_owner then
    select count(*)::integer
      into v_other_active_owners
    from public.admin_profiles ap
    where ap.role = 'owner'
      and ap.is_active
      and ap.user_id <> old.user_id;

    if v_other_active_owners = 0 then
      raise exception 'The last active owner cannot be deactivated or demoted.'
        using errcode = '23514';
    end if;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger guard_admin_profile_invariants
before update of role, is_active or delete on public.admin_profiles
for each row execute function private.guard_admin_profile_invariants();

revoke delete on public.admin_profiles from authenticated;
drop policy if exists admin_profiles_delete_owner on public.admin_profiles;

create or replace function public.set_admin_status(
  p_user_id uuid,
  p_role text,
  p_is_active boolean
)
returns public.admin_profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile public.admin_profiles;
begin
  if not (select private.is_owner()) then
    raise exception 'Owner permission with MFA is required.' using errcode = '42501';
  end if;

  if p_role not in ('owner', 'editor') then
    raise exception 'Role must be owner or editor.' using errcode = '22023';
  end if;

  update public.admin_profiles
  set role = p_role,
      is_active = p_is_active
  where user_id = p_user_id
  returning * into v_profile;

  if not found then
    raise exception 'Admin profile not found.' using errcode = 'P0002';
  end if;

  return v_profile;
end;
$$;

create or replace function public.add_admin_profile(
  p_user_id uuid,
  p_display_name text,
  p_role text
)
returns public.admin_profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile public.admin_profiles;
begin
  if not (select private.is_owner()) then
    raise exception 'Owner permission with MFA is required.' using errcode = '42501';
  end if;

  if p_role not in ('owner', 'editor') then
    raise exception 'Role must be owner or editor.' using errcode = '22023';
  end if;

  if nullif(btrim(p_display_name), '') is null then
    raise exception 'Display name is required.' using errcode = '22023';
  end if;

  insert into public.admin_profiles (user_id, display_name, role, is_active)
  values (p_user_id, btrim(p_display_name), p_role, true)
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function private.guard_admin_profile_invariants() from public, anon, authenticated;
revoke all on function public.set_admin_status(uuid, text, boolean) from public, anon;
revoke all on function public.add_admin_profile(uuid, text, text) from public, anon;
grant execute on function public.set_admin_status(uuid, text, boolean) to authenticated;
grant execute on function public.add_admin_profile(uuid, text, text) to authenticated;

comment on function public.set_admin_status(uuid, text, boolean) is
  'Owner and AAL2-only role/status update. RLS and owner invariant trigger remain authoritative.';

comment on function public.add_admin_profile(uuid, text, text) is
  'Adds an existing Supabase Auth user to admin_profiles. It never creates an Auth account.';
