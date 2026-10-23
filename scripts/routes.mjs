/* Herkese açık adres şeması. Sitemap, sayfa üreticisi ve testler buradan okur.
   Adresler kalıcıdır: bir slug yayına çıktıktan sonra değiştirilirse adres kırılır. */

import { resolveSiteOrigin } from './site-config.mjs';

export const canonicalOrigin = resolveSiteOrigin();

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLLECTION_SUFFIX = '-hediyelikleri';

/* Kök dizinde kategori adresiyle çakışmaması gereken adlar. */
export const RESERVED_ROOT_SEGMENTS = new Set([
  'admin', 'api', 'assets', 'backups', 'docs', 'iletisim', 'node_modules',
  'robots', 'scripts', 'sitemap', 'supabase', 'test-results', 'tests', 'urun'
]);

function normalizeSlug(slug, label) {
  const value = String(slug == null ? '' : slug).trim().toLowerCase();
  if (!SLUG_PATTERN.test(value)) {
    throw new Error(label + ' slug\'ı yalnızca küçük harf, rakam ve tire içerebilir: ' + JSON.stringify(slug));
  }
  return value;
}

export function collectionPath(slug) {
  const value = normalizeSlug(slug, 'Koleksiyon');
  if (value.endsWith(COLLECTION_SUFFIX)) {
    throw new Error('Koleksiyon slug\'ı "' + COLLECTION_SUFFIX + '" ile bitmemeli: ' + value);
  }
  return '/' + value + COLLECTION_SUFFIX + '/';
}

export function categoryPath(slug) {
  const value = normalizeSlug(slug, 'Kategori');
  if (RESERVED_ROOT_SEGMENTS.has(value)) {
    throw new Error('Kategori slug\'ı ayrılmış bir adla çakışıyor: ' + value);
  }
  if (value.endsWith(COLLECTION_SUFFIX)) {
    throw new Error('Kategori slug\'ı koleksiyon adresiyle çakışıyor: ' + value);
  }
  return '/' + value + '/';
}

export function productPath(slug) {
  return '/urun/' + normalizeSlug(slug, 'Ürün') + '/';
}

export const homePath = '/';
export const contactPath = '/iletisim/';

export function absoluteUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) throw new Error('Adres "/" ile başlamalıdır: ' + path);
  return canonicalOrigin + path;
}

/* Adres yolundan sayfa türünü çözer; assets/js/routes.js ile aynı kurallar.
   İkisinin aynı kaldığı tests/routes.test.mjs içinde doğrulanır. */
export function parsePath(pathname) {
  const parts = String(pathname == null ? '' : pathname).split('/').filter(part => part !== '');
  if (!parts.length) return { kind: 'home', slug: '' };
  if (parts.length === 1 && parts[0] === 'iletisim') return { kind: 'contact', slug: '' };
  if (parts.length === 2 && parts[0] === 'urun') {
    const product = parts[1];
    return SLUG_PATTERN.test(product) ? { kind: 'product', slug: product } : { kind: 'unknown', slug: '' };
  }
  if (parts.length !== 1) return { kind: 'unknown', slug: '' };
  const segment = parts[0];
  if (!SLUG_PATTERN.test(segment)) return { kind: 'unknown', slug: '' };
  if (segment.length > COLLECTION_SUFFIX.length && segment.endsWith(COLLECTION_SUFFIX)) {
    const collection = segment.slice(0, -COLLECTION_SUFFIX.length);
    return collection ? { kind: 'collection', slug: collection } : { kind: 'unknown', slug: '' };
  }
  if (RESERVED_ROOT_SEGMENTS.has(segment)) return { kind: 'unknown', slug: '' };
  return { kind: 'category', slug: segment };
}
