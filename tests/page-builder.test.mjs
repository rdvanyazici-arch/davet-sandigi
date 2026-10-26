import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildHomeBlocks, buildPages, derivePage, injectHome, normalizeProducts } from '../scripts/page-builder.mjs';
import { canonicalOrigin } from '../scripts/routes.mjs';

const SUPABASE = 'https://zdksvgtkeeweufuajugd.supabase.co';

function fixture() {
  return {
    settings: { brand_name: 'Davet Sandığı', whatsapp_number: '905301112233', instagram_url: 'https://www.instagram.com/ornek', email: 'ornek@example.test', delivery_text: 'Onaydan sonra 7 gün içinde kargoda.' },
    collections: [
      { id: 1, slug: 'kina', name: 'Kına Gecesi', short_description: 'Kına geceniz için isme özel hediyelikler.', media_assets: { storage_path: 'collections/1/c.webp', alt_text: 'Kına kapağı', width: 640, height: 800 } },
      { id: 2, slug: 'Geçersiz Slug', name: 'Bozuk', short_description: '' }
    ],
    categories: [{ id: 10, slug: 'yelpaze', name: 'Yelpaze', description: 'İsme özel baskılı yelpazeler.' }],
    products: normalizeProducts([
      { id: 100, slug: 'kina-yelpazesi', sku: 'YEL-001', name: 'Kına Yelpazesi', short_description: 'İsme özel yelpaze.', description: 'Uzun açıklama.', price: 49.9, is_price_visible: true, is_quote_only: false, min_quantity: 25, quantity_step: 25, category_id: 10, product_collections: [{ collection_id: 1 }], product_images: [{ alt_text: 'Yelpaze görseli', sort_order: 0, is_primary: true, media_assets: { storage_path: 'products/100/a.webp', alt_text: 'yedek', width: 800, height: 1000 } }] },
      { id: 101, slug: 'teklif-urunu', sku: 'KES-001', name: 'Teklif Ürünü', short_description: 'Adete göre fiyat.', price: null, is_price_visible: true, is_quote_only: true, min_quantity: 1, quantity_step: 1, category_id: 10, product_collections: [{ collection_id: 1 }], product_images: [] },
      { id: 102, slug: 'xss <script>alert(1)</script>', name: 'Kötü Slug', product_collections: [], product_images: [] }
    ]),
    legal: []
  };
}

test('her koleksiyon, kategori ve ürün için ayrı adres ve başlık üretilir', () => {
  const { pages } = buildPages(fixture(), SUPABASE);
  const paths = pages.map(page => page.path);
  assert.deepEqual(paths, ['/kina-hediyelikleri/', '/yelpaze/', '/urun/kina-yelpazesi/', '/urun/teklif-urunu/', '/iletisim/']);
  assert.equal(pages[0].title, 'Kına Gecesi Hediyelikleri | Davet Sandığı');
  assert.equal(pages[1].title, 'Kişiye Özel Yelpaze | Davet Sandığı');
  assert.equal(pages[2].title, 'Kına Yelpazesi | Davet Sandığı');
  assert.equal(pages[4].title, 'İletişim | Davet Sandığı');
  pages.forEach(page => assert.ok(page.description.length > 0, page.path + ' açıklamasız'));
});

test('geçersiz slug taşıyan kayıt sayfa üretmeden atlanır', () => {
  const { pages } = buildPages(fixture(), SUPABASE);
  const joined = pages.map(page => page.path).join(' ');
  assert.doesNotMatch(joined, /Bozuk|xss|script/i);
});

test('kullanıcı metni HTML olarak kaçırılır', () => {
  const data = fixture();
  data.products[0].name = 'Yelpaze <script>alert("x")</script>';
  data.products[0].description = '"tırnak" & <b>kalın</b>';
  const { pages } = buildPages(data, SUPABASE);
  const page = pages.find(entry => entry.path === '/urun/kina-yelpazesi/');
  assert.doesNotMatch(page.body, /<script>alert/);
  assert.match(page.body, /&lt;script&gt;/);
  assert.match(page.body, /&quot;tırnak&quot; &amp; &lt;b&gt;/);
});

test('fiyatlı üründe Offer, teklif ürününde Offer yok', () => {
  const { pages } = buildPages(fixture(), SUPABASE);
  const priced = pages.find(page => page.path === '/urun/kina-yelpazesi/').schemas.find(s => s['@type'] === 'Product');
  assert.equal(priced.offers.price, '49.90');
  assert.equal(priced.offers.priceCurrency, 'TRY');
  assert.equal(priced.sku, 'YEL-001');
  assert.equal(priced.image, SUPABASE + '/storage/v1/object/public/site-media/products/100/a.webp');
  const quote = pages.find(page => page.path === '/urun/teklif-urunu/').schemas.find(s => s['@type'] === 'Product');
  assert.equal('offers' in quote, false);
});

test('her sayfada mutlak adresli BreadcrumbList bulunur', () => {
  const { pages } = buildPages(fixture(), SUPABASE);
  pages.forEach(page => {
    const crumb = page.schemas.find(schema => schema['@type'] === 'BreadcrumbList');
    assert.ok(crumb, page.path + ' için breadcrumb yok');
    crumb.itemListElement.forEach(item => assert.ok(item.item.startsWith(canonicalOrigin + '/'), item.item));
  });
});

test('gezinme koleksiyonları ve iletişimi içerir, bozuk kaydı içermez', () => {
  const { nav } = buildPages(fixture(), SUPABASE);
  assert.deepEqual(nav.map(item => item.path), ['/', '/kina-hediyelikleri/', '/iletisim/']);
});

test('ürünü olmayan koleksiyon boş durum metni gösterir', () => {
  const data = fixture();
  data.products = [];
  const { pages } = buildPages(data, SUPABASE);
  assert.match(pages[0].body, /yayında ürün bulunmuyor/);
});

test('iç bağlantı listesi koleksiyon, kategori ve iletişimi verir', () => {
  const { siteLinks } = buildPages(fixture(), SUPABASE);
  assert.deepEqual(siteLinks.collections.map(item => item.path), ['/kina-hediyelikleri/']);
  assert.deepEqual(siteLinks.categories.map(item => item.path), ['/yelpaze/']);
  assert.deepEqual(siteLinks.pages.map(item => item.path), ['/iletisim/']);
  Object.values(siteLinks).flat().forEach(item => {
    assert.ok(item.name, 'bağlantı adı boş');
    assert.match(item.path, /^\/[a-z0-9/-]*\/$/, item.path);
  });
});

function home() { return readFileSync(new URL('../index.html', import.meta.url), 'utf8'); }

function blocks(extra) {
  const data = { settings: { brand_name: 'Davet Sandığı', phone: '+905399413902', email: 'davetsandigi@gmail.com', instagram_url: 'https://www.instagram.com/davetsandigi' }, ...extra };
  const { siteLinks } = buildPages(fixture(), SUPABASE);
  return buildHomeBlocks(data, siteLinks);
}

test('iç bağlantılar ana sayfaya işaretçiler arasına yazılır ve tekrarlanmaz', () => {
  const once = injectHome(home(), blocks());
  assert.ok(once.includes('<a href="/kina-hediyelikleri/">'), 'koleksiyon bağlantısı yazılmadı');
  assert.ok(once.includes('<a href="/yelpaze/">'), 'kategori bağlantısı yazılmadı');
  assert.ok(once.includes('<a href="/iletisim/">'), 'iletişim bağlantısı yazılmadı');
  assert.equal(injectHome(once, blocks()), once, 'ikinci yapı farklı sonuç üretti');
  assert.equal(once.split('<a href="/kina-hediyelikleri/">').length - 1, 1);
});

test('işaretçi yoksa ana sayfa değiştirilmeden döner', () => {
  const plain = '<html><body><footer></footer></body></html>';
  assert.equal(injectHome(plain, blocks()), plain);
});

test('bağlantı ve içerik adlarındaki özel karakterler kaçırılır', () => {
  const out = injectHome(home(), blocks({ banners: [{ title: '<script>x</script>' }], faqs: [{ question: '<b>s</b>', answer: '"a"' }] }));
  assert.ok(!out.includes('<script>x</script>'), 'banner başlığı kaçırılmadı');
  assert.ok(out.includes('&lt;script&gt;'), 'kaçırılmış metin yok');
  assert.ok(!out.includes('<b>s</b>'), 'soru metni kaçırılmadı');
});

test('ana sayfaya banner, hikaye, süreç ve soru metinleri gömülür', () => {
  const out = injectHome(home(), blocks({
    banners: [{ eyebrow: 'Kişiye özel', title: 'Misafirlerinize *özel*\nhediyelikler', description: 'El emeğiyle hazırlanır.' }],
    sections: {
      story: { title: 'Hikayemiz', body: 'Üç yıldır\natölyemizde üretiyoruz.' },
      process: { content_json: { steps: [{ title: 'Tasarım', description: 'Konseptinizi hazırlarız.' }] } },
      why_us: { content_json: { items: [{ title: 'El emeği', description: 'Her ürün elde hazırlanır.' }] } }
    },
    faqs: [{ question: 'Teslimat ne kadar sürer?', answer: 'Tasarım onayından sonra hazırlanır.' }]
  }));
  assert.ok(out.includes('Misafirlerinize <em>özel</em><br>hediyelikler'), 'banner başlığı gömülmedi');
  assert.ok(out.includes('El emeğiyle hazırlanır.'), 'banner açıklaması gömülmedi');
  assert.ok(out.includes('Üç yıldır<br>atölyemizde üretiyoruz.'), 'hikaye metni gömülmedi');
  assert.ok(out.includes('<h3>Tasarım</h3>'), 'süreç adımı gömülmedi');
  assert.ok(out.includes('<h3>El emeği</h3>'), 'neden-biz kartı gömülmedi');
  assert.ok(out.includes('Teslimat ne kadar sürer?'), 'soru gömülmedi');
  assert.ok(out.includes('"@type":"FAQPage"'), 'FAQPage şeması yok');
  assert.ok(out.includes('"@type":"ContactPoint"'), 'iletişim noktası yok');
  assert.ok(out.includes('"areaServed":"TR"'), 'hizmet bölgesi yok');
});

/* Banner tarih penceresi dışındaysa yayında değildir; statik HTML'e de girmemeli. */
test('tarihi geçmiş banner ana sayfaya yazılmaz', () => {
  const out = injectHome(home(), blocks({ banners: [{ title: 'Eski kampanya', ends_at: '2020-01-01T00:00:00Z' }] }));
  assert.ok(!out.includes('Eski kampanya'));
});

/* Onaylanmamış demo soru-cevapları hem HTML'den hem şemadan çıkmalı. */
test('onaylanmamış demo soruları statik HTML ve şemaya girmez', () => {
  const out = injectHome(home(), blocks({ faqs: [{ question: 'Kişiye özel tasarım yapıyor musunuz?', answer: 'Evet, isim, tarih ve konseptinize özel tasarımlar hazırlıyoruz. Talebinizi WhatsApp üzerinden iletebilirsiniz.' }] }));
  assert.ok(!out.includes('konseptinize özel tasarımlar hazırlıyoruz'), 'onaylanmamış cevap gömüldü');
  assert.ok(!out.includes('"@type":"FAQPage"'), 'boş FAQPage şeması yazıldı');
});

/* Şema her zaman bulunmalı: site.js ve E2E testi #organization-schema bekliyor. */
test('şema bölgesi organizasyon betiğini korur', () => {
  const out = injectHome(home(), blocks());
  assert.equal(out.split('id="organization-schema"').length - 1, 1);
});

/* İl/ilçe: sokak adresi yayımlanmadığı için PostalAddress yalnızca bu iki
   alanla kurulur ve ikisi birlikte girilmeden şemaya yazılmaz. */
test('il ve ilçe şemaya, iletişim sayfasına ve footera işlenir', () => {
  const out = injectHome(home(), blocks({ settings: { brand_name: 'Davet Sandığı', address_locality: 'Nilüfer', address_region: 'Bursa' } }));
  const schema = JSON.parse(out.split('id="organization-schema">')[1].split('</script>')[0]);
  assert.deepEqual(schema.address, { '@type': 'PostalAddress', addressLocality: 'Nilüfer', addressRegion: 'Bursa', addressCountry: 'TR' });
});

test('eksik veya rakamlı konum şemaya yazılmaz', () => {
  const cases = [
    { address_locality: 'Nilüfer' },
    { address_region: 'Bursa' },
    { address_locality: 'Atatürk Cad. No:12', address_region: 'Bursa' },
    { address_locality: 'N', address_region: 'Bursa' }
  ];
  cases.forEach(settings => {
    const out = injectHome(home(), blocks({ settings: { brand_name: 'Davet Sandığı', ...settings } }));
    const schema = JSON.parse(out.split('id="organization-schema">')[1].split('</script>')[0]);
    assert.equal('address' in schema, false, JSON.stringify(settings));
  });
});

test('iletişim sayfası konumu listeler', () => {
  const data = fixture();
  data.settings = { brand_name: 'Davet Sandığı', address_locality: 'Nilüfer', address_region: 'Bursa' };
  const { pages } = buildPages(data, SUPABASE);
  const contact = pages.find(page => page.path === '/iletisim/');
  assert.match(contact.body, /pg-contact-k">Konum<\/span><span class="pg-contact-v">Nilüfer \/ Bursa/);
});

/* Üretilen sayfa index.html'in kendisinden türetilir: ikinci bir iskelet kopyası
   yok, bu yüzden başlık, footer ve etkileşimli parçalar tek kaynaktan gelir. */
test('üretilen sayfa index.html iskeletini olduğu gibi taşır', () => {
  const data = fixture();
  data.settings = { brand_name: 'Davet Sandığı', whatsapp_number: '905399413902', phone: '+90 539 941 39 02', email: 'davetsandigi@gmail.com', instagram_url: 'https://www.instagram.com/davetsandigi', address_locality: 'Nilüfer', address_region: 'Bursa' };
  const { pages, siteLinks } = buildPages(data, SUPABASE);
  const shell = injectHome(home(), buildHomeBlocks(data, siteLinks));
  const html = derivePage(shell, pages[0], data.settings);

  /* Sitenin etkileşimli parçaları alt sayfada da bulunmalı. */
  ['id="collview"', 'id="product-modal"', 'id="cart-drawer"', 'class="header"', 'class="footer"', 'id="cookie-bar"'].forEach(part => {
    if (shell.includes(part)) assert.ok(html.includes(part), part + ' alt sayfada yok');
  });
  assert.ok(html.includes('/assets/js/site.js'), 'site betiği yüklenmiyor');

  /* pages:seo bloğu her üretilen sayfada baştan yazılıyor. Sayfadan sayfaya
     değişmeyen etiketler yanlışlıkla o bloğun içine taşınırsa alt sayfalarda
     sessizce kaybolur; favicon'lar uzun süre böyle kayıptı. */
  ['/favicon.ico', 'favicon-48.png', 'favicon-96.png', 'favicon-192.png', 'apple-touch-icon', 'name="robots"', 'rel="preconnect"'].forEach(etiket => {
    assert.ok(html.includes(etiket), etiket + ' üretilen sayfada kaybolmuş');
  });
  assert.ok(!html.includes('page.css'), 'ayrı stil dosyası geri gelmiş');
});

test('üretilen sayfada ana sayfaya özel bölümler kalmaz', () => {
  const data = fixture();
  const { pages, siteLinks } = buildPages(data, SUPABASE);
  const shell = injectHome(home(), buildHomeBlocks(data, siteLinks));
  const html = derivePage(shell, pages[0], data.settings || {});
  /* Bunlar her sayfada tekrarlansa, sayfaların büyük kısmı birbirinin kopyası olurdu. */
  ['id="hero-section"', 'id="koleksiyonlar"', 'id="sss"', 'id="hikayemiz"', 'id="social-commerce"'].forEach(part => {
    assert.ok(!html.includes(part), part + ' alt sayfada kalmış');
  });
  assert.ok(html.includes('<main id="top">'), 'ana bölüm kabı kaybolmuş');
  assert.equal(html.split('<h1').length - 1, 1, 'sayfada tek h1 olmalı');
});

test('üretilen sayfanın adres bilgileri kendi adresini gösterir', () => {
  const data = fixture();
  const { pages, siteLinks } = buildPages(data, SUPABASE);
  const shell = injectHome(home(), buildHomeBlocks(data, siteLinks));
  const page = pages.find(item => item.path === '/kina-hediyelikleri/');
  const html = derivePage(shell, page, data.settings || {});

  assert.ok(html.includes('<title>' + page.title + '</title>'), 'başlık yazılmadı');
  assert.ok(html.includes('<link rel="canonical" href="' + canonicalOrigin + '/kina-hediyelikleri/">'), 'canonical yanlış');
  assert.equal(html.split('<link rel="canonical"').length - 1, 1, 'birden fazla canonical var');
  assert.equal(html.split('<title>').length - 1, 1, 'birden fazla başlık var');
  assert.ok(html.includes('"@type":"BreadcrumbList"'), 'site yolu şeması yok');
  assert.ok(html.includes('id="organization-schema"'), 'kurum şeması yok');
  /* Ana sayfanın bölüm çapaları alt sayfada karşılıksız; ana sayfaya gitmeli. */
  assert.ok(html.includes('href="/#koleksiyonlar"'), 'çapa ana sayfaya yönlendirilmemiş');
  assert.ok(!html.includes('href="#koleksiyonlar"'), 'karşılıksız çapa kalmış');
});

test('ürün kartı ürün sayfasına bağlanır ve JavaScript isteyen düğme taşımaz', () => {
  const data = fixture();
  const { pages, siteLinks } = buildPages(data, SUPABASE);
  const shell = injectHome(home(), buildHomeBlocks(data, siteLinks));
  const collection = pages.find(page => page.path === '/kina-hediyelikleri/');
  const html = derivePage(shell, collection, data.settings || {});
  assert.ok(html.includes('<a href="/urun/kina-yelpazesi/">'), 'ürün bağlantısı yok');
  assert.ok(html.includes('class="prod-card"'), 'ürün kartı sitenin bileşeni değil');
});

test('banner görseli, düğmeleri ve üst şerit yapı sırasında HTML\'e yazılır', () => {
  const data = {
    settings: {}, collections: [], categories: [], products: [], faqs: [],
    banners: [{ title: 'Başlık', primary_button_text: 'Keşfet', primary_button_url: '#urunler', secondary_button_text: 'Kötü', secondary_button_url: 'javascript:alert(1)', media_assets: { storage_path: 'banners/a b.webp', alt_text: 'Banner', width: 1600, height: 700 } }],
    sections: { topbar: { content_json: { items: ['Bir', 'İki <b>'] } } }
  };
  const blocks = buildHomeBlocks(data, { collections: [], categories: [], pages: [] }, 'https://x.supabase.co');
  assert.match(blocks['hero-img'], /src="https:\/\/x\.supabase\.co\/storage\/v1\/object\/public\/site-media\/banners\/a%20b\.webp"/);
  assert.match(blocks['hero-img'], /fetchpriority="high"/);
  assert.match(blocks['hero-cta'], /href="#urunler"/);
  assert.ok(!blocks['hero-cta'].includes('javascript:'), 'güvensiz bağlantı yazılmamalı');
  assert.equal((blocks.topbar.match(/<li>/g) || []).length, 2);
  assert.ok(blocks.topbar.includes('İki &lt;b&gt;'));
});
