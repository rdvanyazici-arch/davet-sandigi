# Davet Sandığı — Görev Durumu

## Güncel faz

- Güncel durum: Faz 4 tamamlandı; şema, indeksler, grant/RLS ve seed hem yerel hem uzak Supabase ortamında doğrulandı.
- Aktif faz: Yok; Faz 5 için kullanıcı onayı bekleniyor.
- Beklenen: Sonraki faza geçmeden önce kullanıcı onayı.

### Faz 0–15 durumları

- Faz 0 — Güvenli başlangıç ve yedek: **tamamlandı**
- Faz 1 — İçerik envanteri ve doğruluk kararı: **tamamlandı**
- Faz 2 — Kod yapısını güvenli biçimde ayırma: **tamamlandı**
- Faz 3 — Supabase proje ve yerel geliştirme kurulumu: **tamamlandı**
- Faz 4 — Database şeması, grant ve RLS: **tamamlandı**
- Faz 5 — Storage ve görsel kütüphanesi: **bekliyor**
- Faz 6 — Yönetici kimlik doğrulaması: **bekliyor**
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

## Bilinen riskler

- Canlı kaynak halen Firebase kullanıyor; Supabase geçişi başlamadı.
- `index.html` 6.321.661 bayttan 23.769 bayta düşürüldü; görseller artık ayrı dosyalardan yükleniyor.
- Canlı yasal metinler taslak durumunda.
- Mevcut müşteri yorumları ve sayısal pazarlama iddiaları örnektir; yeni sisteme taşınmamalıdır.
- Canlı site hâlen örnek ürünler, görseller, fiyatlar, yorumlar ve iddialar gösteriyor; gerçek içerik girilmeden nihai production yayını yapılmamalı.
- Yönetim bağlantısı mevcut sitede görünür ve eski demo parola kaynak kodunda bulunuyor.
- Sipariş talebi doğrulaması eksik; mevcut talep numarası cihaz bazlı olduğu için çakışabilir.
- Firebase yedeği yalnızca yerel `backups/` altında ve Git dışında tutuluyor; ayrıca şifreli ikinci konuma kopyalanmalı.
- Firebase Storage SDK'sı başlatılıyor ancak kaynakta Storage dosya çağrısı yok; ilgili bucket mevcut değil ve manifestte 0 dosya olarak kaydedildi.
- Firebase istemci yapılandırması davranış değişmemesi için `assets/js/legacy-firebase.js` içinde tutuluyor; Faz 12'ye kadar legacy bağımlılık devam edecek.
- Davet Sandığı; GitHub, Vercel veya Supabase üzerinde diğer projelerle karıştırılmamalı.
- Yerel Supabase konteynerleri çalışıyor; bilgisayar yeniden başlatılırsa Faz 5 öncesinde Docker Desktop'ın açık olduğu doğrulanmalı.

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

- Faz 5'e yalnızca kullanıcı onayıyla geçilecek.
- Uzak Supabase Faz 5 Storage migration'ları için hazır; Faz 5 komutu kullanıcıdan beklenecek.
