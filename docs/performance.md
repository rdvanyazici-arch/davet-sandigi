# Faz 11 — SEO, performans ve erişilebilirlik ölçümü

## Ölçüm koşulları

- Tarih: 17 Ekim 2026 (yerel saat, UTC+03).
- Lighthouse ile aynı yerel statik sunucu ve Chromium kullanıldı: `http://127.0.0.1:4175/index.html`; headless ölçüm, Lighthouse mobil profili (412 × 823) ve masaüstü profili (1350 × 940).
- Önce ölçümü 16 Ekim 2026 21:02–21:03 UTC, değişiklik sonrası ölçümü 16 Ekim 2026 21:41 UTC'de (17 Ekim 00:41 yerel saat) alındı. Her cihaz için skorlar aynı Lighthouse kategorilerinde karşılaştırıldı.
- Bu sonuçlar tek yerel çalıştırmaya aittir; Lighthouse performans puanı ağ ve çalışma zamanı değişkenliğinden etkilenebilir. Production ölçümü veya deploy yapılmadı.
- Ölçüm sırasında Supabase herkese açık ürün/kategori sorguları başarıyla tamamlandı ancak aktif slug döndürmedi. Bu nedenle build sitemap'i ana sayfa ile sınırlı oluşturdu; testlerde ağ/HTTP hatasında uyarı ve ana sayfa-only geri dönüş davranışı ayrıca doğrulandı.

## Lighthouse puanları

| Profil | Ölçüm | Performance | Accessibility | Best Practices | SEO |
|---|---|---:|---:|---:|---:|
| Mobil | Önce | 85 | 94 | 96 | 91 |
| Mobil | Sonra | 97 | 100 | 100 | 100 |
| Masaüstü | Önce | 96 | 94 | 96 | 91 |
| Masaüstü | Sonra | 96 | 100 | 100 | 100 |
| Mobil | Değişim | +12 | +6 | +4 | +9 |
| Masaüstü | Değişim | 0 | +6 | +4 | +9 |

## Önemli laboratuvar metrikleri

| Profil | Ölçüm | FCP | LCP | Speed Index | TBT | CLS |
|---|---|---:|---:|---:|---:|---:|
| Mobil | Önce | 1.8 sn | 3.9 sn | 3.8 sn | 0 ms | 0 |
| Mobil | Sonra | 1.8 sn | 1.9 sn | 1.8 sn | 20 ms | 0.071 |
| Masaüstü | Önce | 0.4 sn | 1.0 sn | 0.4 sn | 0 ms | 0.1 |
| Masaüstü | Sonra | 0.4 sn | 1.0 sn | 0.4 sn | 0 ms | 0.1 |

## Uygulanan kapsam ve bulgular

- Başlık/açıklama, canonical, Open Graph ve Twitter metadata'sı; Organization ve geçerli fiyatlı yayındaki ürün için koşullu Product JSON-LD eklendi.
- Favicon ve sosyal paylaşım görselleri, `robots.txt` ve sitemap üretimi eklendi. Sitemap yalnızca `sb_publishable_` anahtarıyla onaylı Supabase hostuna, açık `slug` sütunu ve aktif/arşiv filtresiyle build sırasında GET yapar. Ürün rotaları `?urun=<slug>`, kategori rotaları `?kategori=<slug>` biçimindedir; hiçbir kayıt veya migration yazılmaz.
- CSP ile birlikte `X-Content-Type-Options`, `Referrer-Policy` ve `X-Frame-Options` başlıkları Vercel yapılandırmasına eklendi. CSP akışı yerel Playwright yanıtına uygulanarak Supabase istekleri ve sayfa çalışmasıyla test edildi; Vercel'e yayımlanmadı.
- Ürün görsellerine responsive `srcset`/`sizes`, hero görseline yüksek öncelik ve diğer görsellere lazy loading; görsel boyutları ve alt metinler korundu.
- Klavye odak stili, reduced-motion tercihi, modal odak tuzağı/Escape/odak iadesi ve ürün başlığından klavyeyle detay açma eklendi. Mobil 390 px taşma ve görsel davranışı Playwright ile doğrulandı.
- System font yığınları kullanılıyor; harici web fontu, font preload veya `font-display` gereksinimi yok.
- Lighthouse sonrası `color-contrast`, `heading-order`, `meta-description`, canonical ve image-alt denetimleri mobil/masaüstünde geçti. Kontrast için footer marka alt metni düzeltildi.
- Kullanılmayan CSS tasarruf tahmini önce mobil/masaüstü 21/22 KiB, sonra 22/23 KiB oldu. Büyük çaplı CSS silme yapılmadı: Lighthouse tek sayfa ilk görünümünde kullanılmayan olarak işaretlediği kuralların önemli bölümü modal, filtre ve etkileşim durumlarına ait olabilir. Temsilî etkileşimlerde doğrulanmadan kaldırılması görsel/işlevsel regresyon riski taşır; bu bulgu açık kalıyor. Public sayfada yüklenen kullanılmayan Firebase script etiketi kaldırıldı; legacy dosya Faz 12 kapsamı nedeniyle tutuldu.

## Doğrulama

- `npm run build`: başarılı; sitemap ana sayfa-only üretildi (0 aktif ürün, 0 aktif kategori).
- `node --test tests/seo.test.mjs tests/admin-auth.test.mjs`: 11/11 başarılı.
- `tests/e2e/public-site.spec.mjs`: 22/22 başarılı; SEO, sitemap asset yolları, CSP, query rotaları, görseller, erişilebilirlik ve mevcut public akışlar dahil. Son kullanıcı incelemesi sonrası ayrıca kapalı sepet çekmecesinin `aria-hidden`/`inert` durumu ve odak iadesi regresyon testi eklendi.
- Tam Playwright paketi: 31/32 başarılı. Tek hata `product-admin.spec.mjs` ürün liste sayfalama (`#product-next`) timeout testi; Faz 11 öncesinde bilinen ve temiz 7b tabanında da doğrulanmış test hatasıdır, bu kapsamda değiştirilmedi.
- JavaScript `node --check`, yapılandırma JSON doğrulaması ve `git diff --check`: başarılı.
