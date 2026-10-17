# Davet Sandığı — Görev Durumu

## Güncel faz

- Güncel durum: Faz 13 test/güvenlik kabulü yerelde tamamlandı; Preview doğrulandı. Production deploy, commit ve push yapılmadı.
- Aktif faz: Faz 13 — yerel kabul testleri ve raporlama tamamlandı.
- Beklenen: Faz 13 raporunun kullanıcı incelemesi; Faz 14'e geçmeden önce kullanıcı onayı.

### Faz 0–15 durumları

- Faz 0 — Güvenli başlangıç ve yedek: **tamamlandı**
- Faz 1 — İçerik envanteri ve doğruluk kararı: **tamamlandı**
- Faz 2 — Kod yapısını güvenli biçimde ayırma: **tamamlandı**
- Faz 3 — Supabase proje ve yerel geliştirme kurulumu: **tamamlandı**
- Faz 4 — Database şeması, grant ve RLS: **tamamlandı**
- Faz 5 — Storage ve görsel kütüphanesi: **tamamlandı**
- Faz 6 — Yönetici kimlik doğrulaması: **tamamlandı**
- Faz 7 — Yönetim paneli ürün ve içerik modülleri: **tamamlandı (7a, 7b, 7c; migration'lar uzakta, kod GitHub branch'inde)**
- Faz 8 — Public showroom'un Supabase'e bağlanması: **tamamlandı**
- Faz 9 — Sepet ve WhatsApp akışı: **tamamlandı**
- Faz 10 — İçerik ve marka tutarlılığı: **yerelde tamamlandı — kullanıcı incelemesi bekleniyor**
- Faz 11 — SEO, hız ve erişilebilirlik: **yerelde tamamlandı — kullanıcı incelemesi bekleniyor**
- Faz 12 — Firebase verisini taşıma ve Firebase'i koddan çıkarma: **yerelde tamamlandı — örnek içerikler kullanıcı kararıyla aktarılmadı; runtime temizlendi**
- Faz 13 — Test, güvenlik ve kabul: **yerelde tamamlandı — test raporu hazır, kullanıcı incelemesi bekleniyor**
- Faz 14 — GitHub ve Vercel yayını: **bekliyor**
- Faz 15 — Yasal metinler ve son yayın kontrolü: **bekliyor**

## Tamamlanan fazlar

- 2026-10-13 — Faz 0 tamamlandı: Git etiketi/branch'i, Firestore yedeği, Storage kontrolü, geri dönüş rehberi ve canlı site referans görüntüleri hazırlandı.
- 2026-10-13 — Faz 1 tamamlandı: Mevcut içeriklerin örnek olduğu, gerçek veri olarak taşınmayacağı ve tüm içerik alanlarının yönetim panelinden yönetileceği onaylandı.
- 2026-10-13 — Faz 2 tamamlandı: Base64 görseller ayrıldı, CSS/JavaScript modüllere bölündü, yönetim ekranı `admin.html` dosyasına taşındı ve Firebase kodu tek legacy modülde toplandı.
- 2026-10-13 — Faz 3 tamamlandı: Supabase CLI kuruldu ve bağlandı; build sırasında tarayıcı yapılandırması üretildi; Vercel Preview değişkenleri doğru projeye eklendi.
- 2026-10-13 — Faz 4 tamamlandı: 12 içerik tablosu, constraint ve indeksler, grant/RLS politikaları, idempotent seed ve 24 RLS testi yerelde doğrulandı.
- 2026-10-13 — Faz 5 tamamlandı: `site-media` bucket, Storage RLS, WebP yükleme/doğrulama, görsel kullanım sorguları, önizleme, arşivleme ve güvenli kalıcı silme akışı hazırlandı; 10 Storage testi geçti.
- 2026-10-14 — Faz 6 tamamlandı: Public sign-up kapatıldı, parola politikası sertleştirildi, owner profili ve TOTP/AAL2 zorunluluğu yapılandırıldı; gerçek owner girişiyle yönetim panelinin açıldığı doğrulandı.
- 2026-10-14 — Faz 7a tamamlandı: Supabase tabanlı ürün listesi/arama/filtre/sayfalama, ürün ekleme-düzenleme-çoğaltma, ayrı taslak/yayın akışı, yayından kaldırma, arşivleme, fiyat/adet/sıra ayarları, galeri sıralaması ve mobil/masaüstü önizleme hazırlandı.
- 2026-10-15 — Faz 7b yerelde tamamlandı: kategori/koleksiyon ekleme-düzenleme, kapak önizlemesi, bağlı ürün sayısı, pasife alma/arşivleme ve tek satırlık site ayarları önizleme/doğrulama akışı hazırlandı.
- 2026-10-15 — Faz 7c yerelde tamamlandı: banner/hero (starts_at/ends_at zamanlama), üst bant, süreç adımları, neden biz, hikâyemiz, CTA, SSS, müşteri yorumları (izin teyidi + 1–5 puan) ve kampanya pop-up'ı Supabase'e bağlandı; her alanda masaüstü/mobil önizleme ve önizleme onaylı taslak/yayın akışı eklendi; yönetim ana ekranı (8.2) hazırlandı.
- 2026-10-16 — Faz 8 yerelde tamamlandı: public sayfa ürün, kategori, koleksiyon, banner, content_sections, SSS, yayındaki yorum ve `site_settings_public` verisini yalnızca Supabase REST (publishable key, açık sütun listeleri, `select=*` yok) üzerinden okuyor; yerel örnek veri ve Firebase runtime başlangıcı public akıştan çıkarıldı. Kategori/koleksiyon filtreleri, Storage görsellerinde gerçek alt/width/height, yalnızca hero eager + `fetchpriority=high`, bölüm bazlı loading/empty/error durumları, `#urun/<slug>` ve `?urun=<slug>` doğrudan bağlantı, katalog yüklenince pasif ürünlerin sepet/favoriden temizlenmesi, `Fiyat bilgisi şu an yüklenemedi` fiyat fallback'i ve uydurma kargo ücreti/eşiğinin kaldırılması (kargo etiketi `shipping_note`'tan) eklendi. Eski Firebase tarayıcı modülü Faz 12 runtime temizliğine kadar tutuldu ve sonrasında kaldırıldı.
- 2026-10-16 — Faz 8 Vercel Preview tamamlandı: klasör yalnızca `rdvanyazici/davet-sandigi` projesine bağlandı; `target=preview`, `status=Ready` ve `productionUrl=null` doğrulandı. Preview URL masaüstü 1280 px ve mobil 390 px görünümde açıldı; yatay taşma, konsol uyarısı/hatası, eski fiyat, `service_role` veya `sb_secret` bulunmadı. Supabase URL'si `zdksvgtkeeweufuajugd.supabase.co`, anahtar türü yalnızca publishable key olarak doğrulandı.
- 2026-10-16 — Faz 9 yerelde tamamlandı: sepet yalnızca `product_id`, `quantity`, `note` saklıyor; ürün adı/fiyatı güncel katalogdan çözülüyor; pasif ürün uyarılı biçimde toplam dışı kalıyor; minimum/artış ve teklif kuralları uygulanıyor. WhatsApp mesajı benzersiz referans, ürün/SKU/adet/fiyat, isteğe bağlı tarih/not ve açık bilgilendirme ile önizleniyor; müşteri bilgileri Supabase'e yazılmıyor. Gerçek telefon kontrol adımları `docs/whatsapp-device-test.md` içine eklendi.
- 2026-10-16 — Faz 10 yerelde tamamlandı: envanterdeki onaysız iletişim değerleri ile altı eski örnek yorum kaydı bastırılıyor; yalnızca envanterdeki beş kesin legacy SSS kaydı tanımlı çiftlerle ele alınıyor. Genel içerik/iddia filtresi yok: yönetim panelinden yayımlanan “el emeği”, “kişiye özel tasarım”, “kaliteli malzeme” gibi metinler aynen gösteriliyor. `min_quantity`, `quantity_step`, `default_min_quantity`, `default_quantity_step` ve `quote_threshold` pozitif tamsayı kısıtlarıyla kaynak değerlerini koruyor (25/25/100 değerleri değiştirilmez). Kargo/teslimat tekrarları yalnız `site_settings_public.shipping_note` / `delivery_text` değerlerinden besleniyor. Instagram ana marka/satış kanalı; WhatsApp sipariş talebi kanalı; telefon/e-posta `tel:`/`mailto:`. Baby Shower mevcut kapsam dışında olduğu için açıkça belirtiliyor. Sahte yorum fallback'i/statik süreç ve Neden Biz içerikleri kaldırıldı; onaylı yasal metin yoksa legal taslak gösterilmiyor.
- 2026-10-17 — Kullanıcı incelemesinde bulunan kapalı sepet çekmecesi erişilebilirlik hatası düzeltildi: `#drawer` başlangıçta `aria-hidden="true"` ve `inert`; `openCart()` bunları kaldırıyor, `closeCart()` odak iadesinden sonra geri ekliyor. Yeni Playwright regresyon testi kapalı durumdaki klavye erişimini, açılış/kapanışı ve açan düğmeye odak dönüşünü doğruluyor. Public-site Playwright paketi güncel kodda **22/22 başarılı**.
- 2026-10-17 — Faz 12 ilk salt-okunur karşılaştırması: Firebase yedeği 20 ürün / 7 kategori / 4 koleksiyon / 33 envanter görseli gösteriyor; Firebase Storage yedeğinde 0 nesne. Linked Supabase aggregate sorgusu 0 ürün / 0 kategori / 0 koleksiyon / 0 media_assets / 0 Storage nesnesi döndürdü. Ürün/kategori/koleksiyon/görsellerin tamamı envanterde `SİL`; bu nedenle aktarıma yetkili kayıt yok. Bu ara kontrolde import ve runtime temizliği kullanıcı kararı beklediğinden henüz yapılmamıştı; izleyen maddelerdeki kullanıcı kararı ve son uygulama durumu geçerlidir.
- 2026-10-17 — Kullanıcı kararıyla Faz 12 veri aktarımı atlandı: Firebase yedeğindeki 20 ürün / 7 kategori / 4 koleksiyon / 33 görsel örnek; hiçbiri Supabase'e taşınmayacak, Supabase boş kalacak ve gerçek içerikler daha sonra panelden girilecek. Import scripti oluşturulmadı, `service_role` kullanılmadı. Runtime temizliği tamamlandı: uygulamadaki Firebase browser modülü/config/SDK, Firebase'e bağlı `resizeImage`/`img:`/`ds_cloudimg_v1` ve legacy localStorage katalog/admin içerik akışları kaldırıldı. Firebase Firestore/Storage yedek otomasyonları `scripts/backup-firebase.mjs`, `scripts/backup-firebase-storage.mjs`, `scripts/firebase-backup-common.mjs` Git'ten geri getirildi ve yalnızca offline backup/rollback araçları olarak korundu; admin JSON import/export eski yolları kaldırıldı; legal metin alanı Faz 15'e kadar statik bilgilendirme gösterir. Firebase snapshot/yedekleri, `docs/rollback.md`, Firebase projesi ve örnek görsel dosyaları korundu.
- 2026-10-17 — Faz 12 doğrulaması: `tests/admin-auth.test.mjs` **8/8**; ilk public/admin E2E kabul paketi **33/33**. Bu anda pagination fixture testi henüz çalıştırılmamış/düzeltilmemişti; takip eden Faz 13'te kök neden bulunup giderildi. Boş Supabase public ve admin durumları hatasız açılıyor; public istek hostları yalnız local + izinli Supabase, admin boş fixture'ında yalnız local; tarayıcı konsol/sayfa hatası yok ve uygulama runtime'ında Firebase/Firestore/googleapis isteği yok. Uygulama HTML/JS runtime kaynak taraması temiz; korunan offline backup scriptleri bu taramadan ayrı değerlendirilir. Ayrıntı `docs/migration-report.md` içindedir.
- 2026-10-17 — Faz 13 sayfalama son düzeltmesi: `productEnsureListControls()` `.product-pagination` container'ını oluşturuyor ancak `id="product-pagination"` atamıyordu; `productRenderPagination()` bu nedenle `#product-pagination` bulamayıp `#product-next` üretmiyordu. Yalnız container ID'si atandı; pagination/durum/koleksiyon senaryosu Chromium, WebKit ve Firefox'ta geçti.
- 2026-10-17 — Faz 13 nihai kabul: beş linked pgTAP dosyası transaction rollback ile **93/93**; admin-auth + SEO birim testleri **13/13**; tam Playwright (pagination dahil) Chromium **36/36**, WebKit **36/36**, Firefox **36/36**. Docker kurulu; bu oturumda yerel Supabase servisleri başlatılmadı, Supabase CLI `npx --yes supabase@2.121.0` ile çalıştırıldı. Anon GET/yazma reddi, rol sınırları, Storage archive/delete, Türkçe, empty/loading/error, link/image ve admin noindex kontrolleri geçti. Advisor 22 bulgu ve önem dereceleri `docs/test-report.md` içinde. Final Preview `davet-sandigi-13nhmc9ae-rdvanyazici.vercel.app` READY; public/admin `200` ve güvenlik başlıkları doğrulandı. Production deploy, DB kalıcı değişikliği, commit ve push yapılmadı.
- 2026-10-13 — Proje yol haritası ve çalışma kuralları hazırlandı; bu çalışma uygulama fazı olarak sayılmadı.

## Açık kararlar / bekleyen onaylar

- Çalışma ağacı başlangıçta temiz olduğu için `chore: faz 0 öncesi mevcut durum` commit'i oluşturulmadı; commit edilecek mevcut değişiklik yoktu.
- Yerelde `vercel.json` ve `.vercel/project.json` bulunmadı; Vercel proje adı yalnızca mevcut proje kaydından doğrulanabildi.
- Yedek için oluşturulan Firebase Admin anahtarı halen aktif; güvenli saklama veya iptal işlemi ayrıca kullanıcı onayı gerektirir.
- Supabase organizasyonu `rdvanyazici-arch's Org` olarak doğrulandı.
- Supabase proje ref'i `zdksvgtkeeweufuajugd` olarak doğrulandı.
- Supabase bölgesi `ap-southeast-2` — Oceania (Sydney) olarak doğrulandı.
- Mevcut 20 ürün, 7 kategori, 4 koleksiyon, fiyatlar, adet kuralları, 33 görsel, 6 yorum, 5 SSS, iletişim bilgileri ve pazarlama iddiaları örnektir; Supabase'e gerçek içerik olarak taşınmayacaktır.
- Gerçek ürünler, kategoriler, koleksiyonlar, fiyatlar, adet kuralları ve görseller canlıya alınmadan önce yönetim panelinden girilecektir.
- Baby Shower şu anda sunulmamaktadır; ileride yönetim panelinden kategori/koleksiyon olarak eklenebilir.
- Sayfa yapısı korunacak; tüm içerik alanları yönetim panelinden eklenebilir, düzenlenebilir, yayından kaldırılabilir ve arşivlenebilir olacaktır.
- Kalıcı silme yerine önce pasife alma/arşivleme uygulanacaktır.
- Production deploy, kalıcı silme ve Firebase kapatma işlemleri ayrıca onay gerektirir.
- Supabase CLI tarayıcı girişi ve `zdksvgtkeeweufuajugd` proje bağlantısı tamamlandı.
- Statik site için build sırasında ortam yapılandırması üretme yöntemi kullanıcı tarafından onaylandı ve uygulandı.
- Vercel Preview ortamında `SUPABASE_URL` ve `SUPABASE_PUBLISHABLE_KEY` tanımlandı; Production ortamına eklenmedi.
- Vercel'in proje geneli Build Command ayarı Production'ı da etkileyebileceği için değiştirilmedi; repodaki `package.json` build scripti kullanılacak.
- Faz 4 migration'ları uzak `Davet Sandığı` Supabase projesine uygulandı; yerel ve uzak migration geçmişleri eşleşiyor.
- Docker Desktop kuruldu ve yerel Supabase çalışma zamanı doğrulandı.
- İdempotent `supabase/seed.sql` uzak projeye uygulandı; `site_settings` başlangıç satırı oluşturuldu.
- `site-media` için 6 MiB sınırı ve JPEG/PNG/WebP türleri seçildi; SVG kapalıdır. İleride SVG logo gerekirse ayrı, yalnızca yönetici yazabilen bucket güvenlik incelemesiyle değerlendirilecek.
- Faz 5 migration'ı kullanıcı onayıyla uzak `Davet Sandığı` Supabase projesine uygulandı; yerel ve uzak migration geçmişleri eşleşiyor.
- Görsel kütüphanesindeki Supabase yönetici yazma işlemleri, Faz 6 Auth ve owner yetkilendirmesi tamamlandığı için kullanılabilir durumdadır.
- Faz 6 migration'ı kullanıcı onayıyla uzak `Davet Sandığı` Supabase projesine uygulandı.
- Public sign-up kapalı ve e-posta onayı açık olarak dashboard'dan doğrulandı.
- Auth kullanıcısı `7590fe38-46b1-47dd-bd17-b83a0212e87c`, `admin_profiles` tablosuna aktif `owner` olarak eklendi.
- Rate limit değerleri varsayılan güvenli değerlerde bırakıldı; değişiklik gerekmiyor.
- Parola politikası ve ilk yönetim paneli girişindeki TOTP kurulumu tamamlandı.
- Apple Parolalar ile TOTP kaydı oluşturuldu. Supabase kullanıcı ekranında MFA faktörünün bulunduğu ve son girişin 14 Ekim 2026 19:07'de gerçekleştiği doğrulandı.
- MFA doğrulamasından dönen güncel AAL2 oturumu doğrudan yetkilendirmeye aktarılacak şekilde düzeltildi; profil, MFA ve panel yükleme hataları ayrı mesajlarla raporlanıyor.
- Yerel tarayıcının eski `admin-auth.js` dosyasını önbellekten kullandığı, eski genel hata mesajından doğrulandı; yönetici scriptine sürüm sorgusu eklendi.
- Panel oluşturma hatasının, eski yerel `img:` referansları okunurken `CLOUD_IMG` değişkeninin yalnızca legacy Firebase modülünde tanımlı olmasından kaynaklandığı belirlendi; yerel görsel önbelleği ortak yapılandırma modülüne taşındı.
- Faz 7a için `product_drafts`, atomik yayın fonksiyonları ve sahiplik indeksi uzak `zdksvgtkeeweufuajugd` projesine kullanıcı onayıyla uygulandı.
- Ürün görselleri önce merkezi kütüphaneye bağlantısız yüklenebilir, ardından ürün taslağında ana görsel/galeri olarak seçilebilir.
- Faz 7b migration'ı kullanıcı onayıyla uzak `zdksvgtkeeweufuajugd` projesine uygulandı (2026-10-15).
- Kategori ve koleksiyonlarda istemciye kalıcı silme yetkisi verilmedi; bağlı kayıtlar korunarak pasife alma ve arşivleme kullanılır.

- Faz 7c migration'ı (`20261015173221_phase_7c_page_content.sql`) kullanıcı onayıyla `supabase db push --linked --skip-vault --yes` ile uzak projeye uygulandı; `db reset`, seed, deploy, commit ve push yapılmadı. Uzak banners/content_sections/testimonials/faqs tablolarında kayıt olmadığı için yeni constraint'ler veri çakışması üretmedi.
- Banner, content_sections, testimonials ve faqs tablolarında istemciden kalıcı silme (DELETE grant/policy) kaldırıldı; kayıtlar yayından kaldırılarak taslağa alınır.
- Sayfa bölümleri `content_sections` anahtarlarıyla tutulur: `topbar`, `story`, `process`, `why_us`, `cta`, `campaign`. Hero istatistikleri (doğrulanamayan sayılar) ve bölüm başlığı/alt yazı alanları kaldırıldı.
- Eski localStorage render/import/export kodu Faz 12'de `admin-content.js` ve eski admin akışlarından kaldırıldı; güncel panel Supabase modüllerini kullanıyor.

## Bilinen riskler
- Fiyat değişikliği bildirimi açık oturumdaki katalog yenilemelerinde çalışır; gizlilik kuralı gereği önceki fiyat localStorage'a yazılmadığından tarayıcı tamamen kapatılıp açıldıktan sonra eski fiyatla karşılaştırma yapılamaz.
- `scripts/backup-firebase.mjs`, `scripts/backup-firebase-storage.mjs` ve `scripts/firebase-backup-common.mjs` yalnızca açıkça elle çalıştırılan Firebase yedek/geri dönüş araçlarıdır; site HTML'inden yüklenmez, runtime testlerinde çağrılmaz ve uygulama kodunda Firebase istemcisi yoktur.
- `index.html` içindeki eski statik süreç/neden biz metinleri HTML'de duruyor; çalışma anında yükleniyor durumuyla değiştiriliyor.
- Faz 10 grep'inde public runtime için demo/lorem/örnek/sample kalmadı. Envanterdeki onaysız telefon/e-posta/Instagram, müşteri adları ve iddia ifadeleri `catalog.js`/`site.js` içindeki suppression guard listelerinde literal olarak duruyor; sayfaya render edilmezler. Eski admin localStorage render/import/export kodu Faz 12'de kaldırıldı.
- `tests/e2e/product-admin.spec.mjs` ürün pagination testi Faz 13'te düzeltildi: eksik `product-pagination` ID'si pagination container'ına eklendi; Chromium/WebKit/Firefox'ta geçti.
- Uzak güvenlik advisor'ü iki bulgu veriyor: `site_settings_public` görünümü için `security_definer_view` (Faz 4'te bilinçli tasarlanmış, yalnızca güvenli sütunları açan `security_barrier` görünümü) ve `auth_leaked_password_protection` (Auth ayarı). İkisi de 7b/7c'den kaynaklanmıyor; bu adımda değiştirilmedi.
- Supabase CLI `npx` ile `supabase@2.121.0` olarak indirildi (`package.json`'da sabitli değil); önceki fazlarda 2.120.0 kullanılmıştı.

- Production'daki canlı sürüm henüz Faz 8 commit/deploy'u almadı ve eski Firebase tabanlı kaynağı kullanmaya devam ediyor; yerel Faz 8 kodu ise public içeriği Supabase'ten okuyor (Preview/Production yayını Faz 14'te).
- `index.html` 6.321.661 bayttan 23.769 bayta düşürüldü; görseller artık ayrı dosyalardan yükleniyor.
- Canlı yasal metinler taslak durumunda.
- Mevcut müşteri yorumları ve sayısal pazarlama iddiaları örnektir; yeni sisteme taşınmamalıdır.
- Canlı site hâlen örnek ürünler, görseller, fiyatlar, yorumlar ve iddialar gösteriyor; gerçek içerik girilmeden nihai production yayını yapılmamalı.
- Eski demo parola güncel koddan kaldırıldı ancak Git geçmişinde `81a3f8c` ve `5fc1878` commit'lerinde bulunuyor; gerçek bir hesapta kullanıldıysa veya başka yerde tekrarlandıysa değiştirilmelidir.
- Talep referansı zaman damgası ve kriptografik kısa kimlikle üretilir; merkezi sipariş kaydı tutulmadığı için küresel benzersizlik veritabanı constraint'iyle garanti edilmez.
- Firebase yedeği yalnızca yerel `backups/` altında ve Git dışında tutuluyor; ayrıca şifreli ikinci konuma kopyalanmalı.
- Davet Sandığı; GitHub, Vercel veya Supabase üzerinde diğer projelerle karıştırılmamalı.
- Yerel Supabase konteynerleri çalışıyor; bilgisayar yeniden başlatılırsa Faz 5 öncesinde Docker Desktop'ın açık olduğu doğrulanmalı.
- Görsel değiştirme işlemi bağlantıları yeni kayda taşıyıp eski kaydı arşivler; işlem sırasında bağlantı hatası olursa yeni görsel kaydı korunur ve panel açık hata gösterir.
- Uzak Supabase Faz 7a migration'larını aldı; yönetim panelinin `product_drafts` sorgusu için gerekli uzak şema hazırdır.
- Playwright testleri VS Code terminalinden Chromium ile çalıştırıldı; kategori, koleksiyon ve site ayarları akışlarının tamamı geçti.

## Kimlikler

- GitHub deposu: `rdvanyazici-arch/davet-sandigi`
- GitHub remote: `https://github.com/rdvanyazici-arch/davet-sandigi.git`
- Vercel proje adı: `davet-sandigi`
- Canlı adres: `https://davet-sandigi.vercel.app`
- Supabase organizasyonu: `rdvanyazici-arch's Org`
- Supabase proje adı: `Davet Sandığı`
- Supabase proje ref'i: `zdksvgtkeeweufuajugd`
- Supabase bölgesi: `ap-southeast-2` — Oceania (Sydney)
- Gizli anahtarlar: Bu dosyada tutulmaz.
- Firebase proje kimliği: `davetsandigi-3ae7b`
- Firebase Storage bucket: `davetsandigi-3ae7b.firebasestorage.app`
- Git koruma etiketi: `backup-pre-supabase-20261013`
- Git yedek branch'i: `backup-pre-supabase-20261013`

## Son çalıştırılan testler ve sonuçları

- 2026-10-17 — Faz 11 Lighthouse (yerel, headless; mobil 412×823 / masaüstü 1350×940): önce/sonra mobil Performance 85→97, Accessibility 94→100, Best Practices 96→100, SEO 91→100; masaüstü Performance 96→96, Accessibility 94→100, Best Practices 96→100, SEO 91→100. Son ölçümde kontrast, heading-order, meta-description, canonical ve image-alt denetimleri geçti. Ayrıntı ve laboratuvar metrikleri `docs/performance.md` içinde.
- 2026-10-17 — Faz 11 `npm run build`: başarılı; read-only Supabase slug sorguları 0 aktif ürün ve 0 aktif kategori döndürdü, bu nedenle sitemap yalnız canonical ana sayfayı içeriyor. Hata durumunda warning + ana sayfa-only fallback davranışı SEO birim testleriyle doğrulandı. Production deploy veya Supabase yazma işlemi yapılmadı.
- 2026-10-17 — `node --test tests/seo.test.mjs tests/admin-auth.test.mjs`: **11/11 başarılı**; `tests/e2e/public-site.spec.mjs`: ilk doğrulamada **21/21**, kapalı sepet düzeltmesinden sonra **22/22 başarılı** (SEO, sitemap kaynakları, canonical/Product JSON-LD, CSP, responsive görseller, mobil taşma ve klavye/modal odağı dahil).
- 2026-10-17 — Tam Playwright paketi: **31/32**; tek başarısız test `product-admin.spec.mjs` ürün sayfalama (`#product-next`) timeout'u. Bu hata temiz 7b tabanında ve Faz 11 öncesi de biliniyordu; bu fazda değiştirilmedi.
- 2026-10-17 — Değişen JavaScript dosyalarında `node --check`, `package.json`/`vercel.json` JSON parse ve `git diff --check`: **başarılı**. Kullanılmayan CSS Lighthouse tasarruf tahmini son ölçümde mobil/masaüstü 22/23 KiB olarak kaldı; etkileşimli/koşullu bileşenleri bozma riski nedeniyle genel CSS silme yapılmadı ve bu bulgu `docs/performance.md` içinde açıklandı.
- 2026-10-16 — Faz 10 kritik düzeltmesi: 25/100 özel değer eşlemeleri kaldırıldı; yayımlanmış yönetici kopyasına uygulanan genel claim filtresi kaldırıldı; örnek SSS bastırması yalnızca inventory'deki beş kesin eski soru/cevap çiftine daraltıldı.
- 2026-10-16 — Faz 10 hedef Playwright testleri: gerçek 25 minimum / 25 artış / 100 teklif eşiği korunması, onaylı claim metinlerinin render edilmesi, legacy iletişim/yorum örneklerinin bastırılması, Instagram/WhatsApp kanalları ve telefon/e-posta bağlantıları: **5/5 başarılı**.
- 2026-10-16 — `tests/e2e/public-site.spec.mjs`: **16/16 başarılı** (Faz 8, Faz 9 ve Faz 10); 390 px mobil taşma testi dahil.
- 2026-10-16 — Tam Playwright: **26/27**; tek başarısız eski `product-admin.spec.mjs` ürün sayfalama (`#product-next` timeout) testi 7b `76adf86` temiz worktree tabanında da başarısız olarak daha önce yeniden doğrulandı; Faz 10 ile ilgisiz, bu adımda değiştirilmedi.
- 2026-10-16 — `npm run test:cart` **4/4**, `page-content.spec.mjs` + `taxonomy-settings.spec.mjs` **8/8**, `npm run test:admin-auth` **7/7** başarılı.
- 2026-10-16 — `node --check` (config/catalog/site/cart/whatsapp) ve `git diff --check`: **başarılı**.
- 2026-10-16 — Runtime source grep: `demo|lorem|örnek|sample` için sonuç yok. Onaysız örnek telefon/e-posta/Instagram ve altı legacy yorum adı sadece exact suppression kayıtlarında bulunur; geniş ifade filtresi kaldırılmıştır.
- 2026-10-16 — `npm run test:cart`: sepet ekleme/çıkarma ve saklanan veri biçimi, teklif ürünü + WhatsApp mesaj önizlemesi, pasif ürün/güncel fiyat bildirimi, localStorage bellek fallback'i ve 390 px mobil taşma kontrolü: **4/4 başarılı**
- 2026-10-16 — Faz 9 JavaScript ve Playwright test dosyası sözdizimi, yasaklı satış dili taraması ve `git diff --check`: **başarılı**
- 2026-10-16 — Faz 9 Playwright senaryoları: sepet ekle/çıkar, minimum/artış, yalnız izinli localStorage alanları, teklif ürünü, WhatsApp mesaj/URL kodlama, müşteri verisinin Supabase'e gitmemesi, pasif ürün, fiyat değişikliği, localStorage bellek fallback'i ve 390 px mobil görünüm. Standart Playwright Chromium kurulumu tamamlandı; VS Code terminalinden çalıştırıldı.
- 2026-10-16 — Faz 8 `tests/e2e/public-site.spec.mjs`: aktif/pasif/arşivli ürün (liste, arama, doğrudan bağlantı, sepet), katalog hatasında sepetin korunması ve fiyat hata metni, fiyat modları, kategori/koleksiyon filtreleri, loading/empty/error durumları, görsel alt/width/height/loading, ağ hostu ve anahtar güvenliği: **9/9 başarılı** (konsol ve sayfa hatası yok)
- 2026-10-16 — Tam Playwright paketi: **19/20**; tek başarısız test eski `product-admin.spec.mjs` "ürün listesini sayfalar…" testi (7b tabanında da başarısız, Faz 8'den bağımsız)
- 2026-10-16 — `node --check` (`catalog.js`, `site.js`, `cart.js`, `whatsapp.js`): **başarılı**
- 2026-10-16 — Vercel Preview `dpl_3GpcCkx6CVLKWnzjZne967Ta1Cm9`: **başarılı** (`target=preview`, `Ready`, Production etkilenmedi). 1280 px masaüstü ve 390 px mobil görünümde sayfa açıldı; mobil `scrollWidth=390`, tüm veri bölümleri güvenli boş durumda, eski fiyat görünmüyor, hero eager/diğer görseller lazy, konsol uyarısı/hatası yok. Yapılandırmada yalnız `https://zdksvgtkeeweufuajugd.supabase.co` ve publishable key mevcut; `service_role`/`sb_secret` yok.

- 2026-10-15 — Uzak hedef doğrulaması: `projects list` bağlı projeyi `zdksvgtkeeweufuajugd` (Davet Sandığı) gösterdi; `migration list --linked` ve `db push --linked --dry-run` yalnızca `20261015170801` ve `20261015173221` bekliyordu: **beklenen**
- 2026-10-15 — `supabase db push --linked --skip-vault --yes`: iki migration uygulandı; sonraki `migration list --linked` yerel/uzak 10 sürümün tamamının eşleştiğini gösterdi: **başarılı**
- 2026-10-15 — `supabase db lint --linked --fail-on warning`: **No schema errors found**
- 2026-10-15 — Uzak katalog sorgusu: public şemada RLS'siz tablo yok; 14 yeni/ilgili constraint mevcut; `anon` yalnızca SELECT (tablolar ve `site_settings_public`), hiçbir tabloya yazma yetkisi yok; `authenticated` banners/content_sections/testimonials/faqs/categories/collections üzerinde DELETE yetkisine sahip değil; tüm UPDATE politikalarında USING ve WITH CHECK var; `anon` için çalıştırılabilir fonksiyon yok: **başarılı**
- 2026-10-15 — Uzak publishable key probu: `anon` GET banners/content_sections/testimonials/faqs/categories/collections/products 200 ve 0 satır; `site_settings_public` 200; `site_settings`, `admin_profiles`, `product_drafts` 401; POST/PATCH/DELETE yazma denemeleri 401/400: **başarılı** (veri yazılmadı)

- 2026-10-15 — Faz 7c `page_content_test.sql`: anonim/yönetici/pasif yönetici, zamanlama, izin teyidi, puan, URL, JSON şekli ve silme engeli: **20/20 başarılı**
- 2026-10-15 — Yerel DB testleri: `rls_test.sql` 28/28, `taxonomy_settings_test.sql` 20/20, `product_module_test.sql` 15/15, `storage_rls_test.sql` 10/10: **başarılı**
- 2026-10-15 — `supabase db lint --local --fail-on warning`: **No schema errors found**
- 2026-10-15 — Playwright (Chromium): `page-content.spec.mjs` 5/5 (ana ekran, banner zamanlama, yorum izni, süreç/SSS/kampanya, 390 px taşma kontrolü) ve `taxonomy-settings.spec.mjs` 3/3 başarılı; `product-admin.spec.mjs` 2/3 (sayfalama testi baseline'da da başarısız)
- 2026-10-15 — Masaüstü (1280 px) ve mobil (390 px) ekran görüntüleri incelendi; `npm run build`, `node --check`, `npm run test:admin-auth` (7/7) ve `git diff --check`: **başarılı**

- 2026-10-15 — `taxonomy_settings_test.sql`: anonim erişim, aktif/pasif/arşiv görünürlüğü, yönetici/pasif yönetici/yetkisiz kullanıcı, kalıcı silme engeli, WhatsApp doğrulaması ve kullanım sayıları: **20/20 başarılı**
- 2026-10-15 — Genel `rls_test.sql`: **28/28 başarılı**
- 2026-10-15 — `supabase db lint --local --fail-on warning`: **No schema errors found**
- 2026-10-15 — Yerel sorgu: `categories`, `collections` ve `site_settings` tablolarında RLS açık: **başarılı**
- 2026-10-15 — Faz 7b JavaScript/test sözdizimi, `npm run build` ve `git diff --check`: **başarılı**
- 2026-10-15 — Faz 7b Playwright: kategori ekleme/arşivleme, koleksiyon kapak önizleme/kaydetme ve site ayarları doğrulama/kaydetme: **3/3 başarılı**
- 2026-10-15 — Uzak migration dry-run: yalnızca `20261015170801_phase_7b_taxonomy_settings.sql` bekliyor; uzak veritabanına değişiklik gönderilmedi.
- 2026-10-15 — Faz 7a migration'ları `zdksvgtkeeweufuajugd` uzak projesine uygulandı; yerel ve uzak migration geçmişi eşleşiyor: **başarılı**
- 2026-10-15 — Uzak migration tekrar dry-run: `Remote database is up to date`: **başarılı**
- 2026-10-15 — `supabase db lint --linked --fail-on warning`: **No schema errors found**
- 2026-10-15 — Uzak sorgu doğrulaması: `product_drafts` tablosu RLS açık; `save_product_draft`, `publish_product_draft` fonksiyonları ve beklenen indeksler mevcut: **başarılı**
- 2026-10-14 — Faz 7a uygulama tarayıcısı Playwright kontrolü: ürün ekleme → taslak → düzenleme → yayınlama → arşivleme; Türkçe slug; önizleme zorunluluğu; mobil/masaüstü kart ve detay önizlemesi: **başarılı**
- 2026-10-14 — `product_module_test.sql`: taslak/yayın RPC, anon engeli, pasif ürün görünmezliği ve başarısız yayında canlı içeriğin korunması: **15/15 başarılı**
- 2026-10-14 — `rls_test.sql`: yeni `product_drafts` tablosu dahil genel RLS matrisi: **28/28 başarılı**
- 2026-10-14 — `supabase db lint --local --fail-on warning`: **No schema errors found**
- 2026-10-14 — `node --check`, `npm run build`, Playwright test keşfi ve `git diff --check`: **başarılı**
- 2026-10-14 — `npm run test:products`: testler keşfedildi; Chromium başlatma macOS çalışma alanı izni nedeniyle engellendi. Test akışı uygulama tarayıcısının Playwright denetimleriyle doğrulandı.
- 2026-10-14 — Yerel yönetim panelinde gerçek owner e-posta/parola girişi, Apple Parolalar TOTP, AAL2 yetkisi ve panel açılışı: **başarılı**
- 2026-10-14 — Supabase Auth kullanıcı ekranı: owner UUID/e-posta, MFA faktörü ve 19:07 son giriş bilgisi doğrulandı: **başarılı**
- 2026-10-14 — `npm run test:admin-auth`: güncel MFA oturumu ve ayrıştırılmış hata aşamaları dahil **7/7 başarılı**
- 2026-10-14 — `node --check assets/js/admin-auth.js` ve `git diff --check`: **başarılı**
- 2026-10-14 — Auth kullanıcısı e-posta/UUID eşleşmesi ve Supabase TOTP durumunun `Enabled` olduğu dashboard'dan doğrulandı: **başarılı**
- 2026-10-14 — MFA sonrası panel açılış hatası: ortak `esc()` yardımcısı `config.js` içine taşındı; admin script yükleme sırası testi eklendi.
- 2026-10-13 — `20261013164335_enforce_owner_mfa.sql` uzak `zdksvgtkeeweufuajugd` projesine uygulandı: **başarılı**
- 2026-10-13 — Uzak migration dry-run: `Remote database is up to date`: **başarılı**
- 2026-10-13 — İlk yönetici UUID'si aktif `owner` olarak eklendi ve `RETURNING` sonucu doğrulandı: **başarılı**
- 2026-10-13 — Uzak `supabase db lint --linked --fail-on warning`: **No schema errors found**
- 2026-10-13 — Dashboard doğrulaması: public sign-up kapalı, Confirm Email açık; rate limitleri token 150/5 dk, verification 30/5 dk, sign-up/sign-in 30/5 dk: **başarılı**
- 2026-10-13 — Faz 6 migration'ı sıfırlama yapılmadan yerel veritabanına uygulandı: **başarılı**
- 2026-10-13 — `npm run test:admin-auth`: yetkisiz/pasif kullanıcı, owner MFA, editor ve çıkış/geri tuşu davranışı **4/4 başarılı**
- 2026-10-13 — `npm run test:rls`: aktif/pasif yönetici, taslak görünürlüğü, editor/owner ve owner AAL2 yetkisi **28/28 başarılı**
- 2026-10-13 — `npm run test:storage`: owner AAL2 ile Storage yetkisi dahil **10/10 başarılı**
- 2026-10-13 — `supabase db lint --local --fail-on warning`: **No schema errors found**
- 2026-10-13 — Yerel tarayıcı kontrolü: giriş formu/noindex, ana navigasyonda admin bağlantısının olmaması ve konsol hatası bulunmaması doğrulandı: **başarılı**
- 2026-10-13 — Demo parola güncel kaynakta bulunmadı; Git geçmişinde iki eski commit'te bulunduğu doğrulandı.

- 2026-10-13 — `PROJECT_ROADMAP.md` kökte bulundu ve 936 satırın tamamı okundu: **başarılı**
- 2026-10-13 — Yol haritasındaki 1–18 bölüm başlıkları doğrulandı: **başarılı**
- 2026-10-13 — `AGENTS.md` satır sayısı ve zorunlu kuralları doğrulandı: **başarılı**
- 2026-10-13 — `git diff --check -- AGENTS.md`: **başarılı**
- 2026-10-13 — Proje yolu, `origin`, `main` branch ve temiz başlangıç durumu doğrulandı: **başarılı**
- 2026-10-13 — Git etiketi ve yedek branch'in `10c99237a3186444b66d5ad5701dceefb0f42f3b` commit'ini gösterdiği doğrulandı: **başarılı**
- 2026-10-13 — Firebase yedek scriptleri `node --check` ile doğrulandı: **başarılı**
- 2026-10-13 — Kimlik bilgisi yokken scriptlerin veri yazmadan güvenli biçimde durduğu doğrulandı: **başarılı**
- 2026-10-13 — `index.html` base64 taraması: **33 görsel / 4.414 MiB**
- 2026-10-13 — Canlı sitenin Playwright masaüstü ve mobil tam sayfa referans görüntüleri alındı: **başarılı**
- 2026-10-13 — Firestore yedeği: `site` 1 belge, `images` 3 belge: **başarılı**
- 2026-10-13 — Storage kontrolü: bucket mevcut değil, 0 dosya manifestlendi: **başarılı**
- 2026-10-13 — Yedek JSON dosyaları ayrıştırıldı, belge sayıları manifestlerle karşılaştırıldı ve SHA-256 değerleri alındı: **başarılı**
- 2026-10-13 — İndirilemeyen ilk service account anahtarı silindi; çalışan ikinci anahtar doğrulandı: **başarılı**
- 2026-10-13 — `git diff --check`: **başarılı**
- 2026-10-13 — Faz 5 migration'ı `supabase migration up --local` ile sıfırlama yapılmadan uygulandı: **başarılı**
- 2026-10-13 — `npm run test:storage`: **10/10 test başarılı**
- 2026-10-13 — Faz 5 kısıtlarıyla `npm run test:rls`: **24/24 test başarılı**
- 2026-10-13 — `supabase db lint --local --fail-on warning`: **No schema errors found**
- 2026-10-13 — Görsel Kütüphanesi DOM kontrolü: sekme, yükleme alanları, 8 filtre ve masaüstü iki sütunlu düzen doğrulandı: **başarılı**
- 2026-10-13 — Faz 5 JavaScript sözdizimi, paket JSON ayrıştırması, satır içi olay taraması ve `git diff --check`: **başarılı**
- 2026-10-13 — `supabase db push --linked --skip-vault --yes`: Faz 5 Storage migration'ı `zdksvgtkeeweufuajugd` uzak projesine uygulandı: **başarılı**
- 2026-10-13 — Uzak migration doğrulaması: `Remote database is up to date`: **başarılı**
- 2026-10-13 — Uzak bucket sorgusu: `site-media`, public okuma, 6 MiB, JPEG/PNG/WebP ve 4 Storage politikası doğrulandı: **başarılı**
- 2026-10-13 — `supabase db lint --linked --fail-on warning`: **No schema errors found**
- 2026-10-13 — Supabase CLI `2.120.0` ile şema, indeks ve grant/RLS migration dosyaları ayrı ayrı oluşturuldu: **başarılı**
- 2026-10-13 — Faz 4 statik kapsam kontrolü: 12 tablo, 12 RLS etkinleştirmesi, 54 ayrı politika ve 24 RLS test iddiası doğrulandı: **başarılı**
- 2026-10-13 — `orders`/`customers` tablosu ve yetkilendirmede `user_metadata` kullanımı bulunmadı: **başarılı**
- 2026-10-13 — `package.json` ayrıştırması ve `git diff --check`: **başarılı**
- 2026-10-13 — Docker Desktop `4.95.0` ve yerel Supabase servisleri başlatıldı: **başarılı**
- 2026-10-13 — `supabase db reset`: üç migration ve idempotent seed temiz yerel veritabanına uygulandı: **başarılı**
- 2026-10-13 — `npm run test:rls`: **24/24 test başarılı**
- 2026-10-13 — `supabase db lint --local --fail-on warning`: **No schema errors found**
- 2026-10-13 — `supabase db push`: üç Faz 4 migration'ı `zdksvgtkeeweufuajugd` uzak projesine uygulandı: **başarılı**
- 2026-10-13 — `supabase db push --include-seed`: idempotent başlangıç ayarı uzak veritabanına eklendi: **başarılı**
- 2026-10-13 — Yerel ve uzak migration geçmişindeki üç sürümün eşleşmesi doğrulandı: **başarılı**
- 2026-10-13 — `supabase db lint --linked --fail-on warning`: **No schema errors found**
- 2026-10-13 — Uzak REST/RLS kontrolü: anonim public ayar okuması `200` ve 1 satır; `admin_profiles` okuması ile kategori yazması `401`: **başarılı**
- 2026-10-13 — Supabase proje adı dashboard üzerinden `Davet Sandığı` olarak değiştirildi; ref ve bölge yeniden doğrulandı: **başarılı**
- 2026-10-13 — Supabase CLI `2.120.0`, npm güncel sürümü `2.120.0`: **güncel**
- 2026-10-13 — `supabase init`: `config.toml`, `migrations/`, `seed.sql` ve `tests/` yapısı oluşturuldu: **başarılı**
- 2026-10-13 — `.env.local` ve `.env.production` Git dışında, `.env.example` Git'e açık: **başarılı**
- 2026-10-13 — Supabase gizli anahtar taraması: `sb_secret_` ve JWT biçimli gizli token bulunmadı; `service_role` yalnızca güvenlik kuralı ve yorum metinlerinde geçiyor: **başarılı**
- 2026-10-13 — `assets/js/config.js` ve `assets/js/supabase-client.js` sözdizimi kontrolü (`node --check`): **başarılı**
- 2026-10-13 — Faz 3 değişikliklerinde boşluk/patch doğrulaması (`git diff --check`): **başarılı**
- 2026-10-13 — `npm run build`: Git dışında tutulan Supabase tarayıcı yapılandırması doğru proje ref'i ve publishable key türüyle üretildi: **başarılı**
- 2026-10-13 — Yerel yapılandırmayla Supabase Auth ayar uç noktasına bağlantı: **başarılı**
- 2026-10-13 — `supabase login`: tarayıcı doğrulaması tamamlandı: **başarılı**
- 2026-10-13 — `supabase link --project-ref zdksvgtkeeweufuajugd`: `Finished supabase link` sonucu ve yerel `.temp/project-ref` değeri doğrulandı: **başarılı**
- 2026-10-13 — Vercel `davet-sandigi` projesinde iki Supabase değişkeninin yalnızca Preview ortamında kayıtlı olduğu doğrulandı: **başarılı**
- 2026-10-13 — Vercel Preview ortamı simülasyonu (`VERCEL_ENV=preview npm run build`), JavaScript sözdizimi ve proje ref'i kontrolü: **başarılı**
- 2026-10-13 — İlk Vercel Preview deployment'ında build ve Supabase yapılandırma üretimi başarılı oldu; varsayılan `public` çıktı dizini bulunamadığı için deployment hata verdi.
- 2026-10-13 — Statik site çıktısı için `vercel.json` içinde `outputDirectory: "."` tanımlandı; yeni Preview deployment doğrulaması bekleniyor.
- 2026-10-13 — Faz 1 kaynak karşılaştırması: Firebase yedeği ile `index.html` ana kataloğu **20 ürün / 7 kategori / 4 koleksiyon / 6 yorum / 5 SSS** olarak eşleşti.
- 2026-10-13 — Görsel envanteri: `index.html` içinde **30 benzersiz görsel**, Firebase `images` koleksiyonunda bunlardan farklı **3 görsel** bulundu.
- 2026-10-13 — Görsel tekrar kontrolü: `hero` Base64 verisi 2, `cta` Base64 verisi 3 kez gömülü bulundu.
- 2026-10-13 — `docs/inventory.md` tablo ve zorunlu durum değerleriyle oluşturuldu: **başarılı**
- 2026-10-13 — Faz 1 belge doğrulaması: 20 ürün, 33 görsel, 6 yorum, 5 SSS ve 20 kullanıcı sorusu sayıldı; `git diff --check` geçti: **başarılı**
- 2026-10-13 — Faz 1 kullanıcı kararı işlendi: tüm örnek kayıtlar migration dışında `SİL`, yönetim paneli kontrol alanları `DOĞRULANDI` olarak işaretlendi: **başarılı**
- 2026-10-13 — Faz 1 son kontrolü: 24 yönetim paneli kontrol alanı doğrulandı, bekleyen envanter satırı kalmadı ve `git diff --check` geçti: **başarılı**
- 2026-10-13 — Faz 2 JavaScript sözdizimi kontrolü (`node --check`, 10 dosya): **başarılı**
- 2026-10-13 — Base64 taraması: `index.html`, `admin.html`, CSS ve JavaScript dosyalarında `data:image` kalmadı: **başarılı**
- 2026-10-13 — Satır içi yapı taraması: HTML içinde `<style>`, gömülü `<script>`, `style` ve olay niteliği kalmadı; statik stiller CSS sınıflarına taşındı: **başarılı**
- 2026-10-13 — Görsel çıkarma: 30 benzersiz JPEG aslı ve 30 WebP karşılığı oluşturuldu; 30 referansın tamamı mevcut: **başarılı**
- 2026-10-13 — WebP kontrolü: tüm boyutlar eşleşti; yüksek kaliteli WebP toplamı 3.665.926 bayttan 1.951.384 bayta düştü (%46,8): **başarılı**
- 2026-10-13 — Faz 0 masaüstü karşılaştırması: 1440×8016 ölçüsü birebir eşleşti; görsel düzen farkı görülmedi: **başarılı**
- 2026-10-13 — Faz 0 mobil karşılaştırması: genişlik 396 px eşleşti; yerel sayfa 14097 px, referans 14129 px (32 px kısa); içerik, renk ve bileşen düzeninde görsel fark görülmedi.
- 2026-10-13 — Yerel tarayıcı kontrolü: public sayfa ve `admin.html` açıldı, fallback WebP görsellerinde kırık bağlantı ve konsol hatası yok: **başarılı**
- 2026-10-13 — Faz 2 son boyutları: HTML 29.428 bayt, CSS 41.913 bayt, JavaScript 84.532 bayt, JPEG asıllar 3.665.926 bayt, WebP dosyaları 1.951.384 bayt.
- 2026-10-13 — Yerel Playwright paketinin tarayıcı başlatması macOS çalışma alanı izni nedeniyle engellendi; aynı Chromium tabanlı uygulama tarayıcısındaki Playwright denetimleriyle masaüstü/mobil kontrol tamamlandı.
- 2026-10-13 — `git diff --check`: **başarılı**

## Sonraki adım

- Faz 10 değişiklikleri kullanıcı tarafından incelenip commit edilecek.
- Faz 11 — SEO, hız ve erişilebilirlik için kullanıcı onayı/komutu beklenecek; onay olmadan sonraki faza geçilmeyecek.
