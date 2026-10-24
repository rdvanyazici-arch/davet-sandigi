import { readFileSync } from 'node:fs';
import { buildHomeBlocks, buildPages, derivePage, injectHome, normalizeProducts } from '../../scripts/page-builder.mjs';
import { expect, test } from '@playwright/test';
import { canonicalOrigin } from '../../scripts/sitemap-core.mjs';

/* Ekran goruntuleri varsayilan olarak gitignore'lu test-results/ altina yazilir;
   boylece her test kosusu depoyu kirletmez. Referans gorselleri bilerek tazelemek
   icin: UPDATE_ADMIN_BASELINE=1 npx playwright test */
const SHOT_DIR = process.env.UPDATE_ADMIN_BASELINE ? 'docs/admin-baseline' : 'test-results/admin-screens';

const PROJECT_HOST = 'zdksvgtkeeweufuajugd.supabase.co';
const ORIGIN = `https://${PROJECT_HOST}`;
const LOCAL_HOST = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4175').host;
const PRICE_ERROR = 'Fiyat bilgisi şu an yüklenemedi';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,OPTIONS' };
const PNG = readFileSync('assets/images/brand/favicon-48.png');

const media = (path, alt, width = 800, height = 1000) => ({ storage_path: path, alt_text: alt, width, height });

function makeDb(extraProducts = []) {
  const image = (path, alt, primary, order) => ({ alt_text: alt, sort_order: order, is_primary: primary, media_assets: media(path, alt) });
  const product = (id, fields) => ({
    id, category_id: 1, slug: `urun-${id}`, sku: `SKU-${id}`, name: `Ürün ${id}`, short_description: 'Kısa', description: 'Açıklama',
    price: 10, min_quantity: 25, quantity_step: 25, is_price_visible: true, is_quote_only: false, is_featured: false, sort_order: id, is_active: true, archived_at: null,
    product_images: [image(`products/${id}/a.webp`, `Ürün ${id} ana görsel`, true, 0)], product_collections: [], ...fields
  });
  const live = rows => rows.map(row => ({ is_active: true, ...row }));
  return {
    site_settings_public: [{ id: 1, whatsapp_number: '905301112233', instagram_url: 'https://www.instagram.com/brand-channel-check', phone: '+90 212 000 00 00', email: 'info@example.test', delivery_text: 'Teslimat bilgisi panelde yönetilir.', currency_code: 'TRY', default_min_quantity: 25, default_quantity_step: 25, quote_threshold: 100, shipping_note: 'Kargo bilgisi panelde yönetilir.', address_locality: 'Nilüfer', address_region: 'Bursa' }],
    categories: [
      { id: 1, slug: 'kolonya', name: 'Kolonya', description: '', sort_order: 1, is_active: true, archived_at: null, category_collections: [{ collection_id: 1, sort_order: 1 }] },
      { id: 2, slug: 'mum', name: 'Mum', description: '', sort_order: 2, is_active: true, archived_at: null, category_collections: [{ collection_id: 2, sort_order: 1 }] },
      { id: 9, slug: 'gizli', name: 'Gizli Kategori', description: '', sort_order: 3, is_active: false, archived_at: null }
    ],
    collections: [
      { id: 1, slug: 'nisan', name: 'Nişan', short_description: 'Nişan hatıraları', icon_key: 'rings', sort_order: 1, is_active: true, archived_at: null, media_assets: media('collections/1/c.webp', 'Nişan koleksiyonu kapağı', 640, 640) },
      { id: 2, slug: 'kina', name: 'Kına', short_description: 'Kına hatıraları', icon_key: 'henna', sort_order: 2, is_active: true, archived_at: null, media_assets: media('collections/2/c.webp', 'Kına koleksiyonu kapağı', 640, 640) }
    ],
    products: [
      product(1, { slug: 'kolonya-urun', name: 'Kolonya Ürünü', price: 54.9, is_featured: true, product_collections: [{ collection_id: 1 }], product_images: [image('products/1/a.webp', 'Kolonya ana görsel', true, 0), image('products/1/b.webp', 'Kolonya detay görseli', false, 1)] }),
      product(2, { slug: 'mum-urun', name: 'Mum Ürünü', category_id: 2, price: 44.9, product_collections: [{ collection_id: 2 }] }),
      product(3, { slug: 'pasif-urun', name: 'Pasif Ürün', is_active: false, is_featured: true }),
      product(4, { slug: 'arsiv-urun', name: 'Arşiv Ürünü', is_active: false, archived_at: '2026-01-01T00:00:00Z', is_featured: true }),
      product(5, { slug: 'tutarsiz-arsiv', name: 'Tutarsız Arşiv', is_active: true, archived_at: '2026-01-01T00:00:00Z' }),
      ...extraProducts
    ],
    banners: live([
      { id: 1, eyebrow: 'Yeni', title: 'Canlı Banner', description: 'Açıklama', primary_button_text: 'Keşfet', primary_button_url: '#urunler', secondary_button_text: '', secondary_button_url: '', sort_order: 1, starts_at: null, ends_at: null, media_assets: media('banners/1/h.webp', 'Hero görseli', 1600, 700) },
      { id: 2, title: 'Süresi Dolmuş Banner', sort_order: 2, starts_at: '2020-01-01T00:00:00Z', ends_at: '2020-02-01T00:00:00Z', media_assets: media('banners/2/h.webp', 'Eski hero', 1600, 700) },
      { id: 3, title: 'Gelecek Banner', sort_order: 3, starts_at: '2099-01-01T00:00:00Z', ends_at: null, media_assets: media('banners/3/h.webp', 'Gelecek hero', 1600, 700) }
    ]),
    content_sections: live([
      { section_key: 'topbar', content_json: { items: ['Kişiye özel üretim', 'WhatsApp ile sipariş talebi'] } },
      { section_key: 'process', eyebrow: 'Süreç', title: 'Nasıl Çalışır?', content_json: { steps: [{ title: 'Seçin', description: 'Ürünleri sepete ekleyin.' }, { title: 'Gönderin', description: 'Talebi WhatsApp ile iletin.' }] } },
      { section_key: 'why_us', eyebrow: 'Neden Biz', title: 'Neden Davet Sandığı?', content_json: { items: [{ title: 'Özenli', description: 'Detaylı hazırlık.' }] } },
      { section_key: 'story', eyebrow: 'Hakkımızda', title: 'Hikâyemiz', body: 'Test hikâye metni.', media_assets: media('story/s.webp', 'Atölye görseli', 1200, 800) },
      { section_key: 'cta', eyebrow: 'İletişim', title: 'Birlikte tasarlayalım', body: 'Bize yazın.', button_text: 'Yazın', media_assets: media('campaigns/c.webp', 'CTA görseli', 1200, 800) }
    ]),
    faqs: [
      { id: 1, question: 'Siteden tahsilat yapılıyor mu?', answer: 'Sitede çevrimiçi ödeme alınmaz. Sipariş talebi WhatsApp görüşmesinde karşılıklı onaylandıktan sonra kesinleşir.', sort_order: 1 },
      { id: 2, question: 'Kargo ücreti ne kadar?', answer: 'Kargo ücreti sipariş sırasında belirtilir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.', sort_order: 2 },
      { id: 3, question: 'Teslimat süresi ne kadardır?', answer: 'Tasarım onayının ardından ortalama 5–7 iş günü içinde hazırlayıp kargoya veriyoruz.', sort_order: 3 },
      { id: 4, question: 'Minimum sipariş adedi nedir?', answer: 'Ürünlerimiz minimum 25 adet ve 25’er artışlarla sipariş edilebilir. Adet seçimini sepet üzerinden yapabilirsiniz.', sort_order: 4 },
      { id: 5, question: 'Pasif soru', answer: 'x', sort_order: 5, is_active: false }
    ].map(row => ({ is_active: true, ...row })),
    testimonials: [
      { id: 1, customer_display_name: 'A. Y.', event_name: 'Nişan', review_text: 'Çok memnun kaldık.', rating: 4, sort_order: 1, is_published: true, consent_confirmed: true, media_assets: media('testimonials/1/t.webp', 'Müşteri fotoğrafı', 600, 800) },
      ...['Elif & Burak', 'Zeynep Y.', 'Merve & Can', 'Ayşe & Mert', 'Selin & Kaan', 'Deniz & Ece'].map((customer_display_name, index) => ({ id: index + 2, customer_display_name, event_name: 'Örnek', review_text: 'Örnek yorum.', rating: 5, sort_order: index + 2, is_published: true, consent_confirmed: true, media_assets: null }))
    ]
  };
}

function applyFilters(rows, params) {
  let result = rows;
  for (const [key, value] of params) {
    if (['select', 'order', 'limit'].includes(key)) continue;
    if (value === 'is.null') result = result.filter(row => row[key] == null);
    else if (value.startsWith('eq.')) result = result.filter(row => String(row[key]) === value.slice(3));
  }
  return result;
}


/* Yapı sırasında çalışan kodun ta kendisiyle sayfayı üretir. Böylece testler
   üretilen gerçek HTML üzerinde çalışır ve şablon değişikliği testten kaçamaz. */
function generatePage(db, pathname) {
  const data = {
    settings: (db.site_settings_public || [])[0] || {},
    collections: (db.collections || []).filter(row => row.is_active !== false && !row.archived_at),
    categories: (db.categories || []).filter(row => row.is_active !== false && !row.archived_at),
    products: normalizeProducts((db.products || []).filter(row => row.is_active !== false && !row.archived_at)),
    banners: db.banners || [],
    faqs: db.faqs || [],
    sections: {}
  };
  let built;
  try { built = buildPages(data, ORIGIN); } catch { return null; }
  const page = built.pages.find(item => item.path === pathname);
  if (!page) return null;
  const shell = injectHome(readFileSync(new URL('../../index.html', import.meta.url), 'utf8'), buildHomeBlocks(data, built.siteLinks));
  return derivePage(shell, page, data.settings);
}

async function setup(page, { db = makeDb(), fail = {}, delay = {}, cart = null, wish = null, csp = '' } = {}) {
  const log = { requests: [], rest: [], consoleErrors: [], pageErrors: [], db, fail, delay };
  page.on('request', request => log.requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') log.consoleErrors.push(message.text()); });
  page.on('pageerror', error => log.pageErrors.push(String(error)));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (csp && url.host === LOCAL_HOST && url.pathname === '/index.html') {
      return route.fetch().then(response => {
        const headers = Object.assign({}, response.headers(), { 'content-security-policy': csp });
        return route.fulfill({ response, headers });
      });
    }
    /* Üretilen sayfalar gerçek veriyle yapıldığı için testte diskte olmayabilir.
       Sahte veriyle, yapının kendi kodundan üretip sunuyoruz: test gerçek
       çıktıyı sınamış oluyor, elle yazılmış bir taklidi değil. */
    if (url.host === LOCAL_HOST && /^\/(?:[a-z0-9-]+-hediyelikleri|[a-z0-9-]+)\/$/.test(url.pathname) && url.pathname !== '/') {
      const generated = generatePage(log.db, url.pathname);
      if (generated) return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: generated });
    }
    if (url.host === LOCAL_HOST) return route.continue();
    return route.abort();
  });
  await page.route('**/favicon.ico', route => route.fulfill({ status: 204, body: '' }));
  await page.route('**/assets/js/supabase-config.generated.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.__DAVET_SANDIGI_ENV__=Object.freeze({SUPABASE_URL:'${ORIGIN}',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_testkey'});` }));
  await page.route(`${ORIGIN}/storage/v1/object/public/**`, route => route.fulfill({ status: 200, contentType: 'image/png', headers: CORS, body: PNG }));
  /* Gorsel donusturme bu projede kapali ve gercekte 403 donuyor. Mock onu 200
     gosterdigi icin bozuk srcset testlerden kacmisti; gercegi taklit ediyoruz. */
  await page.route(`${ORIGIN}/storage/v1/render/image/public/**`, route => route.fulfill({ status: 403, contentType: 'application/json', headers: CORS, body: '{"error":"FeatureNotEnabled"}' }));
  await page.route(`${ORIGIN}/rest/v1/**`, async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS, body: '' });
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();
    log.rest.push({ table, method: request.method(), params: Object.fromEntries(url.searchParams), headers: request.headers() });
    if (log.delay[table]) await new Promise(resolve => setTimeout(resolve, log.delay[table]));
    if (log.fail[table]) return route.fulfill({ status: 500, contentType: 'application/json', headers: CORS, body: '{"message":"boom"}' });
    return route.fulfill({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(applyFilters(log.db[table] || [], url.searchParams)) });
  });
  if (cart || wish) {
    await page.addInitScript(([storedCart, storedWish]) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      if (storedCart) localStorage.setItem('ds_cart_v6', JSON.stringify(storedCart));
      if (storedWish) localStorage.setItem('ds_wish_v1', JSON.stringify(storedWish));
    }, [cart, wish]);
  }
  return log;
}

const state = (page, id) => page.locator(`#${id}`);
async function waitReady(page) {
  await expect(state(page, 'urunler')).toHaveAttribute('data-state', 'ready');
  await expect(state(page, 'sss')).toHaveAttribute('data-state', /^(ready|empty)$/);
}

test('aktif ürün görünür; pasif/arşivli ürün liste, arama, doğrudan bağlantı ve sepette yok', async ({ page }) => {
  const log = await setup(page, { cart: [{ id: '1', qty: 25 }, { id: '3', qty: 25 }, { id: '4', qty: 25 }, { id: 'p7', qty: 25 }], wish: ['3', '2'] });
  await page.goto('/index.html');
  await waitReady(page);

  await expect(page.locator('#prod-grid .prod-card')).toHaveCount(1);
  await expect(page.locator('#prod-grid')).toContainText('Kolonya Ürünü');
  await page.locator('#filterbar button', { hasText: 'Tümü' }).click();
  await expect(page.locator('#prod-grid .prod-card')).toHaveCount(2);
  for (const hidden of ['Pasif Ürün', 'Arşiv Ürünü', 'Tutarsız Arşiv']) await expect(page.locator('#prod-grid')).not.toContainText(hidden);

  await page.click('#open-search');
  await page.fill('#search-input', 'pasif');
  await expect(page.locator('#search-hint')).toContainText('için sonuç bulunamadı');
  await page.fill('#search-input', 'arşiv');
  await expect(page.locator('#search-grid .prod-card')).toHaveCount(0);
  await page.fill('#search-input', 'kolonya');
  await expect(page.locator('#search-grid .prod-card')).toHaveCount(1);
  await page.click('#search-close');

  const stored = await page.evaluate(() => ({ cart: JSON.parse(localStorage.getItem('ds_cart_v6')), wish: JSON.parse(localStorage.getItem('ds_wish_v1')) }));
  expect(stored.cart).toEqual([
    { product_id: '1', quantity: 25, note: '' },
    { product_id: '3', quantity: 25, note: '' },
    { product_id: '4', quantity: 25, note: '' },
    { product_id: 'p7', quantity: 25, note: '' }
  ]);
  expect(stored.wish).toEqual(['2']);
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText('Kolonya Ürünü');
  await expect(page.locator('#drawer-body')).toContainText('Bu ürün artık yayında değil.');
  await expect(page.locator('#drawer-body')).toContainText('Toplama dahil edilmedi.');
  await expect(page.locator('#drawer-body')).not.toContainText('Pasif Ürün');
  await expect(page.locator('#cart-ship')).toHaveText('Kargo bilgisi panelde yönetilir.');
  await expect(page.locator('#cart-ship')).not.toContainText('Ücretsiz');
  expect(log.pageErrors).toEqual([]);

  await page.goto('/index.html?urun=pasif-urun');
  await expect(state(page, 'urunler')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('#toast')).toContainText('yayında değil');
  await expect(page.locator('#product-modal')).not.toHaveClass(/open/);
  await page.goto('/index.html?urun=arsiv-urun');
  await expect(page.locator('#toast')).toContainText('yayında değil');
  await expect(page.locator('#product-modal')).not.toHaveClass(/open/);
  await page.goto('/index.html?urun=kolonya-urun');
  await expect(page.locator('#product-modal')).toHaveClass(/open/);
  await expect(page.locator('#pm-name')).toHaveText('Kolonya Ürünü');
});

test('analitik gönderimi başarısız olsa bile sepete ekleme çalışır', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await page.evaluate(() => { window.dsAnalytics.track = () => false; });
  await page.locator('[data-add="1"]').first().click();
  await expect(page.locator('#cart-count')).toHaveText('25');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ds_cart_v6')))).toEqual([{ product_id: '1', quantity: 25, note: '' }]);
});

test('katalog hata durumunda sepet silinmez ve fiyat hata metni görünür; tekrar dene toparlar', async ({ page }) => {
  const log = await setup(page, { fail: { products: true }, cart: [{ id: '1', qty: 25 }] });
  await page.goto('/index.html');
  await expect(state(page, 'urunler')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#prod-grid')).toContainText('Ürünler şu an yüklenemedi.');
  await expect(state(page, 'koleksiyonlar')).toHaveAttribute('data-state', 'error');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ds_cart_v6')))).toEqual([{ product_id: '1', quantity: 25, note: '' }]);

  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText(PRICE_ERROR);
  await expect(page.locator('#cart-subtotal')).toHaveText(PRICE_ERROR);
  await expect(page.locator('#cart-total')).toHaveText(PRICE_ERROR);
  await expect(page.locator('#cart-ship')).toHaveText('—');
  await page.click('#drawer-close');

  log.fail.products = false;
  await page.locator('#prod-grid [data-retry]').click();
  await expect(state(page, 'urunler')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('#prod-grid')).toContainText('Kolonya Ürünü');
  expect((await page.evaluate(() => JSON.parse(localStorage.getItem('ds_cart_v6')))).map(item => item.product_id)).toEqual(['1']);
  expect(log.pageErrors).toEqual([]);
});

test('fiyat modları: geçersiz fiyat hata metni, teklif ve gizli fiyat', async ({ page }) => {
  const extra = [
    { id: 6, category_id: 1, slug: 'fiyatsiz', sku: 'S6', name: 'Fiyatsız Ürün', price: null, is_price_visible: true, is_quote_only: false, is_featured: true, sort_order: 6, is_active: true, archived_at: null, product_images: [{ alt_text: 'a', sort_order: 0, is_primary: true, media_assets: media('products/6/a.webp', 'a') }], product_collections: [] },
    { id: 7, category_id: 1, slug: 'teklif', sku: 'S7', name: 'Teklif Ürünü', price: 99, is_price_visible: true, is_quote_only: true, is_featured: true, sort_order: 7, is_active: true, archived_at: null, product_images: [{ alt_text: 'a', sort_order: 0, is_primary: true, media_assets: media('products/7/a.webp', 'a') }], product_collections: [] },
    { id: 8, category_id: 1, slug: 'gizli-fiyat', sku: 'S8', name: 'Gizli Fiyatlı Ürün', price: 12, is_price_visible: false, is_quote_only: false, is_featured: true, sort_order: 8, is_active: true, archived_at: null, product_images: [{ alt_text: 'a', sort_order: 0, is_primary: true, media_assets: media('products/8/a.webp', 'a') }], product_collections: [] }
  ];
  await setup(page, { db: makeDb(extra), cart: [{ id: '6', qty: 25 }] });
  await page.goto('/index.html');
  await waitReady(page);
  const price = name => page.locator('#prod-grid .prod-card', { hasText: name }).locator('.prod-price');
  await expect(price('Fiyatsız Ürün')).toHaveText(PRICE_ERROR);
  await expect(price('Teklif Ürünü')).toHaveText('Özel fiyat teklifi');
  await expect(price('Gizli Fiyatlı Ürün')).toHaveText('Fiyat için iletişime geçin');
  await expect(price('Kolonya Ürünü')).toHaveText('₺54,90');
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText(PRICE_ERROR);
  await expect(page.locator('#cart-total')).toHaveText(PRICE_ERROR);
  await page.locator('#prod-grid .prod-card', { hasText: 'Fiyatsız Ürün' }).locator('.prod-price').scrollIntoViewIfNeeded();
});

test('kategori ve koleksiyon filtreleri', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await expect(page.locator('#filterbar button')).toHaveText(['Öne Çıkanlar', 'Tümü', 'Kolonya', 'Mum']);
  await page.locator('#filterbar button', { hasText: 'Mum' }).click();
  await expect(page.locator('#prod-grid .prod-card')).toHaveCount(1);
  await expect(page.locator('#prod-grid')).toContainText('Mum Ürünü');
  await page.locator('#filterbar button', { hasText: 'Kolonya' }).click();
  await expect(page.locator('#prod-grid')).toContainText('Kolonya Ürünü');
  await expect(page.locator('#prod-grid')).not.toContainText('Mum Ürünü');

  await page.locator('#cookie-reject').click();
  await expect(page.locator('#coll-grid .coll-card')).toHaveCount(2);
  await expect(page.locator('#coll-grid .coll-card', { hasText: 'Nişan' })).toHaveAccessibleName(/Nişan.*Nişan hatıraları.*Koleksiyonu Gör/i);
  /* Kartlar gerçek bağlantı olmalı: JavaScript çalıştırmayan botlar üretilen
     koleksiyon sayfalarını ana sayfadan ancak böyle bulabilir. */
  await expect(page.locator('#coll-grid .coll-card', { hasText: 'Nişan' })).toHaveAttribute('href', '/nisan-hediyelikleri/');
  await expect(page.locator('#coll-grid a.coll-card')).toHaveCount(2);
  await page.locator('#coll-grid .coll-card', { hasText: 'Nişan' }).click();
  await expect(page.locator('#collview')).toHaveClass(/open/);
  /* Kapak görseli bandın içinde kalmalı. img[srcset]{height:auto} kuralı tek
     sınıflı object-fit kurallarını eziyordu ve görsel bandın altına taşıyordu. */
  const bannerBox = await page.locator('#cv-banner').boundingBox();
  const coverBox = await page.locator('#cv-banner-image').boundingBox();
  expect(Math.round(coverBox.height), 'kapak görseli bandı taşıyor').toBe(Math.round(bannerBox.height));
  expect(Math.round(coverBox.width)).toBe(Math.round(bannerBox.width));
  await expect(page.locator('#cv-grid .cv-category-card')).toHaveCount(2);
  await page.locator('#cv-grid .cv-category-card', { hasText: 'Kolonya' }).press('Enter');
  await expect(page.locator('#cv-grid .prod-card')).toHaveCount(1);
  await expect(page.locator('#cv-grid')).toContainText('Kolonya Ürünü');
  await page.click('#cv-back');
  await page.locator('#coll-grid .coll-card', { hasText: 'Kına' }).click();
  await page.locator('#cv-grid .cv-category-card', { hasText: 'Tümünü Gör' }).press('Enter');
  await expect(page.locator('#cv-grid .prod-card')).toHaveCount(1);
  await expect(page.locator('#cv-grid')).toContainText('Mum Ürünü');
  await expect(page.locator('#footer-coll li')).toHaveCount(2);
  await expect(page.locator('#footer-coll li a').first()).toHaveAttribute('href', '/nisan-hediyelikleri/');
});

test('yükleniyor durumu', async ({ page }) => {
  await setup(page, { delay: { products: 1500, faqs: 1500, content_sections: 1500, testimonials: 1500, banners: 1500 } });
  await page.goto('/index.html');
  await expect(state(page, 'urunler')).toHaveAttribute('data-state', 'loading');
  await expect(page.locator('#prod-grid')).toContainText('Ürünler yükleniyor…');
  await expect(page.locator('#coll-grid')).toContainText('Koleksiyonlar yükleniyor…');
  await expect(state(page, 'sss')).toHaveAttribute('data-state', 'loading');
  await expect(page.locator('#faq-list')).toContainText('Sorular yükleniyor…');
  await expect(state(page, 'yorumlar')).toHaveAttribute('data-state', 'loading');
  await expect(state(page, 'hero-section')).toHaveAttribute('data-state', 'loading');
  await expect(state(page, 'hikayemiz')).toHaveAttribute('data-state', 'loading');
  await waitReady(page);
  await expect(state(page, 'hero-section')).toHaveAttribute('data-state', 'ready');
});

test('boş durum: yayında içerik yok', async ({ page }) => {
  const empty = Object.fromEntries(Object.keys(makeDb()).map(table => [table, []]));
  const log = await setup(page, { db: empty });
  await page.goto('/index.html');
  await expect(state(page, 'urunler')).toHaveAttribute('data-state', 'empty');
  await expect(page.locator('#prod-grid')).toContainText('Şu anda yayında ürün bulunmuyor.');
  await expect(page.locator('#coll-grid')).toContainText('Şu anda yayında koleksiyon bulunmuyor.');
  await expect(state(page, 'koleksiyonlar')).toHaveAttribute('data-state', 'empty');
  await expect(page.locator('#faq-list')).toContainText('Şu anda yayımlanmış soru bulunmuyor.');
  await expect(page.locator('#review-grid')).toContainText('Henüz yayınlanmış yorum bulunmuyor.');
  await expect(page.locator('#story-text')).toHaveText('Henüz yayımlanmış içerik bulunmuyor.');
  await expect(page.locator('#hakkimizda .steps')).toContainText('Henüz yayımlanmış süreç bilgisi bulunmuyor.');
  await expect(state(page, 'neden-biz')).toHaveAttribute('data-state', 'empty');
  await expect(state(page, 'hero-section')).toHaveAttribute('data-state', 'empty');
  await expect(page.locator('#hero-title')).toHaveText('Davet Sandığı');
  await expect(state(page, 'topbar')).toHaveAttribute('data-state', 'empty');
  await expect(page.locator('#hdr-wa')).toBeHidden();
  await expect(page.locator('#prod-more')).toBeHidden();
  expect(log.consoleErrors).toEqual([]);
  expect(log.pageErrors).toEqual([]);
});

test('hata durumu: tüm sorgular başarısız, uydurma iletişim bilgisi yok', async ({ page }) => {
  const tables = Object.keys(makeDb());
  const log = await setup(page, { fail: Object.fromEntries(tables.map(table => [table, true])) });
  await page.goto('/index.html');
  for (const id of ['urunler', 'koleksiyonlar', 'sss', 'yorumlar', 'hikayemiz', 'hakkimizda', 'neden-biz', 'hero-section', 'topbar']) {
    await expect(state(page, id), id).toHaveAttribute('data-state', 'error');
  }
  await expect(page.locator('#faq-list')).toContainText('Sorular şu an yüklenemedi.');
  await expect(page.locator('#review-grid')).toContainText('Yorumlar şu an yüklenemedi.');
  await expect(page.locator('#hero-title')).toHaveText('Davet Sandığı');
  for (const id of ['hdr-wa', 'cta-wa', 'ft-wa', 'story-wa', 'ft-ig']) await expect(page.locator(`#${id}`), id).toBeHidden();
  for (const id of ['ft-phone', 'ft-mail', 'ft-addr']) await expect(page.locator(`#${id}`), id).toHaveText('');
  await expect(page.locator('body')).not.toContainText('0500 000');
  await expect(page.locator('body')).not.toContainText('500+');
  expect(log.pageErrors).toEqual([]);
});

test('görsellerde alt/width/height; yalnızca hero eager ve fetchpriority high; konsol hatası yok', async ({ page }) => {
  const log = await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await expect(page.locator('#hero-title')).toHaveText('Canlı Banner');
  await expect(page.locator('#hero-cta')).not.toContainText('Süresi');
  await expect(page.locator('body')).not.toContainText('Gelecek Banner');
  await page.locator('#prod-grid .prod-card').first().click();
  await expect(page.locator('#product-modal')).toHaveClass(/open/);
  await page.locator('#pm-thumbs .pm-thumb').nth(1).click();

  const images = await page.evaluate(() => Array.from(document.images).map(img => ({
    id: img.id, cls: img.closest('[class]')?.className || '', src: img.getAttribute('src') || '', alt: img.getAttribute('alt'),
    srcset: img.getAttribute('srcset'), sizes: img.getAttribute('sizes'), width: img.getAttribute('width'), height: img.getAttribute('height'), loading: img.getAttribute('loading'), priority: img.getAttribute('fetchpriority')
  })));
  const hero = images.find(image => image.id === 'hero-img');
  expect(hero).toMatchObject({ loading: 'eager', priority: 'high', width: '1600', height: '700', alt: 'Hero görseli' });
  expect(hero.src).toContain(`${ORIGIN}/storage/v1/object/public/site-media/banners/1/h.webp`);
  /* Gorsel donusturme bu projede kapali; o adresler srcset'e girerse tarayici
     onlardan birini secip gorseli hic yukleyemiyor. Nitelik ya hic olmamali ya
     da donusturme adresi icermemeli. */
  expect(hero.srcset || '', 'calismayan donusturme adresi srcset\'e girmemeli').not.toContain('render/image');
  const others = images.filter(image => image.id !== 'hero-img' && image.src);
  expect(others.length).toBeGreaterThan(6);
  for (const image of others) {
    expect(image.srcset || '', image.src).not.toContain('render/image');
    expect(image.loading, image.src).toBe('lazy');
    expect(image.priority, image.src).toBeNull();
    expect(image.alt && image.alt.trim(), image.src).toBeTruthy();
    expect(Number(image.width), image.src).toBeGreaterThan(0);
    expect(Number(image.height), image.src).toBeGreaterThan(0);
  }
  const bySrc = part => others.find(image => image.src.includes(part));
  expect(bySrc('products/1/a.webp')).toMatchObject({ alt: 'Kolonya ana görsel', width: '800', height: '1000' });
  expect(bySrc('products/1/a.webp').srcset || '').not.toContain('data:image');
  expect(bySrc('products/1/a.webp').src).not.toContain('data:image');
  expect(bySrc('products/1/a.webp').src).toContain('/storage/v1/object/public/site-media/products/1/a.webp');
  await page.locator('#prod-grid .prod-card').first().scrollIntoViewIfNeeded();
  /* Urun gorselleri de depodaki dosyadan gelmeli; donusturme adresi kapali. */
  await expect(page.locator('#prod-grid .prod-card img').first()).toHaveAttribute('src', /\/storage\/v1\/object\/public\/site-media\//);
  expect(bySrc('collections/1/c.webp')).toMatchObject({ alt: 'Nişan koleksiyonu kapağı', width: '640', height: '640' });
  expect(bySrc('story/s.webp')).toMatchObject({ alt: 'Atölye görseli', width: '1200', height: '800' });
  expect(bySrc('campaigns/c.webp')).toMatchObject({ alt: 'CTA görseli' });
  expect(bySrc('testimonials/1/t.webp')).toMatchObject({ alt: 'Müşteri fotoğrafı' });
  expect(await page.locator('#pm-main').getAttribute('alt')).toBe('Kolonya detay görseli');
  expect(log.consoleErrors).toEqual([]);
  expect(log.pageErrors).toEqual([]);
});

test('ağ: yalnızca doğru Supabase projesi, yalnızca açık sütunlu GET sorguları, gizli anahtar yok', async ({ page }) => {
  const log = await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  const hosts = new Set(log.requests.filter(url => /^https?:/.test(url)).map(url => new URL(url).host));
  expect([...hosts].sort()).toEqual([LOCAL_HOST, PROJECT_HOST].sort());
  expect(log.requests.some(url => !url.includes(LOCAL_HOST) && /firebase|firestore|gstatic|jsdelivr|googleapis/i.test(url))).toBe(false);
  expect(log.requests.some(url => url.includes(LOCAL_HOST) && /firestore|firebasejs/i.test(url))).toBe(false);

  const tables = new Set(log.rest.map(entry => entry.table));
  expect([...tables].sort()).toEqual(['banners', 'categories', 'collections', 'content_sections', 'faqs', 'products', 'site_settings_public', 'testimonials']);
  for (const entry of log.rest) {
    expect(entry.method).toBe('GET');
    expect(entry.params.select, entry.table).toBeTruthy();
    expect(entry.params.select, entry.table).not.toContain('*');
    expect(entry.headers.apikey, entry.table).toBe('sb_publishable_testkey');
    expect(JSON.stringify(entry.headers)).not.toMatch(/service_role|sb_secret_/i);
  }
  const query = table => log.rest.find(entry => entry.table === table).params;
  expect(query('products')).toMatchObject({ is_active: 'eq.true', archived_at: 'is.null' });
  expect(query('products').select).toContain('product_images(alt_text,sort_order,is_primary,media_assets(storage_path,alt_text,width,height))');
  expect(query('categories')).toMatchObject({ is_active: 'eq.true', archived_at: 'is.null' });
  expect(query('collections').select).toContain('media_assets!cover_media_id(storage_path,alt_text,width,height)');
  expect(query('testimonials')).toMatchObject({ is_published: 'eq.true', consent_confirmed: 'eq.true' });
  expect(query('site_settings_public').select).not.toMatch(/archived|updated_by/);

  const files = ['index.html', 'assets/js/catalog.js', 'assets/js/site.js', 'assets/js/cart.js', 'assets/js/whatsapp.js', 'assets/js/config.js', 'assets/js/supabase-client.js'];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    expect(source, file).not.toMatch(/service_role|sb_secret_|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\./);
    expect(source, file).not.toMatch(/select\(\s*['"]\*['"]/);
  }
});

test('Faz 13: dahili bağlantılar ve yayımlanan görseller eksiksiz', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  const brokenLinks = await page.evaluate(async () => {
    const results = await Promise.all(Array.from(document.querySelectorAll('a[href]'), async anchor => {
      const href = anchor.getAttribute('href') || '';
      if (!href || href === '#' || /^(https?:|mailto:|tel:)/i.test(href)) return null;
      if (href.startsWith('#')) {
        const target = decodeURIComponent(href.slice(1)).split(/[/?=]/, 1)[0];
        return target && !document.getElementById(target) ? href : null;
      }
      const target = new URL(href, location.href);
      if (target.origin !== location.origin) return null;
      try { return (await fetch(target.pathname + target.search, { method: 'HEAD' })).ok ? null : href; }
      catch { return href; }
    }));
    return results.filter(Boolean);
  });
  expect(brokenLinks).toEqual([]);

  const brokenImages = await page.evaluate(async () => {
    const images = Array.from(document.images).filter(image => !!image.getAttribute('src'));
    images.forEach(image => { image.loading = 'eager'; });
    await Promise.all(images.map(image => image.decode().catch(() => null)));
    return images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.currentSrc || image.src);
  });
  expect(brokenImages).toEqual([]);
});

test('Faz 15: yasal footer modalı yalnız onaylı content_sections metnini gösterir', async ({ page }) => {
  const db=makeDb();
  db.content_sections.push({section_key:'legal_privacy',title:'Gizlilik Politikası',body:'Hukuk danışmanı onayı bekliyor. [TAMAMLANACAK]',content_json:{legal_document:true,legal_review_approved:false,legal_status:'draft'},is_active:true});
  const log=await setup(page,{db});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/index.html');
  await waitReady(page);
  const footerLegal=page.locator('.footer-legal [data-legal]');
  await expect(footerLegal).toHaveCount(8);
  await expect(footerLegal.first()).toHaveAttribute('role','button');
  await expect.poll(() => page.evaluate(() => catalogState.sections)).toBe('ready');
  const publicText=await page.locator('body').innerText();
  expect(publicText).not.toMatch(/örnek|taslak|Hukuk danışmanı onayı bekliyor|\[TAMAMLANACAK\]/i);
  await page.locator('[data-legal="privacy"]').click();
  await expect(page.locator('#legal-modal')).toHaveAttribute('aria-modal','true');
  await expect(page.locator('#legal-body')).toHaveText('Bu metin henüz onaylanıp yayımlanmamıştır.');
  await expect(page.locator('#legal-body')).not.toContainText(/Hukuk danışmanı onayı bekliyor|\[TAMAMLANACAK\]/i);
  await page.locator('#legal-close').click();
  await expect(page.locator('[data-legal="privacy"]')).toBeFocused();

  const legalSection=log.db.content_sections.find(section=>section.section_key==='legal_privacy');
  legalSection.body='Veri sorumlusu: RIDVAN YAZICI.';
  legalSection.content_json.legal_review_approved=true;
  legalSection.content_json.legal_status='lawyer_approved';
  await page.reload();
  await waitReady(page);
  await expect.poll(() => page.evaluate(() => catalogState.sections)).toBe('ready');
  await page.locator('[data-legal="privacy"]').click();
  await expect(page.locator('#legal-title')).toHaveText('Gizlilik Politikası');
  await expect(page.locator('#legal-body')).toHaveText('Veri sorumlusu: RIDVAN YAZICI.');
  await expect(page.locator('#legal-body')).not.toContainText(/taslak|onay bekliyor|tamamlanacak/i);
  const dimensions=await page.evaluate(()=>({body:document.body.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport+1);
});

test('Faz 10: Instagram ana kanal, WhatsApp sipariş talebi; telefon ve e-posta tıklanabilir', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await expect.poll(() => page.evaluate(() => catalogState.settings)).toBe('ready');
  expect(await page.evaluate(() => [settings.minQty, settings.stepQty, settings.quoteThreshold])).toEqual([25, 25, 100]);
  await page.click('#cookie-reject');

  await expect(page.locator('#hdr-ig')).toHaveAttribute('href', 'https://www.instagram.com/brand-channel-check');
  await expect(page.locator('#ft-ig')).toHaveAttribute('href', 'https://www.instagram.com/brand-channel-check');
  await expect(page.locator('#channel-ig')).toHaveAttribute('href', 'https://www.instagram.com/brand-channel-check');
  await expect(page.locator('#social-commerce')).toContainText('Instagram ana satış ve marka iletişim kanalıdır.');
  await expect(page.locator('#social-commerce')).toContainText('Sipariş talebi WhatsApp üzerinden iletilir.');
  await expect(page.locator('#hdr-wa')).toContainText('WhatsApp’ta Sipariş Talebi');
  await expect(page.locator('#channel-wa')).toContainText('WhatsApp’ta Sipariş Talebi Oluştur');
  await expect(page.locator('#topbar-list')).toContainText('Kişiye özel üretim');
  await expect(page.locator('#hdr-wa')).toHaveAttribute('href', /^https:\/\/wa\.me\/905301112233\?/);
  await expect(page.locator('#ft-phone')).toHaveAttribute('href', 'tel:+902120000000');
  await expect(page.locator('#ft-mail')).toHaveAttribute('href', 'mailto:info@example.test');

  await page.locator('[data-add="1"]').first().click();
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body .stepper')).toContainText('25');
  await expect(page.locator('#cart-rule-note')).toContainText('Teslimat bilgisi panelde yönetilir.');
  await expect(page.locator('#cart-rule-note')).toContainText('Kargo bilgisi panelde yönetilir.');
  await expect(page.locator('#drawer-body')).toContainText('Kolonya Ürünü');
  await page.evaluate(() => { addToCart('1'); addToCart('1'); addToCart('1'); });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ds_cart_v6'))[0].quantity)).toBe(100);
  await expect(page.locator('#cart-total')).toHaveText('Özel fiyat teklifi');
  await expect(page.locator('#faq-list')).toContainText('Kargo bilgisi panelde yönetilir.');
  await expect(page.locator('#faq-list')).toContainText('Teslimat bilgisi panelde yönetilir.');
  await expect(page.locator('#faq-list')).toContainText('Minimum adet ve artış kuralı ürün detayında belirtilir.');
  await expect(page.locator('#faq-list')).toContainText('Sitede çevrimiçi ödeme alınmaz.');
  await expect(page.locator('#faq-list')).not.toContainText('150 TL');
  await expect(page.locator('#faq-list')).not.toContainText('5–7 iş günü');
  await expect(page.locator('#faq-list')).not.toContainText('25’er artış');
  await expect(page.locator('#review-grid')).toContainText('A. Y.');
  await expect(page.locator('#review-grid')).not.toContainText('Elif & Burak');
  await expect(page.locator('#review-grid')).not.toContainText('Zeynep Y.');
  await expect(page.locator('.footer-about')).toHaveText('Nişan, kına, Baby Shower ve düğün koleksiyonlarını inceleyebilirsiniz.');
  await page.click('#drawer-close');
  await page.click('[data-legal="privacy"]');
  await expect(page.locator('#legal-body')).toHaveText('Bu metin henüz onaylanıp yayımlanmamıştır.');
});

/* Bu test eskiden bu iletişim değerlerinin GİZLENMESİNİ doğruluyordu: Faz 10'da
   bunlar doğrulanmamış demo bilgi sayılıyordu. Aradan geçen sürede aynı
   değerler işletmenin gerçek bilgileri oldu ve panele önizleme onayıyla
   kaydedildi. Değer bazlı eleme kaldırıldı; kural artık şu: panele kaydedilen
   her geçerli bilgi vitrinde görünür. */
test('Faz 10: yönetimden onaylanan içerik ve iletişim bilgileri vitrinde görünür', async ({ page }) => {
  const db = makeDb();
  db.banners = [{ id: 9, is_active: true, title: 'Kişiye özel tasarım', description: 'El emeği ve özenle seçilen kaliteli malzemeler.', sort_order: 1, starts_at: null, ends_at: null, media_assets: media('banners/9/new.webp', 'Yeni banner') }];
  db.content_sections = [
    { section_key: 'topbar', is_active: true, content_json: { items: ['El emeği', 'Kişiye özel üretim', 'Kaliteli malzeme'] } },
    { section_key: 'process', is_active: true, title: 'Süreç', content_json: { steps: [{ title: 'Zamanında Teslim', description: 'Belirtilen tarihte teslim.' }] } },
    { section_key: 'why_us', is_active: true, title: 'Neden biz?', content_json: { items: [{ title: 'Kaliteli malzeme', description: 'Özenle seçildi.' }, { title: 'Kişiye özel tasarım', description: 'Size özel üretim.' }] } },
    { section_key: 'story', is_active: true, title: 'Hikâyemiz', body: 'Davet Sandığı kişiye özel tasarımlar sunar.' },
    { section_key: 'cta', is_active: true, title: 'Birlikte tasarlayalım', body: 'Kişiye özel tasarım için bize yazın.' },
    { section_key: 'campaign', is_active: true, title: 'Yeni koleksiyon', body: 'El emeği ürünleri keşfedin.' }
  ];
  db.site_settings_public[0] = {
    id: 1, whatsapp_number: '905399413902', instagram_url: 'https://www.instagram.com/davetsandigi?utm_source=legacy',
    phone: '+90 539 941 39 02', email: 'info@davetsandigi.com', delivery_text: "Türkiye'nin her yerine teslimat",
    currency_code: 'TRY', default_min_quantity: 25, default_quantity_step: 25, quote_threshold: 100, shipping_note: ''
  };
  db.faqs = [{ id: 1, question: 'Teslimat süresi ne kadardır?', answer: 'Tasarım onayının ardından ortalama 5–7 iş günü içinde hazırlayıp kargoya veriyoruz.', sort_order: 1, is_active: true }];
  await setup(page, { db });
  await page.goto('/index.html');
  await waitReady(page);

  for (const id of ['hdr-ig', 'ft-ig', 'channel-ig', 'hdr-wa', 'ft-wa', 'channel-wa']) await expect(page.locator(`#${id}`), id).toBeVisible();
  await expect(page.locator('#ft-phone')).toHaveText('+90 539 941 39 02');
  await expect(page.locator('#ft-mail')).toHaveText('info@davetsandigi.com');
  await expect(page.locator('#hero-title')).toHaveText('Kişiye özel tasarım');
  await expect(page.locator('#hero-img')).toBeVisible();
  await expect(page.locator('#topbar-list')).toContainText('El emeği');
  await expect(page.locator('#topbar-list')).toContainText('Kişiye özel üretim');
  await expect(page.locator('#topbar-list')).toContainText('Kaliteli malzeme');
  await expect(page.locator('#hakkimizda .steps')).toContainText('Zamanında Teslim');
  await expect(page.locator('#neden-biz .why-grid')).toContainText('Kaliteli malzeme');
  await expect(page.locator('#neden-biz .why-grid')).toContainText('Kişiye özel tasarım');
  await expect(page.locator('#story-text')).toContainText('kişiye özel tasarımlar');
  await expect(page.locator('#ctahead-t')).toHaveText('Birlikte tasarlayalım');
  await expect(page.locator('#campaign-modal')).toHaveClass(/open/);
  await expect(page.locator('#cart-rule-note')).toContainText("Türkiye'nin her yerine teslimat");
  /* Demo S.S.S. cevabı hâlâ eleniyor, ama yerine panelden gelen gerçek teslimat
     metni konuyor: ayar dolu olduğu için soru artık yayımlanıyor. */
  await expect(page.locator('#faq-list')).toContainText('Teslimat süresi ne kadardır?');
  await expect(page.locator('#faq-list')).toContainText("Türkiye'nin her yerine teslimat");
  await expect(page.locator('#review-grid')).toContainText('A. Y.');
  await expect(page.locator('#review-grid')).not.toContainText('Elif & Burak');
  await expect(page.locator('#review-grid')).not.toContainText('Ayşe & Mert');
  /* Bu üç satır eskiden bu değerlerin sayfada GÖRÜNMEMESİNİ doğruluyordu; aynı
     gerekçeyle kaldırıldı: panele kaydedilen gerçek bilgi artık vitrinde görünür.
     Yerine WhatsApp bağlantısının gerçekten kurulduğunu doğruluyoruz. */
  await expect(page.locator('#channel-wa')).toHaveAttribute('href', /wa\.me\/905399413902/);
  await page.click('#camp-close');
  await page.click('[data-legal="privacy"]');
  await expect(page.locator('#legal-body')).toHaveText('Bu metin henüz onaylanıp yayımlanmamıştır.');
});

test('Faz 10: mobilde Instagram/WhatsApp ve tutarlı kapsam metinleri taşmaz', async ({ page }) => {
  await setup(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  await waitReady(page);
  await page.click('#cookie-reject');
  await expect(page.locator('#channel-ig')).toBeVisible();
  await expect(page.locator('#channel-wa')).toBeVisible();
  await expect(page.locator('.footer-about')).toContainText('Baby Shower ve düğün koleksiyonlarını');
  const sizes = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport + 1);
});

test('Faz 11: category slug route, dynamic canonical and priced Product JSON-LD', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html?kategori=mum');
  await waitReady(page);
  await expect(page.locator('#prod-grid')).toContainText('Mum Ürünü');
  await expect(page.locator('#filterbar button.active')).toHaveText('Mum');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalOrigin + '/mum/');

  await page.goto('/index.html?urun=kolonya-urun');
  await expect(page.locator('#product-modal')).toHaveClass(/open/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalOrigin + '/urun/kolonya-urun/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Açıklama/);
  const schema = await page.locator('#product-schema').evaluate(node => JSON.parse(node.textContent));
  expect(schema['@type']).toBe('Product');
  expect(schema.offers.price).toBe('54.90');
  await page.goto('/index.html?urun=pasif-urun');
  await expect(page.locator('#product-schema')).toHaveCount(0);
});

test('Faz 11: directory taxonomy category route query selects active slug', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html?kategori=mum');
  await waitReady(page);
  await expect(page.locator('#prod-grid')).toContainText('Mum Ürünü');
  await expect(page.locator('#prod-grid')).not.toContainText('Kolonya Ürünü');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalOrigin + '/mum/');
});

test('Faz 11: SEO metadata, one H1, Organization schema and favicon resources', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await expect(page).toHaveTitle('Davet Sandığı | Ürünler ve Koleksiyonlar');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /sipariş talebinizi WhatsApp/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalOrigin + '/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const organization = JSON.parse(await page.locator('#organization-schema').evaluate(node => node.textContent));
  expect(organization['@type']).toBe('Organization');
  expect(organization.areaServed).toBe('TR');
  expect(organization.contactPoint?.[0]?.['@type']).toBe('ContactPoint');
  /* Sokak adresi yayımlanmadığı için PostalAddress yalnızca il/ilçe taşır. */
  expect(organization.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Nilüfer', addressRegion: 'Bursa', addressCountry: 'TR' });
  await expect(page.locator('#ft-addr')).toHaveText('Nilüfer / Bursa');
  /* Yayındaki sorular FAQPage olarak da işaretlenmeli: yapay zekâ ve arama
     sonuçları soru-cevabı buradan okuyor. */
  const faqSchema = JSON.parse(await page.locator('#faq-schema').evaluate(node => node.textContent));
  expect(faqSchema['@type']).toBe('FAQPage');
  expect(faqSchema.mainEntity.length).toBeGreaterThan(0);
  expect(faqSchema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  await expect(page.locator('h1')).toHaveCount(1);
  for (const path of ['/robots.txt', '/sitemap.xml', '/favicon.ico', '/assets/images/brand/favicon-48.png', '/assets/images/brand/favicon-96.png', '/assets/images/brand/favicon-192.png', '/assets/images/brand/apple-touch-icon.png', '/assets/images/brand/logo.png', '/assets/images/brand/social-card.png']) {
    const response = await page.request.get(path);
    expect(response.ok(), path).toBeTruthy();
  }
});

test('Faz 11: Vercel security headers CSP policy allows Supabase and Google Fonts only where needed', async ({ page }) => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const headers = config.headers[0].headers;
  const csp = headers.find(header => header.key === 'Content-Security-Policy').value;
  expect(headers).toContainEqual({ key: 'X-Content-Type-Options', value: 'nosniff' });
  expect(headers).toContainEqual({ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' });
  expect(headers).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' });
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain(`connect-src 'self' https://${PROJECT_HOST}`);
  expect(csp).toContain(`img-src 'self' data: blob: https://${PROJECT_HOST}`);
  expect(csp).toContain('https://fonts.googleapis.com');
  expect(csp).toContain('https://fonts.gstatic.com');
  expect(csp).not.toContain('unsafe-eval');

  const log = await setup(page, { csp });
  const response = await page.goto('/index.html');
  expect(response.headers()['content-security-policy']).toBe(csp);
  await waitReady(page);
  await expect(page.locator('#prod-grid')).toContainText('Kolonya Ürünü');
  expect(log.consoleErrors.filter(message => message.includes('Refused to'))).toEqual([]);
  expect(log.pageErrors).toEqual([]);
});

test('Faz 11: keyboard dialog focus trap, Escape and opener restoration', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await page.click('#cookie-reject');

  await page.click('#open-search');
  await expect(page.locator('#searchview')).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#search-input')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#search-close')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#search-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#searchview')).not.toHaveClass(/open/);
  await expect(page.locator('#open-search')).toBeFocused();

  const productOpener = page.locator('#prod-grid .product-detail-trigger').first();
  await productOpener.click();
  await expect(page.locator('#product-modal')).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#pm-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#product-modal')).not.toHaveClass(/open/);
  await expect(productOpener).toBeFocused();

  await page.click('#open-cart');
  await expect(page.locator('#drawer')).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#drawer-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#drawer')).not.toHaveClass(/open/);
  await expect(page.locator('#open-cart')).toBeFocused();
  expect(await page.locator('h1').count()).toBe(1);
});

test('Faz 11: closed cart drawer is inert and hidden until opened', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await page.click('#cookie-reject');

  const drawer = page.locator('#drawer');
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  await expect(drawer).toHaveAttribute('inert', '');
  await page.locator('#drawer-close').focus();
  await expect(page.locator('#drawer-close')).not.toBeFocused();
  await page.locator('#open-cart').focus();
  await page.keyboard.press('Tab');
  expect(await drawer.evaluate(node => node.contains(document.activeElement))).toBe(false);

  await page.locator('#open-cart').click();
  await expect(drawer).not.toHaveAttribute('aria-hidden', 'true');
  await expect(drawer).not.toHaveAttribute('inert', '');
  await expect(page.locator('#drawer-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  await expect(drawer).toHaveAttribute('inert', '');
  await expect(page.locator('#open-cart')).toBeFocused();
});

test('Faz 9: sepet ekle/çıkar, minimum adet, artış ve saklanan veri biçimi', async ({ page }) => {
  await setup(page);
  await page.goto('/index.html');
  await waitReady(page);

  await page.locator('[data-add="1"]').first().click();
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText('25');
  await page.locator('[data-inc="1"]').click();
  await expect(page.locator('#drawer-body')).toContainText('50');
  await page.locator('[data-cart-note="1"]').fill('Altın kurdele');
  await page.locator('[data-cart-note="1"]').blur();

  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ds_cart_v6')))).toEqual([
    { product_id: '1', quantity: 50, note: 'Altın kurdele' }
  ]);
  await expect(page.locator('#cart-status')).toContainText('notu güncellendi');
  await page.locator('[data-rm="1"]').click();
  await expect(page.locator('#drawer-body')).toContainText('Sepetiniz henüz boş');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ds_cart_v6')))).toEqual([]);
});

test('Faz 9: teklif ürünü ve WhatsApp mesaj önizlemesi', async ({ page }) => {
  const quoteProduct = {
    id: 7, category_id: 1, slug: 'ozel-teklif', sku: 'TEKLIF-7', name: 'Teklif Ürünü', price: 99,
    min_quantity: 10, quantity_step: 5, is_price_visible: true, is_quote_only: true, is_featured: true,
    sort_order: 7, is_active: true, archived_at: null,
    product_images: [{ alt_text: 'Teklif ürünü', sort_order: 0, is_primary: true, media_assets: media('products/7/a.webp', 'Teklif ürünü') }],
    product_collections: []
  };
  const log = await setup(page, { db: makeDb([quoteProduct]) });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  await waitReady(page);
  await page.click('#cookie-reject');
  await page.locator('[data-add="7"]').first().click();
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText('10');
  await expect(page.locator('#cart-total')).toHaveText('Özel fiyat teklifi');

  await page.click('#checkout-btn');
  await page.fill('#c-event-date', '2026-12-20');
  await page.fill('#c-note', 'Kırmızı tema');
  await page.check('#c-kvkk');
  await page.click('#checkout-btn');
  await expect(page.locator('#order-modal')).toHaveClass(/open/);
  await expect(page.locator('#rc-wa')).toHaveText(/WhatsApp'ta Sipariş Talebi Oluştur/);
  await expect(page.locator('.receipt-disc')).toContainText('WhatsApp açılır');

  const message = await page.locator('#wa-message-preview').textContent();
  expect(message).toMatch(/^Davet Sandığı sipariş talebi\nTalep referansı: DS-\d{14}-[A-Z0-9]{1,5}\n/);
  expect(message).toContain('• Teklif Ürünü (TEKLIF-7)');
  expect(message).toContain('Adet: 10');
  expect(message).toContain('Birim fiyat: Özel fiyat teklifi');
  expect(message).toContain('Etkinlik tarihi: 2026-12-20');
  expect(message).toContain('Genel not: Kırmızı tema');
  expect(message).toContain('Kargo ve kesin fiyat WhatsApp görüşmesinde onaylanacaktır.');

  await page.evaluate(() => { window.__openedWhatsapp = ''; window.open = url => { window.__openedWhatsapp = String(url); }; });
  await page.click('#rc-wa');
  const opened = await page.evaluate(() => window.__openedWhatsapp);
  expect(opened).toMatch(/^https:\/\/wa\.me\/905301112233\?text=/);
  expect(decodeURIComponent(opened.split('?text=')[1])).toBe(message);
  expect(log.rest.every(entry => entry.method === 'GET')).toBe(true);
  expect(JSON.stringify(log.rest)).not.toContain('Kırmızı tema');
  const pageWidth = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(pageWidth.scrollWidth).toBeLessThanOrEqual(pageWidth.clientWidth);
});

test('Faz 9: pasif ürün toplamdan çıkarılır ve güncel fiyat bildirilir', async ({ page }) => {
  await setup(page, { cart: [{ product_id: '1', quantity: 25, note: '' }, { product_id: '3', quantity: 25, note: '' }] });
  await page.goto('/index.html');
  await waitReady(page);
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText('Bu ürün artık yayında değil.');
  await expect(page.locator('#cart-subtotal')).toHaveText('₺1372,50');

  await page.evaluate(() => { products.find(product => String(product.id) === '1').price = 60; syncCart(); });
  await expect(page.locator('#toast')).toContainText('Fiyat güncellendi');
  await expect(page.locator('#cart-subtotal')).toHaveText('₺1500,00');
});

test('Faz 9: localStorage yazılamazsa sepet bellekte çalışır', async ({ page }) => {
  await setup(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/index.html');
  await waitReady(page);
  await page.locator('[data-add="1"]').first().click();
  await expect(page.locator('#cart-status')).toContainText('bellekte tutulacak');
  await page.click('#open-cart');
  await expect(page.locator('#drawer-body')).toContainText('Kolonya Ürünü');
});

test('Prompt 2 public site masaüstü ve mobil görsel referansı değişmeden alınır', async ({ page }) => {
  const log = await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${width}px public`).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `${SHOT_DIR}/public-${width}.png`, animations: 'disabled' });
  }
  expect(log.consoleErrors).toEqual([]);
  expect(log.pageErrors).toEqual([]);
});

test('bakım modu açıkken vitrin kapanır, yalnız bilgilendirme ekranı görünür', async ({ page }) => {
  const db = makeDb();
  db.site_settings_public = [{ ...db.site_settings_public[0], is_maintenance_mode: true }];
  const log = await setup(page, { db });
  await page.goto('/index.html');
  await expect(page.locator('#maintenance')).toBeVisible();
  await expect(page.locator('#maint-title')).toHaveText('Kısa bir ara veriyoruz');
  await expect(page.locator('.topbar')).toBeHidden();
  await expect(page.locator('header.header')).toBeHidden();
  await expect(page.locator('main')).toBeHidden();
  await expect(page.locator('footer.footer')).toBeHidden();
  await expect(page.locator('#maint-ig')).toBeVisible();
  await expect(page.locator('#maint-wa')).toBeVisible();
  await expect(page.locator('#maint-wa')).toHaveAttribute('href', /^https:\/\/wa\.me\/905301112233\?text=/);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(log.consoleErrors).toEqual([]);
  expect(log.pageErrors).toEqual([]);
});

test('bakım modu kapalıyken vitrin normal açılır', async ({ page }) => {
  const log = await setup(page);
  await page.goto('/index.html');
  await waitReady(page);
  await expect(page.locator('#maintenance')).toBeHidden();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('header.header')).toBeVisible();
  expect(log.consoleErrors).toEqual([]);
  expect(log.pageErrors).toEqual([]);
});

/* Google ziyaretçiyi doğrudan koleksiyon adresine gönderir. O adrese girildiğinde
   sitenin kendisi, koleksiyon görünümü açık hâlde gelmeli — sade bir ikizi değil. */
test('koleksiyon adresine doğrudan girildiğinde koleksiyon görünümü açılır', async ({ page }) => {
  await setup(page);
  await page.goto('/kina-hediyelikleri/');
  await expect(page.locator('#collview')).toHaveClass(/open/);
  await expect(page.locator('#cv-banner-title')).toHaveText('Kına');
  /* Adres çubuğu gerçek sayfa adresinde kalmalı; sorgu biçimine düşmemeli. */
  expect(new URL(page.url()).pathname).toBe('/kina-hediyelikleri/');
  expect(new URL(page.url()).search).toBe('');
});

/* Sayfanın başlığı yapı sırasında HTML'e yazılıyor. Uygulama aynı adresi açtığında
   onu kendi biçimiyle yeniden üretirse bot ile kullanıcı farklı başlık görür. */
test('üretilen sayfanın başlığı JavaScript açıldıktan sonra da değişmez', async ({ page }) => {
  await setup(page);
  const response = await page.goto('/kina-hediyelikleri/');
  const staticHtml = await response.text();
  const staticTitle = staticHtml.match(/<title>([^<]*)<\/title>/)[1];
  await expect(page.locator('#collview')).toHaveClass(/open/);
  await expect(page).toHaveTitle(staticTitle);
});

test('kategori adresine doğrudan girildiğinde sayfa kendi adresinde kalır', async ({ page }) => {
  await setup(page);
  const response = await page.goto('/mum/');
  const staticTitle = (await response.text()).match(/<title>([^<]*)<\/title>/)[1];
  /* waitReady ana sayfanın bölümlerini bekler; üretilen sayfada onlar yok. */
  await page.waitForFunction(() => window.catalogState && window.catalogState.catalog === 'ready');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalOrigin + '/mum/');
  await expect(page).toHaveTitle(staticTitle);
  expect(new URL(page.url()).pathname).toBe('/mum/');
  /* Ana sayfa bölümleri çizilmeye çalışırken sessizce durmalı, çökmemeli. */
  await expect(page.locator('.prod-card, .pg-empty').first()).toBeVisible();
});

/* Vitrin, panele kaydedilen gercek iletisim bilgilerini olduğu gibi göstermeli.
   Daha önce "örnek veriyi yayına çıkarma" amaçlı bir değer süzgeci vardı ve
   içindeki örnekler işletmenin gerçek numarası ile Instagram adresiydi; doğru
   bilgi girildiğinde site onu demo sanıp gizliyor, sipariş akışı tamamen
   kapanıyordu. Testler bunu görmemişti çünkü sahte veride başka bir numara
   kullanılıyordu. Burada bilerek gerçek değerler kullanılıyor. */
test('panele kaydedilen gerçek iletişim bilgileri vitrinde görünür', async ({ page }) => {
  const db = makeDb();
  db.site_settings_public = [{
    ...db.site_settings_public[0],
    whatsapp_number: '905399413902',
    instagram_url: 'https://www.instagram.com/davetsandigi',
    phone: '+90 539 941 39 02',
    email: 'davetsandigi@gmail.com'
  }];
  await setup(page, { db });
  await page.goto('/index.html');
  await waitReady(page);
  await page.click('#cookie-reject');

  for (const id of ['hdr-wa', 'cta-wa', 'ft-wa', 'channel-wa']) {
    await expect(page.locator(`#${id}`), id + ' gizlenmiş').toBeVisible();
    await expect(page.locator(`#${id}`)).toHaveAttribute('href', /wa\.me\/905399413902/);
  }
  for (const id of ['hdr-ig', 'ft-ig']) {
    await expect(page.locator(`#${id}`), id + ' gizlenmiş').toBeVisible();
    await expect(page.locator(`#${id}`)).toHaveAttribute('href', /instagram\.com\/davetsandigi/);
  }
  await expect(page.locator('#ft-phone')).toHaveText('+90 539 941 39 02');
  await expect(page.locator('#ft-mail')).toHaveText('davetsandigi@gmail.com');
});
