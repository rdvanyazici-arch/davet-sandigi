export const canonicalOrigin = 'https://davet-sandigi.vercel.app';
export const approvedSupabaseHost = 'zdksvgtkeeweufuajugd.supabase.co';

export function publicSlugUrl(kind, slug) {
  if (!['urun', 'kategori', 'koleksiyon'].includes(kind) || typeof slug !== 'string' || !slug.trim()) throw new Error('A public route requires an active slug.');
  const url = new URL('/', canonicalOrigin);
  url.searchParams.set(kind, slug.trim());
  return url.href;
}

export function buildSitemapUrls(products, categories, collections = []) {
  return Array.from(new Set([
    canonicalOrigin + '/',
    ...products.map(slug => publicSlugUrl('urun', slug)),
    ...categories.map(slug => publicSlugUrl('kategori', slug)),
    ...collections.map(slug => publicSlugUrl('koleksiyon', slug))
  ]));
}

export function buildSitemapXml(urls) {
  const entries = Array.from(new Set(urls)).map(url => '  <url><loc>' + escapeXml(url) + '</loc></url>').join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + '\n</urlset>\n';
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function fetchActiveSlugs({ endpoint, publishableKey, table, fetchImpl = fetch, pageSize = 1000 }) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.host !== approvedSupabaseHost) throw new Error('Sitemap fetch is restricted to the approved Supabase project.');
  if (!String(publishableKey || '').startsWith('sb_publishable_')) throw new Error('Sitemap fetch requires a publishable key.');
  if (!['products', 'categories', 'collections'].includes(table)) throw new Error('Unsupported sitemap table.');

  const slugs = [];
  for (let offset = 0; ; offset += pageSize) {
    const requestUrl = new URL('/rest/v1/' + table, url.origin);
    requestUrl.searchParams.set('select', 'slug');
    requestUrl.searchParams.set('is_active', 'eq.true');
    requestUrl.searchParams.set('archived_at', 'is.null');
    requestUrl.searchParams.set('order', 'slug.asc');
    const response = await fetchImpl(requestUrl, {
      headers: { apikey: publishableKey, Range: offset + '-' + (offset + pageSize - 1), 'Range-Unit': 'items' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(table + ' returned HTTP ' + response.status);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error(table + ' returned an unexpected response.');
    rows.forEach(row => { if (typeof row.slug === 'string' && row.slug.trim()) slugs.push(row.slug.trim()); });
    if (rows.length < pageSize) break;
  }
  return slugs;
}
