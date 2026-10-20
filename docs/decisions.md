# Davet Sandığı — Teknik Kararlar

## Proje kimlikleri

| Sistem | Kimlik | Değer |
|---|---|---|
| GitHub | Depo | `rdvanyazici-arch/davet-sandigi` |
| Vercel | Proje adı | `davet-sandigi` |
| Supabase | Organizasyon | `rdvanyazici-arch's Org` |
| Supabase | Proje adı | `Davet Sandığı` |
| Supabase | Proje ref'i | `zdksvgtkeeweufuajugd` |
| Supabase | Bölge kodu | `ap-southeast-2` |
| Supabase | Bölge | `Oceania (Sydney)` |

Bu dosyada gizli anahtar veya veritabanı parolası tutulmaz.

## Faz 3 kararları

### Supabase CLI

- Kontrol edilen sürüm: `2.120.0`
- npm üzerindeki güncel sürüm: `2.120.0`
- Sonuç: Güncelleme gerekmiyor.
- İleride güncelleme komutu: `npx supabase@latest --version`

### Proje bağlantısı

- Yerel bağlantı komutu: `npx supabase link --project-ref zdksvgtkeeweufuajugd`
- Veritabanı parolası yalnızca CLI isteminde girilir; dosyaya veya komut satırına yazılmaz.
- CLI tarayıcı doğrulaması tamamlandı.
- Yerel proje `zdksvgtkeeweufuajugd` ref'ine başarıyla bağlandı.
- Bağlantı sırasında veritabanı parolası gerekmedi; ileride gereken komutlarda parola yalnızca güvenli CLI isteminde girilecek.

### Tarayıcı yapılandırması

- Tarayıcı yalnızca Supabase URL'sini ve publishable key'i okuyabilir.
- Gizli anahtarlar tarayıcıya, GitHub'a veya statik dosyalara yazılmaz.
- Statik sitede Vercel ortam değişkenleri tarayıcıda kendiliğinden okunamaz.
- Seçilen yöntem: `assets/js/supabase-config.generated.js` dosyasını build sırasında Preview ve Production ortam değişkenlerinden üretmek.
- Üretilen dosya Git'e alınmaz; yerelde `.env.local`, Vercel'de ilgili ortamın değişkenleri kullanılır.
- Build komutu: `npm run build`
- Vercel Output Directory: `.`
- Doğrudan kaynak dosyaya publishable key yazılmaz; böylece Preview ve Production değerleri karışmaz.

### Vercel ortam ayrımı

1. Vercel Dashboard'da yalnızca `davet-sandigi` projesini aç.
2. **Settings → Environment Variables** bölümüne gir.
3. `SUPABASE_URL` ve `SUPABASE_PUBLISHABLE_KEY` değişkenlerini ekle.
4. Preview değerlerini yalnızca **Preview** ortamına ata.
5. Production değerlerini yalnızca **Production** ortamına ata.
6. Development değerlerini yerelde `.env.local` içinde tut; Git'e ekleme.
7. **Build & Deployment → Build Command** alanını `npm run build` olarak ayarla.
8. **Output Directory** alanını `.` olarak ayarla.
9. Preview deploy çıktısında proje ref'inin `zdksvgtkeeweufuajugd` olduğunu doğrula.
10. Kullanıcı onayı olmadan Production değişkenlerini değiştirme veya production deploy yapma.

2026-10-13 tarihinde `SUPABASE_URL` ve `SUPABASE_PUBLISHABLE_KEY` yalnızca **Preview** ortamına eklendi. `package.json` içindeki `npm run build` komutu yapılandırma dosyasını üretir. Vercel'in proje geneli Build Command ayarı Production'ı da etkileyebileceği için dashboard üzerinden değiştirilmedi. Statik çıktı kök dizinde bulunduğundan `vercel.json` içinde `outputDirectory` değeri `.` olarak tanımlandı.

## Production güvenliği

- Faz 3 sırasında production yapılandırması değiştirilmedi.
- Supabase veritabanı şeması, RLS, Storage ve Auth ayarları değiştirilmedi.
- Firebase bağlantısı kaldırılmadı.

## Yönetim değişiklik geçmişi ve yöneticiler

- Değişiklik geçmişi 180 gün saklanır; temizleme fonksiyonu hazırdır ancak zamanlama bilinçli olarak etkinleştirilmemiştir.
- Ürün taslağı her kayıtta değil, yalnızca yayınlama anında geçmişe yazılır.
- Açıklama/gövde/JSON gibi büyük alanlar ile e-posta/telefon/WhatsApp değerlerinin eski ve yeni içerikleri geçmişte saklanmaz; yalnızca değişti bilgisi tutulur.
- Audit kayıtlarını aktif yöneticiler okuyabilir. İstemci rollerine audit ekleme, güncelleme veya silme yetkisi verilmez.
- Yönetici rolü ve aktiflik değişiklikleri yalnızca owner + MFA AAL2 oturumuyla SECURITY INVOKER RPC üzerinden yapılır.
- Panel Auth hesabı oluşturmaz ve `service_role` kullanmaz. Mevcut Auth kullanıcısı UUID ile profile bağlanır.
- Güvenli davet akışı gerekirse ileride ayrı bir Edge Function olarak değerlendirilecektir; bu adımda uygulanmamıştır.
- `20261018075733_admin_draft_delete_and_media_column_security.sql`, `20261020030526_admin_audit_log.sql`, `20261020030527_admin_management_security.sql` ve `20261020102505_admin_audit_lint_fix.sql` 2026-10-20 tarihinde kullanıcı onayıyla uzak Supabase'e uygulanmıştır.
