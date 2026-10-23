/* Yerel aramada görünürlük için il ve ilçe bilgisi.
   Tam sokak adresinin yayımlanmamasına karar verildi: bu yüzden burada yalnızca
   ilçe (addressLocality) ve il (addressRegion) tutulur, sokak/kapı numarası
   tutulmaz. Uzunluk sınırı, panele yanlışlıkla tam adres yazılmasını önler. */
alter table public.site_settings
  add column if not exists address_locality text,
  add column if not exists address_region text;

alter table public.site_settings
  drop constraint if exists site_settings_address_locality_length,
  drop constraint if exists site_settings_address_region_length;

alter table public.site_settings
  add constraint site_settings_address_locality_length
    check (address_locality is null or char_length(btrim(address_locality)) between 2 and 60),
  add constraint site_settings_address_region_length
    check (address_region is null or char_length(btrim(address_region)) between 2 and 60);

comment on column public.site_settings.address_locality is
  'İlçe (schema.org addressLocality). Sokak adresi saklanmaz.';
comment on column public.site_settings.address_region is
  'İl (schema.org addressRegion). Sokak adresi saklanmaz.';

/* Yeni sütunlar görünümün SONUNA eklenir: create or replace view yalnızca sona
   ekleme yapılırsa çalışır, araya sütun sokmak hata verir. */
create or replace view public.site_settings_public
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
  updated_at,
  address_locality,
  address_region
from public.site_settings
where id = 1;

comment on view public.site_settings_public is
  'Public projection of site settings: analytics flag plus the city/district shown on the site. The base table remains admin-managed.';

grant select on public.site_settings_public to anon, authenticated;
