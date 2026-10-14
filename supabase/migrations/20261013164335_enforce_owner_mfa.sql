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
      and (
        ap.role = 'editor'
        or (
          ap.role = 'owner'
          and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
        )
      )
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
      and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
  );
$$;

revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_owner() from public, anon;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_owner() to authenticated;

comment on function private.is_admin() is
  'Active editors are authorized at AAL1; active owners require a verified AAL2 MFA session.';
comment on function private.is_owner() is
  'Returns true only for an active owner with a verified AAL2 MFA session.';
