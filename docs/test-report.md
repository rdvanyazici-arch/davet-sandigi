# Faz 13 — Test, güvenlik ve kabul raporu

**Tarih:** 17 Ekim 2026  
**Kapsam:** Faz 13 kabul testleri. Yeni ürün özelliği eklenmedi. WebKit odak iadesi ve testte bulunan ürün sayfalama container ID hatası düzeltildi. **Production, veritabanı/Storage kalıcı değişikliği, commit veya push yapılmadı.**

## Sonuç özeti

- Kritik/yüksek önem derecesinde doğrulanmış uygulama kusuru: **yok**.
- Beş Supabase pgTAP paketi toplam **93/93** başarılı; her test dosyası `BEGIN`…`ROLLBACK` ile çalıştı. Uzak Supabase'te kalıcı test verisi bırakılmadı.
- Anon REST yazma denemeleri `401`; public okuma `200`.
- E2E: Chromium **36/36**, WebKit **36/36**, Firefox **36/36**; sayfalama testi dahil.
- Auth/SEO birim testleri **13/13**.
- Preview deployment **Ready**; public ve admin sayfaları `200`, güvenlik başlıkları mevcut.

## Roadmap Faz 13 kontrol listesi

| Kontrol | Sonuç | Kanıt / kapsam |
|---|---|---|
| Public okuma | **GEÇTİ** | `rls_test.sql` dahil pgTAP **28/28**; anon `products`, `categories`, `collections`, `site_settings_public` GET'leri `200`. Gizli yönetim tabloları anon için kapalı. |
| Yetkisiz yazma/silme reddi | **GEÇTİ** | RLS pgTAP anon tablolarında INSERT/UPDATE/DELETE yetkisi olmadığını doğruluyor. Publishable key ile PostgREST POST/PATCH/DELETE denemeleri sırasıyla `401/401/401`; `service_role` kullanılmadı. |
| Yönetici CRUD ve rol sınırları | **GEÇTİ** | Product **15/15**, taxonomy/settings **20/20**, page content **20/20**, genel RLS **28/28**. Aktif owner AAL2, aktif editor izinleri, pasif admin reddi ve editor'ın owner yetkisi olmaması test edildi. Ürün/kategori/koleksiyon/içerik CRUD E2E mock Supabase üzerinde başarılı. |
| Storage politika ve yükleme sınırları | **GEÇTİ** | Storage pgTAP **10/10**: anon upload/list/delete reddi, pasif admin upload reddi, aktif admin'in yalnız izinli path'e yüklemesi ve arşiv yoluna sınırlı DELETE politikası. |
| Görsel arşivleme ve kalıcı silme akışı | **GEÇTİ** | E2E arşivde `story/b.webp` → `archive/story/b.webp` taşımasını, ardından iki ayrı onaylı kalıcı silmeyi ve kaydın kaldırılmasını doğruluyor. RLS testi silme politikası kısıtını doğruluyor. Gerçek nesne silme yapılmadı. |
| Sepet ve WhatsApp mesajı | **GEÇTİ** | Public E2E'de sepet, minimum/artış, teklif/fiyat, mesaj önizlemesi ve WhatsApp URL/mesaj davranışları; üç motorun tamamında geçti. Müşteri verisinin Supabase'e yazılmadığı ağ testi mevcut. |
| Mobil/masaüstü tarayıcılar | **GEÇTİ** | Chromium, WebKit, Firefox'ın her birinde public/admin E2E **36/36**. 1280×900 varsayılan masaüstü ve 390×844 mobil taşma testi dahil. WebKit'te tıklamayla açılan modalın odak iadesi başarısızlığı bulundu ve çağıran düğme açıkça iletilerek düzeltildi; yeniden test edildi. |
| Boş/yükleniyor/hata durumları | **GEÇTİ** | Boş public katalog, boş Supabase admin paneli, yükleniyor, katalog/SSS içerik hataları ve yeniden deneme akışları test edildi. Boş admin paneli her motor ve konsol/sayfa hatasız açıldı. |
| Türkçe karakterler | **GEÇTİ** | Ürün adı “Çiçekli Şişe & Özel Ürün” için `cicekli-sise-ozel-urun` slug'ı; ürün/kategori metinleri ve Türkçe içerik E2E ile üç motor test edildi. |
| Kırık dahili bağlantı ve eksik görsel taraması | **GEÇTİ (dahili kapsam)** | Fragment hedefleri ve aynı-origin href'ler kontrol edildi; sayfada yüklenen her görselin `decode()`, `complete` ve `naturalWidth` durumu kontrol edildi. Supabase Storage yanıtları tarayıcı testlerinde geçerli PNG fixture ile taklit edildi; uzak tabloda aktif ürün/görsel olmadığı için gerçek kullanıcı görsellerinin dosya mevcudiyeti bu testle ölçülemedi. Dinamik dış hedeflerin canlı erişilebilirliği doğrulanmadı. |
| Supabase security/performance advisor | **GEÇTİ (bulgular var)** | Linked advisor salt-okunur çalıştı; 22 bulgu: 1 ERROR (`security_definer_view`), 11 WARN, 10 INFO. Ayrıntı aşağıda. Hiçbir DB değişikliği yapılmadı. |
| Vercel Preview kabulü | **GEÇTİ** | Final Preview: https://davet-sandigi-13nhmc9ae-rdvanyazici.vercel.app — `target=preview`, `READY`. `/index.html` ve `/admin.html` HEAD `200`; CSP, Referrer-Policy, `X-Content-Type-Options`, `X-Frame-Options` mevcut. Vercel Preview `X-Robots-Tag: noindex` (beklenen); admin HTML ayrıca `noindex,nofollow,noarchive`. Production deploy yapılmadı. |

## Sayfalama testi kök nedeni ve düzeltme

`product-admin.spec.mjs` fixture'ı dokuz ürün döndürüyor ve uygulama durumu `9 ürün bulundu` olarak güncelleniyordu; ancak `productEnsureListControls()` sayfalama container'ını yalnızca `product-pagination` CSS class'ıyla oluşturuyor, `productRenderPagination()` ise `#product-pagination` ID'siyle arıyordu. Bu nedenle pagination markup'ı hiç render edilmiyor ve `#product-next` bulunamıyordu. Uygulamada container oluşturulurken eksik ID atandı; ürün listesi/pagination davranışında başka refactor yapılmadı. Senaryo Chromium, WebKit ve Firefox'ta ayrı ayrı geçti ve tam paketlere dahil edildi.

## Ek güvenlik kontrolleri

### Anon PostgREST — elle yapılan istekler

| İstek | Sonuç |
|---|---|
| `GET /rest/v1/products?select=id&limit=1` | **GEÇTİ — 200** |
| `GET /rest/v1/categories?select=id&limit=1` | **GEÇTİ — 200** |
| `GET /rest/v1/collections?select=id&limit=1` | **GEÇTİ — 200** |
| `GET /rest/v1/site_settings_public?select=id,brand_name&limit=1` | **GEÇTİ — 200**; yalnız tanımlı public projection, 14 public kolon |
| `GET /rest/v1/site_settings?select=id` | **GEÇTİ — 401** |
| `GET /rest/v1/admin_profiles?select=user_id` | **GEÇTİ — 401** |
| `GET /rest/v1/product_drafts?select=id` | **GEÇTİ — 401** |
| `POST /rest/v1/product_drafts` | **GEÇTİ — 401** |
| `PATCH /rest/v1/categories?id=eq.-2147483648` | **GEÇTİ — 401** |
| `DELETE /rest/v1/products?id=eq.-2147483648` | **GEÇTİ — 401** |

Tüm çağrılar yalnızca yoksayılan yerel runtime yapılandırmasındaki `sb_publishable_` anahtarıyla yapıldı; anahtar değeri ekrana veya dosyaya yazılmadı. Yazma denemeleri yetkilendirme aşamasında reddedildi, hiçbir satır değişmedi.

### Anahtar/parola taraması

- Mevcut dosyalar ve erişilebilir Git blob'ları `service_role`/`sb_secret` gerçek biçimleri, özel anahtar PEM'i ve JWT literal'ları için tarandı. Otomatik test **GEÇTİ**; gerçek private/service-role anahtarı veya token tespit edilmedi. `.env.example`, migration, güvenlik belgesi ve negatif testlerde anahtar adlarının/örüntülerinin anılması içerik eşleşmesidir; gizli değer değildir. `.env.example` ve Supabase CLI'nin yerel `postgres` geliştirme parolası canlı credential değildir.
- Supabase'in üretilen runtime config'i `sb_publishable_` türünde; değer rapora yazılmadı.
- Erişilebilir Git geçmişinde eski demo parola referansları daha önce `81a3f8c` ve `5fc1878` commit'lerinde belgelenmişti. Güncel runtime'da yoktur. Gerçek bir hesapta tekrar kullanıldıysa o hesap parolası ayrıca döndürülmelidir; bu test kapsamında kimlik bilgisi değişikliği yapılmadı.
- Silinmiş legacy dosyanın eski Git blob'larında Firebase **public client API key** bulunması beklenen tarihsel kayıttır; service-role benzeri bir anahtar değildir. Firebase runtime/config mevcut kaynakta yoktur; Firebase projesi ve rollback yedekleri korunur.

## Supabase advisor bulguları ve önem derecesi

| Seviye | Bulgu | Etki değerlendirmesi / işlem |
|---|---|---|
| **Orta** (advisor ERROR) | `public.site_settings_public` `security_definer_view` | Bu görünüm yalnızca `id=1` için tanımlı public ayar kolonlarını projekte eder; `anon` base `site_settings` tablosuna erişemez (PostgREST `401`), `security_barrier=true`. Public projection tasarımı kasıtlıdır. RLS/grant mimarisini değiştirecek migration bu test fazında uygulanmadı. |
| **Orta** (advisor WARN) | Leaked password protection kapalı | Supabase Auth konfigürasyon uyarısı. Kimlik doğrulama sağlayıcısı ayarıdır; uzaktan değiştirilmedi. Owner tarafından dashboard'da değerlendirilmesi önerilir. |
| **Düşük** (10 advisor WARN) | `authenticated` için public+admin SELECT politikalarının örtüşmesi (10 içerik tablosu) | İki ayrı politika public aktif satırlar ve admin taslak/arşiv okumasını sağlıyor; yetki testleri beklenen sonuç verdi. Advisor performans uyarısı; politika konsolidasyonu gerektirecek şema değişikliği yapılmadı. |
| **Düşük** (10 advisor INFO) | Kullanılmayan indeksler | Boş/çok az kullanılmış veritabanında advisor sayaçlarıdır; indeksler güvenlik riski değil. İndeks silinmedi. |

## Pagination testi kök nedeni ve düzeltme

`productEnsureListControls()` `.product-pagination` container'ını oluşturuyor ancak `id="product-pagination"` atamıyordu. `productRenderPagination()` bu container'ı `#product-pagination` ile aradığı için pagination markup'ı hiç üretilmiyor; fixture'da 9 ürün bulunmasına rağmen `#product-next` bulunamıyordu. Container oluşturulurken ID atandı; gereksiz uygulama refactor'u yapılmadı. Sayfalama, durum ve koleksiyon filtresi testi Chromium, WebKit ve Firefox'ta geçti ve tam kabul paketlerine dahil edildi.

## Kalan sınırlamalar

| Önem | Sonuç | Açıklama |
|---|---|---|
| **Düşük — KALDI / kapsam sınırı** | Dış linklerin canlı erişilebilirliği | Public veritabanında onaylı gerçek işletme URL'leri bulunmadığından örnek/test fixture URL'lerinin Instagram/WhatsApp hedefinde gerçekten açıldığı doğrulanmadı. İç fragment ve same-origin linkleri üç tarayıcıda geçti. |

Docker kurulu. Bu oturumda Docker üzerinden **yerel Supabase servisleri başlatılmadı**; Supabase CLI `npx --yes supabase@2.121.0` ile çalıştırıldı. Beş DB test dosyası linked Supabase'te transaction `ROLLBACK` ile koştu; kalıcı değişiklik yapılmadı.

**Kritik/yüksek bulgu:** Yok. Bu nedenle uygulama kodunda kritik/yüksek önem dereceli düzeltme gerekmedi. WebKit'te bulunan orta düzey odak iadesi farkı, kapsam içi tarayıcı tutarlılığı için düzeltildi ve üç motorun son testinde geçti.

## Çalıştırılan test paketleri

- pgTAP (linked, her dosya `BEGIN`/`ROLLBACK`): RLS **28/28**, Storage **10/10**, product module **15/15**, taxonomy/settings **20/20**, page content **20/20** — toplam **93/93**.
- Node: `tests/admin-auth.test.mjs` + `tests/seo.test.mjs` **13/13**.
- Playwright tam kabul paketi (pagination dahil): Chromium **36/36**, WebKit **36/36**, Firefox **36/36**.
- JavaScript/test syntax, JSON parse ve `git diff --check`: **GEÇTİ**.
