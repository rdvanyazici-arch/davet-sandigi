# Davet Sandığı — Görev Durumu

## Güncel faz

- Güncel durum: Hazırlık tamamlandı; Faz 0 henüz başlatılmadı.
- Aktif faz: Yok.
- Başlangıç için gereken: Kullanıcının Faz 0 onayı.

### Faz 0–15 durumları

- Faz 0 — Güvenli başlangıç ve yedek: **bekliyor**
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

- Henüz tamamlanan uygulama fazı yok.
- 2026-10-13 — Proje yol haritası ve çalışma kuralları hazırlandı; bu çalışma uygulama fazı olarak sayılmadı.

## Açık kararlar / bekleyen onaylar

- Faz 0'ın başlatılması için kullanıcı onayı bekleniyor.
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
- Firebase verileri ve görselleri yedeklenmeden taşıma veya silme yapılmamalı.
- Davet Sandığı; GitHub, Vercel veya Supabase üzerinde diğer projelerle karıştırılmamalı.

## Kimlikler

- GitHub deposu: `rdvanyazici-arch/davet-sandigi`
- GitHub remote: `https://github.com/rdvanyazici-arch/davet-sandigi.git`
- Vercel proje adı: `davet-sandigi`
- Canlı adres: `https://davet-sandigi.vercel.app`
- Supabase proje ref'i: **henüz belirlenmedi**
- Supabase bölgesi: **henüz belirlenmedi**
- Gizli anahtarlar: Bu dosyada tutulmaz.

## Son çalıştırılan testler ve sonuçları

- 2026-10-13 — `PROJECT_ROADMAP.md` kökte bulundu ve 936 satırın tamamı okundu: **başarılı**
- 2026-10-13 — Yol haritasındaki 1–18 bölüm başlıkları doğrulandı: **başarılı**
- 2026-10-13 — `AGENTS.md` satır sayısı ve zorunlu kuralları doğrulandı: **başarılı**
- 2026-10-13 — `git diff --check -- AGENTS.md`: **başarılı**
- Uygulama kodunda bu dokümantasyon çalışması sırasında değişiklik yapılmadığı için yeni site testi çalıştırılmadı.

## Sonraki adım

- Kullanıcı onayından sonra `PROJECT_ROADMAP.md` içindeki Faz 0 — Güvenli başlangıç ve yedek başlatılacak.
- Faz 0 tamamlanmadan Faz 1'e geçilmeyecek.
