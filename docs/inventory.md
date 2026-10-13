# Davet Sandığı — Faz 1 İçerik Envanteri

Tarih: 2026-10-13

## Kapsam ve kaynaklar

Bu envanter yalnızca aşağıdaki kaynaklardan çıkarıldı:

1. `backups/firebase-20261013/site.json` — Firebase `site/main` yedeği
2. `backups/firebase-20261013/images.json` — Firebase `images` yedeği
3. `backups/firebase-20261013/firestore-manifest.json`
4. `backups/firebase-20261013/storage-manifest.json`
5. `index.html` — varsayılan katalog, içerik ve gömülü Base64 görseller

Firebase yedeği 2026-10-13 tarihinde alındı. `site/main` içindeki son güncelleme zamanı
2026-08-23 19:40:01 (Türkiye saati) olarak görünüyor. Firebase Storage bucket'ı
bulunmadı; Storage nesne sayısı sıfır. Firebase yedeği ile `index.html` içindeki ana
katalog aynı 20 ürünü, 7 kategoriyi, 4 koleksiyonu, 6 yorumu ve 5 SSS kaydını içeriyor.
Firebase kaydında ayrıca Instagram bağlantısı ve iki banner görseli bulunuyor.

Durum açıklamaları:

- **DOĞRULANDI:** Kullanıcı tarafından gerçek ve güncel olduğu onaylandı.
- **DOĞRULANMASI GEREK:** Kaynakta var, fakat gerçekliği/güncelliği kullanıcı onayı bekliyor.
- **SİL:** Kullanıcı kaldırılmasını onayladı.
- **TEKRAR:** Aynı içerik veya dosya kaynakta birden fazla kez bulunuyor.

## Kullanıcı kararı

2026-10-13 tarihinde aşağıdaki kararlar kesinleştirildi:

- Mevcut ürünler, kategoriler, koleksiyonlar, fiyatlar, adet kuralları, görseller,
  yorumlar, iletişim bilgileri ve pazarlama iddiaları örnek içeriktir.
- Örnek kayıtlar Supabase'e gerçek işletme verisi olarak taşınmayacaktır.
- Mevcut sayfa düzeni ve içerik alanları korunacaktır.
- Gerçek içerikler canlıya alınmadan önce yönetim panelinden girilecektir.
- Baby Shower şu anda sunulan bir kategori/koleksiyon değildir; örnek kaydı
  taşınmayacaktır. İleride panelden yeniden eklenebilecektir.
- Fiyatlar yönetim panelinden girilecek; taslak ürün fiyatı olmadan veya fiyat
  gizlenmiş halde tutulabilecek ve yönetici yayınlamadan canlıda görünmeyecektir.
- “Sil” durumu Firebase yedeğini fiziksel olarak silmek anlamına gelmez; yalnızca
  ilgili örnek kaydın yeni sisteme canlı içerik olarak taşınmayacağını belirtir.

### Yönetim panelinde korunacak kontrol alanları

| Alan | Yönetim paneli işlemleri | Yayın kuralı | Durum |
|---|---|---|---|
| Marka, logo ve favicon | Dosya seç, önizle, değiştir, arşivle | Eksik marka dosyası canlıya alınmaz | DOĞRULANDI |
| Navigasyon ve footer | Metin, bağlantı, görünürlük ve sıra düzenle | Kırık veya boş bağlantı yayınlanmaz | DOĞRULANDI |
| Sayfa bölümleri | Bölümü göster/gizle ve sırasını düzenle | Boş bölüm yerine kontrollü boş durum gösterilir | DOĞRULANDI |
| Ürünler | Ekle, düzenle, çoğalt, pasife al, arşivle, sırala | Taslak ve yayın ayrılır | DOĞRULANDI |
| Kategoriler | Ekle, düzenle, sırala, pasife al, arşivle | Bağlı ürün varken kalıcı silme yok | DOĞRULANDI |
| Koleksiyonlar | Ekle, düzenle, sırala, pasife al, arşivle | Baby Shower ileride buradan eklenebilir | DOĞRULANDI |
| Fiyatlar | Gir, değiştir, gizle, teklif ürünü seç | Yayın öncesi önizleme zorunlu | DOĞRULANDI |
| Minimum adet ve artış | Ürün bazında veya varsayılan olarak ayarla | Yayındaki ürün kuralı sepete uygulanır | DOĞRULANDI |
| Ürün ve galeri görselleri | Yükle, önizle, sırala, değiştir, arşivle | Ana görsel olmadan ürün yayınlanmaz | DOĞRULANDI |
| Görsel kütüphanesi | Tüm görselleri ve kullanım yerlerini görüntüle | Kullanımdaki görsel doğrudan silinmez | DOĞRULANDI |
| Hero ve banner | Ekle, düzenle, görsel seç, sırala, pasife al | Mobil ve masaüstü önizleme sonrası yayınlanır | DOĞRULANDI |
| Üst bant | Metin ekle, düzenle, sırala, kaldır | Yalnızca yayınlanan metinler görünür | DOĞRULANDI |
| Süreç adımları | Ekle, düzenle, sırala, kaldır | Önizleme sonrası yayınlanır | DOĞRULANDI |
| Neden biz / iddialar | Ekle, düzenle, sırala, kaldır | Gerçek olmayan sayı veya iddia yayınlanmaz | DOĞRULANDI |
| Hikâyemiz | Başlık, metin ve görseli düzenle | Önizleme sonrası yayınlanır | DOĞRULANDI |
| CTA alanları | Metin, düğme, bağlantı ve görseli düzenle | Ödeme değil sipariş talebi dili kullanılır | DOĞRULANDI |
| Yorumlar | Ekle, izin durumunu gir, yayınla, arşivle | Yalnızca gerçek ve izinli yorum yayınlanır | DOĞRULANDI |
| SSS | Ekle, düzenle, sırala, pasife al | Yalnızca aktif kayıtlar görünür | DOĞRULANDI |
| İletişim ve sosyal medya | WhatsApp, telefon, e-posta ve Instagram'ı düzenle | Eksik/örnek bilgi canlıya alınmaz | DOĞRULANDI |
| WhatsApp sipariş talebi | Mesaj başlığı, açıklama ve işletme numarasını düzenle | Müşteri verisi Supabase'e kaydedilmez | DOĞRULANDI |
| Kargo ve teslimat | Ücret, eşik ve açıklamayı düzenle | Tek kaynaktan yönetilir | DOĞRULANDI |
| Kampanya alanı | İçerik ve görsel ekle, zamanla, pasife al | Varsayılan olarak kapalı tutulabilir | DOĞRULANDI |
| SEO ve sosyal paylaşım | Sayfa başlığı, açıklama ve paylaşım görseli düzenle | Yalnızca doğrulanmış içerik yayınlanır | DOĞRULANDI |
| Yasal metinler | Faz 15'te onaylı metinleri düzenle/yayınla | Taslak metin canlıya alınmaz | DOĞRULANDI |

Panelde “kaldırma” işlemi öncelikle yayından kaldırma veya arşivleme olarak
uygulanacaktır. Kalıcı silme ayrıca onay gerektirir.

## Özet

| Veri grubu | Kayıt sayısı | Nihai durum |
|---|---:|---|
| Ürün | 20 | SİL |
| Kategori | 7 | SİL |
| Koleksiyon | 4 | SİL |
| Benzersiz görsel | 33 | SİL |
| Yorum | 6 | SİL |
| SSS | 5 | SİL |
| İletişim/teslimat kaydı | 5 | SİL |

## Ürünler

Kaynakta tüm ürünlere ortak minimum 25, 25'er artış ve 100 adedin üzerinde özel
teklif kuralı uygulanıyor. Bunların tamamı örnektir. Yeni sistemde adet kuralları ve
fiyatlar yönetim panelinden girilecek, taslak/yayın ayrımıyla canlıya alınacaktır.

| ID | Ad | SKU/kod | Kategori | Koleksiyon | Fiyat | Adet kuralı | Görsel dosyası/kaynağı | Durum |
|---|---|---|---|---|---:|---|---|---|
| p1 | Nişan Kolonyası · İnci Detay | KOL001 | Kolonya Şişeleri | Nişan & Söz | 54,90 TL | Min. 25, +25; >100 teklif | `IMG/nisan-1` + 4 galeri görseli | SİL |
| p2 | Söz Çikolatası · Özel Kutu | SEK001 | Şeker & Çikolata | Nişan & Söz | 64,90 TL | Min. 25, +25; >100 teklif | `IMG/nisan-2` | SİL |
| p3 | İnci Taneli Magnet · Nişan | MAG001 | Magnetler | Nişan & Söz | 21,90 TL | Min. 25, +25; >100 teklif | `IMG/nisan-3` | SİL |
| p4 | Nişan Mumu · Cam Kavanoz | MUM001 | Mum & Kokular | Nişan & Söz | 44,90 TL | Min. 25, +25; >100 teklif | `IMG/nisan-4` | SİL |
| p5 | Kahve İkramlık · Nişan | KHV001 | Kahve & Fincan | Nişan & Söz | 49,90 TL | Min. 25, +25; >100 teklif | `IMG/nisan-5` | SİL |
| p6 | Kadife Kına Kesesi · Bordo | KES001 | Keseler & Sachet | Kına | 34,90 TL | Min. 25, +25; >100 teklif | `IMG/kina-1` | SİL |
| p7 | Telli Kına Kesesi · Gold | KES002 | Keseler & Sachet | Kına | 37,90 TL | Min. 25, +25; >100 teklif | `IMG/kina-2` | SİL |
| p8 | Kınalı İkramlık Fincan | KHV002 | Kahve & Fincan | Kına | 52,90 TL | Min. 25, +25; >100 teklif | `IMG/kina-3` | SİL |
| p9 | Nazarlıklı Kına Magneti | MAG002 | Magnetler | Kına | 23,90 TL | Min. 25, +25; >100 teklif | `IMG/kina-4` | SİL |
| p10 | Kına Gecesi Mumu · Kırmızı | MUM002 | Mum & Kokular | Kına | 42,90 TL | Min. 25, +25; >100 teklif | `IMG/kina-5` | SİL |
| p11 | Beyaz Keten Kese · İnci | KES003 | Keseler & Sachet | Nikâh | 32,90 TL | Min. 25, +25; >100 teklif | `IMG/nikah-1` | SİL |
| p12 | Nikah Şekeri · Badem | SEK002 | Şeker & Çikolata | Nikâh | 12,90 TL | Min. 25, +25; >100 teklif | `IMG/nikah-2` | SİL |
| p13 | Nikâh Kolonyası · Zarif | KOL002 | Kolonya Şişeleri | Nikâh | 56,90 TL | Min. 25, +25; >100 teklif | `IMG/nikah-3` | SİL |
| p14 | Okaliptüslü Nikah Mumu | MUM003 | Mum & Kokular | Nikâh | 46,90 TL | Min. 25, +25; >100 teklif | `IMG/nikah-4` | SİL |
| p15 | Nikâh Magneti · Okaliptüs | MAG003 | Magnetler | Nikâh | 22,90 TL | Min. 25, +25; >100 teklif | `IMG/nikah-5` | SİL |
| p16 | Sage Müslin Kese · Bebek | KES004 | Keseler & Sachet | Baby Shower | 27,90 TL | Min. 25, +25; >100 teklif | `IMG/baby-1` | SİL |
| p17 | Bebek Şekeri · Pastel Kutu | SEK003 | Şeker & Çikolata | Baby Shower | 14,90 TL | Min. 25, +25; >100 teklif | `IMG/baby-2` | SİL |
| p18 | Patik Temalı Magnet | MAG004 | Magnetler | Baby Shower | 19,90 TL | Min. 25, +25; >100 teklif | `IMG/baby-3` | SİL |
| p19 | Mini Bebek Mumu | MUM004 | Mum & Kokular | Baby Shower | 34,90 TL | Min. 25, +25; >100 teklif | `IMG/baby-4` | SİL |
| p20 | Kurdeleli Bebek Hediyeliği | KUR001 | Süsleme & Kurdele | Baby Shower | 16,90 TL | Min. 25, +25; >100 teklif | `IMG/baby-5` | SİL |

Kaynakta öne çıkan ürünler: `p1`, `p5`, `p6`, `p11`, `p15`, `p16`.
Kaynakta 20 ürünün tamamı görünür/aktif durumda.

### Ürün açıklamaları

| ID | Kaynaktaki açıklama | Durum |
|---|---|---|
| p1 | Cam şişe, gold kapak ve inci detaylı kişiye özel kolonya. | SİL |
| p2 | Özel kutuda, kişiye özel etiketli çikolata ikramı. | SİL |
| p3 | İnci ve kuru çiçek detaylı, isme özel magnet. | SİL |
| p4 | Cam kavanozda, gold detaylı kokulu nişan mumu. | SİL |
| p5 | Fincan ve kolonya ikilisi, nişan ikramı için şık set. | SİL |
| p6 | Bordo kadife, gold biyeli, kuru çiçekli kına kesesi. | SİL |
| p7 | Gold tel ve pul işlemeli, zarif kına gecesi kesesi. | SİL |
| p8 | Kırmızı-gold motifli fincan ve kese ikilisi. | SİL |
| p9 | Nazar boncuğu ve kırmızı-gold çiçekli magnet. | SİL |
| p10 | Kırmızı-gold detaylı, kokulu kına gecesi mumu. | SİL |
| p11 | Beyaz keten, inci detaylı, okaliptüslü nikâh kesesi. | SİL |
| p12 | Beyaz kurdeleli kutuda badem şekeri ikramı. | SİL |
| p13 | Okaliptüslü, beyaz kurdeleli zarif nikâh kolonyası. | SİL |
| p14 | Okaliptüs dokunuşlu, cam kavanozda nikâh mumu. | SİL |
| p15 | Okaliptüs motifli, ivory zeminli nikâh magneti. | SİL |
| p16 | Sage yeşili müslin, minik etiketli baby shower kesesi. | SİL |
| p17 | Mint-krem pastel kutuda bebek şekeri. | SİL |
| p18 | Örgü patik temalı, pastel tonlarda sevimli magnet. | SİL |
| p19 | Küçük cam kavanozda pastel etiketli mini mum. | SİL |
| p20 | Pastel saten kurdele ve cipso ile bebek hediyeliği. | SİL |

## Kategoriler

| ID | Ad | Kod öneki | Ürün sayısı | Durum |
|---|---|---|---:|---|
| kolonya | Kolonya Şişeleri | KOL | 2 | SİL |
| mum | Mum & Kokular | MUM | 4 | SİL |
| magnet | Magnetler | MAG | 4 | SİL |
| kese | Keseler & Sachet | KES | 4 | SİL |
| kahve | Kahve & Fincan | KHV | 2 | SİL |
| seker | Şeker & Çikolata | SEK | 3 | SİL |
| kurdele | Süsleme & Kurdele | KUR | 1 | SİL |

## Koleksiyonlar

| ID | Ad | Alt metin | Kapak görseli | Ürün sayısı | Durum |
|---|---|---|---|---:|---|
| nisan | Nişan & Söz | Anılarınızı zarifçe saklayın | `IMG/col-nisan` | 5 | SİL |
| kina | Kına | Geleneksel dokunuşlar | `IMG/col-kina` | 5 | SİL |
| nikah | Nikâh | En özel başlangıçlar | `IMG/col-nikah` | 5 | SİL |
| baby | Baby Shower | Minikler için özel hatıralar | `IMG/col-baby` | 5 | SİL |

## Görseller

`index.html` içinde 33 Base64 kullanımı ve 30 benzersiz görsel tespit edildi.
Firebase `images` koleksiyonundaki 3 görsel bunlardan farklıdır. Böylece toplam
33 benzersiz görsel vardır. Kullanıcı bu görsellerin gerçek ürün görselleri olmadığını
doğruladı. Yeni sisteme gerçek içerik olarak taşınmayacaklar; sayfa görsel alanları ve
yönetim panelindeki önizleme yapısı korunacaktır.

| Kimlik | Kullanım | Kaynak | Boyut | Ölçü | AI/gerçek | Durum |
|---|---|---|---:|---:|---|---|
| baby-1 | p16 ana; yorum 4 | `index.html/IMG` | 106657 B | 700×900 | Örnek / gerçek değil | SİL |
| baby-2 | p17 ana | `index.html/IMG` | 80628 B | 700×900 | Örnek / gerçek değil | SİL |
| baby-3 | p18 ana | `index.html/IMG` | 66385 B | 700×900 | Örnek / gerçek değil | SİL |
| baby-4 | p19 ana | `index.html/IMG` | 86511 B | 700×900 | Örnek / gerçek değil | SİL |
| baby-5 | p20 ana | `index.html/IMG` | 96546 B | 700×900 | Örnek / gerçek değil | SİL |
| col-baby | Baby Shower kapak | `index.html/IMG` | 78107 B | 640×640 | Örnek / gerçek değil | SİL |
| col-kina | Kına kapak | `index.html/IMG` | 70167 B | 640×640 | Örnek / gerçek değil | SİL |
| col-nikah | Nikâh kapak | `index.html/IMG` | 73395 B | 640×640 | Örnek / gerçek değil | SİL |
| col-nisan | Nişan & Söz kapak | `index.html/IMG` | 74689 B | 640×640 | Örnek / gerçek değil | SİL |
| cta | CTA/hikâye alanları | `index.html/IMG` | 204812 B | 1500×975 | Örnek / gerçek değil | SİL |
| hero | Varsayılan hero | `index.html/IMG` | 552612 B | 1600×1179 | Örnek / gerçek değil | SİL |
| kina-1 | p6 ana; yorum 2 | `index.html/IMG` | 134800 B | 700×900 | Örnek / gerçek değil | SİL |
| kina-2 | p7 ana; yorum 6 | `index.html/IMG` | 171959 B | 700×900 | Örnek / gerçek değil | SİL |
| kina-3 | p8 ana | `index.html/IMG` | 126596 B | 700×900 | Örnek / gerçek değil | SİL |
| kina-4 | p9 ana | `index.html/IMG` | 117209 B | 700×900 | Örnek / gerçek değil | SİL |
| kina-5 | p10 ana | `index.html/IMG` | 124243 B | 700×900 | Örnek / gerçek değil | SİL |
| nikah-1 | p11 ana; yorum 3 | `index.html/IMG` | 142952 B | 700×900 | Örnek / gerçek değil | SİL |
| nikah-2 | p12 ana | `index.html/IMG` | 119357 B | 700×900 | Örnek / gerçek değil | SİL |
| nikah-3 | p13 ana | `index.html/IMG` | 83389 B | 700×900 | Örnek / gerçek değil | SİL |
| nikah-4 | p14 ana | `index.html/IMG` | 92657 B | 700×900 | Örnek / gerçek değil | SİL |
| nikah-5 | p15 ana | `index.html/IMG` | 106810 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-1 | p1 ana; yorum 1 | `index.html/IMG` | 83372 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-1-b | p1 galeri | `index.html/IMG` | 95259 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-1-c | p1 galeri | `index.html/IMG` | 148578 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-1-d | p1 galeri | `index.html/IMG` | 116308 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-1-e | p1 galeri | `index.html/IMG` | 109354 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-2 | p2 ana | `index.html/IMG` | 73728 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-3 | p3 ana | `index.html/IMG` | 118052 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-4 | p4 ana; yorum 5 | `index.html/IMG` | 97320 B | 700×900 | Örnek / gerçek değil | SİL |
| nisan-5 | p5 ana | `index.html/IMG` | 113474 B | 700×900 | Örnek / gerçek değil | SİL |
| 2zAEPiiVtFmAVOoFP5b6 | Banner 1 | Firebase `images` | 273775 B | 1000×807 | Örnek / gerçek değil | SİL |
| JVj41pOQDOPbZNbg7AYl | Banner 2 | Firebase `images` | 247843 B | 1000×800 | Örnek / gerçek değil | SİL |
| 4AfCActDPO3Qp3zJEIHM | Kaynakta kullanım referansı bulunamadı | Firebase `images` | 760 B | 6×6 | Örnek / gerçek değil | SİL |

## Yorumlar

Kayıtların tamamı örnektir. Gerçek müşteri doğrulaması veya paylaşım izni bulunmadığı
için yeni sisteme aktarılmayacaktır.

| No | İsim | Etkinlik | Yorum | Görsel | Durum |
|---:|---|---|---|---|---|
| 1 | Elif & Burak | Nişan | Nişanımız için hazırlanan kolonyalar ve magnetler herkesin çok beğendi. İşçilik ve paketleme kusursuzdu, teşekkürler. | nisan-1 | SİL |
| 2 | Zeynep Y. | Kına Gecesi | Kına keseleri tam hayal ettiğim gibi oldu. Bordo-gold uyumu ve kuru çiçek dokunuşu çok şıktı. | kina-1 | SİL |
| 3 | Merve & Can | Nikâh | Nikâh hediyeliklerimiz zamanında elimize ulaştı, davetlilerimiz çok memnun kaldı. Kişiye özel etiketler harikaydı. | nikah-1 | SİL |
| 4 | Ayşe & Mert | Baby Shower | Bebeğimizin ilk günü için hazırlanan minik keseler ve mumlar çok sevildi. Pastel renk uyumu harikaydı. | baby-1 | SİL |
| 5 | Selin & Kaan | Nişan | Nişan mumlarımız ve kolonyalarımız çok şıktı. Misafirlerimiz nereden yaptırdığımızı tek tek sordu. | nisan-4 | SİL |
| 6 | Deniz & Ece | Kına Gecesi | Telli kına keseleri gerçekten göz kamaştırıcıydı. Hızlı teslimat için ayrıca teşekkürler. | kina-2 | SİL |

## SSS

| No | Soru | Cevap | Durum |
|---:|---|---|---|
| 1 | Minimum sipariş adedi nedir? | Ürünlerimiz minimum 25 adet ve 25'er artışlarla sipariş edilebilir. Adet seçimini sepet üzerinden yapabilirsiniz. | SİL |
| 2 | 100 adet üzeri fiyat nasıl belirlenir? | 100 adedin üzerindeki siparişlerde size özel fiyat teklifi sunuyoruz. Sepetinizi oluşturup WhatsApp'tan iletişime geçmeniz yeterli. | SİL |
| 3 | Kargo ücreti ne kadar? | Kargo ücreti sipariş sırasında belirtilir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir. | SİL |
| 4 | Teslimat süresi ne kadardır? | Tasarım onayının ardından ortalama 5–7 iş günü içinde hazırlayıp kargoya veriyoruz. | SİL |
| 5 | Kişiye özel tasarım yapıyor musunuz? | Evet, isim, tarih ve konseptinize özel tasarımlar hazırlıyoruz. Talebinizi WhatsApp üzerinden iletebilirsiniz. | SİL |

## İletişim ve teslimat

| Alan | Kaynaktaki değer | Not | Durum |
|---|---|---|---|
| WhatsApp | `905399413902` | Uluslararası biçim, yalnızca rakam | SİL |
| Telefon | `+90 539 941 39 02` | WhatsApp numarasıyla eşleşiyor | SİL |
| E-posta | `info@davetsandigi.com` | Alan adının ve posta kutusunun çalıştığı doğrulanmadı | SİL |
| Instagram | `https://www.instagram.com/davetsandigi` | Kaynaktaki takip parametreleri çıkarılarak yazıldı | SİL |
| Teslimat alanı | Türkiye'nin her yerine teslimat | Kargo kapsamı teyit edilmeli | SİL |

## Sayılar, kurallar ve iddialar

| İfade/değer | Kullanıldığı yer | Risk/not | Durum |
|---|---|---|---|
| 500+ Mutlu Çift | Ana sayfa güven göstergesi | Kanıt gerektirir | SİL |
| %100 El Emeği | Ana sayfa güven göstergesi | Tüm ürünler için doğru olmalı | SİL |
| 48 Saat Hızlı Hazırlık | Ana sayfa güven göstergesi | 5–7 iş günü SSS cevabıyla çelişiyor | SİL |
| 5–7 iş günü | SSS | Tasarım onayından sonra kargoya verme süresi olarak yazılmış | SİL |
| Minimum 25 adet | Sepet ve SSS | Tüm ürünlere global uygulanıyor | SİL |
| 25'er adet artış | Sepet ve SSS | Tüm ürünlere global uygulanıyor | SİL |
| 100 adedin üzeri özel teklif | Sepet ve SSS | Kod `>100` uygular; 100 dahil değildir | SİL |
| 150 TL kargo | Site ayarı/sepet | SSS kesin tutar söylemiyor | SİL |
| 2.500 TL ve üzeri ücretsiz kargo | Site ayarı/sepet | SSS yalnızca “belirli tutar” diyor | SİL |
| Türkiye'nin her yerine teslimat | İletişim/footer | Operasyon kapsamı teyit edilmeli | SİL |
| Zamanında teslimat | Üst bant, süreç ve neden biz | Mutlak hizmet iddiası olarak değerlendirilmeli | SİL |
| Özenle seçilen/kaliteli malzemeler | Üst bant ve neden biz | Ürünlerin tümü için doğru olmalı | SİL |
| Kişiye özel üretim/tasarım | Hero, üst bant, SSS | Sunulan kişiselleştirme kapsamı teyit edilmeli | SİL |

## Roadmap bölüm 12 çelişkileri

| Konu | Mevcut durum | Gereken karar | Durum |
|---|---|---|---|
| “500+ Mutlu Çift” | Ana sayfada kanıtsız sayı olarak bulunuyor | Kanıtlanırsa kalmalı, aksi halde kaldırılmalı veya doğrulanmış ifadeyle değişmeli | SİL |
| “48 Saat” / “5–7 iş günü” | Aynı sitede iki farklı hazırlık süresi var | Tek gerçek teslimat/hazırlık kuralı belirlenmeli | SİL |
| Kargo ücreti | Ayarda 150 TL; SSS'de “sipariş sırasında belirtilir” | Sabit ücret mi, görüşmede teklif mi olduğu belirlenmeli | SİL |
| Ücretsiz kargo | Ayarda 2.500 TL; SSS'de eşik yazmıyor | Eşik ve uygulanma şartı belirlenmeli | SİL |
| Müşteri isimleri/yorumları | 6 yorum var; gerçeklik ve izin kaydı yok | Gerçek ve izinli olanlar işaretlenmeli; diğerleri kaldırılmalı | SİL |
| Baby Shower kapsamı | Koleksiyon, 5 ürün, hikâye ve yorumda var; genel metinlerde bazen “tüm özel günler” deniyor | Baby Shower'ın kalıp kalmayacağı ve Türkçe adlandırması belirlenmeli | SİL |

## Faz 1 sonucu

- Taşınacak gerçek ürün, kategori, koleksiyon, fiyat, görsel, yorum veya iletişim
  kaydı bulunmuyor.
- Firebase yedeği geri dönüş amacıyla korunacaktır; bu fazda hiçbir kayıt silinmedi.
- Sayfa düzeni ve tüm içerik türleri korunacak, gerçek kayıtlar yönetim panelinden
  oluşturulacaktır.
- Örnek verilerin tamamı yeni sistem için `SİL` durumundadır; bu, migration dışında
  bırakılacakları anlamına gelir.
- Faz 1 tamamlandı. Faz 2 yalnızca ayrıca kullanıcı onayıyla başlatılacaktır.
