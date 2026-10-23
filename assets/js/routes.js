/* Herkese açık adres şeması — scripts/routes.mjs ile aynı kuralları uygular.
   İki tarafın uyumu tests/routes.test.mjs içinde doğrulanır.
   Fark: geçersiz slug'da hata fırlatmaz, boş dize döner. Tarayıcıda bir kaydın
   bozuk slug'ı yüzünden sayfanın tamamı çalışmaz hale gelmemeli. */
(function (root) {
  var SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var SUFFIX = '-hediyelikleri';
  var RESERVED = ['admin', 'api', 'assets', 'backups', 'docs', 'iletisim', 'node_modules',
    'robots', 'scripts', 'sitemap', 'supabase', 'test-results', 'tests', 'urun'];

  function clean(slug) {
    var value = String(slug == null ? '' : slug).trim().toLowerCase();
    return SLUG.test(value) ? value : '';
  }
  function endsWithSuffix(value) {
    return value.length > SUFFIX.length && value.slice(-SUFFIX.length) === SUFFIX;
  }
  function collectionPath(slug) {
    var value = clean(slug);
    if (!value || endsWithSuffix(value)) return '';
    return '/' + value + SUFFIX + '/';
  }
  function categoryPath(slug) {
    var value = clean(slug);
    if (!value || RESERVED.indexOf(value) > -1 || endsWithSuffix(value)) return '';
    return '/' + value + '/';
  }
  function productPath(slug) {
    var value = clean(slug);
    return value ? '/urun/' + value + '/' : '';
  }
  /* Adres yolundan sayfa türünü çözer: üretilen sayfaya doğrudan girildiğinde
     site hangi koleksiyonun açılacağını buradan öğrenir. Kurallar yukarıdaki
     üreticilerin tersidir. */
  function parsePath(pathname) {
    var path = String(pathname == null ? '' : pathname);
    var parts = path.split('/').filter(function (part) { return part !== ''; });
    if (!parts.length) return { kind: 'home', slug: '' };
    if (parts.length === 1 && parts[0] === 'iletisim') return { kind: 'contact', slug: '' };
    if (parts.length === 2 && parts[0] === 'urun') {
      var product = clean(parts[1]);
      return product ? { kind: 'product', slug: product } : { kind: 'unknown', slug: '' };
    }
    if (parts.length !== 1) return { kind: 'unknown', slug: '' };
    var segment = clean(parts[0]);
    if (!segment) return { kind: 'unknown', slug: '' };
    if (endsWithSuffix(segment)) {
      var collection = segment.slice(0, -SUFFIX.length);
      return collection ? { kind: 'collection', slug: collection } : { kind: 'unknown', slug: '' };
    }
    if (RESERVED.indexOf(segment) > -1) return { kind: 'unknown', slug: '' };
    return { kind: 'category', slug: segment };
  }

  root.DS_ROUTES = {
    collectionPath: collectionPath,
    categoryPath: categoryPath,
    productPath: productPath,
    parsePath: parsePath,
    homePath: '/',
    contactPath: '/iletisim/'
  };
})(typeof window !== 'undefined' ? window : this);
