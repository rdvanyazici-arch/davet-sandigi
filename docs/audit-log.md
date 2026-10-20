# Yönetim Değişiklik Geçmişi

## Kapsam

Değişiklik geçmişi; ürün, ürün yayını, kategori, koleksiyon, banner, sayfa içeriği, yorum, SSS, site ayarı, görsel, ürün görseli ve yönetici profili değişikliklerini kaydeder.

- Eylemler: `insert`, `update`, `archive`, `delete`
- Ürün taslakları yalnızca yayınlanırken kayda girer.
- Normal taslak kaydetme geçmiş kaydı oluşturmaz.
- Kayıtları aktif yöneticiler okuyabilir; tarayıcıdan ekleme, güncelleme veya silme yapılamaz.
- Anonim ziyaretçiler geçmişi göremez.

## Gizlilik

Büyük metin alanlarının tam içeriği saklanmaz. Açıklama, gövde ve JSON içeriklerinde yalnızca değişti bilgisi tutulur. Site ayarlarındaki e-posta, telefon ve WhatsApp numarası için eski/yeni değerler kaydedilmez.

## Saklama süresi

Kayıtlar 180 gün saklanır. `private.cleanup_admin_audit_log()` fonksiyonu daha eski kayıtları siler. Zamanlama bu migration kapsamında etkinleştirilmemiştir.

Supabase projesinde `pg_cron` etkinleştirildikten sonra yetkili SQL Editor oturumunda örnek günlük zamanlama:

```sql
select cron.schedule(
  'admin-audit-retention',
  '15 3 * * *',
  $$select private.cleanup_admin_audit_log();$$
);
```

Bu komut uygulanmadan önce iş adının daha önce tanımlı olmadığı ve zaman diliminin proje beklentisiyle eşleştiği kontrol edilmelidir. Zamanlama Production'a ayrıca onay verilmeden eklenmemelidir.

## Yönetici işlemleri

- Yöneticiler ekranı yalnızca `owner` rolü ve MFA `aal2` oturumuyla açılır.
- Panel Auth hesabı oluşturmaz. Kullanıcı önce Supabase Auth ekranında oluşturulur, ardından UUID ile yönetici profili eklenir.
- Son aktif owner pasif yapılamaz veya editor rolüne indirilemez.
- Kullanıcı kendi owner rolünü düşüremez.
- İleride hesap daveti için, gizli anahtarın tarayıcıya girmediği ayrı bir Edge Function değerlendirilebilir.
