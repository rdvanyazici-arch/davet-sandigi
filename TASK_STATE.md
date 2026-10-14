# Davet Sandığı — Görev Durumu

## Güncel faz

- Güncel durum: Faz 6 tamamlandı; owner hesabıyla e-posta/parola, Apple Parolalar TOTP, AAL2 yetkisi ve yönetim paneli açılışı doğrulandı.
- Aktif faz: Yok — Faz 6 tamamlandı.
- Beklenen: Kullanıcının Faz 7 komutunu göndermesi.

### Faz 0–15 durumları

- Faz 0 — Güvenli başlangıç ve yedek: **tamamlandı**
- Faz 1 — İçerik envanteri ve doğruluk kararı: **tamamlandı**
- Faz 2 — Kod yapısını güvenli biçimde ayırma: **tamamlandı**
- Faz 3 — Supabase proje ve yerel geliştirme kurulumu: **tamamlandı**
- Faz 4 — Database şeması, grant ve RLS: **tamamlandı**
- Faz 5 — Storage ve görsel kütüphanesi: **tamamlandı**
- Faz 6 — Yönetici kimlik doğrulaması: **tamamlandı**
- Faz 7 — Yönetim paneli ürün ve içerik modülleri: **bekliyor**
- Faz 8 — Public showroom'un Supabase'e bağlanması: **bekliyor**
- Faz 9 — Sepet ve WhatsApp akışı: **bekliyor**
- Faz 10 — İçerik ve marka tutarlılığı: **bekliyor**
- Faz 11 — SEO, hız ve erişilebilirlik: **bekliyor**
- Faz 12 — Firebase verisini taşıma ve Firebase'i koddan çıkarma: **bekliyor**
- Faz 13 — Test, güvenlik ve kabul: **bekliyor**
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

## Bilinen riskler

- Canlı kaynak halen Firebase kullanıyor; Supabase geçişi başlamadı.
- `index.html` 6.321.661 bayttan 23.769 bayta düşürüldü; görseller artık ayrı dosyalardan yükleniyor.
- Canlı yasal metinler taslak durumunda.
- Mevcut müşteri yorumları ve sayısal pazarlama iddiaları örnektir; yeni sisteme taşınmamalıdır.
- Canlı site hâlen örnek ürünler, görseller, fiyatlar, yorumlar ve iddialar gösteriyor; gerçek içerik girilmeden nihai production yayını yapılmamalı.
- Eski demo parola güncel koddan kaldırıldı ancak Git geçmişinde `81a3f8c` ve `5fc1878` commit'lerinde bulunuyor; gerçek bir hesapta kullanıldıysa veya başka yerde tekrarlandıysa değiştirilmelidir.
- Sipariş talebi doğrulaması eksik; mevcut talep numarası cihaz bazlı olduğu için çakışabilir.
- Firebase yedeği yalnızca yerel `backups/` altında ve Git dışında tutuluyor; ayrıca şifreli ikinci konuma kopyalanmalı.
- Firebase Storage SDK'sı başlatılıyor ancak kaynakta Storage dosya çağrısı yok; ilgili bucket mevcut değil ve manifestte 0 dosya olarak kaydedildi.
- Firebase istemci yapılandırması davranış değişmemesi için `assets/js/legacy-firebase.js` içinde tutuluyor; Faz 12'ye kadar legacy bağımlılık devam edecek.
- Davet Sandığı; GitHub, Vercel veya Supabase üzerinde diğer projelerle karıştırılmamalı.
- Yerel Supabase konteynerleri çalışıyor; bilgisayar yeniden başlatılırsa Faz 5 öncesinde Docker Desktop'ın açık olduğu doğrulanmalı.
- Görsel değiştirme işlemi bağlantıları yeni kayda taşıyıp eski kaydı arşivler; işlem sırasında bağlantı hatası olursa yeni görsel kaydı korunur ve panel açık hata gösterir.

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

- Faz 6 değişiklikleri kullanıcı tarafından commit edilip GitHub'a gönderilecek.
- Kullanıcının Faz 7 komutu beklenecek; onay olmadan sonraki faza geçilmeyecek.
