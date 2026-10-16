import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { approvedSupabaseHost, buildSitemapUrls, buildSitemapXml, fetchActiveSlugs } from './sitemap-core.mjs';

const root = process.cwd();
const configPath = resolve(root, 'assets/js/supabase-config.generated.js');
const outputPath = resolve(root, 'sitemap.xml');

async function loadConfig() {
  const source = await readFile(configPath, 'utf8');
  const match = source.match(/Object\.freeze\((\{[^\n]+\})\);/);
  if (!match) throw new Error('Supabase runtime config was not generated.');
  const value = JSON.parse(match[1]);
  const endpoint = new URL(value.SUPABASE_URL);
  if (endpoint.protocol !== 'https:' || endpoint.host !== approvedSupabaseHost) throw new Error('Sitemap may only read the approved Davet Sandığı Supabase project.');
  if (!String(value.SUPABASE_PUBLISHABLE_KEY || '').startsWith('sb_publishable_')) throw new Error('A Supabase publishable key is required to build the sitemap.');
  return { endpoint: endpoint.origin, key: value.SUPABASE_PUBLISHABLE_KEY };
}

let productSlugs = [];
let categorySlugs = [];
try {
  const config = await loadConfig();
  [productSlugs, categorySlugs] = await Promise.all([
    fetchActiveSlugs({ endpoint: config.endpoint, publishableKey: config.key, table: 'products' }),
    fetchActiveSlugs({ endpoint: config.endpoint, publishableKey: config.key, table: 'categories' })
  ]);
} catch (error) {
  console.warn('[sitemap] Public catalog could not be fetched; writing homepage-only sitemap:', error.message);
}

const urls = buildSitemapUrls(productSlugs, categorySlugs);
await writeFile(outputPath, buildSitemapXml(urls), 'utf8');
console.log('[sitemap] Wrote ' + urls.length + ' public URLs (' + productSlugs.length + ' products, ' + categorySlugs.length + ' categories).');
