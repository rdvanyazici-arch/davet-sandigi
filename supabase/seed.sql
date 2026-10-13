-- Faz 3: Yerel Supabase başlangıç dosyası.
-- Örnek katalog verileri Faz 1 kararı gereği buraya eklenmez.
insert into public.site_settings (
  id,
  brand_name,
  currency_code,
  default_min_quantity,
  default_quantity_step,
  is_maintenance_mode
)
values (
  1,
  'Davet Sandığı',
  'TRY',
  1,
  1,
  false
)
on conflict (id) do nothing;

-- Kategori kayıtları gerçek içerik onaylandıktan sonra yönetim panelinden
-- eklenecektir. Başlangıçta örnek veya sahte kategori oluşturulmaz.
