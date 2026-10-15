import { expect, test } from '@playwright/test';

function installFakeSupabase() {
  const db = {
    categories: [{ id: 1, name: 'Kolonya Şişeleri', code_prefix: 'KOL', is_active: true, sort_order: 0 }],
    collections: [{ id: 1, name: 'Nişan', is_active: true, sort_order: 0 }],
    media_assets: [{ id: 1, storage_path: 'products/test.webp', alt_text: 'Ürün ana görseli', original_name: 'test.webp', status: 'active', archived_at: null, usage_type: 'product', created_at: new Date().toISOString() }],
    products: [], product_drafts: [], product_images: [], product_collections: []
  };
  let productSequence = 1;
  let draftSequence = 1;
  const session = { user: { id: '7590fe38-46b1-47dd-bd17-b83a0212e87c' }, expires_at: Math.floor(Date.now() / 1000) + 3600 };

  function decorateProduct(product) {
    return {
      ...product,
      categories: db.categories.find(item => item.id === Number(product.category_id)) || null,
      product_collections: db.product_collections.filter(item => item.product_id === product.id).map(item => ({ collection_id: item.collection_id })),
      product_images: db.product_images.filter(item => item.product_id === product.id).sort((a, b) => a.sort_order - b.sort_order).map(item => ({ ...item, media_assets: db.media_assets.find(asset => asset.id === item.media_id) || null }))
    };
  }

  class Query {
    constructor(table) { this.table = table; this.action = 'select'; this.filters = []; this.payload = null; this.count = false; this.head = false; this.rangeValue = null; }
    select(_columns, options = {}) { this.count = options.count === 'exact'; this.head = options.head === true; return this; }
    insert(payload) { this.action = 'insert'; this.payload = payload; return this; }
    update(payload) { this.action = 'update'; this.payload = payload; return this; }
    delete() { this.action = 'delete'; return this; }
    eq(column, value) { this.filters.push(row => String(row[column]) === String(value)); return this; }
    is(column, value) { this.filters.push(row => row[column] === value); return this; }
    not(column, operator, value) { if (operator === 'is') this.filters.push(row => row[column] !== value); return this; }
    in(column, values) { this.filters.push(row => values.map(String).includes(String(row[column]))); return this; }
    or() { return this; }
    order() { return this; }
    range(from, to) { this.rangeValue = [from, to]; return this; }
    maybeSingle() { return this.execute(true); }
    single() { return this.execute(true); }
    then(resolve, reject) { return this.execute(false).then(resolve, reject); }
    async execute(single) {
      if (this.table === 'admin_profiles') return { data: { user_id: session.user.id, display_name: 'Test Owner', role: 'owner', is_active: true }, error: null };
      let rows = db[this.table] || [];
      if (this.action === 'update') {
        rows.filter(row => this.filters.every(filter => filter(row))).forEach(row => Object.assign(row, this.payload));
      } else if (this.action === 'insert') {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        values.forEach(value => rows.push({ ...value }));
      } else if (this.action === 'delete') {
        db[this.table] = rows.filter(row => !this.filters.every(filter => filter(row)));
        rows = db[this.table];
      }
      let result = rows.filter(row => this.filters.every(filter => filter(row)));
      const count = result.length;
      if (this.table === 'products') result = result.map(decorateProduct);
      if (this.rangeValue) result = result.slice(this.rangeValue[0], this.rangeValue[1] + 1);
      if (this.head) result = null;
      if (single) result = Array.isArray(result) ? (result[0] || null) : result;
      return { data: result, count: this.count ? count : null, error: null };
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
    storage: { from: () => ({ getPublicUrl: path => ({ data: { publicUrl: '/assets/images/fallback/nisan-1.webp?path=' + encodeURIComponent(path) } }) }) },
    rpc(name, args) {
      const run = async () => {
        if (name === 'save_product_draft') {
          let productId = args.p_product_id;
          if (!productId) {
            productId = productSequence++;
            db.products.push({ id: productId, ...args.p_payload, is_active: false, archived_at: null, updated_at: new Date().toISOString() });
          }
          let draft = db.product_drafts.find(item => item.product_id === productId);
          if (!draft) { draft = { id: draftSequence++, product_id: productId }; db.product_drafts.push(draft); }
          draft.payload = structuredClone(args.p_payload); draft.updated_at = new Date().toISOString();
          return { data: { draft_id: draft.id, product_id: productId }, error: null };
        }
        if (name === 'publish_product_draft') {
          const draft = db.product_drafts.find(item => item.id === args.p_draft_id);
          const product = db.products.find(item => item.id === draft.product_id);
          Object.assign(product, structuredClone(draft.payload), { is_active: true, archived_at: null, updated_at: new Date().toISOString() });
          db.product_images = db.product_images.filter(item => item.product_id !== product.id);
          draft.payload.images.forEach((image, index) => db.product_images.push({ id: index + 1, product_id: product.id, media_id: image.media_id, alt_text: image.alt_text, sort_order: index, is_primary: index === 0 }));
          db.product_collections = db.product_collections.filter(item => item.product_id !== product.id);
          draft.payload.collection_ids.forEach(collectionId => db.product_collections.push({ product_id: product.id, collection_id: collectionId }));
          db.product_drafts = db.product_drafts.filter(item => item.id !== draft.id);
          return { data: product.id, error: null };
        }
        return { data: null, error: new Error('Unknown RPC') };
      };
      return { single: run, then: (resolve, reject) => run().then(resolve, reject) };
    }
  };
  window.__PW_DB = db;
  window.__visitorProducts = () => db.products.filter(product => product.is_active && !product.archived_at);
  window.supabase = { createClient: () => client };
  window.__DAVET_SANDIGI_ENV__ = { SUPABASE_URL: 'http://local.test', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(installFakeSupabase);
  await page.goto('/admin.html');
  await expect(page.locator('#admin-panel')).toHaveClass(/show/);
  await expect(page.locator('#product-list-status')).toContainText('Kayıt bulunamadı');
});

test('ürün ekleme, düzenleme, yayınlama ve arşivleme akışı', async ({ page }) => {
  await page.click('[data-view="add"]');
  await page.fill('#pf-name', 'İnci Detaylı Kolonya');
  await page.fill('#pf-sku', 'KOL-001');
  await page.selectOption('#pf-category', '1');
  await page.fill('#pf-price', '54.90');
  await page.selectOption('#pf-media-select', '1');
  await page.click('#pf-media-add');
  await page.click('#pf-preview');
  await page.click('[data-preview-approve]');
  await page.click('#pf-draft');
  await expect(page.locator('#admin-rows')).toContainText('Taslak değişiklik');

  await page.click('[data-product-edit="1"]');
  await page.fill('#pf-name', 'İnci Detaylı Nişan Kolonyası');
  await page.click('#pf-preview');
  await page.click('[data-preview-approve]');
  await page.click('#pf-publish');
  await expect(page.locator('.product-admin-row')).toContainText('Yayında');
  await expect.poll(() => page.evaluate(() => window.__visitorProducts().map(item => item.name))).toEqual(['İnci Detaylı Nişan Kolonyası']);

  page.once('dialog', dialog => dialog.accept());
  await page.click('[data-product-archive="1"]');
  await expect(page.locator('.product-admin-row')).toContainText('Arşiv');
  await expect.poll(() => page.evaluate(() => window.__visitorProducts().length)).toBe(0);
});

test('Türkçe karakterlerden güvenli slug üretir ve önizleme olmadan kaydetmez', async ({ page }) => {
  await page.click('[data-view="add"]');
  await page.fill('#pf-name', 'Çiçekli Şişe & Özel Ürün');
  await expect(page.locator('#pf-slug')).toHaveValue('cicekli-sise-ozel-urun');
  await page.fill('#pf-sku', 'TST-002');
  await page.selectOption('#pf-category', '1');
  await page.fill('#pf-price', '10');
  await page.click('#pf-draft');
  await expect(page.locator('#product-form-status')).toContainText('önce güncel önizlemeyi');
});

test('ürün listesini sayfalar ve durum/koleksiyon filtrelerini uygular', async ({ page }) => {
  await page.evaluate(async () => {
    for (let index = 1; index <= 9; index += 1) {
      window.__PW_DB.products.push({
        id: index,
        name: `Test Ürün ${index}`,
        slug: `test-urun-${index}`,
        sku: `TST-${String(index).padStart(3, '0')}`,
        category_id: 1,
        price: 10,
        is_price_visible: true,
        is_quote_only: false,
        min_quantity: 1,
        quantity_step: 1,
        is_featured: false,
        is_active: index % 2 === 1,
        sort_order: index,
        archived_at: null,
        updated_at: new Date().toISOString()
      });
    }
    window.__PW_DB.product_collections.push({ product_id: 1, collection_id: 1 });
    await productInitialize(true);
  });
  await expect(page.locator('.product-admin-row')).toHaveCount(8);
  await page.click('#product-next');
  await expect(page.locator('.product-admin-row')).toHaveCount(1);
  await page.selectOption('#admin-status-filter', 'active');
  await expect(page.locator('.product-admin-row')).toHaveCount(5);
  await page.selectOption('#admin-status-filter', '');
  await page.selectOption('#admin-collection-filter', '1');
  await expect(page.locator('.product-admin-row')).toHaveCount(1);
});
