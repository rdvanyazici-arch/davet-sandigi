import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSitemapUrls, buildSitemapXml, fetchActiveSlugs, canonicalOrigin } from '../scripts/sitemap-core.mjs';

const endpoint = 'https://zdksvgtkeeweufuajugd.supabase.co';
const key = 'sb_publishable_test';

test('sitemap lists the homepage, collection, category, product and contact routes', () => {
  const urls = buildSitemapUrls(['nisan-kolonyasi', 'mum'], ['kolonya'], ['kina']);
  assert.deepEqual(urls, [
    canonicalOrigin + '/',
    canonicalOrigin + '/kina-hediyelikleri/',
    canonicalOrigin + '/kolonya/',
    canonicalOrigin + '/urun/nisan-kolonyasi/',
    canonicalOrigin + '/urun/mum/',
    canonicalOrigin + '/iletisim/'
  ]);
  const xml = buildSitemapXml(urls);
  assert.equal((xml.match(/<url>/g) || []).length, 6);
  assert.ok(xml.includes('<loc>' + canonicalOrigin + '/</loc>'));
});

test('sitemap skips slugs that cannot become a safe public route', () => {
  const urls = buildSitemapUrls(['nişan kolonyası', 'mum'], ['urun', 'kolonya'], ['kina-hediyelikleri', 'kina']);
  assert.deepEqual(urls, [
    canonicalOrigin + '/',
    canonicalOrigin + '/kina-hediyelikleri/',
    canonicalOrigin + '/kolonya/',
    canonicalOrigin + '/urun/mum/',
    canonicalOrigin + '/iletisim/'
  ]);
});

test('sitemap slug fetch filters active, non-archived rows and uses only a publishable key', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url: new URL(url), options });
    const rows = [
      { slug: 'active-one', is_active: true, archived_at: null },
      { slug: 'draft', is_active: false, archived_at: null },
      { slug: 'archived', is_active: true, archived_at: '2026-01-01T00:00:00Z' }
    ].filter(row => row.is_active && row.archived_at === null).map(row => ({ slug: row.slug }));
    return { ok: true, json: async () => rows };
  };
  const slugs = await fetchActiveSlugs({ endpoint, publishableKey: key, table: 'products', fetchImpl, pageSize: 100 });
  assert.deepEqual(slugs, ['active-one']);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url.searchParams.get('select'), 'slug');
  assert.equal(requests[0].url.searchParams.get('is_active'), 'eq.true');
  assert.equal(requests[0].url.searchParams.get('archived_at'), 'is.null');
  assert.equal(requests[0].options.headers.apikey, key);
  assert.equal('Authorization' in requests[0].options.headers, false);
  assert.equal('service_role' in requests[0].options.headers, false);
});

test('sitemap fetch rejects unapproved hosts and secret-key types', async () => {
  await assert.rejects(fetchActiveSlugs({ endpoint: 'https://other-project.supabase.co', publishableKey: key, table: 'products' }));
  await assert.rejects(fetchActiveSlugs({ endpoint, publishableKey: 'sb_secret_never', table: 'products' }));
});

test('fallback sitemap can be generated with homepage only when Supabase is unavailable', () => {
  const xml = buildSitemapXml(buildSitemapUrls([], []));
  assert.equal((xml.match(/<url>/g) || []).length, 2);
  assert.ok(xml.includes(canonicalOrigin + '/'));
  assert.doesNotMatch(xml, /\?urun=|\?kategori=|\?koleksiyon=/);
});
