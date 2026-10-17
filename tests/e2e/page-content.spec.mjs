import { expect, test } from '@playwright/test';

const pageRequests=new WeakMap();
const pageErrors=new WeakMap();
const pageConsoleErrors=new WeakMap();

function installFakeSupabase(options={}) {
  const now = new Date().toISOString();
  const db = options.empty ? {
    categories: [], collections: [], products: [], product_images: [], product_drafts: [], media_assets: [],
    banners: [], content_sections: [], faqs: [], testimonials: [], product_collections: [],
    site_settings: [{ id: 1, brand_name: 'Davet Sandığı', whatsapp_number: '905399999999', instagram_url: null, phone: null, email: null, delivery_text: null, currency_code: 'TRY', default_min_quantity: 25, default_quantity_step: 25, quote_threshold: 100, shipping_note: null, is_maintenance_mode: false }]
  } : {
    admin_profiles: [],
    categories: [{ id: 1, name: 'Kolonya', is_active: true, archived_at: null, updated_at: now }],
    collections: [{ id: 1, name: 'Nişan', is_active: true, archived_at: null, updated_at: now }],
    products: [
      { id: 1, name: 'Görselli Ürün', is_active: true, archived_at: null, updated_at: now },
      { id: 2, name: 'Görselsiz Ürün', is_active: false, archived_at: null, updated_at: now }
    ],
    product_images: [{ id: 1, product_id: 1, media_id: 1, is_primary: true, sort_order: 0 }],
    product_drafts: [{ id: 1, product_id: 2, updated_at: now }],
    media_assets: [
      { id: 1, storage_path: 'products/1/a.webp', original_name: 'urun.webp', alt_text: 'Ürün', usage_type: 'product', status: 'active', archived_at: null, created_at: now },
      { id: 2, storage_path: 'story/b.webp', original_name: 'altsiz.webp', alt_text: '', usage_type: 'story', status: 'active', archived_at: null, created_at: now },
      { id: 3, storage_path: 'banners/c.webp', original_name: 'hero.webp', alt_text: 'Hero görseli', usage_type: 'banner', status: 'active', archived_at: null, created_at: now }
    ],
    banners: [], content_sections: [], faqs: [], testimonials: [], product_collections: []
  };
  const sequences = {};
  const session = { user: { id: '7590fe38-46b1-47dd-bd17-b83a0212e87c' }, expires_at: Math.floor(Date.now() / 1000) + 3600 };

  function decorate(table, row) {
    if (table === 'products') return { ...row, product_images: db.product_images.filter(item => item.product_id === row.id) };
    if (table === 'product_images') return { ...row, products: db.products.find(item => item.id === row.product_id) || null };
    return row;
  }

  class Query {
    constructor(table) { this.table = table; this.action = 'select'; this.filters = []; this.payload = null; }
    select() { return this; }
    insert(payload) { this.action = 'insert'; this.payload = payload; return this; }
    update(payload) { this.action = 'update'; this.payload = payload; return this; }
    eq(column, value) { this.filters.push(row => String(row[column]) === String(value)); return this; }
    is(column, value) { this.filters.push(row => row[column] === value); return this; }
    not(column, operator, value) { if (operator === 'is') this.filters.push(row => row[column] !== value); return this; }
    range() { return this; }
    order() { return this; }
    single() { return this.execute(true); }
    maybeSingle() { return this.execute(true); }
    then(resolve, reject) { return this.execute(false).then(resolve, reject); }
    async execute(single) {
      if (this.table === 'admin_profiles') return { data: { user_id: session.user.id, display_name: 'Test Owner', role: 'owner', is_active: true }, error: null };
      const rows = db[this.table] || (db[this.table] = []);
      let result;
      if (this.action === 'insert') {
        sequences[this.table] = (sequences[this.table] || 100) + 1;
        const row = { id: sequences[this.table], updated_at: new Date().toISOString(), created_at: new Date().toISOString(), ...this.payload };
        if (this.table === 'testimonials' && row.is_published && !row.consent_confirmed) return { data: null, error: { message: 'Paylaşım izni yok (23514)' } };
        rows.push(row);
        result = [row];
      } else {
        const matched = rows.filter(row => this.filters.every(filter => filter(row)));
        if (this.action === 'update') matched.forEach(row => Object.assign(row, this.payload, { updated_at: new Date().toISOString() }));
        result = matched;
      }
      result = result.map(row => decorate(this.table, row));
      return { data: single ? (result[0] || null) : result, error: null };
    }
  }

  const client = {
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      refreshSession: async () => ({ data: { session }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
      mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: 'aal2' }, error: null }) }
    },
    from: table => new Query(table),
    storage: { from: () => ({ getPublicUrl: path => ({ data: { publicUrl: '/assets/images/fallback/hero.webp?path=' + encodeURIComponent(path) } }) }) },
    rpc: () => ({ single: async () => ({ data: null, error: null }) })
  };
  window.__PW_DB = db;
  window.supabase = { createClient: () => client };
  window.__DAVET_SANDIGI_ENV__ = { SUPABASE_URL: 'http://local.test', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' };
}

test.beforeEach(async ({ page }, testInfo) => {
  pageRequests.set(page,[]);pageErrors.set(page,[]);
  pageConsoleErrors.set(page,[]);
  page.on('request',request=>pageRequests.get(page).push(request.url()));
  page.on('pageerror',error=>pageErrors.get(page).push(String(error)));
  page.on('console',message=>{if(message.type()==='error')pageConsoleErrors.get(page).push(message.text());});
  await page.addInitScript(installFakeSupabase,{empty:testInfo.title.includes('boş Supabase')});
  await page.goto('/admin.html');
  await expect(page.locator('#admin-panel')).toHaveClass(/show/);
});

test('boş Supabase durumunda yönetim paneli açılır ve Firebase ağı kullanılmaz', async ({ page }) => {
  const dashboard=page.locator('#dashboard-admin');
  await expect(dashboard.locator('.pg-stat')).toHaveCount(4);
  for(const stat of await dashboard.locator('.pg-stat').all())await expect(stat).toContainText('0');
  await expect(dashboard).toContainText('Henüz güncelleme yok.');

  await page.click('[data-view="products"]');
  await expect(page.locator('#product-list-status')).toContainText('Kayıt bulunamadı');
  await page.click('[data-view="categories"]');
  await expect(page.locator('#category-list')).toContainText('Henüz kategori yok.');
  await page.click('[data-view="collections"]');
  await expect(page.locator('#collection-list')).toContainText('Henüz koleksiyon yok.');
  await page.click('[data-view="media"]');
  await expect(page.locator('#media-library-status')).toContainText('0 görsel bulundu.');
  await expect(page.locator('#media-library')).toContainText('Bu filtreye uygun görsel yok.');
  await page.click('[data-view="banner"]');
  await expect(page.locator('#banner-admin')).toContainText('Henüz kayıt yok.');
  await page.click('[data-view="faq"]');
  await expect(page.locator('#faq-admin')).toContainText('Henüz kayıt yok.');
  await page.click('[data-view="reviews"]');
  await expect(page.locator('#reviews-admin')).toContainText('Henüz kayıt yok.');
  await page.click('[data-view="content"]');
  await expect(page.locator('#content-admin')).toContainText('Henüz yok');
  await page.click('[data-view="home"]');
  await expect(page.locator('#home-admin')).toContainText('Henüz yok');
  await page.click('[data-view="campaign"]');
  await expect(page.locator('#campaign-admin')).toContainText('Henüz yok');
  await page.click('[data-view="settings"]');
  await expect(page.locator('#settings-whatsapp')).toBeVisible();

  const urls=pageRequests.get(page),hosts=new Set(urls.filter(url=>/^https?:/.test(url)).map(url=>new URL(url).host));
  expect([...hosts]).toEqual(['127.0.0.1:4175']);
  expect(urls.some(url=>/firebase|firestore|firebasejs|googleapis|gstatic/i.test(url))).toBe(false);
  expect(pageErrors.get(page)).toEqual([]);
  expect(pageConsoleErrors.get(page)).toEqual([]);
});

async function approvePreview(page) {
  await expect(page.locator('.taxonomy-preview-dialog')).toBeVisible();
  await page.click('[data-pg-mode="mobile"]');
  await expect(page.locator('.pg-canvas')).toHaveClass(/mobile/);
  await page.click('[data-pg-mode="desktop"]');
  await expect(page.locator('.pg-canvas')).toHaveClass(/desktop/);
  await page.click('[data-pg-approve]');
}

test('genel bakış sayıları ve eksikleri gösterir', async ({ page }) => {
  const dashboard = page.locator('#dashboard-admin');
  await expect(dashboard).toContainText('Aktif ürün');
  await expect(dashboard.locator('.pg-stat').first()).toContainText('1');
  await expect(dashboard).toContainText('Ana görseli eksik ürünler (1)');
  await expect(dashboard).toContainText('Görselsiz Ürün');
  await expect(dashboard).toContainText('Alt metni eksik görseller (1)');
  await expect(dashboard).toContainText('altsiz.webp');
  await expect(dashboard).toContainText('Kullanılmayan görseller (2)');
  await expect(dashboard).toContainText('1 ürün taslağı');
  await expect(dashboard).toContainText('Son güncellemeler');
});

test('banner zamanlama, görsel zorunluluğu ve önizlemeyle yayınlanır', async ({ page }) => {
  await page.click('[data-view="banner"]');
  await expect(page.locator('#banner-admin')).toContainText('Henüz kayıt yok');
  await page.click('#banner-admin [data-pg-new]');
  await page.fill('#banner-admin [data-f="title"]', 'Yeni *Sezon*');
  await page.fill('#banner-admin [data-f="primary_button_url"]', 'javascript:alert(1)');
  await page.fill('#banner-admin [data-f="primary_button_text"]', 'Keşfet');
  await page.click('#banner-admin [data-pg-preview]');
  await expect(page.locator('#banner-admin [data-pg-status]')).toContainText('https://');
  await page.fill('#banner-admin [data-f="primary_button_url"]', '#urunler');
  await page.fill('#banner-admin [data-f="starts_at"]', '2030-01-02T10:00');
  await page.fill('#banner-admin [data-f="ends_at"]', '2030-01-01T10:00');
  await page.click('#banner-admin [data-pg-preview]');
  await expect(page.locator('#banner-admin [data-pg-status]')).toContainText('Bitiş tarihi');
  await page.fill('#banner-admin [data-f="ends_at"]', '2030-02-01T10:00');
  await page.click('#banner-admin [data-pg-preview]');
  await approvePreview(page);
  await page.click('#banner-admin [data-pg-publish]');
  await expect(page.locator('#banner-admin [data-pg-status]')).toContainText('hero görseli zorunludur');
  await page.selectOption('#banner-admin [data-f="media_id"]', '3');
  await page.click('#banner-admin [data-pg-preview]');
  await expect(page.locator('.pg-hero img')).toBeVisible();
  await approvePreview(page);
  await page.click('#banner-admin [data-pg-publish]');
  await expect(page.locator('#banner-admin [data-pg-list]')).toContainText('Yeni *Sezon*');
  await expect(page.locator('#banner-admin [data-pg-list]')).toContainText('Zamanlanmış');
  expect(await page.evaluate(() => window.__PW_DB.banners[0].starts_at)).toContain('2030-01-02');
});

test('yorum izin teyidi olmadan yayınlanamaz', async ({ page }) => {
  await page.click('[data-view="reviews"]');
  await page.click('#reviews-admin [data-pg-new]');
  await page.fill('#reviews-admin [data-f="customer_display_name"]', 'A. Y.');
  await page.fill('#reviews-admin [data-f="review_text"]', 'Çok memnun kaldık.');
  await page.selectOption('#reviews-admin [data-f="rating"]', '4');
  await page.click('#reviews-admin [data-pg-preview]');
  await expect(page.locator('.pg-stars')).toContainText('★★★★☆');
  await approvePreview(page);
  await page.click('#reviews-admin [data-pg-publish]');
  await expect(page.locator('#reviews-admin [data-pg-status]')).toContainText('izni teyit edilmeden');
  expect(await page.evaluate(() => window.__PW_DB.testimonials.length)).toBe(0);
  await page.check('#reviews-admin [data-f="consent"]');
  await page.click('#reviews-admin [data-pg-preview]');
  await approvePreview(page);
  await page.click('#reviews-admin [data-pg-publish]');
  await expect(page.locator('#reviews-admin [data-pg-list]')).toContainText('Yayında');
  expect(await page.evaluate(() => window.__PW_DB.testimonials[0].rating)).toBe(4);

  page.once('dialog', dialog => dialog.accept());
  await page.click('#reviews-admin [data-pg-off]');
  await expect(page.locator('#reviews-admin [data-pg-list]')).toContainText('Taslak');
});

test('süreç adımları, SSS ve kampanya pop-up kaydedilir', async ({ page }) => {
  await page.click('[data-view="home"]');
  const card = page.locator('[data-section="process"]');
  await card.locator('[data-f="title"]').fill('Nasıl çalışır?');
  await card.locator('[data-li-add]').click();
  await card.locator('[data-li="title"]').fill('Seçin');
  await card.locator('[data-pg-preview]').click();
  await expect(card.locator('[data-pg-status]')).toContainText('başlık ve açıklama');
  await card.locator('[data-li="description"]').fill('Ürünleri sepete ekleyin.');
  await card.locator('[data-pg-preview]').click();
  await approvePreview(page);
  await card.locator('[data-pg-publish]').click();
  await expect.poll(() => page.evaluate(() => window.__PW_DB.content_sections[0] && window.__PW_DB.content_sections[0].content_json.steps.length)).toBe(1);
  await expect(page.locator('[data-section="process"]')).toContainText('Yayında');

  await page.click('[data-view="faq"]');
  await page.click('#faq-admin [data-pg-new]');
  await page.fill('#faq-admin [data-f="question"]', 'Siteden tahsilat yapılıyor mu?');
  await page.fill('#faq-admin [data-f="answer"]', 'Hayır, sipariş talebi WhatsApp üzerinden onaylanır.');
  await page.click('#faq-admin [data-pg-preview]');
  await approvePreview(page);
  await page.click('#faq-admin [data-pg-draft]');
  await expect(page.locator('#faq-admin [data-pg-list]')).toContainText('Taslak');

  await page.click('[data-view="campaign"]');
  const campaign = page.locator('[data-section="campaign"]');
  await campaign.locator('[data-f="title"]').fill('Hoş geldiniz');
  await campaign.locator('[data-f="body"]').fill('Yeni koleksiyon yakında.');
  await campaign.locator('[data-pg-preview]').click();
  await expect(page.locator('.pg-popup')).toBeVisible();
  await approvePreview(page);
  await campaign.locator('[data-pg-publish]').click();
  await expect.poll(() => page.evaluate(() => window.__PW_DB.content_sections.some(row => row.section_key === 'campaign' && row.is_active))).toBe(true);
});

test('mobil görünümde yatay taşma yok', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  for (const view of ['dashboard', 'banner', 'home', 'content', 'reviews', 'faq', 'campaign']) {
    await page.evaluate(name => switchView(name), view);
    const overflow = await page.evaluate(() => document.querySelector('.admin-main').scrollWidth - document.querySelector('.admin-main').clientWidth);
    expect(overflow, view).toBeLessThanOrEqual(1);
  }
});
