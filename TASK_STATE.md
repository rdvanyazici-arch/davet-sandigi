# Davet Sandığı — Görev Durumu

## Güncel faz

- Güncel durum: Faz 0 tamamlandı; Git koruma noktaları, Firebase yedeği ve canlı site referansları doğrulandı.
- Aktif faz: Yok.
- Beklenen: Faz 1'e başlamadan önce kullanıcı onayı.

### Faz 0–15 durumları

- Faz 0 — Güvenli başlangıç ve yedek: **tamamlandı**
- Faz 1 — İçerik envanteri ve doğruluk kararı: **bekliyor**
- Faz 2 — Kod yapısını güvenli biçimde ayırma: **bekliyor**
- Faz 3 — Supabase proje ve yerel geliştirme kurulumu: **bekliyor**
- Faz 4 — Database şeması, grant ve RLS: **bekliyor**
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
- 2026-10-13 — Proje yol haritası ve çalışma kuralları hazırlandı; bu çalışma uygulama fazı olarak sayılmadı.

## Açık kararlar / bekleyen onaylar

- Çalışma ağacı başlangıçta temiz olduğu için `chore: faz 0 öncesi mevcut durum` commit'i oluşturulmadı; commit edilecek mevcut değişiklik yoktu.
- Yerelde `vercel.json` ve `.vercel/project.json` bulunmadı; Vercel proje adı yalnızca mevcut proje kaydından doğrulanabildi.
- Yedek için oluşturulan Firebase Admin anahtarı halen aktif; güvenli saklama veya iptal işlemi ayrıca kullanıcı onayı gerektirir.
- Supabase projesinin oluşturulacağı hesap/organizasyon henüz doğrulanmadı.
- Supabase proje ref'i henüz belirlenmedi.
- Supabase bölgesi henüz belirlenmedi.
- Gerçek ürünler, fiyatlar, görseller, yorumlar ve pazarlama iddiaları Faz 1'de kullanıcıyla doğrulanacak.
- Production deploy, kalıcı silme ve Firebase kapatma işlemleri ayrıca onay gerektirir.

## Bilinen riskler

- Canlı kaynak halen Firebase kullanıyor; Supabase geçişi başlamadı.
- Mevcut `index.html` yaklaşık 6,3 MB ve Base64 görseller içeriyor.
- Canlı yasal metinler taslak durumunda.
- Bazı müşteri yorumları ve sayısal pazarlama iddiaları doğrulanmış değil.
- Yönetim bağlantısı mevcut sitede görünür ve eski demo parola kaynak kodunda bulunuyor.
- Sipariş talebi doğrulaması eksik; mevcut talep numarası cihaz bazlı olduğu için çakışabilir.
- Firebase yedeği yalnızca yerel `backups/` altında ve Git dışında tutuluyor; ayrıca şifreli ikinci konuma kopyalanmalı.
- Firebase Storage SDK'sı başlatılıyor ancak kaynakta Storage dosya çağrısı yok; ilgili bucket mevcut değil ve manifestte 0 dosya olarak kaydedildi.
- `index.html` içinde 33 base64 görsel var; çözülmüş toplam boyut 4.414 MiB.
- Davet Sandığı; GitHub, Vercel veya Supabase üzerinde diğer projelerle karıştırılmamalı.

## Kimlikler

- GitHub deposu: `rdvanyazici-arch/davet-sandigi`
- GitHub remote: `https://github.com/rdvanyazici-arch/davet-sandigi.git`
- Vercel proje adı: `davet-sandigi`
- Canlı adres: `https://davet-sandigi.vercel.app`
- Supabase proje ref'i: **henüz belirlenmedi**
- Supabase bölgesi: **henüz belirlenmedi**
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

## Sonraki adım

- Kullanıcı onayı gelirse Faz 1 — İçerik envanteri ve doğruluk kararı başlatılacak.
- Faz 1'e kendiliğinden geçilmeyecek.
