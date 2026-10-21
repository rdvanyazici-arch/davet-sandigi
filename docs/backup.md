# Katalog yedeği

## Yönetim panelinden alınan yedek

`Yönetim > Raporlar > Katalog yedeği` tek bir tarihli JSON dosyası üretir. Dosya şu kayıtları içerir:

- Ürünler, kategoriler ve koleksiyonlar
- Kategori–koleksiyon ve ürün–koleksiyon ilişkileri
- Ürün görsel ilişkileri
- Bannerlar, sayfa içerikleri, SSS ve yorumlar
- Site ayarlarının public alanları
- Görsel kayıtları, `storage_path` ve public URL listesi

Yedek şunları **içermez**:

- Supabase Storage içindeki gerçek görsel dosyaları
- Supabase Auth kullanıcıları ve yönetici parolaları
- Gizli anahtarlar, `service_role`, oturumlar veya müşteri verileri
- Audit kayıtları

## Kontrollü geri yükleme

Panelde otomatik geri yükleme düğmesi yoktur. Geri yükleme mevcut verinin üzerine yazabileceği için önce yeni veya boş bir Supabase projesinde denenmelidir.

1. JSON dosyasının `schema_version`, `exported_at` ve `tables` alanlarını doğrulayın.
2. Mevcut veritabanının ayrıca Supabase CLI ile mantıksal yedeğini alın.
3. Kayıtları şu sırayla içe aktarın: `site_settings`, `categories`, `collections`, `media_assets`, `products`, ilişkiler, `banners`, `content_sections`, `faqs`, `testimonials`.
4. Görsel dosyalarını ayrı Storage yedeğinden `site-media` bucket'ındaki aynı `storage_path` yollarına yükleyin.
5. Identity sayaçlarını en büyük kimlikten sonra gelecek biçimde düzeltin.
6. RLS ve Storage testlerini çalıştırın; yönetici ve ziyaretçi görünümünü doğrulayın.
7. Doğrulama tamamlanmadan canlı projeye veri yazmayın.

Bu işlem için projeye özel, doğrulama yapan geçici bir içe aktarma aracı hazırlanmalıdır. JSON dosyasını doğrudan SQL Editor'e yapıştırmak güvenli bir geri yükleme yöntemi değildir.

## Supabase otomatik yedek koşulları

21 Ekim 2026 tarihinde resmi Supabase belgelerinde doğrulanan durum:

- Pro, Team ve Enterprise projeleri günlük otomatik veritabanı yedeği alır.
- Günlük yedek saklama süresi Pro için 7 gün, Team için 14 gün, Enterprise için 30 güne kadardır.
- Free projelerde düzenli `supabase db dump` alınıp proje dışında saklanması önerilir.
- PITR, Pro/Team/Enterprise için ücretli eklentidir; daha hassas geri dönüş noktaları sağlar ve en az Small compute gerektirir.
- PITR etkinleştirildiğinde günlük yedek yerine PITR kullanılır.
- Veritabanı yedekleri Storage API ile saklanan gerçek dosyaları içermez; yalnızca dosya metadatası veritabanında bulunur.
- Fiziksel yedekler doğrudan indirilemeyebilir; indirilebilir mantıksal yedek için Supabase CLI `db dump` veya `pg_dump` gerekir.
- Bir yedeği geri yüklerken proje geçici olarak erişilemez olur; canlı kullanım için kesinti planlanmalıdır.

Kaynaklar:

- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Download Storage Objects](https://supabase.com/docs/guides/storage/management/download-objects)
