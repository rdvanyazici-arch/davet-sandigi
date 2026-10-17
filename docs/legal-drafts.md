# Faz 15 — Hukuk danışmanı incelemesine sunulacak metin taslakları

> **Bunlar hukuki danışmanlık veya yayına hazır hukuki metin değildir. Her bölümün zorunlu başlangıç notu: “Hukuk danışmanı onayı bekliyor.” Hukukçu incelemesi, işletme teyidi ve onayı olmadan bu metinler `content_sections.is_active=true` yapılmamalı ve canlı sitede yayımlanmamalıdır.**
>
> Kullanıcı tarafından sağlanan bilgiler taslak girdisi olarak işlendi: işletme türü şahıs işletmesi; ad/veri sorumlusu RIDVAN YAZICI; Avcılar Vergi Dairesi / 9450566793; adres “Yunus Emre Mah. 381. Sk. 45 7 Esenyurt İstanbul” (resmi yazımı ve kapı/daire biçimi teyit edilmeli); `davetsandigi@gmail.com`; kargo 100 adet ve altında alıcıya, 100 adedin üzerinde satıcıya ait; organizasyondan en az 10 gün önce talep ve onay sonrası 7 gün içinde kargoya verme (gün türü/taşıyıcı süresi teyit edilmeli); üretim onay ve ödeme sonrasında başlar. Bilinmeyen hususlar köşeli parantezli tamamlanacak alanlar olarak bırakılmıştır.

## content_sections kayıt eşlemesi

Tüm yasal bölümler `public.content_sections` üzerinden yönetilecek. Her satırın `section_key` aşağıdaki anahtar, `title` başlık, `body` ilgili metin, `content_json` ise `{ "legal_document": true, "legal_review_approved": false, "legal_status": "draft" }` biçimindedir. Yeni kayıtlar **pasif taslak** (`is_active=false`) kalmalıdır. Bu dosyada taslakları DB'ye yazan işlem yoktur.

| section_key | Footer bağlantısı |
|---|---|
| `legal_privacy` | Gizlilik Politikası |
| `legal_kvkk` | KVKK Aydınlatma Metni |
| `legal_local_storage` | Çerez ve Yerel Depolama |
| `legal_data_sharing` | WhatsApp ve Instagram'a Veri Aktarımı |
| `legal_order_process` | Sipariş Talebi ve Satış Süreci |
| `legal_returns` | İptal, İade ve Kişiye Özel Ürünler |
| `legal_shipping` | Kargo ve Teslimat |
| `legal_media_permissions` | Yorum ve Görsel Paylaşım İzni |

Yönetim panelinde “Yasal Metinler” bölümü bu sekiz anahtarı ayrı ayrı düzenleyecek. Taslak kaydı daima pasif tutulmalı; yalnız hukuk danışmanı onayı alınmış, başındaki uyarı ve tamamlanacak yerleri çıkarılmış metin için onay kutusu + önizleme ile yayın yapılabilmelidir. Public modal yalnız aktif ve `legal_review_approved=true` kaydı göstermeli; aksi durumda “Bu metin henüz onaylanıp yayımlanmamıştır.” mesajı kullanılmalıdır.

---

## 1. Gizlilik Politikası (`legal_privacy`)

**Hukuk danışmanı onayı bekliyor.**

Bu metin, Davet Sandığı ürün kataloğu/showroom sayfası ve bu sayfadan başlatılan iletişim süreçleri hakkında taslaktır. Site üzerinden çevrimiçi ödeme alınmaz ve site formu üzerinden kesin sipariş oluşturulmaz.

**Veri sorumlusu (teyit edilecek):** RIDVAN YAZICI, şahıs işletmesi.  
**Vergi bilgisi (resmi kayıtla teyit edilecek):** Avcılar Vergi Dairesi / 9450566793.  
**Adres (resmi yazım teyit edilecek):** Yunus Emre Mah. 381. Sk. 45 7, Esenyurt/İstanbul.  
**İletişim:** davetsandigi@gmail.com (işletmenin gizlilik başvurularını takip ettiği adres olduğu teyit edilmeli).

Site, yayınlanmış ürün/kategori/koleksiyon ve sayfa içeriklerini sunmak için Supabase hizmetini kullanır. Yönetim paneli yalnız yetkili yöneticiler içindir. Ziyaretçinin sepeti, favorileri ve çerez tercihi tarayıcının yerel depolamasında tutulabilir; müşteri adı, telefon numarası ve kişiselleştirme notu Supabase'e sipariş kaydı olarak yazılmaz.

Ziyaretçi bir ürün talebini WhatsApp veya Instagram üzerinden kendisi ilettiğinde; ürün seçimi, talep referansı, miktar/fiyat bilgisi, isteğe bağlı etkinlik tarihi ve not gibi mesajda bulunan bilgiler ilgili platforma aktarılabilir. Bu platformların kendi veri işleme koşulları ayrıca geçerlidir. Web barındırma, ağ güvenliği ve teknik günlüklerde oluşabilecek kayıt türleri/saklama süreleri sağlayıcı sözleşmeleri ve hukuk danışmanı tarafından doğrulanmalıdır.

Kişisel verilerin işlenme amaçları, hukuki sebepleri, alıcı grupları, aktarım mekanizmaları ve saklama süreleri gerçek işleyiş incelenerek hukuk danışmanıyla tamamlanacaktır: **[işleme amacı/hukuki sebep/alıcı/saklama süresi hukukçu tarafından doldurulacak]**. Yurt dışı hizmet sağlayıcılarına olası aktarımlar (Supabase'in ap-southeast-2 bölgesi ve WhatsApp/Instagram hizmetleri dahil) ayrıca değerlendirilecektir.

Gizlilikle ilgili başvurular için davetsandigi@gmail.com adresine yazabilirsiniz. Başvuruların kimlik doğrulama, cevaplama süresi ve yöntemi hukuk danışmanınca son metinde belirtilecektir.

## 2. KVKK Aydınlatma Metni (`legal_kvkk`)

**Hukuk danışmanı onayı bekliyor.**

Bu taslak, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanacak aydınlatmanın iskeletidir; kanuni dayanak veya hakların kapsamı hakkında nihai hukuki değerlendirme değildir.

**Veri sorumlusu:** RIDVAN YAZICI (şahıs işletmesi olduğu ve unvanın resmi biçimi teyit edilmelidir).  
**Vergi dairesi/no:** Avcılar Vergi Dairesi / 9450566793 (teyit bekliyor).  
**Adres:** Yunus Emre Mah. 381. Sk. 45 7, Esenyurt/İstanbul (resmi adres teyit bekliyor).  
**Başvuru kanalı:** davetsandigi@gmail.com (işletmece teyit edilmelidir).

Katalog görüntüleme sırasında ürün seçimi ve sepet/favori tercihleri ziyaretçinin cihazında tutulabilir. Ziyaretçi WhatsApp veya Instagram üzerinden kendisi iletişime geçtiğinde mesaj içeriğinde ürün, adet, talep referansı, isteğe bağlı etkinlik tarihi ve kişiselleştirme notu yer alabilir. Site üzerinden üyelik, çevrimiçi ödeme veya sipariş formu bulunmaz. Teknik erişim/güvenlik kayıtlarının kapsamı hizmet sağlayıcılar ve hukuk danışmanıyla netleştirilmelidir.

İşleme amaçları, hukuki sebepler, veri kategorileri, elde edilme yöntemi, aktarım yapılan alıcı grupları, saklama ve imha süreleri ile ilgili kişi haklarının kullanım usulü hukuk danışmanı tarafından gerçek süreç ve güncel mevzuata göre tamamlanmalıdır: **[KVKK m.10 kapsamındaki zorunlu bilgiler hukukçu tarafından doldurulacak]**.

WhatsApp/Instagram'a geçiş, ziyaretçinin ilgili uygulamayı açıp mesaj göndermeyi seçmesiyle gerçekleşir. Bu aktarımın hukuki koşulu, yurt dışı aktarım değerlendirmesi ve olası alternatif başvuru kanalı hukuk danışmanının incelemesine tabidir. Bu taslak tek başına açık rıza metni değildir.

## 3. Çerez ve Yerel Depolama Bilgisi (`legal_local_storage`)

**Hukuk danışmanı onayı bekliyor.**

Davet Sandığı showroom'u katalog verisini Supabase'den görüntüler. Sepet (`ds_cart_v6`), favori ürün kimlikleri (`ds_wish_v1`) ve ziyaretçinin çerez bilgilendirme tercihi (`ds_cookie_v1`) tarayıcının `localStorage` alanında tutulabilir. Bu veriler ürün talebi oluşturmayı ve tercihlerin cihazda hatırlanmasını sağlar; müşteri adı/telefonu veya talep notu Supabase'e sipariş kaydı olarak gönderilmez.

Tarayıcı verisini temizlemek, sepet/favori/tercih kayıtlarını kaldırabilir. Başka analiz/reklam çerezi kullanımı mevcut kaynak kodda doğrulanmamıştır; harici barındırma ve güvenlik günlükleri ayrıca incelenmelidir. “Reddet/Kabul Et” tercihinin hangi teknolojiler bakımından geçerli olduğu, hukuki gereklilik ve saklama süresi hukuk danışmanı tarafından doğrulanmalıdır.

## 4. WhatsApp ve Instagram'a Veri Aktarımı (`legal_data_sharing`)

**Hukuk danışmanı onayı bekliyor.**

Site ürünleri inceleme ve sipariş talebi hazırlama amacıyla sunar; ödeme almaz ve siparişi kesinleştirmez. Ziyaretçi WhatsApp düğmesini seçtiğinde mesaj taslağı ilgili platformda açılır. Mesajda talep referansı, ürün adı/kodu, adet, görüntülenen fiyat veya teklif notu ve kullanıcı tarafından girilmişse etkinlik tarihi/kişiselleştirme notu bulunabilir. Ad ve telefon numarası site tarafından Supabase'e kaydedilmez; WhatsApp hesabı/numarası platform tarafından görülebilir.

Instagram üzerinden iletişim başlatılırsa ziyaretçi mesajı Instagram'a doğrudan gönderir; mesaj içeriği ve hesap bilgileri Meta hizmetlerine aktarılabilir. Bu hizmetlerin veri sorumluluğu, yurt dışı aktarımı ve saklama koşulları ilgili platformların güncel belgelerine ve hukuk danışmanı değerlendirmesine göre açıklanmalıdır. Kullanıcı, mesajı göndermeden önce taslağı kontrol edebilir ve göndermemeyi seçebilir.

## 5. Sipariş Talebi ve Mesafeli Satış Süreci (`legal_order_process`)

**Hukuk danışmanı onayı bekliyor.**

Web sitesi katalog/showroom niteliğindedir. Sepet ve WhatsApp mesajı sipariş talebi hazırlamak içindir; site üzerinden ödeme alınmaz, sepetin oluşturulması veya mesajın açılması tek başına sipariş sözleşmesi kurmaz. Kullanıcı ürün, miktar ve kişiselleştirme isteğini WhatsApp veya Instagram'dan iletir; fiyat, tasarım, üretim ve teslimat ayrıntıları taraflarca ayrıca teyit edilir.

İşletmenin verdiği mevcut bilgiye göre üretim, ürün/tasarım ve fiyat onayı ile ödemenin alınmasının ardından başlar. Etkinlikten en az 10 gün önce talep iletilmesi istenir; onaya istinaden ürünün 7 gün içinde kargoya verilmesi hedeflenir. Bu sürelerin takvim/iş günü olup olmadığı, siparişin hangi anda hukuken kurulduğu, ödeme/iade ve mesafeli sözleşme bilgilendirmelerinin hangi aşamada verileceği hukuk danışmanı tarafından doğrulanıp son metne eklenmelidir.

## 6. İptal, İade ve Kişiye Özel Ürünler (`legal_returns`)

**Hukuk danışmanı onayı bekliyor.**

İşletmenin bildirdiği iş akışında ürün kişiye özel hazırlanabilir ve üretim, müşteri ürün/tasarım/fiyatı onaylayıp ödeme yaptıktan sonra başlar. Üretim başladıktan sonra iptal talebi için işletmeye mesaj gönderilmesi istenir. Bu açıklama, tüketicinin mevzuattan doğan emredici haklarını ortadan kaldırdığı şeklinde yorumlanmamalıdır.

Hasarlı, ayıplı, yanlış veya eksik ürün teslimi halinde izlenecek bildirim yöntemi, süreler, kanıt/teslimat bilgileri ve uygulanacak çözüm (**onarım/değişim/bedel iadesi veya mevzuatın gerektirdiği diğer haklar**) hukuk danışmanı ve işletme tarafından belirlenmelidir. Kişiye özel ürünlerde cayma/iptal istisnasının kapsamı ve hangi ürünlerin bu kapsama girdiği hukuk danışmanı tarafından güncel mevzuata göre teyit edilmelidir. Bu taslak “kişiye özel ürünlerde hiçbir koşulda iade/değişim yapılmaz” şeklinde kesin bir hüküm kurmaz.

Başvuru kanalı: davetsandigi@gmail.com ve/veya işletmenin doğrulanmış WhatsApp numarası **[numara teyit edilecek]**. Ürün tesliminde hasar/ayıp bildirim süreci **[işletme ve hukukçu tarafından doldurulacak]**.

## 7. Kargo ve Teslimat (`legal_shipping`)

**Hukuk danışmanı onayı bekliyor.**

İşletmenin bildirdiği ücret kuralı: 100 adet ve altındaki taleplerde kargo alıcıya, 100 adedin üzerindeki taleplerde satıcıya aittir. Kargonun hangi ürün/adet veya birim bazında hesaplandığı, farklı ürünlerin toplam adetinin nasıl ele alınacağı ve ücretin sipariş onayından önce nasıl bildirileceği **[işletme teyidi bekliyor]**.

Mevcut iş akışı bilgisine göre organizasyon tarihinden en az 10 gün önce talep verilmesi ve onay sonrası ürünün 7 gün içinde kargoya verilmesi hedeflenir. 7 günün takvim günü mü iş günü mü olduğu, taşıma süresinin bu süreye dahil olup olmadığı, gönderim bölgeleri, taşıyıcı, gecikme/teslim edilememe ve hasarlı paket prosedürü **[teyit bekliyor]**. Buradaki süreler garanti taahhüdü olarak yayımlanmadan önce işletme ve hukuk danışmanı tarafından doğrulanmalıdır.

## 8. Müşteri Görseli/Yorumu İzin Metni ve Süreci (`legal_media_permissions`)

**Hukuk danışmanı onayı bekliyor.**

Müşteri yorumu, adı/rumuzu, etkinlik bilgisi veya fotoğraf/video içeriği; müşteri tarafından paylaşım için ayrı ve bilgilendirilmiş izin verilmeden web sitesinde, sosyal medya hesaplarında veya tanıtım materyallerinde yayımlanmamalıdır. Sipariş talebi için iletişime geçmek, yorum veya görselin tanıtım amaçlı yayımlanmasına tek başına izin sayılmaz.

Yayımdan önce izin kaydında en azından izin verenin doğrulanması, kullanılacak içerik/görsel, yayın kanalları ve amaç, görünen isim tercihi, izin tarihi ve geri çekme/başvuru yöntemi kayıt altına alınmalıdır. Çocuklara ait görüntüler ve üçüncü kişilerin yer aldığı içerikler için ayrıca hukuki değerlendirme yapılmalıdır. İzin geri çekildiğinde içeriğin kaldırılma ve yedeklerdeki kopyaların ele alınma süreci **[hukuk danışmanı ve işletme tarafından tamamlanacak]**. Siteye yüklenen müşteri içeriği ancak ayrı onay ve gerekli yetki kontrollerinden sonra yayınlanabilir.

**Yayın koşulu:** Bu metinlerin her biri başlangıç uyarısı korunarak yalnız taslak olarak değerlendirilmeli; hukuk danışmanı metinleri ayrı ayrı onaylayıp eksik bilgileri tamamlamadan `content_sections.is_active=true` yapılmamalıdır. Onaylanan metin sisteme girilirken “Hukuk danışmanı onayı bekliyor” uyarısı ve `[TAMAMLANACAK]` alanları çıkarılmalı, onay durumu ilgili content section kaydında ayrıca işaretlenmelidir.
