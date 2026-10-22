import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

/* Ekran goruntuleri varsayilan olarak gitignore'lu test-results/ altina yazilir;
   boylece her test kosusu depoyu kirletmez. Referans gorselleri bilerek tazelemek
   icin: UPDATE_ADMIN_BASELINE=1 npx playwright test */
const SHOT_DIR = process.env.UPDATE_ADMIN_BASELINE ? 'docs/admin-baseline' : 'test-results/admin-screens';

const pageRequests=new WeakMap();
const pageErrors=new WeakMap();
const pageConsoleErrors=new WeakMap();

function installFakeSupabase(options={}) {
  const now = new Date().toISOString();
  const db = options.empty ? {
    categories: [], collections: [], products: [], product_images: [], product_drafts: [], media_assets: [],
    banners: [], content_sections: [], faqs: [], testimonials: [], product_collections: [],
    site_settings: [{ id: 1, brand_name: 'Davet Sandığı', whatsapp_number: '905399999999', instagram_url: null, phone: null, email: null, delivery_text: null, currency_code: 'TRY', default_min_quantity: 25, default_quantity_step: 25, quote_threshold: 100, shipping_note: null, is_maintenance_mode: false, analytics_enabled: false }]
  } : {
    admin_profiles: [],
    categories: [{ id: 1, name: 'Kolonya', is_active: true, archived_at: null, updated_at: now }],
    collections: [{ id: 1, name: 'Nişan', is_active: true, archived_at: null, updated_at: now }],
    products: [
      { id: 1, name: 'Görselli Ürün', category_id: 1, is_active: true, archived_at: null, updated_at: now },
      { id: 2, name: 'Görselsiz Ürün', category_id: 1, is_active: true, archived_at: null, updated_at: now }
    ],
    product_images: [{ id: 1, product_id: 1, media_id: 1, is_primary: true, sort_order: 0 }],
    product_drafts: [{
      id: 1,
      product_id: 2,
      updated_at: now,
      payload: {
        name: 'Görselsiz Ürün', slug: 'gorselsiz-urun', sku: 'KOL-002', category_id: 1,
        short_description: '', description: '', price: 100, is_price_visible: true,
        is_quote_only: false, min_quantity: 25, quantity_step: 25, is_featured: false,
        sort_order: 2, seo_title: '', seo_description: '', collection_ids: [1], images: []
      }
    }],
    media_assets: [
      { id: 1, storage_path: 'products/1/a.webp', original_name: 'urun.webp', alt_text: 'Ürün', usage_type: 'product', status: 'active', archived_at: null, created_at: now },
      { id: 2, storage_path: 'story/b.webp', original_name: 'altsiz.webp', alt_text: '', usage_type: 'story', status: 'active', archived_at: null, created_at: now },
      { id: 3, storage_path: 'banners/c.webp', original_name: 'hero.webp', alt_text: 'Hero görseli', usage_type: 'banner', status: 'active', archived_at: null, created_at: now }
    ],
    banners: [], content_sections: [], faqs: [], testimonials: [], product_collections: [{ product_id: 1, collection_id: 1 }, { product_id: 2, collection_id: 1 }],
    site_settings: [{ id: 1, analytics_enabled: true, whatsapp_number: '905399999999', default_min_quantity: 25, default_quantity_step: 25 }]
  };
  const sequences = {};
  const session = { user: { id: '7590fe38-46b1-47dd-bd17-b83a0212e87c' }, expires_at: Math.floor(Date.now() / 1000) + 3600 };

  function decorate(table, row) {
    if (table === 'products') return { ...row, product_images: db.product_images.filter(item => item.product_id === row.id) };
    if (table === 'product_images') return { ...row, products: db.products.find(item => item.id === row.product_id) || null };
    return row;
  }

  class Query {
    constructor(table) { this.table = table; this.action = 'select'; this.filters = []; this.payload = null; this.count=false; this.rangeValue=null; }
    select(_columns, options={}) { this.count=options.count==='exact'; return this; }
    insert(payload) { this.action = 'insert'; this.payload = payload; return this; }
    update(payload) { this.action = 'update'; this.payload = payload; return this; }
    delete() { this.action = 'delete'; return this; }
    eq(column, value) { this.filters.push(row => String(row[column]) === String(value)); return this; }
    is(column, value) { this.filters.push(row => row[column] === value); return this; }
    not(column, operator, value) { if (operator === 'is') this.filters.push(row => row[column] !== value); return this; }
    in(column, values) { this.filters.push(row => values.map(String).includes(String(row[column]))); return this; }
    or(expression) { const match=String(expression).match(/\.ilike\.%(.*?)%/); if(match){const search=match[1].toLocaleLowerCase('tr-TR');this.filters.push(row=>[row.original_name,row.alt_text].some(value=>String(value||'').toLocaleLowerCase('tr-TR').includes(search)));} return this; }
    range(from,to) { this.rangeValue=[from,to]; return this; }
    order() { return this; }
    single() { return this.execute(true); }
    maybeSingle() { return this.execute(true); }
    then(resolve, reject) { return this.execute(false).then(resolve, reject); }
    async execute(single) {
      if (this.table === 'admin_profiles') {
        const profile = { user_id: session.user.id, display_name: 'Test Owner', role: 'owner', is_active: true };
        return { data: single ? profile : [profile], count: this.count ? 1 : null, error: null };
      }
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
        if (this.action === 'delete') db[this.table] = rows.filter(row => !matched.includes(row));
        result = matched;
      }
      result = result.map(row => decorate(this.table, row));
      const count=result.length;if(this.rangeValue)result=result.slice(this.rangeValue[0],this.rangeValue[1]+1);
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
    storage: { from: () => ({
      getPublicUrl: path => ({ data: { publicUrl: '/assets/images/fallback/hero.webp?path=' + encodeURIComponent(path) } }),
      move: async (from, to) => { window.__PW_STORAGE_MOVES.push({ from, to }); return { data: { path: to }, error: null }; },
      remove: async paths => { window.__PW_STORAGE_REMOVES.push(...paths); return { data: paths, error: null }; }
    }) },
    rpc: name => {
      const run = async () => {
        if (name === 'admin_analytics_summary') return { data: {
          days: 30, total_events: 94,
          totals: { page_view: 50, product_view: 25, add_to_cart: 12, whatsapp_request: 5, instagram_click: 2 },
          daily: [], sources: [{ source: 'instagram', count: 30 }, { source: 'direct', count: 20 }],
          devices: [{ device: 'mobile', count: 40 }, { device: 'desktop', count: 10 }],
          products: [{ id: 1, name: 'Görselli Ürün', sku: 'KOL-001', views: 25, adds: 12 }],
          collections: [{ id: 1, name: 'Nişan', views: 25, adds: 12 }]
        }, error: null };
        if (name !== 'admin_dashboard_summary') return { data: null, error: null };
        if (options.empty) return { data: {
          products: { published: 0, drafts: 0, unpublished: 0, archived: 0, total: 0 },
          health: { percentage: 100, healthy_active: 0, total_active: 0, issues: {} },
          recent_changes: [], categories: { total: 0, top: [] }, collections: { total: 0, top: [] }, scheduled_banners: []
        }, error: null };
        return { data: {
          products: { published: 2, drafts: 1, unpublished: 0, archived: 0, total: 2 },
          health: { percentage: 50, healthy_active: 1, total_active: 2, issues: {
            missing_primary: { count: 1, records: [{ id: 2, name: 'Görselsiz Ürün' }] },
            missing_alt: { count: 1, records: [{ id: 2, name: 'altsiz.webp' }] },
            pending_drafts: { count: 1, records: [{ id: 2, name: 'Görselsiz Ürün' }] },
            unused_media: { count: 2, records: [{ id: 2, name: 'altsiz.webp' }, { id: 3, name: 'hero.webp' }] },
            categoryless: { count: 0, records: [] }, missing_price: { count: 0, records: [] }, no_collection: { count: 0, records: [] }
          } },
          recent_changes: [{ id: 1, table_name: 'products', row_id: '2', action: 'update', summary: 'Ürün: Görselsiz Ürün', created_at: now, actor_name: 'Test Owner' }],
          categories: { total: 1, top: [{ id: 1, name: 'Kolonya', product_count: 2 }] },
          collections: { total: 1, top: [{ id: 1, name: 'Nişan', product_count: 2 }] }, scheduled_banners: []
        }, error: null };
      };
      return { single: run, then: (resolve, reject) => run().then(resolve, reject) };
    }
  };
  window.__PW_DB = db;
  window.__PW_CLIENT = client;
  window.__PW_STORAGE_MOVES = [];
  window.__PW_STORAGE_REMOVES = [];
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

test('Prompt 8 giriş ve owner MFA doğrulaması tamamlanmadan paneli açmaz', async ({ page }) => {
  await page.evaluate(() => {
    let aal = 'aal1';
    const session = { user: { id: '7590fe38-46b1-47dd-bd17-b83a0212e87c' }, expires_at: Math.floor(Date.now() / 1000) + 3600 };
    window.__PW_CLIENT.auth.signInWithPassword = async () => ({ data: { session }, error: null });
    window.__PW_CLIENT.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({ data: { currentLevel: aal }, error: null });
    window.__PW_CLIENT.auth.mfa.listFactors = async () => ({ data: { totp: [{ id: 'factor-1', status: 'verified' }] }, error: null });
    window.__PW_CLIENT.auth.mfa.challenge = async () => ({ data: { id: 'challenge-1' }, error: null });
    window.__PW_CLIENT.auth.mfa.verify = async ({ code }) => {
      if (code !== '123456') return { data: null, error: { message: 'invalid code' } };
      aal = 'aal2';
      return { data: { session }, error: null };
    };
    showAdminLogin('');
  });
  await page.fill('#admin-email', 'owner@example.test');
  await page.fill('#admin-pw', 'test-password-not-a-secret');
  await page.click('#admin-login-btn');
  await expect(page.locator('#admin-panel')).not.toHaveClass(/show/);
  await expect(page.locator('#admin-mfa-challenge')).not.toHaveClass(/admin-auth-hidden/);
  await page.fill('#admin-mfa-code', '123456');
  await page.click('#admin-mfa-verify');
  await expect(page.locator('#admin-panel')).toHaveClass(/show/);
  await expect(page.locator('#admin-user-mfa')).toHaveText('MFA doğrulandı');
});

test('Prompt 8 editör owner ekranını göremez ve değişiklik geçmişi güvenli ayrıntıyı gösterir', async ({ page }) => {
  await page.evaluate(() => {
    window.__PW_DB.admin_audit_log = [{
      id: 1, table_name: 'products', row_id: '7', action: 'update', actor_id: '7590fe38-46b1-47dd-bd17-b83a0212e87c',
      summary: 'Ürün: Test Kolonyası', changes: { price: { old: 30, new: 38 }, description: { changed: true } }, created_at: new Date().toISOString()
    }];
  });
  await page.click('[data-view="history"]');
  await expect(page.locator('#audit-list')).toContainText('Ürün: Test Kolonyası');
  await page.click('[data-audit-id="1"]');
  await expect(page.getByRole('dialog')).toContainText('30 → 38');
  await expect(page.getByRole('dialog')).toContainText('Değişti (gizli veya büyük alan)');
  await page.click('[data-audit-close]');

  await page.evaluate(() => {
    adminAuthProfile = { user_id: 'editor-1', display_name: 'Test Editor', role: 'editor', is_active: true };
    adminMfaLevel = 'aal1';
    renderAdminIdentity(adminAuthProfile);
  });
  await expect(page.locator('[data-view="admins"]')).toBeHidden();
  await page.evaluate(() => adminOpenView('admins'));
  await expect(page.locator('#view-admins')).not.toHaveClass(/show/);
  await expect(page.getByRole('dialog', { name: 'Yönetici yetkisi gerekli' })).toBeVisible();
});

test('Prompt 8 görünür yönetim kontrollerinin erişilebilir adı vardır', async ({ page }) => {
  for (const view of ['dashboard', 'products', 'media', 'collections', 'categories', 'banner', 'settings', 'reports', 'history']) {
    await page.evaluate(name => window.adminOpenView(name), view);
    const missing = await page.locator(`#view-${view} button:visible, #view-${view} input:visible, #view-${view} select:visible, #view-${view} textarea:visible`).evaluateAll(nodes => nodes.filter(node => {
      const label = node.id && document.querySelector(`label[for="${CSS.escape(node.id)}"]`);
      const wrapped = node.closest('label');
      return !String(node.getAttribute('aria-label') || node.getAttribute('aria-labelledby') || node.textContent || node.getAttribute('placeholder') || label?.textContent || wrapped?.textContent || '').trim();
    }).map(node => node.outerHTML.slice(0, 180)));
    expect(missing, view).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.adminOpenView('dashboard'));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('boş Supabase durumunda yönetim paneli açılır ve Firebase ağı kullanılmaz', async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex,nofollow/);
  const dashboard=page.locator('#dashboard-admin');
  await expect(dashboard.locator('.pg-stat')).toHaveCount(4);
  for(const stat of await dashboard.locator('.pg-stat').all())await expect(stat).toContainText('0');
  await expect(dashboard).toContainText('Henüz güncelleme yok.');

  await page.click('[data-view="products"]');
  await expect(page.locator('#product-list-status')).toContainText('0 filtreli sonuç.');
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
  expect([...hosts]).toEqual([new URL(page.url()).host]);
  expect(urls.some(url=>/firebase|firestore|firebasejs|googleapis|gstatic/i.test(url))).toBe(false);
  expect(pageErrors.get(page)).toEqual([]);
  expect(pageConsoleErrors.get(page)).toEqual([]);
});

test('Analiz ekranı anonim toplamları ve talep hunisini gösterir', async ({ page }) => {
  await page.click('[data-view="analytics"]');
  await expect(page.locator('#analytics-admin .analytics-stats')).toContainText('50');
  await expect(page.locator('#analytics-admin')).toContainText('Sayfa görüntüleme');
  await expect(page.locator('#analytics-admin')).toContainText('WhatsApp talebi');
  await expect(page.locator('#analytics-admin')).toContainText('Instagram');
  await expect(page.locator('#analytics-admin')).toContainText('Mobil');
  await expect(page.locator('#analytics-admin')).toContainText('Görselli Ürün');
  await expect(page.locator('#analytics-admin')).not.toContainText('Ziyaretçi');
});

test('görsel arşivleme önce dosyayı taşır, kalıcı silme iki onay ister', async ({ page }) => {
  await page.click('[data-view="media"]');
  await expect(page.locator('#media-library-status')).toContainText('3 görsel bulundu.');
  await expect(page.locator('[data-media-archive="2"]')).toBeVisible();
  await page.click('[data-media-archive="2"]');
  await expect(page.getByRole('dialog', { name: 'Görseli arşivle' })).toBeVisible();
  await page.click('[data-dialog-confirm]');
  await expect(page.locator('#media-library-status')).toContainText('2 görsel bulundu.');
  await page.selectOption('#media-filter', 'archived');
  await expect(page.locator('#media-library-status')).toContainText('1 görsel bulundu.');
  await expect(page.locator('[data-media-delete="2"]')).toBeVisible();
  expect(await page.evaluate(() => window.__PW_STORAGE_MOVES)).toEqual([{ from: 'story/b.webp', to: 'archive/story/b.webp' }]);

  await page.click('[data-media-delete="2"]');
  await expect(page.getByRole('dialog', { name: 'Kalıcı silme' })).toBeVisible();
  await page.click('[data-dialog-confirm]');
  await expect(page.getByRole('dialog', { name: 'Son onay' })).toBeVisible();
  await page.click('[data-dialog-confirm]');
  await expect(page.locator('#media-library-status')).toContainText('0 görsel bulundu.');
  expect(await page.evaluate(() => window.__PW_STORAGE_REMOVES)).toEqual(['archive/story/b.webp']);
  expect(await page.evaluate(() => window.__PW_DB.media_assets.some(asset => asset.id === 2))).toBe(false);
});

test('Raporlar CSV dosyasını BOM, ayraç ve formül korumasıyla indirir', async ({ page }) => {
  await page.evaluate(() => {
    Object.assign(window.__PW_DB.products[0], { name: '=FORMÜL', sku: '+KOL-001', price: 38, is_price_visible: true, is_quote_only: false, min_quantity: 25, quantity_step: 25 });
    Object.assign(window.__PW_DB.products[1], { sku: 'KOL-002', price: null, is_price_visible: true, is_quote_only: true, min_quantity: 50, quantity_step: 25 });
  });
  await page.click('[data-view="reports"]');
  await expect(page.locator('#reports-admin')).toContainText('Fiyat listesi');
  await page.click('[data-report="price"]');
  await expect(page.locator('#reports-status')).toContainText('2 satır hazır.');
  await expect(page.locator('.reports-table')).toHaveAttribute('class', /reports-table/);
  await expect(page.locator('.reports-table caption')).toHaveText('Fiyat listesi');
  const downloadPromise=page.waitForEvent('download');
  await page.click('#reports-csv');
  const download=await downloadPromise,path=await download.path(),content=await readFile(path,'utf8');
  expect(content.charCodeAt(0)).toBe(0xFEFF);
  expect(content).toContain('Ürün;SKU;Kategori;Fiyat;Minimum adet;Adet artışı');
  expect(content).toContain("'=FORMÜL;'+KOL-001;Kolonya;38,00;25;25");
  expect(content).toContain('Teklif');
  await expect(page.locator('#reports-status')).toHaveAttribute('aria-live','polite');
});

test('yasal content_sections taslak kalır ve hukukçu onayı olmadan yayımlanamaz', async ({ page }) => {
  await page.click('[data-view="legal"]');
  await page.setViewportSize({width:390,height:844});
  const section=page.locator('[data-section="legal_privacy"]');
  await expect(section).toContainText('Henüz yok · taslak bekleniyor');
  await section.locator('[data-f="title"]').fill('Gizlilik Politikası');
  await section.locator('[data-f="body"]').fill('Hukuk danışmanı onayı bekliyor. [TAMAMLANACAK]');
  await section.locator('[data-pg-preview]').click();
  await page.locator('[data-pg-approve]').click();
  await section.locator('[data-pg-publish]').click();
  await expect(section.locator('[data-pg-status]')).toContainText('Hukuk danışmanı son sürümü onaylamadan');

  await section.locator('[data-f="legal_approved"]').check();
  await section.locator('[data-pg-preview]').click();
  await page.locator('[data-pg-approve]').click();
  await section.locator('[data-pg-publish]').click();
  await expect(section.locator('[data-pg-status]')).toContainText('uyarısını ve tamamlanacak alanları kaldırın');

  await section.locator('[data-f="body"]').fill('Veri sorumlusu bilgileri ve uygulanan süreçler hakkında bilgilendirme metni.');
  await section.locator('[data-pg-preview]').click();
  await page.locator('[data-pg-approve]').click();
  await section.locator('[data-pg-publish]').click();
  await expect.poll(() => page.evaluate(() => window.__PW_DB.content_sections.find(row => row.section_key === 'legal_privacy')?.is_active)).toBe(true);
  expect(await page.evaluate(() => window.__PW_DB.content_sections.find(row => row.section_key === 'legal_privacy')?.content_json.legal_review_approved)).toBe(true);
  const dimensions=await page.evaluate(()=>({body:document.body.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport+1);
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
  await expect(dashboard).toContainText('Yayındaki ürün');
  await expect(dashboard.locator('.pg-stat').first()).toContainText('2');
  await expect(dashboard).toContainText('Katalog sağlığı');
  await expect(dashboard.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow','50');
  await expect(dashboard).toContainText('Ana görseli eksik ürünler');
  await expect(dashboard).toContainText('Görselsiz Ürün');
  await expect(dashboard).toContainText('Alt metni eksik görseller');
  await expect(dashboard).toContainText('altsiz.webp');
  await expect(dashboard).toContainText('Kullanılmayan görseller');
  await expect(dashboard).toContainText('Taslak');
  await expect(dashboard).toContainText('Son değişiklikler');
  await dashboard.locator('[data-dash-product="2"]').first().click();
  await expect(page.locator('#view-add')).toHaveClass(/show/);
  await expect(page.locator('#pf-name')).toHaveValue('Görselsiz Ürün');
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
  await page.click('#banner-admin [data-media-picker]');
  await page.click('[data-picker-id="3"]');
  await page.click('[data-picker-apply]');
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

  await page.click('#reviews-admin [data-pg-off]');
  await expect(page.getByRole('dialog', { name: 'Yayından kaldır' })).toBeVisible();
  await page.click('[data-dialog-confirm]');
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

test('Prompt 2 yönetim kabuğu, gezinme ve tüm ekranlar dört genişlikte taşmaz', async ({ page }) => {
  test.setTimeout(120_000);
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href', /assets\/css\/admin\.css\?v=\d{8}-prompt\d+$/);
  await expect(page.locator('#admin-user-name')).toHaveText('Test Owner');
  await expect(page.locator('#admin-user-role')).toHaveText('Owner');
  await expect(page.locator('#admin-user-mfa')).toHaveText('MFA doğrulandı');

  await page.fill('#admin-global-search', 'KOL-001');
  await page.press('#admin-global-search', 'Enter');
  await expect(page.locator('#view-products')).toHaveClass(/show/);
  await expect(page.locator('#admin-search')).toHaveValue('KOL-001');

  await page.click('[data-view="analytics"]');
  await expect(page.locator('#view-analytics')).toContainText(/Analiz|Analitik kapalı|Henüz veri yok/);
  await expect(page.locator('.admin-tabs [data-view="analytics"]')).toHaveAttribute('aria-current', 'page');

  const views = ['dashboard','analytics','reports','products','add','media','collections','categories','banner','home','content','campaign','reviews','faq','legal','settings','admins','history'];
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of views) {
      await page.evaluate(name => window.adminOpenView(name), view);
      await expect(page.locator(`#view-${view}`)).toHaveClass(/show/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${width}px / ${view}`).toBeLessThanOrEqual(1);
      await page.screenshot({ path: `${SHOT_DIR}/${width}-${view}.png`, animations: 'disabled' });
    }
  }

  const hasSiteStylesheet = await page.locator('link[rel="stylesheet"][href*="site.css"]').count();
  expect(hasSiteStylesheet).toBe(0);
  expect(pageConsoleErrors.get(page)).toEqual([]);
  expect(pageErrors.get(page)).toEqual([]);
});

test('Prompt 2 renk çiftleri WCAG AA metin kontrastını karşılar', async ({ page }) => {
  const ratios = await page.evaluate(() => {
    function rgb(hex) { const value = hex.replace('#',''); return [0,2,4].map(index => parseInt(value.slice(index,index+2),16) / 255); }
    function lum(hex) { return rgb(hex).map(value => value <= .03928 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4)).reduce((sum,value,index) => sum + value * [.2126,.7152,.0722][index], 0); }
    function ratio(a,b) { const values=[lum(a),lum(b)].sort((x,y)=>y-x); return (values[0]+.05)/(values[1]+.05); }
    return { body: ratio('#14201B','#F3F4F1'), muted: ratio('#5A665F','#FFFFFF'), accent: ratio('#0F5C4D','#FFFFFF'), warning: ratio('#8A5200','#FFF3DC'), danger: ratio('#B3261E','#FDECEA'), success: ratio('#17653F','#E4F4EA') };
  });
  Object.entries(ratios).forEach(([name, ratio]) => expect(ratio, name).toBeGreaterThanOrEqual(4.5));
});
