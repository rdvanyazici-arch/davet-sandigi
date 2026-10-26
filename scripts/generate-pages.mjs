/* Build sırasında Supabase'deki yayındaki içerikten gerçek HTML sayfaları üretir.
   Amaç üç katlı: adreslerde hedef kelime, sayfa başına ayrı başlık/açıklama ve
   JavaScript çalıştırmayan tarayıcıların (yapay zeka botları) okuyabileceği dolu HTML.

   Supabase'e ulaşılamazsa hiçbir sayfa silinmez ve yapı durdurulmaz. */

import { mkdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { approvedSupabaseHost } from './sitemap-core.mjs';
import { buildHomeBlocks, buildPages, derivePage, injectHome, normalizeProducts, notFoundPage } from './page-builder.mjs';

const root = process.cwd();
const manifestPath = resolve(root, '.generated-pages.json');

async function loadConfig() {
  const source = await readFile(resolve(root, 'assets/js/supabase-config.generated.js'), 'utf8');
  const match = source.match(/Object\.freeze\((\{[^\n]+\})\);/);
  if (!match) throw new Error('Supabase tarayıcı yapılandırması üretilmemiş.');
  const value = JSON.parse(match[1]);
  const endpoint = new URL(value.SUPABASE_URL);
  if (endpoint.protocol !== 'https:' || endpoint.host !== approvedSupabaseHost) throw new Error('Yalnızca onaylı Supabase projesi okunabilir.');
  if (!String(value.SUPABASE_PUBLISHABLE_KEY || '').startsWith('sb_publishable_')) throw new Error('Publishable key gereklidir.');
  return { origin: endpoint.origin, key: value.SUPABASE_PUBLISHABLE_KEY };
}

async function query(config, table, params) {
  const url = new URL('/rest/v1/' + table, config.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { apikey: config.key, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(table + ' HTTP ' + response.status);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error(table + ' beklenmeyen yanıt döndürdü.');
  return rows;
}

const MEDIA = 'storage_path,alt_text,width,height';
const LIVE = { is_active: 'eq.true', archived_at: 'is.null' };

async function loadCatalog(config) {
  const [settingsRows, collections, categories, products, sections, banners, faqs] = await Promise.all([
    query(config, 'site_settings_public', { select: 'brand_name,whatsapp_number,instagram_url,phone,email,delivery_text,shipping_note,address_locality,address_region', id: 'eq.1', limit: '1' }),
    query(config, 'collections', { ...LIVE, select: 'id,slug,name,short_description,media_assets!cover_media_id(' + MEDIA + ')', order: 'sort_order.asc,id.asc' }),
    query(config, 'categories', { ...LIVE, select: 'id,slug,name,description,category_collections(collection_id)', order: 'sort_order.asc,id.asc' }),
    query(config, 'products', { ...LIVE, select: 'id,slug,sku,name,short_description,description,price,is_price_visible,is_quote_only,min_quantity,quantity_step,category_id,product_collections(collection_id),product_images(alt_text,sort_order,is_primary,media_assets(' + MEDIA + '))', order: 'sort_order.asc,id.asc', limit: '1000' }),
    query(config, 'content_sections', { is_active: 'eq.true', select: 'section_key,eyebrow,title,body,content_json,media_assets!media_id(' + MEDIA + ')' }),
    query(config, 'banners', { is_active: 'eq.true', select: 'eyebrow,title,description,primary_button_text,primary_button_url,secondary_button_text,secondary_button_url,starts_at,ends_at,media_assets!media_id(' + MEDIA + ')', order: 'sort_order.asc,id.asc' }),
    query(config, 'faqs', { is_active: 'eq.true', select: 'question,answer', order: 'sort_order.asc,id.asc' })
  ]);
  const sectionsByKey = {};
  sections.forEach(row => { if (row.section_key) sectionsByKey[row.section_key] = row; });
  return {
    settings: settingsRows[0] || {},
    collections, categories, banners, faqs,
    sections: sectionsByKey,
    products: normalizeProducts(products),
    legal: sections.filter(row => String(row.section_key || '').startsWith('legal_'))
  };
}

async function readManifest() {
  try { return JSON.parse(await readFile(manifestPath, 'utf8')); } catch { return { files: [] }; }
}

let config;
try { config = await loadConfig(); }
catch (error) { console.warn('[pages] Yapılandırma okunamadı, sayfa üretilmedi: ' + error.message); process.exit(0); }

let data;
try { data = await loadCatalog(config); }
catch (error) { console.warn('[pages] Katalog çekilemedi, mevcut sayfalara dokunulmadı: ' + error.message); process.exit(0); }

const { pages, siteLinks } = buildPages(data, config.origin);

/* Önce ana sayfa yazılır; alt sayfalar onun üzerinden türetildiği için footer
   bağlantıları ve gömülü içerik her yere aynı anda işlenmiş olur. */
const homeFile = resolve(root, 'index.html');
const home = await readFile(homeFile, 'utf8');
const nextHome = injectHome(home, buildHomeBlocks(data, siteLinks, config.origin));
if (nextHome !== home) await writeFile(homeFile, nextHome, 'utf8');

const written = [];
for (const page of pages) {
  const file = join(page.path.replace(/^\/+/, ''), 'index.html');
  await mkdir(dirname(resolve(root, file)), { recursive: true });
  await writeFile(resolve(root, file), derivePage(nextHome, page, data.settings), 'utf8');
  written.push(file);
}

/* Bulunamayan adresler için Vercel kökteki 404.html'i sunar. Manifest'e
   girmez: yayından kaldırma temizliği onu hiçbir zaman silmemeli. */
await writeFile(resolve(root, '404.html'), derivePage(nextHome, notFoundPage(siteLinks), data.settings), 'utf8');

/* Yayından kaldırılan kayıtların sayfaları geride kalmasın. */
const previous = await readManifest();
const stale = (previous.files || []).filter(file => !written.includes(file) && /^[^/]+(?:\/[^/]+)*\/index\.html$/.test(file));
for (const file of stale) {
  await rm(resolve(root, file), { force: true });
  /* rm bir dizini recursive olmadan silmez; rmdir yalnızca boş dizini siler,
     yani başka dosya varsa dokunmaz. Aksi hâlde geride boş klasörler kalıyordu. */
  await rmdir(dirname(resolve(root, file))).catch(() => {});
}

await writeFile(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), files: written.sort() }, null, 2) + '\n', 'utf8');
console.log('[pages] ' + written.length + ' sayfa üretildi, ' + stale.length + ' eski sayfa kaldırıldı.');
