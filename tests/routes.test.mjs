import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { absoluteUrl, canonicalOrigin, categoryPath, collectionPath, contactPath, homePath, parsePath, productPath } from '../scripts/routes.mjs';

test('public routes use keyword paths, not query parameters', () => {
  assert.equal(collectionPath('kina'), '/kina-hediyelikleri/');
  assert.equal(collectionPath('baby-shower'), '/baby-shower-hediyelikleri/');
  assert.equal(categoryPath('kolonya'), '/kolonya/');
  assert.equal(productPath('nisan-kolonyasi'), '/urun/nisan-kolonyasi/');
  assert.equal(contactPath, '/iletisim/');
  assert.equal(absoluteUrl('/kolonya/'), canonicalOrigin + '/kolonya/');
});

test('slugs outside the safe alphabet are rejected', () => {
  for (const bad of ['Nişan', 'nisan kolonyasi', 'nisan_kolonyasi', '-nisan', 'nisan-', '', null, '../etc', 'a//b']) {
    assert.throws(() => productPath(bad), /slug/i, 'kabul edilmemeliydi: ' + JSON.stringify(bad));
  }
});

test('a category slug cannot collide with a reserved segment or a collection route', () => {
  assert.throws(() => categoryPath('urun'), /ayrılmış/);
  assert.throws(() => categoryPath('iletisim'), /ayrılmış/);
  assert.throws(() => categoryPath('admin'), /ayrılmış/);
  assert.throws(() => categoryPath('kina-hediyelikleri'), /koleksiyon adresiyle/);
  assert.throws(() => collectionPath('kina-hediyelikleri'), /ile bitmemeli/);
});

test('canonical origin is https and carries no path', () => {
  const url = new URL(canonicalOrigin);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.pathname, '/');
  assert.equal(canonicalOrigin.endsWith('/'), false);
});

/* Tarayıcı tarafı (assets/js/routes.js) ile Node tarafı (scripts/routes.mjs) aynı
   adresleri üretmelidir. Biri değişip diğeri unutulursa canonical ile üretilen
   sayfanın adresi ayrışır ve aynı içerik iki adreste yayımlanmış olur. */
const browserScope = {};
new Function('window', readFileSync(new URL('../assets/js/routes.js', import.meta.url), 'utf8'))(browserScope);
const browserRoutes = browserScope.DS_ROUTES;

test('browser and build route helpers agree on every valid slug', () => {
  const cases = [
    ['collectionPath', collectionPath, ['kina', 'nisan', 'baby-shower', 'a1', 'cok-uzun-bir-slug-123']],
    ['categoryPath', categoryPath, ['kolonya', 'mum', 'yelpaze', 'kese', 'tarak', 'magnet']],
    ['productPath', productPath, ['kina-yelpazesi', 'mum', 'urun-12']]
  ];
  for (const [name, nodeFn, slugs] of cases) {
    for (const slug of slugs) {
      assert.equal(browserRoutes[name](slug), nodeFn(slug), name + '(' + slug + ') ayrıştı');
    }
  }
  assert.equal(browserRoutes.contactPath, contactPath);
  assert.equal(browserRoutes.homePath, '/');
});

test('browser helpers return an empty path exactly where the build helpers refuse', () => {
  const cases = [
    ['collectionPath', collectionPath, ['Nişan', 'bos luk', '', null, '../etc', 'kina-hediyelikleri']],
    ['categoryPath', categoryPath, ['urun', 'iletisim', 'admin', 'kina-hediyelikleri', 'BÜYÜK']],
    ['productPath', productPath, ['', ' ', 'a//b', 'slug_alt_cizgi']]
  ];
  for (const [name, nodeFn, slugs] of cases) {
    for (const slug of slugs) {
      assert.throws(() => nodeFn(slug), name + '(' + JSON.stringify(slug) + ') Node tarafında reddedilmeliydi');
      assert.equal(browserRoutes[name](slug), '', name + '(' + JSON.stringify(slug) + ') tarayıcıda boş dönmeliydi');
    }
  }
});

/* Ana sayfanın iç bağlantıları yapı sırasında bu işaretçilerin arasına yazılır.
   İşaretçiler silinirse botlar üretilen sayfaları ana sayfadan bulamaz. */
test('index.html iç bağlantı işaretçilerini taşır', () => {
  const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  ['collections', 'sitelinks'].forEach(key => {
    assert.ok(home.includes('<!--pages:' + key + ':start-->'), key + ' başlangıç işaretçisi yok');
    assert.ok(home.includes('<!--pages:' + key + ':end-->'), key + ' bitiş işaretçisi yok');
  });
});

/* Koleksiyon kartları ve footer bağlantıları gerçek adres taşımalı; aksi halde
   üretilen sayfalara ana sayfadan bağlantı kalmaz. */
test('koleksiyon kartları gerçek bağlantı üretir', () => {
  const catalog = readFileSync(new URL('../assets/js/catalog.js', import.meta.url), 'utf8');
  assert.match(catalog, /routeHref\('collectionPath',o\.slug\)/);
  assert.ok(!catalog.includes("<a href=\"#koleksiyonlar\" data-occ="), 'footer bağlantısı hâlâ sabit çapa kullanıyor');
});

/* Adres çözümleyicisi iki tarafta da aynı sonucu vermeli: tarayıcı hangi
   koleksiyonu açacağını, yapı hangi sayfayı üreteceğini buradan biliyor. */
test('adres çözümleyicisi tarayıcı ve yapı tarafında aynı sonucu verir', () => {
  const samples = ['/', '/iletisim/', '/kina-hediyelikleri/', '/kolonya/', '/urun/mum-seti/',
    '/admin/', '/assets/', '/urun/', '/bir/iki/uc/', '/BÜYÜK/', '/-hediyelikleri/', ''];
  samples.forEach(path => {
    assert.deepEqual(browserScope.DS_ROUTES.parsePath(path), parsePath(path), path || '(boş)');
  });
});

test('adres çözümleyicisi üretilen adresleri geri okur', () => {
  assert.deepEqual(parsePath(collectionPath('kina')), { kind: 'collection', slug: 'kina' });
  assert.deepEqual(parsePath(categoryPath('kolonya')), { kind: 'category', slug: 'kolonya' });
  assert.deepEqual(parsePath(productPath('mum-seti')), { kind: 'product', slug: 'mum-seti' });
  assert.deepEqual(parsePath(contactPath), { kind: 'contact', slug: '' });
  assert.deepEqual(parsePath(homePath), { kind: 'home', slug: '' });
});
