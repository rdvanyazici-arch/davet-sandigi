/* 20261023071500 görünüme address_locality ve address_region sütunlarını ekledi
   ama anon rolünün sütun yetkisini güncellemedi. site_settings_public
   security_invoker olduğu için yetki temel tablonun sütunları üzerinden
   kontrol edilir: yetkisiz tek bir sütun, görünümün TAMAMINI okunamaz yapar.
   Sonuç, ziyaretçinin WhatsApp numarası dahil hiçbir ayarı görememesiydi.

   Sütun yetkisi, sütun ekleyen her göçte yeniden verilmelidir. */
grant select (
  id, brand_name, whatsapp_number, instagram_url, phone, email,
  delivery_text, currency_code, default_min_quantity,
  default_quantity_step, quote_threshold, shipping_note,
  is_maintenance_mode, analytics_enabled, updated_at,
  address_locality, address_region
) on public.site_settings to anon, authenticated;
