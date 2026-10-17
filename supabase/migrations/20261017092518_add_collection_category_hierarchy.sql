create table public.category_collections (
  category_id bigint not null references public.categories(id) on delete cascade,
  collection_id bigint not null references public.collections(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (category_id, collection_id)
);

create index category_collections_collection_id_idx
  on public.category_collections (collection_id, sort_order, category_id);

alter table public.category_collections enable row level security;
revoke all on public.category_collections from anon, authenticated;
grant select on public.category_collections to anon, authenticated;
grant insert, update, delete on public.category_collections to authenticated;

create policy category_collections_select_public
on public.category_collections
for select
to anon, authenticated
using (
  exists (
    select 1 from public.categories c
    where c.id = category_id and c.is_active and c.archived_at is null
  )
  and exists (
    select 1 from public.collections c
    where c.id = collection_id and c.is_active and c.archived_at is null
  )
);

create policy category_collections_select_admin
on public.category_collections
for select
to authenticated
using ((select private.is_admin()));

create policy category_collections_insert_admin
on public.category_collections
for insert
to authenticated
with check ((select private.is_admin()));

create policy category_collections_update_admin
on public.category_collections
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy category_collections_delete_admin
on public.category_collections
for delete
to authenticated
using ((select private.is_admin()));

-- Advisor bulgusunu gidermek için görünüm çağıranın yetkileriyle çalışır.
alter view public.site_settings_public set (security_invoker = true);

grant select (
  id, brand_name, whatsapp_number, instagram_url, phone, email,
  delivery_text, currency_code, default_min_quantity,
  default_quantity_step, quote_threshold, shipping_note,
  is_maintenance_mode, updated_at
) on public.site_settings to anon, authenticated;

create policy site_settings_select_public
on public.site_settings
for select
to anon, authenticated
using (id = 1);

insert into public.collections (slug, name, short_description, icon_key, sort_order, is_active)
values
  ('nisan', 'Nişan', 'Nişan gününe özel tasarımlar', 'rings', 10, true),
  ('kina', 'Kına', 'Kına gecesine özel tasarımlar', 'henna', 20, true),
  ('baby-shower', 'Baby Shower', 'Baby Shower etkinliklerine özel tasarımlar', 'gift', 30, true),
  ('dugun', 'Düğün', 'Düğün gününe özel tasarımlar', 'heart', 40, true)
on conflict (slug) do nothing;

insert into public.categories (slug, name, code_prefix, description, sort_order, is_active)
values ('kolonya-tasarimlari', 'Kolonya Tasarımları', 'KOL', 'Kişiselleştirilebilir kolonya tasarımları', 10, true)
on conflict (slug) do nothing;

insert into public.category_collections (category_id, collection_id, sort_order)
select category.id, collection.id, 10
from public.categories category
join public.collections collection on collection.slug = 'nisan'
where category.slug = 'kolonya-tasarimlari'
on conflict (category_id, collection_id) do nothing;
