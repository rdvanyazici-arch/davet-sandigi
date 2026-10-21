# Gizlilik odaklı analitik

## Karar

- Local ve Vercel Preview ortamlarında analitik her zaman kapalıdır.
- Production'da yalnız gerçek özel alan adında ve `site_settings.analytics_enabled = true` iken çalışır.
- Vercel/Cloudflare Web Analytics ayrıca etkinleştirilmez.
- Ölçümler ziyaretçi değil olay toplamıdır; tekil ziyaretçi hesabı yapılmaz.

## Saklanan günlük toplamlar

`page_view`, `product_view`, `add_to_cart`, `whatsapp_request` ve
`instagram_click` olayları; gün, kaynak ve mobil/masaüstü sınıfıyla tutulur.
Yalnız ürün görüntüleme ve sepete ekleme olaylarında aktif ürün kimliği bulunur.
WhatsApp olayı tek sayaçtır; sepet içeriği analitiğe gönderilmez.

Ad, telefon, e-posta, IP, user-agent, ham referrer, tam URL/query, mesaj,
sepet, not, etkinlik tarihi, çerez, localStorage kimliği, oturum/cihaz kimliği
ve parmak izi saklanmaz.

## Edge Function sırları

Uzak fonksiyon yayınlanmadan önce:

1. `ANALYTICS_ALLOWED_ORIGINS` yalnız gerçek HTTPS alan adlarını virgülle ayrılmış biçimde içermelidir.
2. `ANALYTICS_HMAC_SECRET` en az 32 rastgele karakter olmalıdır.
3. `SUPABASE_SERVICE_ROLE_KEY` platform tarafından fonksiyon ortamına sağlanır; tarayıcıya veya Git'e yazılmaz.

IP yalnız fonksiyon belleğinde hız sınırı anahtarını üretmek için geçici işlenir.
Günlük/ham IP saklanmaz. Dönen 10 dakikalık HMAC anahtarı `private` şemada
en fazla 10 dakika tutulur. Sınır aynı anahtar için 10 dakikada 120 istektir.

## Saklama ve zamanlama

`private.cleanup_analytics_data()` 400 günden eski günlük toplamları ve süresi
dolan hız sınırı kayıtlarını siler. Migration zamanlama kurmaz. Canlı kullanımdan
önce Supabase Cron üzerinden günde bir kez çalıştırılması ayrıca onaylanmalıdır.

## Canlı açılış sırası

1. Migration ve Edge Function test edilir ve uzak projeye ayrı onayla uygulanır.
2. Özel alan adı `ANALYTICS_ALLOWED_ORIGINS` listesine eklenir.
3. Gerçek katalog yüklenir.
4. Güncellenmiş yasal metinler hukuk danışmanı tarafından tekrar onaylanır.
5. Site Ayarları içindeki anonim analiz bayrağı açılır.
6. Ağ kaydında yalnız anonim olay alanlarının gönderildiği doğrulanır.

## Yasal metin incelemesi

Mevcut metinler otomatik değiştirilmedi. Hukuk danışmanı şu ekleri incelemelidir:

- Gizlilik politikasına anonim, günlük toplulaştırılmış kullanım ölçümü amacı;
- IP ve referrer'ın yalnız geçici sınıflandırma/hız sınırı işlemi;
- hiçbir müşteri, mesaj, sepet veya cihaz kimliği tutulmadığı;
- günlük toplamların 400 gün saklandığı;
- DNT ve Global Privacy Control açıkken ölçüm yapılmadığı;
- WhatsApp ve Instagram tıklamalarında yalnız olay sayısının artırıldığı.

Mevcut yayınla karşılaştırma:

| Metin | Mevcut cümle / eksik açıklama | İnceleme ihtiyacı |
|---|---|---|
| `legal_local_storage` | “Davet Sandığı yalnız sitenin çalışması için gerekli tarayıcı depolamasını kullanır.” | Analitik çerez/localStorage kullanmasa da site kullanım ölçümü yapacağı için kapsam netleştirilmeli. |
| `legal_local_storage` | “Sitede reklam veya davranışsal izleme amacıyla çerez kullanılmamaktadır.” | Teknik olarak doğru kalır; anonim ölçümün reklam, profil veya tekil ziyaretçi takibi olmadığı ayrıca yazılmalı. |
| `legal_privacy` | Supabase'in katalog sunumu ve WhatsApp/Instagram aktarımı anlatılıyor; günlük anonim olay toplamları, geçici IP/referrer işlemi ve 400 günlük saklama belirtilmiyor. | Bu veri akışı ve saklama süresi eklenmeli. |
| `legal_data_sharing` | WhatsApp/Instagram'a aktarılan sipariş talebi anlatılıyor; bu kanallara tıklamanın anonim sayaç olarak işlendiği belirtilmiyor. | Yalnız olay sayısının tutulduğu, hesap/mesaj içeriğinin analitiğe gitmediği açıklanmalı. |
