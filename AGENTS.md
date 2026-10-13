# Davet Sandığı Proje Kuralları

## Proje özeti

- Davet Sandığı, herkese açık bir ürün showroom sitesidir.
- Ziyaretçiler için üyelik, kayıt veya giriş bulunmaz.
- Site üzerinden çevrimiçi ödeme alınmaz.
- Ziyaretçi ürünleri sepete ekler ve sepet içeriğini WhatsApp üzerinden sipariş talebi olarak gönderir.
- Sipariş, WhatsApp görüşmesi ve işletme onayından sonra kesinleşir.
- Instagram ana satış ve marka iletişim kanalıdır.
- Supabase Auth yalnızca gizli yönetim panelindeki yetkili yöneticiler için kullanılır.

## Değişmez kurallar

- `service_role` veya başka bir gizli anahtar asla tarayıcıya, GitHub'a, HTML ya da JavaScript dosyalarına yazılmaz.
- Tarayıcıda yalnızca Supabase publishable key kullanılır.
- Açık şemadaki her tabloda RLS etkinleştirilir.
- `anon` rolü yalnızca yayındaki satırlarda `SELECT` yapabilir; ekleme, güncelleme ve silme yapamaz.
- Yetkilendirmede `user_metadata` kullanılmaz.
- Yönetici yetkisi `admin_profiles` tablosu ve güvenli `is_admin()` kontrolüyle doğrulanır.
- `is_admin()` ayrı ve erişimi sınırlandırılmış bir şemada tutulur; çağıranın `auth.uid()` değeri mutlaka kontrol edilir.
- Yazma yetkisi yalnızca aktif yönetici hesaplarına verilir.
- Silme işlemleri önce arşivleme ile yapılır; kalıcı silme ayrı kullanıcı onayı gerektirir.
- Müşteri adı, telefon numarası veya özel gün notu Supabase'e yazılmaz.
- Sepet ziyaretçinin cihazında tutulur; müşteri bilgileri yalnızca kullanıcı WhatsApp'a geçerken oluşturulan mesaja eklenir.
- Site hiçbir yerde ödeme alıyormuş veya siparişi kesinleştiriyormuş gibi görünmez.
- Arayüzde “sipariş talebi” dili kullanılır.
- Renkler, yazı tipleri, görsel oranlar ve mevcut sayfa düzeni kullanıcı istemedikçe değiştirilmez.
- Gerçek olmayan yorum, müşteri adı, sayı, istatistik veya pazarlama iddiası eklenmez.
- Kullanılmakta olan görsel doğrudan silinmez; önce kullanım yerleri kaldırılır ve görsel arşivlenir.
- Firebase verisi, görselleri veya projesi kullanıcı onayı olmadan silinmez.

## Çalışma yöntemi

Her fazda `PROJECT_ROADMAP.md` Bölüm 16'daki sıra uygulanır:

1. İlgili dosyalar ve mevcut durum incelenir.
2. O fazın net kapsamı kullanıcıya kısa biçimde bildirilir.
3. Gerekli değişiklikler yalnızca güncel proje klasöründe yapılır.
4. İlgili testler çalıştırılır.
5. Mobil ve masaüstü kontrol edilir.
6. Supabase değişikliği varsa RLS ve yetki testi yapılır.
7. `TASK_STATE.md` güncellenir.
8. Değişen dosyalar ve dikkat noktası raporlanır.
9. Sonraki faza geçmeden kullanıcı onayı beklenir.

- Bir faz tamamlanmadan sonraki faza geçilmez.
- Her görevin başında `AGENTS.md`, `TASK_STATE.md` ve ilgili yol haritası bölümü okunur.
- Gereksiz dosyalar ve repository'nin tamamı tekrar tekrar taranmaz.
- İstenmeyen refactor, özellik veya paket eklenmez.
- Her faz sonunda yalnızca ilgili kontroller çalıştırılır.

## Kod standartları

- Tablo, sütun, fonksiyon, değişken ve dosya adları İngilizce kullanılır.
- Veritabanı tablo ve sütun adları küçük harfli `snake_case` olur.
- Migration dosyaları Supabase CLI ile oluşturulur ve zaman damgalı ad kullanır.
- Migration dosya adları elle tahmin edilmez; `supabase migration new <name>` kullanılır.
- Migration'lar mevcut veriyi korur, tekrar üretilebilir olur ve mümkün olduğunda geri alınabilir tasarlanır.
- Foreign key alanları indekslenir; fiyatlarda `numeric`, zamanlarda `timestamptz` kullanılır.
- `UPDATE` RLS politikalarında hem `USING` hem `WITH CHECK` bulunur.
- Arayüz metinleri Türkçe ve doğru Türkçe karakterlerle yazılır.
- Kod, değişken adları ve commit mesajları İngilizce olur.
- Gizli bilgiler ortam değişkenlerinde tutulur ve commit edilmez.
- Mobil görünüm önce değerlendirilir; ardından masaüstü görünüm doğrulanır.
- Boş, yükleniyor ve hata durumları eklenir.
- Erişilebilirlik için form etiketleri, klavye kullanımı, odak stilleri ve kontrast korunur.

## Önceden kullanıcı onayı gereken işlemler

Aşağıdaki komut veya işlemler çalıştırılmadan hemen önce kullanıcıdan açık onay alınır:

- Production deploy veya production ortamını değiştiren yayın işlemleri
- Veritabanı, Storage, dosya, ürün, görsel veya kullanıcı için kalıcı silme
- `supabase db reset`
- `git push --force` veya `git push --force-with-lease`
- Firebase verisi, görseli, koleksiyonu, kullanıcı hesabı veya Firebase projesi silme

Bu işlemler için hedef, kapsam, geri dönüş imkânı ve olası risk kısaca açıklanır.

## Test komutları

<!-- Fazlar ilerledikçe ilgili test komutları buraya eklenecek. -->
