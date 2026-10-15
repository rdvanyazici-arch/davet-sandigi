alter table public.categories
  add column if not exists archived_at timestamptz;

alter table public.collections
  add column if not exists archived_at timestamptz;

alter table public.categories
  add constraint categories_active_not_archived_check
  check (not is_active or archived_at is null);

alter table public.collections
  add constraint collections_active_not_archived_check
  check (not is_active or archived_at is null);

alter table public.site_settings
  add constraint site_settings_whatsapp_number_check
  check (
    whatsapp_number is null
    or whatsapp_number ~ '^[1-9][0-9]{9,14}$'
  );

drop index if exists public.categories_active_sort_idx;
create index categories_active_sort_idx
  on public.categories (is_active, sort_order)
  where is_active and archived_at is null;

drop index if exists public.collections_active_sort_idx;
create index collections_active_sort_idx
  on public.collections (is_active, sort_order)
  where is_active and archived_at is null;

drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
on public.categories
for select
to anon, authenticated
using (is_active and archived_at is null);

drop policy if exists collections_select_public on public.collections;
create policy collections_select_public
on public.collections
for select
to anon, authenticated
using (is_active and archived_at is null);

-- Kategori ve koleksiyonlar istemciden kalıcı olarak silinmez.
-- Kullanımdaki kayıtlar bağlı ürün sayısıyla gösterilir ve yalnızca pasife
-- alınır veya archived_at ile arşivlenir.
revoke delete on public.categories from authenticated;
revoke delete on public.collections from authenticated;

drop policy if exists categories_delete_admin on public.categories;
drop policy if exists collections_delete_admin on public.collections;
