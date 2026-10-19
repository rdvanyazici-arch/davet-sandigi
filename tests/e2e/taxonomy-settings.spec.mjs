import { expect, test } from '@playwright/test';

function installFakeSupabase() {
  const db = {
    categories: [{ id: 1, name: 'Kullanımdaki Kategori', slug: 'kullanilan', code_prefix: 'KUL', description: 'Açıklama', sort_order: 1, is_active: true, archived_at: null }],
    collections: [{ id: 1, name: 'Nişan', slug: 'nisan', short_description: 'Nişan tasarımları', cover_media_id: 1, sort_order: 1, is_active: true, archived_at: null }],
    media_assets: [{ id: 1, storage_path: 'collections/test/cover.webp', original_name: 'cover.webp', alt_text: 'Koleksiyon kapağı', usage_type: 'collection', status: 'active', archived_at: null, created_at: new Date().toISOString() }],
    products: [{ id: 1, category_id: 1, name: 'Bağlı Ürün', slug: 'bagli-urun', sku: 'BAG-001', price: 10, min_quantity: 1, quantity_step: 1, is_active: false, archived_at: null, sort_order: 1, updated_at: new Date().toISOString() }],
    product_collections: [], category_collections: [], product_images: [], product_drafts: [],
    site_settings: [{ id: 1, brand_name: 'Davet Sandığı', whatsapp_number: '905399999999', instagram_url: 'https://www.instagram.com/davetsandigi', phone: '+90 539 999 99 99', email: 'info@example.com', delivery_text: 'Türkiye geneli teslimat', currency_code: 'TRY', default_min_quantity: 25, default_quantity_step: 25, quote_threshold: 100, shipping_note: 'Kargo görüşmede netleşir.', is_maintenance_mode: false }]
  };
  const sequences = { categories: 2, collections: 2 };
  const session = { user: { id: '7590fe38-46b1-47dd-bd17-b83a0212e87c' }, expires_at: Math.floor(Date.now() / 1000) + 3600 };

  class Query {
    constructor(table) { this.table = table; this.action = 'select'; this.filters = []; this.payload = null; this.count=false; this.rangeValue=null; }
    select(_columns, options={}) { this.count=options.count==='exact'; return this; }
    insert(payload) { this.action = 'insert'; this.payload = payload; return this; }
    delete() { this.action = 'delete'; return this; }
    update(payload) { this.action = 'update'; this.payload = payload; return this; }
    eq(column, value) { this.filters.push(row => String(row[column]) === String(value)); return this; }
    is(column, value) { this.filters.push(row => row[column] === value); return this; }
    in(column, values) { this.filters.push(row => values.map(String).includes(String(row[column]))); return this; }
    or(expression) { const match=String(expression).match(/\.ilike\.%(.*?)%/); if(match){const search=match[1].toLocaleLowerCase('tr-TR');this.filters.push(row=>[row.original_name,row.alt_text].some(value=>String(value||'').toLocaleLowerCase('tr-TR').includes(search)));} return this; }
    range(from,to) { this.rangeValue=[from,to]; return this; }
    order() { return this; }
    single() { return this.execute(true); }
    maybeSingle() { return this.execute(true); }
    then(resolve, reject) { return this.execute(false).then(resolve, reject); }
    async execute(single) {
      if (this.table === 'admin_profiles') return { data: { user_id: session.user.id, display_name: 'Test Owner', role: 'owner', is_active: true }, error: null };
      let rows = db[this.table] || [];
      if (this.action === 'insert') (Array.isArray(this.payload) ? this.payload : [this.payload]).forEach(payload => {
        const value = { ...payload, id: payload.id || (sequences[this.table] ? sequences[this.table]++ : undefined) };
        rows.push(value);
      });
      if (this.action === 'update') rows.filter(row => this.filters.every(filter => filter(row))).forEach(row => Object.assign(row, this.payload));
      if (this.action === 'delete') db[this.table] = rows = rows.filter(row => !this.filters.every(filter => filter(row)));
      let result = rows.filter(row => this.filters.every(filter => filter(row))),count=result.length;
      if(this.rangeValue)result=result.slice(this.rangeValue[0],this.rangeValue[1]+1);
      return { data: single ? (result[0] || null) : result, count:this.count?count:null, error: null };
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
    storage: { from: () => ({ getPublicUrl: path => ({ data: { publicUrl: '/assets/images/fallback/col-nisan.webp?path=' + encodeURIComponent(path) } }) }) },
    rpc: () => ({ single: async () => ({ data: null, error: null }) })
  };
  window.__PW_DB = db;
  window.__visitorCategories = () => db.categories.filter(row => row.is_active && !row.archived_at);
  window.supabase = { createClient: () => client };
  window.__DAVET_SANDIGI_ENV__ = { SUPABASE_URL: 'http://local.test', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(installFakeSupabase);
  await page.goto('/admin.html');
  await expect(page.locator('#admin-panel')).toHaveClass(/show/);
});

test('kategori ekler, bağlı ürün sayısını gösterir ve arşivler', async ({ page }) => {
  await page.click('[data-view="categories"]');
  await expect(page.locator('#category-list')).toContainText('1 bağlı ürün');
  await page.click('#category-new');
  await page.fill('#category-name', 'Çiçekli Hediyeler');
  await expect(page.locator('#category-slug')).toHaveValue('cicekli-hediyeler');
  await page.fill('#category-prefix', 'CHK');
  await page.check('.category-collection');
  await page.click('#category-preview');
  await page.click('[data-taxonomy-approve]');
  await page.click('#category-save');
  await expect(page.locator('#category-list')).toContainText('Çiçekli Hediyeler');

  await page.click('[data-category-archive="1"]');
  await page.click('[data-dialog-confirm]');
  await expect(page.locator('#category-list')).toContainText('Arşiv');
  await expect.poll(() => page.evaluate(() => window.__visitorCategories().length)).toBe(0);
});

test('koleksiyon kapak önizlemesiyle kaydeder', async ({ page }) => {
  await page.click('[data-view="collections"]');
  await page.click('#collection-new');
  await page.fill('#collection-name', 'Nişan Koleksiyonu');
  await page.click('[data-picker-field="collection-cover"]');
  await page.click('[data-picker-id="1"]');
  await page.click('[data-picker-apply]');
  await page.check('#collection-active');
  await expect(page.locator('#collection-cover-preview img')).toBeVisible();
  await page.click('#collection-preview');
  await expect(page.locator('.taxonomy-preview-card img')).toBeVisible();
  await page.click('[data-taxonomy-approve]');
  await page.click('#collection-save');
  await expect(page.locator('#collection-list')).toContainText('Nişan Koleksiyonu');
  await expect(page.locator('#collection-list')).toContainText('0 bağlı ürün');
});

test('site ayarlarını doğrular, önizler ve kaydeder', async ({ page }) => {
  await page.click('[data-view="settings"]');
  await page.fill('#settings-whatsapp', '+90 539 999 99 99');
  await page.click('#settings-preview');
  await expect(page.locator('#settings-status')).toContainText('10–15 rakam');
  await page.fill('#settings-whatsapp', '905301112233');
  await page.click('#settings-preview');
  await expect(page.locator('.settings-preview-card')).toContainText('905301112233');
  await page.click('[data-taxonomy-approve]');
  await page.click('#settings-save');
  await expect.poll(() => page.evaluate(() => window.__PW_DB.site_settings[0].whatsapp_number)).toBe('905301112233');
});
