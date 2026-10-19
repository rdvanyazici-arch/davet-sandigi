import { expect, test } from '@playwright/test';

function installFakeSupabase() {
  const db = {
    categories: [{ id: 1, name: 'Kolonya Şişeleri', code_prefix: 'KOL', is_active: true, sort_order: 0 }],
    collections: [{ id: 1, name: 'Nişan', is_active: true, sort_order: 0 }],
    media_assets: [{ id: 1, storage_path: 'products/test.webp', alt_text: 'Ürün ana görseli', original_name: 'test.webp', status: 'active', archived_at: null, usage_type: 'product', created_at: new Date().toISOString() }],
    products: [], product_drafts: [], product_images: [], product_collections: [],
    adminProfile: { user_id: '7590fe38-46b1-47dd-bd17-b83a0212e87c', display_name: 'Test Owner', role: 'owner', is_active: true }
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
    not(column, operator, value) { if (operator === 'is') this.filters.push(row => row[column] !== value); if (operator === 'in') { const values=String(value).replace(/[()]/g,'').split(','); this.filters.push(row => !values.includes(String(row[column]))); } return this; }
    ilike(column, pattern) { const search=String(pattern).replaceAll('%','').toLocaleLowerCase('tr-TR'); this.filters.push(row => String(row[column]||'').toLocaleLowerCase('tr-TR').includes(search)); return this; }
    limit(value) { this.rangeValue=[0,Math.max(0,Number(value)-1)]; return this; }
    in(column, values) { this.filters.push(row => values.map(String).includes(String(row[column]))); return this; }
    or(expression) {
      const match = String(expression || '').match(/\.ilike\.%(.*?)%/);
      if (match) {
        const search = match[1].toLocaleLowerCase('tr-TR');
        this.filters.push(row => [row.name, row.sku, row.slug, row.original_name, row.alt_text].some(value => String(value || '').toLocaleLowerCase('tr-TR').includes(search)));
      }
      return this;
    }
    order() { return this; }
    range(from, to) { this.rangeValue = [from, to]; return this; }
    maybeSingle() { return this.execute(true); }
    single() { return this.execute(true); }
    then(resolve, reject) { return this.execute(false).then(resolve, reject); }
    async execute(single) {
      if (this.table === 'admin_profiles') return { data: db.adminProfile, error: null };
      let rows = db[this.table] || [];
      let insertedRows = null;
      if (this.action === 'update') {
        rows.filter(row => this.filters.every(filter => filter(row))).forEach(row => Object.assign(row, this.payload));
      } else if (this.action === 'insert') {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        insertedRows = values.map(value => ({ id: value.id || (Math.max(0, ...rows.map(row => Number(row.id) || 0)) + 1), ...value }));
        insertedRows.forEach(value => rows.push(value));
      } else if (this.action === 'delete') {
        db[this.table] = rows.filter(row => !this.filters.every(filter => filter(row)));
        rows = db[this.table];
      }
      let result = insertedRows || rows.filter(row => this.filters.every(filter => filter(row)));
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
    storage: { from: () => ({ getPublicUrl: path => ({ data: { publicUrl: '/assets/images/fallback/nisan-1.webp?path=' + encodeURIComponent(path) } }), move: async () => ({ error: null }), remove: async () => ({ error: null }), upload: async () => ({ error: null }) }) },
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
        if (name === 'delete_empty_product_draft') {
          db.product_drafts = db.product_drafts.filter(item => item.product_id !== args.p_product_id);
          db.products = db.products.filter(item => item.id !== args.p_product_id);
          return { data: true, error: null };
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
  await expect(page.locator('#product-list-status')).toContainText('0 filtreli sonuç');
});

test('ürün ekleme, düzenleme, yayınlama ve arşivleme akışı', async ({ page }) => {
  await page.click('[data-view="add"]');
  await page.fill('#pf-name', 'İnci Detaylı Kolonya');
  await page.selectOption('#pf-category', '1');
  await expect(page.locator('#pf-sku')).toHaveValue('KOL-001');
  await page.fill('#pf-price', '54.90');
  await page.click('#pf-media-picker');
  await page.click('[data-picker-id="1"]');
  await page.click('[data-picker-apply]');
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

  await page.click('[data-product-archive="1"]');
  await page.click('[data-dialog-confirm]');
  await expect(page.locator('.product-admin-row')).toContainText('Arşiv');
  await expect.poll(() => page.evaluate(() => window.__visitorProducts().length)).toBe(0);
  await page.click('[data-product-restore="1"]');
  await expect(page.locator('.product-admin-row')).toContainText('Yayında değil');
});

test('boş taslağı yalnız owner görür ve güvenli RPC ile siler', async ({ page }) => {
  await page.click('[data-view="products"]');
  await page.evaluate(async () => {
    window.__PW_DB.products.push({ id: 50, name: null, slug: null, sku: null, is_active: false, archived_at: null, product_images: [] });
    window.__PW_DB.product_drafts.push({ id: 50, product_id: 50, payload: { name: '', sku: '', images: [] }, updated_at: new Date().toISOString() });
    await productInitialize(true);
  });
  await expect(page.locator('[data-product-delete-draft="50"]')).toBeVisible();
  await page.click('[data-product-delete-draft="50"]');
  await page.click('[data-dialog-confirm]');
  await expect(page.locator('[data-product-delete-draft="50"]')).toHaveCount(0);
  await expect(page.locator('#admin-count')).toHaveText('0 ürün');
});

test('editör owner eylemlerini görmez ve sayaç filtreden bağımsız kalır', async ({ page }) => {
  await page.click('[data-view="products"]');
  await page.evaluate(async () => {
    window.adminAuthProfile.role = 'editor';
    window.__PW_DB.products.push({ id: 60, name: null, slug: null, sku: null, is_active: false, archived_at: null, product_images: [] });
    window.__PW_DB.product_drafts.push({ id: 60, product_id: 60, payload: { name: '', sku: '', images: [] }, updated_at: new Date().toISOString() });
    await productInitialize(true);
  });
  await expect(page.locator('[data-product-delete-draft="60"]')).toHaveCount(0);
  await expect(page.locator('#admin-count')).toHaveText('1 ürün');
  await page.fill('#admin-search', 'eşleşmeyen');
  await expect(page.locator('#product-list-status')).toContainText('0 filtreli sonuç');
  await expect(page.locator('#admin-count')).toHaveText('1 ürün');
});

test('ortak dialog odağı tutar, Esc ile kapanır ve odağı geri verir', async ({ page }) => {
  await page.click('[data-view="products"]');
  await page.evaluate(() => {
    window.__PW_DB.products.push({ id: 70, name: 'Test', slug: 'test', sku: 'TEST', is_active: true, archived_at: null, updated_at: new Date().toISOString() });
  });
  await page.evaluate(() => productInitialize(true));
  const trigger = page.locator('[data-product-archive="70"]');
  await trigger.focus();
  await trigger.click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('medya listesi yükleme bayrağından bağımsız yenilenir ve arşiv sonrası güncellenir', async ({ page }) => {
  await page.click('[data-view="media"]');
  await page.evaluate(async () => {
    window.__PW_DB.media_assets.push({ id: 8, storage_path: 'products/8/test.webp', original_name: 'new.webp', alt_text: 'Yeni görsel', usage_type: 'product', status: 'active', archived_at: null, width: 800, height: 1000, file_size: 1000, mime_type: 'image/webp', created_at: new Date().toISOString() });
    mediaState.uploading = true;
    await renderMediaLibrary();
  });
  await expect(page.locator('.media-card').filter({ hasText: 'new.webp' })).toBeVisible();
  await page.click('[data-media-archive="8"]');
  await page.click('[data-dialog-confirm]');
  await page.selectOption('#media-filter', 'archived');
  await expect(page.locator('.media-card').filter({ hasText: 'new.webp' })).toContainText('Arşiv');
});

test('görsel yükleme ve değiştirme sonrası kütüphane yenilenir', async ({ page }) => {
  await page.click('[data-view="media"]');
  await page.evaluate(async () => {
    const selected = { original: { name: 'yeni.png' }, blob: new Blob(['image'], { type: 'image/webp' }), hash: 'a'.repeat(64), width: 800, height: 1000 };
    mediaState.selected = selected;
    document.querySelector('#media-alt').value = 'Yeni ürün görseli';
    await mediaUploadSelected();
  });
  await expect(page.locator('.media-card').filter({ hasText: 'yeni.png' })).toBeVisible();
  const uploadedId = await page.evaluate(() => Math.max(...window.__PW_DB.media_assets.map(item => item.id)));
  await page.evaluate(async id => {
    mediaState.replaceId = id;
    mediaState.selected = { original: { name: 'degisen.png' }, blob: new Blob(['replacement'], { type: 'image/webp' }), hash: 'b'.repeat(64), width: 900, height: 1100 };
    document.querySelector('#media-alt').value = 'Değiştirilen görsel';
    await mediaUploadSelected();
  }, uploadedId);
  await expect(page.locator('.media-card').filter({ hasText: 'degisen.png' })).toBeVisible();
});

test('hata çevirileri güvenli Türkçe mesaj ve teknik ayrıntı üretir', async ({ page }) => {
  const errors = await page.evaluate(() => ({
    sku: window.__adminUiTest.errorInfo({ code: '23505', message: 'duplicate key products_sku_key' }),
    slug: window.__adminUiTest.errorInfo({ code: '23505', message: 'duplicate key products_slug_key' }),
    permission: window.__adminUiTest.errorInfo({ code: '42501', message: 'permission denied' }),
    network: window.__adminUiTest.errorInfo(new Error('Failed to fetch')),
    primary: window.__adminUiTest.errorInfo(new Error('Active products require one active primary image.')),
    unknown: window.__adminUiTest.errorInfo(new Error('opaque database detail'))
  }));
  expect(errors.sku.message).toBe('Bu SKU başka bir üründe kullanılıyor.');
  expect(errors.slug.message).toContain('slug');
  expect(errors.permission.message).toContain('yetkiniz');
  expect(errors.network.message).toContain('Ağ');
  expect(errors.primary.message).toContain('ana görsel');
  expect(errors.unknown.technical).toBe('opaque database detail');
});

test('mobil menü erişilebilir biçimde açılır, odağı tutar ve Esc ile kapanır', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#admin-menu-open')).toBeVisible();
  await page.click('#admin-menu-open');
  await expect(page.locator('#admin-side')).toHaveClass(/open/);
  await expect(page.locator('#admin-menu-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#admin-side')).not.toHaveClass(/open/);
  await expect(page.locator('#admin-menu-open')).toBeFocused();
  await expect(page.locator('#admin-side [data-view="dashboard"]')).toHaveAttribute('aria-current', 'page');
});

test('Türkçe karakterlerden güvenli slug üretir; taslak önizlemesiz, yayın önizlemeli çalışır', async ({ page }) => {
  await page.click('[data-view="add"]');
  await page.fill('#pf-name', 'Çiçekli Şişe & Özel Ürün');
  await expect(page.locator('#pf-slug')).toHaveValue('cicekli-sise-ozel-urun');
  await page.fill('#pf-sku', 'TST-002');
  await page.selectOption('#pf-category', '1');
  await page.fill('#pf-price', '10');
  await page.click('#pf-draft');
  await expect(page.locator('#admin-rows')).toContainText('Taslak değişiklik');
  await page.click('[data-product-edit="1"]');
  await page.click('#pf-media-picker');
  await page.click('[data-picker-id="1"]');
  await page.click('[data-picker-apply]');
  await page.click('#pf-publish');
  await expect(page.locator('#product-form-status')).toContainText('Yayınlamadan önce');
});

test('seçilen ürünleri onayla toplu arşivler', async ({ page }) => {
  await page.evaluate(async () => {
    window.__PW_DB.products.push(
      { id: 81, name: 'Toplu Bir', slug: 'toplu-bir', sku: 'TOP-001', category_id: 1, price: 10, is_active: false, archived_at: null, updated_at: new Date().toISOString() },
      { id: 82, name: 'Toplu İki', slug: 'toplu-iki', sku: 'TOP-002', category_id: 1, price: 10, is_active: false, archived_at: null, updated_at: new Date().toISOString() }
    );
    await productInitialize(true);
  });
  await page.click('[data-view="products"]');
  await page.click('[data-product-select="81"]');
  await page.click('[data-product-select="82"]');
  await page.selectOption('#product-bulk-action', 'archive');
  await page.click('#product-bulk-apply');
  await expect(page.getByRole('dialog')).toContainText('2 ürün');
  await page.click('[data-dialog-confirm]');
  await page.click('[data-product-status="archived"]');
  await expect(page.locator('.product-admin-row')).toHaveCount(2);
});

test('kaydedilmemiş ürün değişikliğinde sekme geçişini korur', async ({ page }) => {
  await page.click('[data-view="add"]');
  await page.fill('#pf-name', 'Kaydedilmemiş ürün');
  await page.click('[data-view="media"]');
  await expect(page.getByRole('dialog')).toContainText('Kaydedilmemiş');
  await page.click('[data-dialog-cancel]');
  await expect(page.locator('#view-add')).toHaveClass(/show/);
  await page.click('[data-view="media"]');
  await page.click('[data-dialog-confirm]');
  await expect(page.locator('#view-media')).toHaveClass(/show/);
});

test('ürün listesini sayfalar ve durum/koleksiyon filtrelerini uygular', async ({ page }) => {
  await page.evaluate(async () => {
    for (let index = 1; index <= 11; index += 1) {
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
  await page.click('[data-view="products"]');
  await expect(page.locator('.product-admin-row')).toHaveCount(10);
  await page.click('#product-next');
  await expect(page.locator('.product-admin-row')).toHaveCount(1);
  await page.click('[data-product-status="active"]');
  await expect(page.locator('.product-admin-row')).toHaveCount(6);
  await page.click('[data-product-status=""]');
  await page.selectOption('#admin-collection-filter', '1');
  await expect(page.locator('.product-admin-row')).toHaveCount(1);
});
