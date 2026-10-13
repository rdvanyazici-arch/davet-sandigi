# Faz 0 Geri Dönüş Rehberi

Bu rehber, Supabase geçişi sırasında mevcut Firebase sürümüne veri kaybı olmadan dönmek içindir.

## Koruma noktaları

- Kaynak commit: `10c99237a3186444b66d5ad5701dceefb0f42f3b`
- Git etiketi: `backup-pre-supabase-20261013`
- Yedek branch: `backup-pre-supabase-20261013`
- Firebase projesi: `davetsandigi-3ae7b`
- Firestore koleksiyonları: `site`, `images`
- Storage bucket: `davetsandigi-3ae7b.firebasestorage.app`

`backups/` klasörü Git'e eklenmez. Yedekleri ayrıca şifreli ve erişimi sınırlı bir konumda saklayın.

### 2026-10-13 doğrulanmış yedek

- `site`: 1 belge
- `images`: 3 belge
- Storage bucket: mevcut değil
- Storage dosyası: 0
- `firestore-manifest.json`: `f8406a490e259449f49bd317e3f5bdede0a0cd7c2a1a682936b7ab48375a00dc`
- `images.json`: `ceb3f4e64ff3b9b56795c1391e5acb0a50dc1967c41bbc057149677d0954d1f0`
- `site.json`: `21893426cece3de99902466f7a7b5bd727f6fd25e618127e209c4f4d540918c9`
- `storage-manifest.json`: `88417b53f175d2a5756ef0e86fee9de58a29eefe631845b706cf3bb4ef63a343`

## 1. Yedeği doğrulama

1. `backups/firebase-YYYYMMDD/firestore-manifest.json` dosyasını açın.
2. Proje kimliğinin `davetsandigi-3ae7b` olduğunu doğrulayın.
3. `site.json` ve `images.json` belge sayılarını manifest ile karşılaştırın.
4. Storage kullanılmışsa `storage-manifest.json` içindeki dosya sayısı ve SHA-256 değerlerini kontrol edin.
5. JSON dosyalarını ve `storage/` klasörünü ikinci, şifreli bir konuma kopyalayın.

## 2. Kodu güvenli biçimde geri alma

Mevcut çalışmayı silmeden etiketten yeni bir kurtarma branch'i oluşturun:

```bash
git show refs/tags/backup-pre-supabase-20261013
git switch -c restore-pre-supabase refs/tags/backup-pre-supabase-20261013
```

Projeyi yerelde açın ve showroom, koleksiyon, sepet ve WhatsApp akışını kontrol edin. `git reset --hard` veya force push kullanmayın.

## 3. Firebase verisini geri yükleme

Faz 0 scriptleri yalnızca okur; veri yazmaz veya silmez. Geri yükleme gerektiğinde:

1. Mevcut Firebase verisini ayrıca yeniden yedekleyin.
2. Hedef proje kimliğini ve koleksiyon adlarını iki kez doğrulayın.
3. `site.json` ve `images.json` içindeki ham Firestore alan tiplerini koruyan belgeleri kullanın.
4. Storage manifestindeki her dosyayı aynı nesne adıyla geri yükleyin.
5. Yazma işlemini yapan geri yükleme aracını ayrı hazırlayın ve çalıştırmadan önce açık onay alın.
6. Belge ve dosya sayılarını manifestlerle karşılaştırın; örnek görselleri tarayıcıda açın.

Firebase verisi kalıcı olarak silinmeden önce Supabase sürümünün eksiksiz olduğu ayrıca doğrulanmalıdır.

## 4. Vercel sürümünü geri alma

1. Kurtarma branch'ini yerelde test edin.
2. Vercel proje adının `davet-sandigi` olduğunu doğrulayın.
3. Production deploy için açık onay alın.
4. Kurtarma branch'ini veya koruma etiketindeki commit'i deploy edin.
5. `https://davet-sandigi.vercel.app` üzerinde mobil ve masaüstü kontrollerini tekrarlayın.

## 5. Son doğrulama

- Ana sayfa ve koleksiyon eksiksiz açılıyor.
- Firestore belge sayıları yedek manifestiyle aynı.
- Görseller yükleniyor; bozuk bağlantı yok.
- Sepet yalnızca sipariş talebi oluşturuyor.
- WhatsApp mesajı doğru ürünleri içeriyor.
- Yönetim alanı mevcut Firebase verisini okuyabiliyor.
