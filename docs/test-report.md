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

## Faz 14 — Preview hazırlığı ve Roadmap §17 ön kontrolü

**Bu bölüm yalnız Preview ve ön kabul durumudur. Production deploy veya `main` merge yapılmadı.** Production ortamına değişken eklemek/kullanmak ve yayınlamak için kullanıcının açık `ONAYLIYORUM` mesajı bekleniyor.

### Hedef doğrulama

| Hedef | Doğrulanan değer | Durum |
|---|---|---|
| Git remote | `origin` → `https://github.com/rdvanyazici-arch/davet-sandigi.git` | **GEÇTİ** |
| Branch | `refactor/faz-2-yapi`; remote tracking branch ile eşit; worktree temiz | **GEÇTİ** |
| Phase 13 commit | `2d23e8b test: complete Phase 13 security acceptance` | **GEÇTİ** |
| Main | `origin/main` ref'i doğrulandı; merge/push yapılmadı | **GEÇTİ — DEĞİŞMEDİ** |
| Vercel proje | `rdvanyazici/davet-sandigi`, project ID `prj_IZyfmfA3gwqBZFkk3a2kx2j6kojL` | **GEÇTİ** |
| Supabase | `Davet Sandığı`, ref `zdksvgtkeeweufuajugd`, `ap-southeast-2`, `ACTIVE_HEALTHY` | **GEÇTİ** |
| Branch PR hazırlığı | Tek anlamlı Phase 13 commit'i feature branch'e push edildi. Karşılaştırma: https://github.com/rdvanyazici-arch/davet-sandigi/compare/main...refactor/faz-2-yapi?expand=1 | **HAZIR**; `gh` CLI mevcut olmadığından PR kaydı web arayüzünde açılmadı. |

### Vercel environment variable kontrolü

| Scope | `SUPABASE_URL` | `SUPABASE_PUBLISHABLE_KEY` | Durum |
|---|---|---|---|
| Preview | Tanımlı; onaylı Supabase ref'ine eşleşiyor | Tanımlı; `sb_publishable_` prefix'i doğrulandı | **GEÇTİ**; Preview/Production'dan ayrı scope |
| Production | Tanımlı değil | Tanımlı değil | **KALDI / YAYIN ENGELİ**; Production env değişkenleri henüz eklenmedi. Hiçbir değer eklenmedi veya değiştirilmedi. |

### Roadmap bölüm 17 — Preview üzerinde işaretleme

| Kabul maddesi | Durum | Kanıt / not |
|---|---|---|
| Site müşteri girişi istemiyor | **GEÇTİ** | Public HTML'de login/registration akışı yok; public tarayıcı testleri. |
| Yönetim paneli genel navigasyonda görünmüyor | **GEÇTİ** | Public navigasyon/E2E kontrolleri. |
| Yalnızca yönetici içerik yazabiliyor | **GEÇTİ** | RLS pgTAP ve anon PostgREST yazma testleri. |
| Public kullanıcı Supabase'e yazamıyor/silemiyor | **GEÇTİ** | Anon POST/PATCH/DELETE `401`; RLS pgTAP **28/28**. |
| Tüm ürün/kategori/koleksiyonlar doğru | **BEKLEMEDE** | Kullanıcı kararı gereği örnek kayıtlar taşınmadı; Supabase katalog boş. Gerçek katalog panelden girilecek. |
| Tüm fiyat/adet kuralları doğru | **KOD GEÇTİ / GERÇEK İÇERİK BEKLEMEDE** | Kurallar test fixture'larında doğru; yayındaki gerçek ürün/fiyat mevcut değil. |
| Tüm görseller yönetim panelinde önizlenebiliyor | **TEST AKIŞI GEÇTİ / GERÇEK MEDYA BEKLEMEDE** | Storage politika/UI testleri geçti; gerçek medya yüklenmedi. |
| Kullanımdaki görsel yanlışlıkla silinemiyor | **GEÇTİ** | Storage RLS/policy testleri ve UI arşiv→iki onaylı silme senaryosu. Canlı dosya silinmedi. |
| Instagram bağlantısı doğru | **BEKLEMEDE** | Gerçek doğrulanmış sosyal ayar henüz sağlanmadı; test fixture URL'si gerçek işletme kabul edilmedi. |
| WhatsApp numarası/mesajı doğru | **AKIŞ GEÇTİ / GERÇEK NUMARA BEKLEMEDE** | Mesaj biçimi/encode ve yönlendirme testleri geçti; canlı işletme değeri doğrulanmadı. |
| Sepet mobil/masaüstünde çalışıyor | **AKIŞ GEÇTİ / GERÇEK KATALOG BEKLEMEDE** | Chromium/WebKit/Firefox testleri geçti; Supabase gerçek kataloğu boş olduğu için canlı ürünle Preview sepet kontrolü yapılamadı. |
| Site ödeme alıyormuş gibi görünmüyor | **GEÇTİ** | Sipariş talebi dilini doğrulayan E2E. |
| Gerçek olmayan yorum/istatistik bulunmuyor | **GEÇTİ** | İçerik boş durumları ve onaysız legacy içerik bastırma testleri. |
| Taslak yasal metin bulunmuyor | **GEÇTİ** | Public legal modal taslak yerine henüz yayımlanmadı bilgisi gösteriyor. |
| SEO temel dosyaları mevcut | **GEÇTİ** | `robots.txt`, `sitemap.xml`, canonical, metadata ve JSON-LD E2E. |
| Mobil taşma/kırık düzen bulunmuyor | **GEÇTİ** | 390 px E2E; Chromium/WebKit/Firefox. |
| Konsol/ağ hatası bulunmuyor | **GEÇTİ (TEST ORTAMI)** | Boş içerik ve ana public/admin fixture testlerinde console/page errors yok; tam browser E2E geçti. |
| Firebase isteği bulunmuyor | **GEÇTİ (TEST ORTAMI)** | Kaynak taraması ve üç motorun request allowlist kontrolleri. |
| GitHub/Vercel/Supabase hedefleri doğru | **GEÇTİ** | Yukarıdaki ID/remote kontrolleri. |
| Rollback yedeği mevcut | **GEÇTİ** | Firebase snapshot'ları ve `docs/rollback.md` mevcut; silinmedi. |

Preview deployment: https://davet-sandigi-70r13w9sl-rdvanyazici.vercel.app (`READY`, Preview). `/index.html` ve `/admin.html` HEAD `200`; CSP ve güvenlik başlıkları mevcut. Vercel deployment protection nedeniyle tarayıcıda tam oturumlu canlı kullanım doğrulaması bu kontrole dahil değildir; eşdeğer uygulama akışları yerel Playwright browser paketinde test edilmiştir.

### Production onay kapısı

Production Vercel environment değişkenleri şu anda **boş**. Doğru Supabase URL ve yalnız publishable key'in Production scope'una eklenmesi, canlı deployment ve canlı veriye karşı kabul testleri için kullanıcı onayı gereklidir. Bu rapor **Production yayınına onay değildir**. `ONAYLIYORUM` gelmeden Production env değişikliği/deploy yapılmayacak. Main merge ve Phase 15 de bu çalışmada yapılmadı.

## Faz 15 — Hukuk danışmanı taslakları ve yeniden son kontrol

Bu fazda yalnızca hukuk danışmanının incelemesine sunulacak taslaklar ve panel/public görüntüleme akışı hazırlandı. Bu rapor veya taslak dosya **hukuki danışmanlık değildir**.

- [docs/legal-drafts.md](legal-drafts.md) içinde sekiz metin hazırlandı: gizlilik, KVKK aydınlatma, çerez/yerel depolama, WhatsApp/Instagram veri aktarımı, sipariş talebi/satış süreci, iptal/iade/kişiye özel ürün, kargo/teslimat, müşteri görseli/yorum izni.
- Her metin zorunlu “Hukuk danışmanı onayı bekliyor” notuyla başlar. Kullanıcının sağladığı bilgiler kullanıldı; resmi adres formatı, sürelerin iş/takvim günü olması, hukuki dayanaklar, başvuru süreci, hasarlı/ayıplı ürün çözümü gibi teyitsiz alanlar taslakta açıkça doldurulmaya bırakıldı. Özel üretim ürünlerde genel ve kesin “iade yok” feragati yazılmadı.
- Panelde sekiz ayrı `content_sections` anahtarı yapılandırıldı. Yeni kayıtlar taslak/pasif kalır; yayın için hukuk danışmanı onay kutusu, önizleme, metinden taslak uyarısı ve `[TAMAMLANACAK]` yer tutucularının kaldırılması gerekir. Bu fazda metinler DB'ye eklenmedi/yayınlanmadı.
- Public footer'da sekiz klavyeyle erişilebilir düğme bulunur. Modal yalnız `is_active=true` ve `legal_review_approved=true` içeriği gösterir; aksi durumda onaylanmamış metin yerine “Bu metin henüz onaylanıp yayımlanmamıştır.” gösterilir. Test, taslak marker'ının public DOM'a sızmadığını doğrular.
- Hukuk danışmanı tarafından onaylanmış gerçek metin bulunmadığından Roadmap §17 “taslak yasal metin bulunmuyor” maddesi ve final legal/publication kabulü **AÇIK**. Production env değerleri de Vercel'de yok; Production yayın kapısı ayrıca beklemededir.

### Roadmap §17 yeniden kontrolü (Phase 15 sonrası)

| Madde | Sonuç |
|---|---|
| Site müşteri girişi istemiyor; admin genel nav'da görünmüyor | **GEÇTİ** — önceki Faz 13 testleri tekrar kullanıldı; yeni feature bu davranışı değiştirmedi. |
| Yalnız admin içerik yazıyor; anon yazma/silme yok | **GEÇTİ** — linked RLS pgTAP ve elle PostgREST denemeleri Faz 13 raporunda. Bu faz DB'ye yazmadı. |
| Gerçek ürün/kategori/koleksiyon/fiyatlar | **AÇIK** — kullanıcı kararıyla örnekler aktarılmadı; gerçek katalog daha sonra yönetim panelinden doldurulacak. |
| Tüm gerçek görseller önizleniyor ve kullanımda olanlar silinemiyor | **AÇIK (gerçek içerik)** — medya akışı/politikaları test edildi; gerçek medya henüz eklenmedi. |
| Instagram doğru; WhatsApp numara/mesaj doğru | **AÇIK (işletme teyidi)** — uygulama akışı testli; yasal taslakta gerçek değerlerin ve iletişim sürecinin hukukçu/işletme teyidi bekleniyor. |
| Sepet mobil/masaüstünde; ödeme izlenimi yok | **GEÇTİ (test fixture)** — Phase 13 üç motor testleri; site sipariş talebi dilini kullanıyor. Gerçek katalogla canlı kontrol içerik girildikten sonra tekrarlanmalı. |
| Gerçek olmayan yorum/istatistik yok | **GEÇTİ (uygulama kontrolleri)** — eski örnekler bastırılıyor, aktif testler geçti. |
| Hukukçu onaylı yasal metin var; taslak/example ifadesi yok | **AÇIK** — yalnız inceleme taslakları hazır. Onaylı metin olmadan `content_sections` yayınlanamaz. Public sayfa DOM testinde “örnek/taslak/onay bekliyor/TAMAMLANACAK” ifadeleri görünmüyor; bu, taslakların hazır olduğu anlamına gelmez. |
| SEO, mobil taşma, link/görsel, konsol/ağ ve Firebase kontrolü | **GEÇTİ (Preview öncesi test fixture)** — tam E2E Chromium/WebKit/Firefox **38/38'er**, link/görsel kontrolleri ve public DOM taslak-marker testi geçti. |
| Kimlikler ve rollback yedeği | **GEÇTİ** — Git/Vercel/Supabase hedefleri Faz 14'te doğrulandı; rollback docs/Firebase backup korunuyor. |
| Production canlı doğrulaması | **BEKLEMEDE / ONAY GEREKİR** — Production Supabase env boş, Production deploy yapılmadı; açık “ONAYLIYORUM” mesajı olmadan yapılmayacak. |

Faz 15 sonrası unit testler **13/13**, Playwright tam paketleri Chromium **38/38**, WebKit **38/38**, Firefox **38/38** geçti. `node --check` ve `git diff --check` başarılı. Bu fazda deploy, uzak Supabase mutation, commit veya push yapılmadı.

### Faz 15 bağımsız şema denetimi

İlk uygulamada yönetim ve public tarayıcı testleri geçmesine rağmen uzak/yerel gerçek şemadaki `content_sections_key_check` yalnız Faz 7c anahtarlarını kabul ediyordu; sekiz `legal_*` kaydı gerçek Supabase'te reddedilecekti. `20261017091000_phase_15_legal_content.sql` ile anahtar listesi genişletildi. Aynı migration; yasal metin aktif edilirken başlık/metin, `legal_review_approved=true`, `legal_status=lawyer_approved` ve taslak yer tutucularının kaldırılmış olmasını DB seviyesinde zorunlu kılar.

Yerel migration uygulandı. Yeni `legal_content_test.sql` **8/8**, mevcut `page_content_test.sql` **20/20**, auth/SEO Node testleri **13/13** ve yerel DB lint geçti. Uzak dry-run yalnız `20261017091000_phase_15_legal_content.sql` migration'ının beklediğini doğruladı. Bu Codex ortamındaki hedef Playwright tekrarında macOS Mach port izni tarayıcıyı başlatmadı; kod/test hatası oluşmadan önce durdu. VS Code'da daha önce alınan üç motor **38/38** sonucu geçerlidir. Migration uzak Supabase'e gönderilmedi.
