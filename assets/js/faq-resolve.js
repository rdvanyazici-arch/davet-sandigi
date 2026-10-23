/* Taşıma öncesi dönemin yedeğinden (backups/ klasörü) geri yüklenebilecek,
   müşteri tarafından onaylanmamış demo soru-cevapları yayına çıkarmamak için
   kullanılır. Tek kaynak: hem tarayıcı (site.js) hem yapı (page-builder.mjs)
   bu dosyayı kullanır, böylece statik HTML ile çalışma anı aynı metni gösterir. */
(function (root) {
  function faqText(value) {
    return String(value || '').toLocaleLowerCase('tr-TR').normalize('NFD')
      .replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i')
      .replace(/[’‘]/g, "'").replace(/[–—]/g, '-');
  }

  var LEGACY = {
    "minimum siparis adedi nedir?|urunlerimiz minimum 25 adet ve 25'er artislarla siparis edilebilir. adet secimini sepet uzerinden yapabilirsiniz.": 'minimum',
    '100 adet uzeri fiyat nasil belirlenir?|100 adedin uzerindeki siparislerde size ozel fiyat teklifi sunuyoruz. sepetinizi olusturup whatsapp\'tan iletisime gecmeniz yeterli.': 'quote',
    'kargo ucreti ne kadar?|kargo ucreti siparis sirasinda belirtilir. belirli tutarin uzerindeki siparislerde kargo ucretsizdir.': 'shipping',
    'teslimat suresi ne kadardir?|tasarim onayinin ardindan ortalama 5-7 is gunu icinde hazirlayip kargoya veriyoruz.': 'delivery',
    'kisiye ozel tasarim yapiyor musunuz?|evet, isim, tarih ve konseptinize ozel tasarimlar hazirliyoruz. talebinizi whatsapp uzerinden iletebilirsiniz.': 'unconfirmed'
  };

  /* Yayına uygun soru-cevabı döner; onaylanmamış içerik için null döner. */
  function resolveFaq(entry, settings) {
    if (!entry || !entry.question || !entry.answer) return null;
    var config = settings || {};
    var type = LEGACY[faqText(entry.question) + '|' + faqText(entry.answer)];
    if (!type) return { question: entry.question, answer: entry.answer };
    if (type === 'unconfirmed') return null;
    if (type === 'shipping') return config.shippingNote ? { question: entry.question, answer: config.shippingNote } : null;
    if (type === 'delivery') return config.deliveryText ? { question: entry.question, answer: config.deliveryText } : null;
    if (type === 'minimum') return { question: entry.question, answer: 'Minimum adet ve artış kuralı ürün detayında belirtilir.' };
    return { question: entry.question, answer: 'Özel fiyat teklifi gereken ürün veya adetler ürün ve sepet görünümünde belirtilir.' };
  }

  root.DS_FAQ = { faqText: faqText, resolveFaq: resolveFaq };
})(typeof window !== 'undefined' ? window : globalThis);
