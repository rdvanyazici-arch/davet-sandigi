# Faz 12 — Firebase / Supabase karşılaştırma raporu

**Durum: Örnek içerikler kullanıcı kararıyla aktarılmadı; Firebase runtime temizliği tamamlandı.**

## Kaynaklar ve yöntem

- Firebase kaynağı: `backups/firebase-20261013/site.json`, `images.json`, `firestore-manifest.json`, `storage-manifest.json` ve `docs/inventory.md`. Yedek 13 Ekim 2026 tarihli, read-only olarak alınmış.
- Hedef: bağlı Davet Sandığı Supabase projesi `zdksvgtkeeweufuajugd`; yalnızca salt-okunur aggregate SQL sorguları çalıştırıldı. Hiçbir Supabase verisi değiştirilmedi.
- Kural: yalnız envanterde `DOĞRULANDI` olarak işaretlenmiş gerçek içerikler aktarılabilir. Envanter kararında tüm kaynak ürün/kategori/koleksiyon/görsel örnekleri `SİL`; bu işaretler import onayı değildir.

## Kayıt sayıları

| Varlık | Firebase yedeği / envanter | Supabase mevcut | Fark ve envanter kararı |
|---|---:|---:|---|
| Ürün | 20 (20 görünür) | 0 | 20 kaynak kaydı Supabase'te yok; envanterde hepsi `SİL` |
| Kategori | 7 | 0 | 7 kaynak kaydı Supabase'te yok; envanterde hepsi `SİL` |
| Koleksiyon | 4 | 0 | 4 kaynak kaydı Supabase'te yok; envanterde hepsi `SİL` |
| Görsel | 33 benzersiz envanter görseli; 30 gömülü/HTML kaynağı ve 3 `images` Firestore belgesi | 0 `media_assets`, 0 Storage nesnesi | 33 görsel hedefte yok; hepsi örnek ve `SİL` |
| Firebase Storage nesnesi | 0; bucket yedek sırasında yoktu | — | Taşınabilir Firebase Storage nesnesi bulunmuyor |

Mevcut hedef boş olduğu için kaynak-hedef eşleşmesi bulunmuyor. Bu farklılık kullanıcı kararıyla kabul edildi: kaynak kayıtlar örnektir, aktarılmayacaktır; gerçek içerikler daha sonra yönetim panelinden girilecektir.

## Fiyat karşılaştırması

Firebase yedeğinde 20 ürünün her birinde örnek fiyat bulunuyor; Supabase'te karşılaştırılabilir ürün kaydı olmadığından 20/20 fiyat eşleşmesi yapılamadı. Fiyatlar arasındaki fark **bilinmiyor / karşılaştırılamaz** olarak raporlanır; mevcut olmayan hedef fiyatları sıfır kabul edilmedi ve yedeğe göre yazılmadı.

| Firebase ürün ID | Yedek fiyatı (TRY) | Supabase karşılığı |
|---|---:|---|
| p1 | 54,90 | Yok |
| p2 | 64,90 | Yok |
| p3 | 21,90 | Yok |
| p4 | 44,90 | Yok |
| p5 | 49,90 | Yok |
| p6 | 34,90 | Yok |
| p7 | 37,90 | Yok |
| p8 | 52,90 | Yok |
| p9 | 23,90 | Yok |
| p10 | 42,90 | Yok |
| p11 | 32,90 | Yok |
| p12 | 12,90 | Yok |
| p13 | 56,90 | Yok |
| p14 | 46,90 | Yok |
| p15 | 22,90 | Yok |
| p16 | 27,90 | Yok |
| p17 | 14,90 | Yok |
| p18 | 19,90 | Yok |
| p19 | 34,90 | Yok |
| p20 | 16,90 | Yok |

Bunlar envanterde açıkça örnek olarak işaretlenen değerlerdir; canlı fiyat kabul edilmemeli ve import edilmemelidir.

## Görsel ve alt metin farkları

Envanterde 33 görselin hiçbiri için ayrı alt metin alanı bulunmuyor. Bu nedenle doğrulanmış içerik için **alt metni eksik görsel sayısı 0** (aktarılabilir/DOĞRULANDI görsel yok); tüm 33 örnek görsel için envanter tablosunda alt metin eksik. `media_assets` tablosu boş ve `site-media` bucket'ında nesne yok; hedefte fazla görsel yok.

| Kaynak görsel kimlikleri — tümü `SİL`, aktarılmadı |
|---|
| `baby-1`, `baby-2`, `baby-3`, `baby-4`, `baby-5`, `col-baby`, `col-kina`, `col-nikah`, `col-nisan`, `cta`, `hero` |
| `kina-1`, `kina-2`, `kina-3`, `kina-4`, `kina-5`, `nikah-1`, `nikah-2`, `nikah-3`, `nikah-4`, `nikah-5` |
| `nisan-1`, `nisan-1-b`, `nisan-1-c`, `nisan-1-d`, `nisan-1-e`, `nisan-2`, `nisan-3`, `nisan-4`, `nisan-5` |
| Firebase `images` belgeleri: `2zAEPiiVtFmAVOoFP5b6`, `JVj41pOQDOPbZNbg7AYl`, `4AfCActDPO3Qp3zJEIHM` |

Bu görseller için yeni SEO dosya adı veya alt metin üretilmedi; içeriklerin gerçek ve güncel olduğuna dair onay olmadığı için isim/alt metin uydurulması uygun değil.

## Kayıt eşleşmeleri ve karar

- Firebase ürünleri: 20 kaynak kaydın 0'ı Supabase'te eşleşiyor; kategori/collection ilişkileri de hedefte yok. Kaynak satırların tümü envanterde `SİL`.
- Kategoriler: 7 kaynak kaydın 0'ı eşleşiyor; tümü `SİL`.
- Koleksiyonlar: 4 kaynak kaydın 0'ı eşleşiyor; tümü `SİL`.
- Görseller: 33 kaynak referansının 0'ı hedefe aktarılmış; tümü `SİL`.
- Envanterdeki `DOĞRULANDI` etiketleri panel işlevleri/yönetim kuralları tablosuna ait; veri tablolarındaki kayıtları onaylamıyor. `DOĞRULANDI` statüsünde aktarılabilir ürün, kategori, koleksiyon veya görsel kaydı yok.

## Faz 12 kararı ve güvenlik sonucu

Kullanıcı 17 Ekim 2026'da Firebase yedeğindeki 20 ürün, 7 kategori, 4 koleksiyon ve 33 görselin örnek olduğunu, hiçbirinin Supabase'e aktarılmamasını ve Supabase'in boş kalmasını onayladı. Gerçek içerikler daha sonra yönetim panelinden eklenecek. Import scripti oluşturulmadı; `service_role` anahtarı istenmedi, okunmadı veya bir dosyaya yazılmadı; veritabanına/Storage'a hiçbir kayıt yazılmadı.

Bu kararla Faz 12 kapsamındaki runtime temizliği tamamlandı: uygulama HTML/JS modüllerinden Firebase SDK/config/CDN/Firestore kodu ve eski admin localStorage render/import/export yolları kaldırıldı. Firebase Firestore/Storage snapshot'ları, `docs/rollback.md` ve read-only yedekleme araçları (`scripts/backup-firebase.mjs`, `scripts/backup-firebase-storage.mjs`, `scripts/firebase-backup-common.mjs`) korundu; bu araçlar uygulama HTML'inden yüklenmez ve site çalışma zamanı değildir. Firebase projesi silinmedi; örnek görsel dosyaları kalıcı silinmedi.

Playwright doğrulamasında public sayfanın istek hostları yalnızca local origin ve izinli Supabase projesiydi; admin boş Supabase fixture'ında dış host isteği oluşmadı. Her iki akışta Firebase/Firestore/Google API isteği yok ve boş içerik durumu hata vermeden açılıyor. Test raporu `TASK_STATE.md` içinde kaydedildi.

Son kontroller: `tests/admin-auth.test.mjs` **8/8 başarılı**; public/admin E2E kapsamındaki dört Playwright dosyası bilinen eski ürün sayfalama testi hariç **33/33 başarılı**. Uygulama HTML/JS runtime taramasında Firebase/Firestore/Google API istemci veya endpoint kodu bulunmadı; yalnız korunan, app dışı yedekleme araçları Firebase read-only API'lerine başvurur. `git diff --check` ve değişen JavaScript dosyalarının sözdizimi kontrolleri başarılı.

**Sonuç:** Supabase 0 ürün / 0 kategori / 0 koleksiyon / 0 medya kaydı ile kalıyor. Fiyatlar karşılaştırılmadı çünkü kayıtlar örnek ve aktarılmıyor. Bu durum kullanıcı kararıyla beklenen nihai durumdur; Firebase projesi ve yedekleri korunmuştur.
