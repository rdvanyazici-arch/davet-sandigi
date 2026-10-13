# Davet Sandığı — Supabase Geçişi ve Site Tamamlama Yol Haritası

## 1. Belgenin amacı

Bu belge, Davet Sandığı sitesinin Firebase'den Supabase'e güvenli biçimde taşınması ve showroom odaklı satış sitesinin tamamlanması için uygulanacak işleri önem sırasına göre tanımlar.

Her ana madde ayrı bir çalışma olarak ele alınacaktır. Bir madde tamamlanıp kontrol edilmeden sonraki maddeye geçilmeyecektir.

## 2. Kesinleşen ürün kapsamı

### 2.1. Site modeli

- Site herkese açık bir ürün showroom'u olacaktır.
- Ziyaretçiler için üyelik, kayıt veya giriş ekranı olmayacaktır.
- Çevrimiçi ödeme alınmayacaktır.
- Ana satış ve marka iletişimi Instagram üzerinden yürütülecektir.
- Ziyaretçi ürünleri sepete ekleyebilecektir.
- Sepetteki ürünler, adetler ve notlar düzenli bir WhatsApp mesajına dönüştürülecektir.
- Sipariş, WhatsApp görüşmesi ve işletme onayı sonrasında kesinleşecektir.
- Site üzerinde oluşturulan belge veya ekran “sipariş talebi” olarak adlandırılacaktır; ödeme belgesi veya kesin sipariş olarak sunulmayacaktır.

### 2.2. Yönetim modeli

- Yönetim paneli korunacak ve geliştirilecektir.
- Yönetim paneli ana site navigasyonunda görünmeyecektir.
- Yalnızca tanımlı yönetici hesapları giriş yapabilecektir.
- Müşteri hesabı olmayacak; Supabase Auth yalnızca yönetim paneli için kullanılacaktır.
- Genel kullanıcı kaydı kapalı olacaktır.
- Ürünler, kategoriler, koleksiyonlar, banner'lar, sayfa içerikleri, SSS, yorumlar, iletişim bilgileri ve görseller panelden yönetilecektir.
- Bir içerik kaydedilmeden önce görsel ve metin önizlemesi gösterilecektir.

### 2.3. İlk sürümde olmayacaklar

- Kredi kartı veya çevrimiçi ödeme
- Müşteri üyeliği ve müşteri profili
- Müşteri sipariş geçmişi
- Kargo firması entegrasyonu
- Fatura/e-arşiv entegrasyonu
- Stok rezervasyonu
- Otomatik fiyatlandırılmış kargo
- Supabase'e müşteri adı, telefon numarası veya özel gün notu kaydetme

Bu özellikler daha sonra ayrıca kararlaştırılmadan eklenmeyecektir.

## 3. Hedef teknik mimari

### 3.1. Genel yapı

1. **Vercel:** Canlı siteyi yayınlar.
2. **GitHub:** Kaynak kodu ve migration dosyalarını saklar.
3. **Supabase Database:** Ürün ve site içeriklerini saklar.
4. **Supabase Storage:** Ürün, banner, koleksiyon, yorum ve sayfa görsellerini saklar.
5. **Supabase Auth:** Yalnızca yönetici girişini sağlar.
6. **Tarayıcı localStorage:** Ziyaretçinin geçici sepetini ve favorilerini saklar.
7. **WhatsApp:** Sepet içeriğini sipariş talebi mesajı olarak işletmeye iletir.
8. **Instagram:** Ana sosyal satış ve marka kanalı olarak öne çıkarılır.

### 3.2. Güvenlik sınırı

- Ziyaretçi yalnızca yayındaki içerikleri okuyabilir.
- Ziyaretçi veritabanına ürün, ayar, yorum veya görsel yazamaz.
- Yönetici içerik ekleyebilir, güncelleyebilir, yayından kaldırabilir ve arşivleyebilir.
- Silme işlemleri doğrudan kalıcı silme yerine önce arşivleme ile yapılır.
- `service_role` anahtarı hiçbir zaman tarayıcıya, GitHub'a veya `index.html` içine yazılmaz.
- Tarayıcıda yalnızca Supabase publishable key kullanılır.
- Tüm açık şema tablolarında RLS etkinleştirilir.
- `anon` rolüne yalnızca gerekli tablolarda ve yalnızca yayınlanmış satırlar için `SELECT` verilir.
- Yazma yetkileri yalnızca aktif yönetici hesabına verilir.

## 4. Önerilen proje dosya yapısı

Mevcut tek dosyalık yapı kontrollü biçimde bölünecektir:

```text
/
├── index.html
├── admin.html
├── assets/
│   ├── css/
│   │   ├── site.css
│   │   └── admin.css
│   ├── js/
│   │   ├── config.js
│   │   ├── supabase-client.js
│   │   ├── site.js
│   │   ├── catalog.js
│   │   ├── cart.js
│   │   ├── whatsapp.js
│   │   ├── admin-auth.js
│   │   ├── admin-products.js
│   │   ├── admin-media.js
│   │   └── admin-content.js
│   └── images/
│       ├── brand/
│       └── fallback/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── robots.txt
├── sitemap.xml
├── AGENTS.md
├── TASK_STATE.md
└── PROJECT_ROADMAP.md
```

Not: Dosyaların bölünmesi tasarımı değiştirmek için değil; 6,3 MB büyüklüğündeki tek dosyayı sürdürülebilir ve hızlı hale getirmek içindir.

## 5. Supabase veri şeması

Tüm tablo ve sütun adları İngilizce, küçük harfli ve `snake_case` olacaktır. Para alanlarında `numeric(10,2)`, zaman alanlarında `timestamptz`, sıralamalarda `integer`, durumlarda `boolean` veya kontrollü `text` kullanılacaktır.

### 5.1. `admin_profiles`

Yönetici yetkisini tanımlar.

- `user_id uuid primary key`: `auth.users.id` ile bağlantılıdır.
- `display_name text`
- `role text`: `owner` veya `editor`
- `is_active boolean default true`
- `created_at timestamptz`
- `updated_at timestamptz`

Kurallar:

- Her yönetici yalnızca kendi profilini okuyabilir.
- `owner`, diğer yönetici kayıtlarını yönetebilir.
- Yetkilendirme kararında `user_metadata` kullanılmaz.
- Genel kayıt ekranı bulunmaz; yönetici hesabı kontrollü oluşturulur.

### 5.2. `site_settings`

Tek satırlık genel site ayarlarıdır.

- `id smallint primary key` ve `id = 1` kontrolü
- `brand_name text`
- `whatsapp_number text`
- `instagram_url text`
- `phone text`
- `email text`
- `delivery_text text`
- `currency_code text default 'TRY'`
- `default_min_quantity integer`
- `default_quantity_step integer`
- `quote_threshold integer`
- `shipping_note text`
- `is_maintenance_mode boolean`
- `updated_at timestamptz`
- `updated_by uuid`

Public yalnızca bu satırı okuyabilir. Yalnızca yönetici güncelleyebilir.

### 5.3. `categories`

Ürün filtrelerini yönetir.

- `id bigint identity primary key`
- `slug text unique`
- `name text`
- `code_prefix text`
- `description text`
- `sort_order integer`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

İndeksler:

- `slug` unique indeks
- Yayındaki sıralama için `(is_active, sort_order)` bileşik/uygun kısmi indeks

### 5.4. `collections`

Nişan, söz, kına, nikâh ve Baby Shower gibi showroom koleksiyonlarını yönetir.

- `id bigint identity primary key`
- `slug text unique`
- `name text`
- `short_description text`
- `cover_media_id bigint`
- `icon_key text`
- `sort_order integer`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### 5.5. `products`

Ürün kataloğunun ana tablosudur.

- `id bigint identity primary key`
- `category_id bigint` foreign key
- `slug text unique`
- `sku text unique`
- `name text`
- `short_description text`
- `description text`
- `price numeric(10,2)`
- `is_price_visible boolean default true`
- `is_quote_only boolean default false`
- `min_quantity integer`
- `quantity_step integer`
- `is_featured boolean`
- `is_active boolean`
- `sort_order integer`
- `seo_title text`
- `seo_description text`
- `created_at timestamptz`
- `updated_at timestamptz`
- `archived_at timestamptz`

Kontroller:

- `price >= 0`
- `min_quantity > 0`
- `quantity_step > 0`
- Aktif ürünlerde ad, slug, SKU ve ana görsel zorunlu
- Kategori foreign key alanı indeksli

### 5.6. `product_collections`

Bir ürünün birden fazla koleksiyonda görünmesini sağlar.

- `product_id bigint`
- `collection_id bigint`
- Birleşik primary key: `(product_id, collection_id)`
- Her iki foreign key alanı indeksli
- Ürün veya koleksiyon silinirse ilişki güvenli biçimde temizlenir

### 5.7. `media_assets`

Yönetim panelindeki merkezi görsel kütüphanesidir.

- `id bigint identity primary key`
- `storage_path text unique`
- `original_name text`
- `mime_type text`
- `file_size integer`
- `width integer`
- `height integer`
- `alt_text text`
- `usage_type text`: `product`, `collection`, `banner`, `story`, `testimonial`, `campaign`, `brand`, `other`
- `status text`: `active`, `archived`
- `created_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`
- `archived_at timestamptz`

Kurallar:

- JPG, PNG, WebP ve gerektiğinde SVG kabul edilir.
- Dosya tipi yalnızca uzantıya göre değil MIME türüne göre doğrulanır.
- Dosya boyutu ve piksel ölçüsü sınırlandırılır.
- Aynı dosyanın gereksiz tekrar yüklenmesi engellenir.
- Kullanımda olan görsel doğrudan silinemez.
- Görsel önce arşivlenir; kalıcı silme ayrı onay ister.

### 5.8. `product_images`

Ürün galerisindeki görsel sırasını yönetir.

- `id bigint identity primary key`
- `product_id bigint` foreign key
- `media_id bigint` foreign key
- `alt_text text`
- `sort_order integer`
- `is_primary boolean`
- `created_at timestamptz`

Kurallar:

- Bir üründe yalnızca bir ana görsel bulunur.
- Ürün foreign key alanı indeksli olur.
- Sıralama panelde sürükle-bırak veya yukarı/aşağı kontrolleriyle düzenlenir.

### 5.9. `banners`

Ana sayfa hero/banner alanlarını yönetir.

- `id bigint identity primary key`
- `eyebrow text`
- `title text`
- `description text`
- `primary_button_text text`
- `primary_button_url text`
- `secondary_button_text text`
- `secondary_button_url text`
- `media_id bigint`
- `sort_order integer`
- `is_active boolean`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

### 5.10. `content_sections`

Hikâyemiz, süreç, neden biz, CTA ve benzeri metin alanlarını yönetir.

- `id bigint identity primary key`
- `section_key text unique`
- `eyebrow text`
- `title text`
- `body text`
- `button_text text`
- `button_url text`
- `media_id bigint`
- `content_json jsonb`
- `is_active boolean`
- `updated_at timestamptz`

`content_json` yalnızca adımlar veya tekrar eden küçük içerik grupları için kullanılacaktır; ürün ve görsel ilişkileri JSON içine gömülmeyecektir.

### 5.11. `testimonials`

- `id bigint identity primary key`
- `customer_display_name text`
- `event_name text`
- `review_text text`
- `rating smallint`
- `media_id bigint`
- `consent_confirmed boolean`
- `is_published boolean`
- `sort_order integer`
- `created_at timestamptz`

Kurallar:

- Yalnızca gerçek ve paylaşım izni alınmış yorumlar yayınlanır.
- `rating` değeri 1–5 aralığında olur.
- İzin durumu teyit edilmemiş kayıt yayınlanamaz.

### 5.12. `faqs`

- `id bigint identity primary key`
- `question text`
- `answer text`
- `sort_order integer`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### 5.13. Sipariş tablosu kararı

İlk sürümde `orders` veya `customers` tablosu oluşturulmayacaktır.

Gerekçeler:

- Sipariş WhatsApp üzerinden kesinleşmektedir.
- Site müşteri hesabı kullanmamaktadır.
- Gereksiz kişisel veri tutulmamalıdır.
- Anonim sipariş yazma uç noktası spam ve kötüye kullanım riski oluşturur.

İleride sipariş kaydı istenirse doğrudan `anon INSERT` açılmayacak; doğrulama, hız sınırı ve bot koruması olan bir Edge Function üzerinden ayrı fazda tasarlanacaktır.

## 6. RLS ve yetki matrisi

| Alan | Ziyaretçi (`anon`) | Yönetici (`authenticated`) |
|---|---|---|
| Aktif ürün/kategori/koleksiyon | Okur | Okur ve yönetir |
| Pasif/arşivlenmiş içerik | Göremez | Görür ve yönetir |
| Site ayarları | Yayınlanabilir alanları okur | Günceller |
| Banner/içerik/SSS | Yalnızca aktif kayıtları okur | Yönetir |
| Yorumlar | Yalnızca izinli ve yayındaki kayıtları okur | Yönetir |
| Görsel dosyaları | Yayındaki dosyaları görüntüler | Yükler, değiştirir, arşivler |
| Yönetici profilleri | Erişemez | Rolüne göre erişir |
| Müşteri/sipariş verisi | Bulunmaz | Bulunmaz |

Her tablo için yapılacaklar:

1. RLS etkinleştirilecek.
2. `anon` ve `authenticated` varsayılan yetkileri kaldırılacak.
3. Yalnızca gerekli `SELECT`, `INSERT`, `UPDATE`, `DELETE` yetkileri geri verilecek.
4. `SELECT`, `INSERT`, `UPDATE`, `DELETE` politikaları ayrı yazılacak.
5. `UPDATE` politikalarında hem `USING` hem `WITH CHECK` bulunacak.
6. RLS politikasında kullanılan foreign key ve yönetici alanları indekslenecek.
7. `anon` ve `authenticated` için izin/verme ve reddetme testleri yazılacak.
8. Supabase database advisor ve RLS testleri geçmeden canlıya çıkılmayacak.

## 7. Supabase Storage ve görsel yönetimi

### 7.1. Bucket yapısı

Tek bir `site-media` bucket kullanılacaktır. Showroom görsellerinin herkese açık görüntülenmesi gerektiği için public okuma kullanılabilir; yükleme, değiştirme ve silme yalnızca yöneticiye açık olacaktır.

Önerilen klasörler:

```text
site-media/
├── products/{product_id}/
├── collections/{collection_id}/
├── banners/{banner_id}/
├── story/
├── testimonials/{testimonial_id}/
├── campaigns/
├── brand/
└── archive/
```

### 7.2. Yükleme akışı

1. Yönetici dosyayı seçer.
2. Dosya yüklenmeden önce yerel önizleme görünür.
3. Dosya türü, boyutu ve çözünürlüğü kontrol edilir.
4. Gerekirse tarayıcıda WebP türevi hazırlanır.
5. Yönetici alt metin ve kullanım türünü girer.
6. Dosya Storage'a yüklenir.
7. `media_assets` kaydı oluşturulur.
8. İlgili ürün veya içerikle ilişkilendirilir.
9. Masaüstü ve mobil kart önizlemesi gösterilir.
10. Yönetici son onayı verince içerik yayınlanır.

### 7.3. Yönetim panelinde zorunlu görsel ekranı

“Görsel Kütüphanesi” ayrı bir yönetim sekmesi olacaktır.

Her görsel kartında şunlar gösterilecektir:

- Küçük önizleme
- Dosya adı
- Kullanıldığı alan
- Bağlı ürün/banner/koleksiyon adı
- Piksel ölçüsü
- Dosya boyutu
- MIME türü
- Alt metin
- Yüklenme tarihi
- Aktif/arşivlenmiş durumu
- “Değiştir”, “Kullanıldığı Yerler”, “Arşivle” işlemleri

Filtreler:

- Tümü
- Kullanımda olanlar
- Kullanılmayanlar
- Ürün görselleri
- Koleksiyon görselleri
- Banner görselleri
- Yorum görselleri
- Arşivlenmiş görseller

### 7.4. Silme güvenliği

- Kullanımda olan görsel için kalıcı silme düğmesi gösterilmez.
- Önce hangi içeriklerde kullanıldığı listelenir.
- Kullanım kaldırıldıktan sonra görsel arşivlenir.
- Arşivde belirlenen bekleme süresi dolmadan dosya Storage'dan silinmez.
- Kalıcı silmeden önce ikinci onay alınır.
- Silme sonrasında ilgili Storage nesnesi ve veritabanı kaydı birlikte doğrulanır.

## 8. Yönetim paneli kapsamı

### 8.1. Giriş ve güvenlik

- Panel adresi ana sitede görünmez.
- Supabase e-posta/parola ile yönetici girişi kullanılır.
- Kullanıcı kayıt olamaz.
- Hatalı giriş mesajı hesap varlığını açığa çıkarmaz.
- Oturum süresi ve çıkış davranışı test edilir.
- Pasif yönetici paneli açamaz.
- `owner` ve `editor` rolleri ayrılır.
- Kritik silme ve yayınlama işlemleri onay ister.

### 8.2. Yönetim ana ekranı

- Aktif ürün sayısı
- Pasif/arşiv ürün sayısı
- Kategori ve koleksiyon sayısı
- Ana görseli eksik ürünler
- Alt metni eksik görseller
- Kullanılmayan görseller
- Taslak içerikler
- Son güncellenen kayıtlar

### 8.3. Ürün yönetimi

- Ürün listesi ve arama
- Kategori/koleksiyon/aktiflik filtreleri
- Yeni ürün ekleme
- Ürün düzenleme
- Ürünü çoğaltma
- Taslak kaydetme
- Yayına alma/yayından kaldırma
- Arşivleme
- Fiyat görünürlüğü ve teklif ürünü seçimi
- Minimum adet ve artış miktarı
- Öne çıkarma ve sıralama
- Ana görsel ve galeri yönetimi
- Kart önizlemesi
- Ürün detay modalı önizlemesi
- Mobil ve masaüstü önizleme

### 8.4. Kategori ve koleksiyon yönetimi

- Ad, slug, açıklama ve sıra yönetimi
- Koleksiyon kapak görseli önizlemesi
- Koleksiyona bağlı ürün sayısı
- Kullanımda olan kategori/koleksiyonun yanlışlıkla silinmesini engelleme
- Pasife alma ve arşivleme

### 8.5. Sayfa içerikleri

- Hero/banner yönetimi
- Üst bant metinleri
- Süreç adımları
- Neden biz alanı
- Hikâyemiz
- CTA alanı
- SSS
- Müşteri yorumları
- İletişim ve sosyal medya bilgileri
- Kampanya pop-up'ı
- Her alanda kaydetmeden önce önizleme

### 8.6. Yayın davranışı

- “Taslak kaydet” ve “Yayınla” ayrılır.
- Paneldeki değişiklik anında canlıya gitmez.
- Önizleme kontrolünden sonra yayınlanır.
- Güncelleme başarısızsa mevcut canlı içerik korunur.
- Başarılı kayıt ve hata durumları kullanıcıya açıkça gösterilir.

## 9. Genel site bilgi mimarisi

Sayfa sırası:

1. Üst bilgi bandı
2. Logo, ana navigasyon, Instagram, WhatsApp ve sepet
3. Hero/banner
4. Koleksiyonlar
5. Öne çıkan ürünler
6. Tüm ürünler ve filtreler
7. Nasıl çalışır?
8. Neden Davet Sandığı?
9. Hikâyemiz
10. Gerçek müşteri görselleri ve yorumları
11. Sıkça sorulan sorular
12. Instagram'a yönlendiren içerik alanı
13. WhatsApp teklif çağrısı
14. Footer ve iletişim bilgileri
15. Yasal bağlantılar

Her bölüm için boş, yükleniyor ve hata durumu hazırlanacaktır. Supabase erişilemezse kritik olmayan içerikler için güvenli ve sınırlı fallback gösterilecek; eski veya yanlış fiyatlar sessizce gösterilmeyecektir.

## 10. Görsel yerleşim şeması

| Alan | Görsel türü | Yönetim önizlemesi | Zorunluluk |
|---|---|---|---|
| Hero | Yatay/portre uyumlu ana marka görseli | Masaüstü + mobil | Zorunlu |
| Koleksiyon kartı | Kare veya 4:5 kapak | Kart görünümü | Zorunlu |
| Ürün kartı | 4:5 ana ürün görseli | Kart + detay | Zorunlu |
| Ürün galerisi | Ek detay görselleri | Galeri sırası | İsteğe bağlı |
| Hikâyemiz | Atölye/ürün hazırlık görseli | Bölüm görünümü | Önerilen |
| Müşteri yorumu | İzinli gerçek kullanım görseli | Yorum kartı | İsteğe bağlı |
| CTA | Marka/ürün atmosfer görseli | Masaüstü + mobil | Önerilen |
| Kampanya | Kampanya görseli | Pop-up görünümü | İsteğe bağlı |
| Logo/favicons | Marka dosyaları | Farklı boyutlar | Zorunlu |

Görsel kalite kuralları:

- Ürün görselleri aynı oran ve benzer ışık dilinde hazırlanır.
- Ana ürün görselinde ürün net ve merkezi görünür.
- Alt metin boş bırakılamaz.
- Görselde kişisel bilgi veya izinsiz yüz bulunmaz.
- Dosya adları anlamlı ve SEO uyumlu olur.
- Büyük kaynak görselin yanında optimize edilmiş WebP sürümü bulunur.
- Mobilde gereksiz büyük görsel indirilmez.
- Görsellere `loading="lazy"` uygulanır; yalnızca ilk hero görseli öncelikli yüklenir.

## 11. Sepet ve WhatsApp sipariş talebi

### 11.1. Sepet davranışı

- Sepet kullanıcı hesabı gerektirmez.
- Sepet cihazın localStorage alanında tutulur.
- Ürün adı, SKU, adet, birim fiyat ve ara toplam gösterilir.
- Ürünün minimum adet ve artış kuralı uygulanır.
- Teklif gerektiren adetlerde kesin toplam yerine “Özel fiyat teklifi” gösterilir.
- Fiyat değiştiğinde eski localStorage fiyatı değil güncel ürün fiyatı kullanılır.
- Pasife alınmış ürün sepetteyse kullanıcıya açık uyarı gösterilir.
- Sepet boş, yükleniyor ve hata durumları bulunur.

### 11.2. WhatsApp mesajı

Mesaj şu alanları içerecektir:

- “Davet Sandığı sipariş talebi” başlığı
- Benzersiz talep referansı
- Ürün adı ve SKU
- Her ürünün adedi
- Görünen birim fiyat ve toplam
- Teklif gerektiren ürün notu
- İsteğe bağlı etkinlik tarihi
- İsteğe bağlı renk, isim veya kişiselleştirme notu
- Kargo ve kesin fiyatın WhatsApp görüşmesinde onaylanacağı bilgisi

Kurallar:

- Müşteri verisi Supabase'e kaydedilmez.
- WhatsApp açılmadan önce gönderilecek metin ekranda gösterilir.
- Düğme metni “WhatsApp'ta Sipariş Talebi Oluştur” olur.
- Kullanıcı, WhatsApp'a geçeceğini ve verilerin WhatsApp'a aktarılacağını görür.
- Telefon numarası ülke koduyla ve yalnızca sayı olarak yapılandırılır.
- Talep referansı çakışmayı azaltan zaman damgası + rastgele kimlik içerir; kesin sipariş numarası yerine kullanılmaz.

## 12. İçerik doğruluğu ve marka düzeni

- “500+ Mutlu Çift” yalnızca doğrulanabiliyorsa kullanılır.
- “48 Saat Hızlı Hazırlık” ile “5–7 iş günü” çelişkisi giderilir.
- Kargo ücreti ve ücretsiz kargo eşiği aynı kaynaktan yönetilir.
- Gerçek olmayan müşteri isimleri ve yorumları kaldırılır.
- Baby Shower kapsamı footer ve diğer metinlerde tutarlı hale getirilir.
- Telefon ve e-posta tıklanabilir olur.
- Instagram ana sosyal satış kanalı olarak header, içerik ve footer'da açık biçimde yer alır.
- WhatsApp teklif/sipariş kanalı olarak ayrı ve net konumlandırılır.
- Site hiçbir yerde çevrimiçi ödeme alıyormuş gibi görünmez.
- “Sepete ekle” ile “kesin sipariş” kavramları birbirinden ayrılır.

## 13. SEO, performans ve erişilebilirlik

### 13.1. SEO

- Meta açıklaması
- Canonical URL
- Open Graph başlık, açıklama ve görseli
- Twitter/X kartları
- Favicon seti
- `robots.txt`
- `sitemap.xml`
- Organization/LocalBusiness yapılandırılmış verisi
- Product yapılandırılmış verisi yalnızca gerçek ve güncel fiyatlar için
- Anlamlı başlık hiyerarşisi
- Ürün/kategori slug yapısı
- Alt metinlerin yönetim panelinden zorunlu tutulması

### 13.2. Performans

- Base64 görseller HTML'den çıkarılır.
- Görseller Supabase Storage/CDN üzerinden sunulur.
- Hero dışındaki görseller lazy-load edilir.
- Görsel boyutları HTML'de belirtilerek sayfa kayması azaltılır.
- Mobil için uygun çözünürlüklü görsel kullanılır.
- Firebase dosyaları tamamen kaldırılır.
- Kullanılmayan CSS ve JavaScript temizlenir.
- Supabase sorguları yalnızca gerekli sütunları alır.
- Public katalog sorguları aktiflik ve sıralama indekslerini kullanır.
- Yönetim listeleri sayfalanır.
- Hedef: mobilde hızlı ilk görünüm ve belirgin boş bölüm olmaması.

### 13.3. Erişilebilirlik

- Klavye ile tüm etkileşimler kullanılabilir olur.
- Görünür `:focus-visible` stilleri eklenir.
- Modal alanlara `role="dialog"` ve `aria-modal="true"` eklenir.
- Modal açıldığında odak içeri alınır, kapandığında tetikleyiciye döner.
- Escape tuşu modalı kapatır.
- Tüm form alanları gerçek label kullanır.
- İkon düğmelerinde açıklayıcı `aria-label` bulunur.
- Renk kontrastları kontrol edilir.
- `prefers-reduced-motion` desteği eklenir.
- Yatay mobil taşma giderilir.
- Ekran okuyucu için sepet güncellemeleri bildirilir.

## 14. Firebase'den Supabase'e geçiş sırası

1. Mevcut Firebase verileri JSON olarak yedeklenir.
2. Mevcut görsellerin ve içeriklerin envanteri çıkarılır.
3. Hangi verinin gerçek, taslak veya tekrar olduğu işaretlenir.
4. Supabase projesi oluşturulur ve doğru proje kimliği kaydedilir.
5. Supabase CLI bağlantısı kurulur.
6. Migration dosyaları oluşturulur.
7. Tablolar, constraint'ler, indeksler, grant'ler ve RLS politikaları uygulanır.
8. Storage bucket ve politikaları oluşturulur.
9. Tek yönetici hesabı oluşturulur; genel kayıt kapatılır.
10. Temizlenmiş katalog verileri Supabase'e aktarılır.
11. Görseller Storage'a yüklenir ve `media_assets` kayıtlarıyla eşleştirilir.
12. Public site Supabase'den okuma yapacak şekilde geliştirilir.
13. Yönetim paneli Supabase Auth/Database/Storage ile bağlanır.
14. Firebase ve Supabase çıktıları ürün, kategori, fiyat ve görsel bazında karşılaştırılır.
15. Local ve preview ortamında kabul testleri yapılır.
16. Firebase kodu ve CDN dosyaları kaldırılır.
17. Firebase proje silinmez; geri dönüş süresi boyunca salt yedek olarak korunur.
18. Vercel preview yayını doğrulanır.
19. Kullanıcı onayından sonra production yayını yapılır.
20. Canlı doğrulama tamamlandıktan sonra Firebase kapatma kararı ayrıca alınır.

## 15. Uygulama fazları — önem sırası

### Faz 0 — Güvenli başlangıç ve yedek

- [ ] Doğru klasör, GitHub deposu ve Vercel projesini doğrula.
- [ ] Mevcut canlı sitenin ekran ve veri envanterini al.
- [ ] Firebase verilerini ve görsellerini yedekle.
- [ ] Geri dönüş noktası oluştur.
- [ ] Mevcut local değişiklikleri kontrollü commit et.

**Tamamlanma ölçütü:** Mevcut canlı sürüm veri kaybı olmadan geri yüklenebilir.

### Faz 1 — İçerik envanteri ve doğruluk kararı

- [ ] Gerçek ürünleri ve fiyatları doğrula.
- [ ] Gerçek kategori ve koleksiyonları doğrula.
- [ ] Kullanılacak/kaldırılacak tüm görselleri işaretle.
- [ ] Gerçek olmayan yorum ve sayıları ayır.
- [ ] Instagram, WhatsApp, telefon ve e-posta bilgilerini doğrula.
- [ ] Kargo ve minimum sipariş kurallarını doğrula.

**Tamamlanma ölçütü:** Taşınacak veriler onaylı bir envanterde yer alır.

### Faz 2 — Kod yapısını güvenli biçimde ayırma

- [ ] Base64 görselleri kaynak dosyadan çıkar.
- [ ] Site ve admin CSS/JavaScript dosyalarını ayır.
- [ ] Mevcut görünümü değiştirmeden çalışmayı doğrula.
- [ ] Firebase'e bağlı kodu izole et.
- [ ] Geçici fallback görselleri hazırla.

**Tamamlanma ölçütü:** Görsel tasarım korunur; kaynak dosya yönetilebilir hale gelir.

### Faz 3 — Supabase proje ve yerel geliştirme kurulumu

- [ ] Yeni Supabase projesini doğru hesapta oluştur.
- [ ] Proje referansını belgeye ve güvenli yerel ayarlara kaydet.
- [ ] Güncel Supabase CLI sürümünü doğrula.
- [ ] Yerel `supabase/` yapısını başlat.
- [ ] Vercel preview ve production ortam değişkenlerini ayır.
- [ ] Publishable key dışında hiçbir anahtarı istemciye açma.

**Tamamlanma ölçütü:** Yerel ve preview ortamı doğru Supabase projesine bağlanır; production henüz etkilenmez.

### Faz 4 — Database şeması, grant ve RLS

- [ ] Tabloları migration ile oluştur.
- [ ] Constraint ve foreign key'leri ekle.
- [ ] Foreign key indekslerini ekle.
- [ ] Public katalog indekslerini ekle.
- [ ] Her tabloda RLS etkinleştir.
- [ ] Varsayılan rol yetkilerini kaldır.
- [ ] Public okuma ve yönetici yazma politikalarını ekle.
- [ ] RLS testlerini yaz ve çalıştır.
- [ ] Database advisor sonuçlarını düzelt.

**Tamamlanma ölçütü:** Ziyaretçi yalnızca aktif içeriği okuyabilir; hiçbir içerik yazamaz.

### Faz 5 — Storage ve görsel kütüphanesi

- [ ] `site-media` bucket oluştur.
- [ ] Storage upload/update/delete politikalarını ekle.
- [ ] Görsel doğrulama kurallarını uygula.
- [ ] Merkezi görsel kütüphanesi ekranını oluştur.
- [ ] Kullanımda/kullanılmayan görsel kontrolünü ekle.
- [ ] Arşiv ve güvenli silme akışını ekle.
- [ ] Mobil/masaüstü önizlemeyi ekle.

**Tamamlanma ölçütü:** Yönetici tüm görselleri önizleyebilir, kullanım yerini görebilir ve güvenle yönetebilir.

### Faz 6 — Yönetici kimlik doğrulaması

- [ ] Genel kullanıcı kaydını kapat.
- [ ] Yönetici profil tablosunu bağla.
- [ ] Gizli admin giriş ekranını oluştur.
- [ ] Rol ve aktiflik kontrolünü veritabanında uygula.
- [ ] Çıkış ve oturum süresi davranışını test et.
- [ ] Mevcut açık yönetim linkini ve demo parolasını kaldır.

**Tamamlanma ölçütü:** Yetkisiz kullanıcı paneli veya taslak veriyi göremez.

### Faz 7 — Yönetim paneli ürün ve içerik modülleri

- [ ] Ürün CRUD ve ürün önizlemesi
- [ ] Kategori/koleksiyon yönetimi
- [ ] Ürün galeri sıralaması
- [ ] Banner yönetimi ve önizleme
- [ ] Sayfa bölümleri yönetimi
- [ ] SSS yönetimi
- [ ] Yorum ve izin durumu yönetimi
- [ ] Site ayarları
- [ ] Taslak/yayın davranışı
- [ ] Yükleniyor, boş ve hata durumları

**Tamamlanma ölçütü:** Site içeriği kaynak koduna dokunmadan panelden yönetilebilir.

### Faz 8 — Public showroom'un Supabase'e bağlanması

- [ ] Aktif katalog verilerini Supabase'den çek.
- [ ] Kategori ve koleksiyon filtrelerini bağla.
- [ ] Ürün galerilerini Storage görsellerine bağla.
- [ ] Banner ve sayfa içeriklerini bağla.
- [ ] Yorum ve SSS alanlarını bağla.
- [ ] Veri yüklenemediğinde güvenli hata göster.
- [ ] Pasif ürünlerin görünmediğini doğrula.

**Tamamlanma ölçütü:** Canlıya benzer preview ortamında showroom eksiksiz çalışır.

### Faz 9 — Sepet ve WhatsApp akışı

- [ ] Sepet veri modelini güncel ürün verisine bağla.
- [ ] Minimum adet ve artış kurallarını uygula.
- [ ] Teklif ürünlerini ayır.
- [ ] WhatsApp mesaj önizlemesini oluştur.
- [ ] Benzersiz talep referansı oluştur.
- [ ] Instagram ve WhatsApp yönlendirmelerini doğrula.
- [ ] Mobil cihazlarda WhatsApp uygulaması/web davranışını test et.

**Tamamlanma ölçütü:** Kullanıcı giriş yapmadan ürünleri seçip doğru sipariş talebi mesajı oluşturabilir.

### Faz 10 — İçerik ve marka tutarlılığı

- [ ] Doğrulanmamış iddiaları kaldır veya düzelt.
- [ ] Teslimat sürelerini tek kaynaktan yönet.
- [ ] Kargo metnini netleştir.
- [ ] Instagram'ı ana satış kanalı olarak güçlendir.
- [ ] Footer ve kapsam metinlerini güncelle.
- [ ] Gerçek müşteri yorumlarını yerleştir.

**Tamamlanma ölçütü:** Site içeriği gerçek işleyişle tamamen uyumludur.

### Faz 11 — SEO, hız ve erişilebilirlik

- [ ] SEO meta ve yapılandırılmış verileri ekle.
- [ ] Favicon, robots ve sitemap ekle.
- [ ] Görsel optimizasyonunu tamamla.
- [ ] Lazy loading ve boyut bilgilerini ekle.
- [ ] Klavye, modal ve form erişilebilirliğini düzelt.
- [ ] Mobil taşmaları gider.
- [ ] Performans ölçümlerini kaydet.

**Tamamlanma ölçütü:** Masaüstü ve mobilde hızlı, erişilebilir ve arama motoruna hazır sayfa elde edilir.

### Faz 12 — Firebase verisini taşıma ve Firebase'i koddan çıkarma

- [ ] Temizlenmiş verileri Supabase'e aktar.
- [ ] Görselleri Storage'a aktar.
- [ ] Kayıt sayılarını ve görsel eşleşmelerini karşılaştır.
- [ ] Firebase SDK ve yapılandırmasını kaldır.
- [ ] Firebase kullanılmadığını ağ istekleriyle doğrula.
- [ ] Geri dönüş yedeğini koru.

**Tamamlanma ölçütü:** Site yalnızca Supabase kullanır ve hiçbir veri/görsel eksik değildir.

### Faz 13 — Test, güvenlik ve kabul

- [ ] Public okuma testleri
- [ ] Yetkisiz yazma/silme reddi testleri
- [ ] Yönetici CRUD testleri
- [ ] Storage politika testleri
- [ ] Görsel arşiv/silme testleri
- [ ] Sepet ve WhatsApp mesaj testleri
- [ ] Mobil/masaüstü tarayıcı testleri
- [ ] Boş/yükleniyor/hata durumları
- [ ] Türkçe karakter kontrolleri
- [ ] Kırık bağlantı ve eksik görsel kontrolleri
- [ ] Supabase advisor kontrolleri
- [ ] Vercel preview kabul kontrolü

**Tamamlanma ölçütü:** Kritik ve yüksek öncelikli hata kalmaz.

### Faz 14 — GitHub ve Vercel yayını

- [ ] Doğru depo, branch ve Vercel projesini yeniden doğrula.
- [ ] Preview deployment oluştur.
- [ ] Kullanıcı kabul onayı al.
- [ ] Production deployment yap.
- [ ] Canlı Supabase bağlantısını doğrula.
- [ ] Canlı admin panelini doğrula.
- [ ] Canlı WhatsApp ve Instagram bağlantılarını doğrula.
- [ ] Hata halinde rollback prosedürünü uygula.

**Tamamlanma ölçütü:** `davet-sandigi.vercel.app` doğrulanmış Supabase sürümünü yayınlar.

### Faz 15 — Yasal metinler ve son yayın kontrolü

Bu faz özellikle en sona bırakılmıştır.

- [ ] İşletmenin resmi unvanını ve iletişim bilgilerini belirle.
- [ ] Veri sorumlusu bilgisini belirle.
- [ ] Gizlilik politikasını gerçek veri akışına göre hazırla.
- [ ] KVKK aydınlatma metnini gerçek işleme amaçlarına göre hazırla.
- [ ] Çerez/yerel depolama metnini gerçek kullanıma göre hazırla.
- [ ] WhatsApp ve Instagram'a veri aktarımı bilgisini açıkla.
- [ ] Sipariş talebi ve mesafeli satış sürecini işletme modeline göre netleştir.
- [ ] İade/iptal ve kişiye özel ürün koşullarını netleştir.
- [ ] Kargo ve teslimat koşullarını netleştir.
- [ ] Müşteri görselleri ve yorumları için izin sürecini belgeye ekle.
- [ ] Metinleri hukuk danışmanına kontrol ettir.
- [ ] Onaylanan metinleri yönetim paneline ekle.
- [ ] Footer bağlantılarını ve modal erişilebilirliğini test et.

**Tamamlanma ölçütü:** Canlı sitede “örnek/taslak” yasal metin kalmaz.

## 16. Her faz için standart çalışma yöntemi

Her fazda şu sıra izlenecektir:

1. İlgili dosyalar ve mevcut durum incelenir.
2. O fazın net kapsamı kullanıcıya kısa biçimde bildirilir.
3. Gerekli değişiklikler yalnızca güncel proje klasöründe yapılır.
4. İlgili testler çalıştırılır.
5. Mobil ve masaüstü kontrol edilir.
6. Supabase değişikliği varsa RLS ve yetki testi yapılır.
7. `TASK_STATE.md` güncellenir.
8. Değişen dosyalar ve dikkat noktası raporlanır.
9. Sonraki faza geçmeden kullanıcı onayı beklenir.

## 17. Canlıya çıkış öncesi nihai kabul listesi

- [ ] Site müşteri girişi istemiyor.
- [ ] Yönetim paneli genel navigasyonda görünmüyor.
- [ ] Yalnızca yönetici içerik yazabiliyor.
- [ ] Public kullanıcı Supabase'e yazamıyor veya silemiyor.
- [ ] Tüm ürün, kategori ve koleksiyonlar doğru.
- [ ] Tüm fiyat ve adet kuralları doğru.
- [ ] Tüm görseller yönetim panelinde önizlenebiliyor.
- [ ] Kullanımda olan görsel yanlışlıkla silinemiyor.
- [ ] Instagram bağlantısı doğru.
- [ ] WhatsApp numarası ve mesajı doğru.
- [ ] Sepet mobil ve masaüstünde çalışıyor.
- [ ] Site ödeme alıyormuş gibi görünmüyor.
- [ ] Gerçek olmayan yorum veya istatistik bulunmuyor.
- [ ] Taslak yasal metin bulunmuyor.
- [ ] SEO temel dosyaları mevcut.
- [ ] Mobil taşma ve kırık düzen bulunmuyor.
- [ ] Konsol ve ağ hatası bulunmuyor.
- [ ] Firebase isteği bulunmuyor.
- [ ] GitHub, Vercel ve Supabase proje kimlikleri doğru.
- [ ] Rollback yedeği mevcut.

## 18. Resmi teknik referanslar

- Supabase changelog: https://supabase.com/changelog.md
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Storage erişim politikaları: https://supabase.com/docs/guides/storage/security/access-control
- Password Auth: https://supabase.com/docs/guides/auth/passwords
- Data API güvenliği: https://supabase.com/docs/guides/api/securing-your-api

Güncel Supabase değişiklikleri her uygulama fazından önce tekrar kontrol edilmelidir. 12 Ekim 2026 changelog kontrolünde bu proje mimarisini doğrudan engelleyen bir değişiklik görülmemiştir; modern TLS istemcileri kullanılmalıdır.
