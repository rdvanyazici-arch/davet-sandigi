/* Katalog verisinden sayfa tanımlarını üretir. Saf fonksiyon: ağ, dosya veya
   ortam erişimi yok, bu yüzden sabit verilerle test edilebilir. */

import { absoluteUrl, categoryPath, collectionPath, contactPath, homePath, productPath } from './routes.mjs';
import { resolveFaq } from './faq-resolve.mjs';
import { breadcrumb, esc, image, jsonLd, mediaUrl, money, productCard, publicPlace, whatsappLink } from './page-templates.mjs';

/* Instagram adresini okunur bir kullanıcı adına indirger; adres bozuksa
   olduğu gibi gösterir, böylece bilgi kaybolmaz. */
function instagramHandle(url) {
  try {
    const name = new URL(url).pathname.split('/').filter(Boolean)[0];
    return name ? '@' + name : url;
  } catch {
    return url;
  }
}

/* Ürün görsellerini ana görsel önce olacak şekilde sıralar ve koleksiyon kimliklerini düzleştirir. */
export function normalizeProducts(products) {
  return (products || []).map(product => {
    const images = (product.product_images || []).slice()
      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order - b.sort_order));
    const gallery = images
      .map(entry => entry.media_assets ? { ...entry.media_assets, alt_text: entry.alt_text || entry.media_assets.alt_text } : null)
      .filter(asset => asset && asset.storage_path);
    return {
      ...product,
      gallery,
      primaryImage: gallery[0] || null,
      collectionIds: (product.product_collections || []).map(row => Number(row.collection_id))
    };
  });
}

function skip(label, error) { console.warn('[pages] ' + label + ' atlandı: ' + error.message); }

export function buildPages(data, supabaseUrl) {
  const { settings, collections, categories, products } = data;
  const pages = [];
  const nav = [{ name: 'Ana sayfa', path: homePath }];
  const legalLinks = [];

  const liveCollections = [];
  for (const collection of collections) {
    try { liveCollections.push({ ...collection, path: collectionPath(collection.slug) }); }
    catch (error) { skip('koleksiyon ' + collection.slug, error); }
  }
  const liveCategories = [];
  for (const category of categories) {
    try { liveCategories.push({ ...category, path: categoryPath(category.slug) }); }
    catch (error) { skip('kategori ' + category.slug, error); }
  }
  liveCollections.forEach(collection => nav.push({ name: collection.name, path: collection.path }));
  nav.push({ name: 'İletişim', path: contactPath });

  const productsIn = ids => products.filter(product => product.collectionIds.some(id => ids.includes(id)));
  const categoryNames = new Map(liveCategories.map(item => [Number(item.id), item.name]));
  const grid = list => list.length
    ? '<div class="prod-grid">' + list.map(product => productCard(product, supabaseUrl, categoryNames.get(Number(product.category_id)))).join('') + '</div>'
    : '<p class="pg-empty">Bu bölümde şu anda yayında ürün bulunmuyor. Yeni ürünler için Instagram hesabımızı takip edebilirsiniz.</p>';

  for (const collection of liveCollections) {
    const list = productsIn([Number(collection.id)]);
    const crumb = breadcrumb([{ name: 'Ana sayfa', path: homePath }, { name: collection.name, path: collection.path }]);
    const description = (collection.short_description || '').trim()
      || collection.name + ' için kişiye özel hediyelikler. Kendi atölyemizde el emeğiyle hazırlanır, Türkiye geneli kargo.';
    pages.push({
      path: collection.path,
      title: collection.name + ' Hediyelikleri | Davet Sandığı',
      description,
      image: mediaUrl(supabaseUrl, collection.media_assets),
      schemas: [crumb.schema, { '@context': 'https://schema.org', '@type': 'CollectionPage', name: collection.name, description, url: absoluteUrl(collection.path) }],
      body: crumb.html + '<div class="section-head"><div class="ornament"><span class="eyebrow">' + 'Koleksiyon' + '</span></div><h1>' + esc(collection.name) + ' Hediyelikleri' + '</h1><p>' + esc(description) + '</p></div>' + grid(list)
    });
  }

  for (const category of liveCategories) {
    const list = products.filter(product => Number(product.category_id) === Number(category.id));
    const crumb = breadcrumb([{ name: 'Ana sayfa', path: homePath }, { name: category.name, path: category.path }]);
    const description = (category.description || '').trim()
      || 'Kişiye özel ' + category.name.toLocaleLowerCase('tr-TR') + ' modelleri. İsim ve tarih sizin, üretim bizim atölyemizde.';
    pages.push({
      path: category.path,
      title: 'Kişiye Özel ' + category.name + ' | Davet Sandığı',
      description,
      schemas: [crumb.schema, { '@context': 'https://schema.org', '@type': 'CollectionPage', name: category.name, description, url: absoluteUrl(category.path) }],
      body: crumb.html + '<div class="section-head"><div class="ornament"><span class="eyebrow">' + 'Kategori' + '</span></div><h1>' + 'Kişiye Özel ' + esc(category.name) + '</h1><p>' + esc(description) + '</p></div>' + grid(list)
    });
  }

  for (const product of products) {
    let path;
    try { path = productPath(product.slug); } catch (error) { skip('ürün ' + product.slug, error); continue; }
    const parent = liveCollections.find(collection => product.collectionIds.includes(Number(collection.id)))
      || liveCategories.find(category => Number(category.id) === Number(product.category_id));
    const crumb = breadcrumb([
      { name: 'Ana sayfa', path: homePath },
      ...(parent ? [{ name: parent.name, path: parent.path }] : []),
      { name: product.name, path }
    ]);
    const media = mediaUrl(supabaseUrl, product.primaryImage);
    const description = (product.short_description || product.description || '').trim().slice(0, 300)
      || product.name + ' — kişiye özel hazırlanan davet hediyeliği.';
    const priceText = product.is_quote_only ? 'Özel fiyat teklifi'
      : product.is_price_visible === false ? 'Fiyat için iletişime geçin'
      : money(product.price) || 'Fiyat için iletişime geçin';
    const offer = (!product.is_quote_only && product.is_price_visible !== false && Number(product.price) >= 0)
      ? { '@type': 'Offer', price: Number(product.price).toFixed(2), priceCurrency: 'TRY', availability: 'https://schema.org/InStock', url: absoluteUrl(path) }
      : null;
    const wa = whatsappLink(settings, 'Merhaba, "' + product.name + '" ürünü hakkında bilgi almak istiyorum.');
    const rules = [];
    if (Number(product.min_quantity) > 1) rules.push('Minimum ' + Number(product.min_quantity) + ' adet');
    if (Number(product.quantity_step) > 1) rules.push(Number(product.quantity_step) + ' adet artışla');
    pages.push({
      path,
      title: product.name + ' | Davet Sandığı',
      description,
      image: media,
      ogType: 'product',
      schemas: [crumb.schema, {
        '@context': 'https://schema.org', '@type': 'Product', name: product.name, description,
        ...(product.sku ? { sku: product.sku } : {}),
        ...(media ? { image: media.src } : {}),
        brand: { '@type': 'Brand', name: 'Davet Sandığı' },
        ...(offer ? { offers: offer } : {})
      }],
      body: crumb.html + '<article class="pg-product">'
        + '<div class="pg-product-media">' + image(media, '(max-width: 760px) 100vw, 50vw', true) + '</div>'
        + '<div class="pg-product-body"><h1>' + esc(product.name) + '</h1>'
        + (product.sku ? '<p class="pg-sku">Ürün kodu: ' + esc(product.sku) + '</p>' : '')
        + '<p class="pg-price">' + esc(priceText) + '</p>'
        + (product.description ? '<p>' + esc(product.description) + '</p>' : product.short_description ? '<p>' + esc(product.short_description) + '</p>' : '')
        + (rules.length ? '<p class="pg-rule">' + esc(rules.join(' · ')) + '</p>' : '')
        + (settings.delivery_text ? '<p class="pg-rule">' + esc(settings.delivery_text) + '</p>' : '')
        + '<p class="pg-actions">'
        + (wa ? '<a class="btn btn-primary" href="' + esc(wa) + '" rel="noopener noreferrer">WhatsApp\'tan Sipariş Talebi</a>' : '')
        + '<a class="btn" href="' + homePath + '?urun=' + encodeURIComponent(product.slug) + '">Katalogda incele</a>'
        + '</p></div></article>'
    });
  }

  const contactCrumb = breadcrumb([{ name: 'Ana sayfa', path: homePath }, { name: 'İletişim', path: contactPath }]);
  /* İletişim bilgileri sitenin kart diliyle gösterilir: her biri tıklanabilir,
     ham adres yerine ne yapacağını söyleyen bir etiket taşır. */
  const contactCards = [];
  const contactWa = whatsappLink(settings, 'Merhaba, sipariş talebimi iletmek istiyorum.');
  if (contactWa) contactCards.push({ label: 'WhatsApp', value: 'Sipariş talebi gönderin', href: contactWa, external: true });
  if (settings.phone) contactCards.push({ label: 'Telefon', value: settings.phone, href: 'tel:' + String(settings.phone).replace(/[^+0-9]/g, '') });
  if (settings.email) contactCards.push({ label: 'E-posta', value: settings.email, href: 'mailto:' + settings.email });
  if (settings.instagram_url) contactCards.push({ label: 'Instagram', value: instagramHandle(settings.instagram_url), href: settings.instagram_url, external: true });
  const contactPlace = publicPlace(settings);
  if (contactPlace) contactCards.push({ label: 'Konum', value: contactPlace.locality + ' / ' + contactPlace.region });
  pages.push({
    path: contactPath,
    title: 'İletişim | Davet Sandığı',
    description: 'Davet Sandığı ile iletişim: WhatsApp, Instagram ve e-posta. Nişan, kına ve baby shower hediyelikleri için sipariş talebinizi iletin.',
    schemas: [contactCrumb.schema, {
      '@context': 'https://schema.org', '@type': 'Organization',
      name: settings.brand_name || 'Davet Sandığı',
      url: absoluteUrl(homePath),
      description: 'Nişan, kına ve baby shower için kişiye özel hediyelikler üreten atölye.',
      areaServed: { '@type': 'Country', name: 'Türkiye' },
      ...(settings.email ? { email: settings.email } : {}),
      ...(settings.phone ? { telephone: settings.phone } : {}),
      ...(settings.instagram_url ? { sameAs: [settings.instagram_url] } : {})
    }],
    body: contactCrumb.html + '<h1>İletişim</h1>'
      + '<p class="pg-lead">Sipariş talebinizi WhatsApp üzerinden iletebilir, ürünleri Instagram hesabımızdan takip edebilirsiniz. Sitede çevrimiçi ödeme alınmaz.</p>'
      + (contactCards.length
        ? '<div class="pg-contact-grid">' + contactCards.map(card => {
          const inner = '<span class="pg-contact-k">' + esc(card.label) + '</span><span class="pg-contact-v">' + esc(card.value) + '</span>';
          if (!card.href) return '<div class="pg-contact-card">' + inner + '</div>';
          const rel = card.external ? ' rel="noopener noreferrer me"' : '';
          return '<a class="pg-contact-card" href="' + esc(card.href) + '"' + rel + '>' + inner + '</a>';
        }).join('') + '</div>'
        : '<p class="pg-empty">İletişim bilgileri yönetim panelinden girilmedi.</p>')
      + (settings.delivery_text || settings.shipping_note
        ? '<div class="pg-info">'
          + (settings.delivery_text ? '<section><h2>Teslimat</h2><p>' + esc(settings.delivery_text) + '</p></section>' : '')
          + (settings.shipping_note ? '<section><h2>Kargo</h2><p>' + esc(settings.shipping_note) + '</p></section>' : '')
          + '</div>'
        : '')
  });

  const siteLinks = {
    collections: liveCollections.map(item => ({ name: item.name, path: item.path })),
    categories: liveCategories.map(item => ({ name: item.name, path: item.path })),
    pages: [{ name: 'İletişim', path: contactPath }]
  };

  return { pages, nav, legalLinks, siteLinks };
}

/* Ana sayfa metinleri de JavaScript ile doluyor. JavaScript çalıştırmayan
   tarayıcı botları boş bir iskelet görmesin diye yayındaki içeriği yapı
   sırasında işaretçiler arasına gömüyoruz. Tarayıcıda aynı içerik aynı
   kaplara yazıldığı için çift görünme olmaz. */
function linkItems(items) {
  return items.map(item => '<li><a href="' + item.path + '">' + esc(item.name) + '</a></li>').join('');
}

function column(heading, items) {
  return items.length ? '<div><h2>' + esc(heading) + '</h2><ul>' + linkItems(items) + '</ul></div>' : '';
}

function nl2br(value) {
  return esc(value || '').replace(/\r?\n/g, '<br>');
}

/* Banner başlığında *vurgu* ve satır sonu, tarayıcıdaki titleFmt ile aynı şekilde işlenir. */
function titleHtml(value) {
  return esc(value || '').replace(/\n/g, '<br>').replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function activeBanner(banners, now = Date.now()) {
  return (banners || []).find(banner => {
    const from = banner.starts_at ? new Date(banner.starts_at).getTime() : null;
    const to = banner.ends_at ? new Date(banner.ends_at).getTime() : null;
    return (from === null || from <= now) && (to === null || to > now);
  }) || null;
}

function sectionItems(sections, key, field) {
  const section = sections[key];
  const list = section && section.content_json && Array.isArray(section.content_json[field]) ? section.content_json[field] : [];
  return list.filter(item => item && item.title);
}

/* Yapı sırasında dekoratif simgeler boş bırakılır; tarayıcı tarafı doldurur.
   Böylece aynı SVG iki yerde tutulmaz ve ikisi birbirinden sapmaz. */
function cardList(items, wrapperClass, iconClass) {
  return items.map((item, index) => '<div class="' + wrapperClass + '"><div class="' + iconClass + '"></div>'
    + (wrapperClass === 'step' ? '<span class="num">' + ('0' + (index + 1)).slice(-2) + '</span>' : '')
    + '<h3>' + esc(item.title) + '</h3><p>' + esc(item.description || '') + '</p></div>').join('');
}

/* Onaylanmamış demo içeriği statik HTML'e ve şemaya sızdırmamak için
   tarayıcıyla aynı süzgeçten geçer. */
function liveFaqs(data) {
  const settings = data.settings || {};
  return (data.faqs || [])
    .map(row => resolveFaq(row, { shippingNote: settings.shipping_note, deliveryText: settings.delivery_text }))
    .filter(Boolean);
}

function faqItems(entries) {
  return entries.map(row => '<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false"><span>'
    + esc(row.question) + '</span><b>+</b></button><div class="faq-a"><p>' + esc(row.answer) + '</p></div></div>').join('');
}

function jsonLdScript(id, schema) {
  return '<script type="application/ld+json" id="' + id + '">' + jsonLd(schema) + '</script>';
}

/* Sokak adresi yayımlanmadığı için LocalBusiness değil Organization kullanılır:
   eksik adresli LocalBusiness arama konsolunda uyarı üretir. İl/ilçe yine
   PostalAddress olarak verilir, bu geçerli ve yerel sinyal taşır. */
function organizationSchema(settings) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.brand_name || 'Davet Sandığı',
    url: absoluteUrl(homePath),
    areaServed: 'TR'
  };
  if (settings.instagram_url) schema.sameAs = [settings.instagram_url];
  const contact = { '@type': 'ContactPoint', contactType: 'customer support', availableLanguage: ['tr'] };
  if (settings.phone) contact.telephone = settings.phone;
  if (settings.email) contact.email = settings.email;
  if (contact.telephone || contact.email) schema.contactPoint = [contact];
  const place = publicPlace(settings);
  if (place) schema.address = { '@type': 'PostalAddress', addressLocality: place.locality, addressRegion: place.region, addressCountry: 'TR' };
  return schema;
}

function faqSchema(entries) {
  if (!entries.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(row => ({
      '@type': 'Question',
      name: row.question,
      acceptedAnswer: { '@type': 'Answer', text: row.answer }
    }))
  };
}

/* İşaretçi anahtarı -> o bölgeye yazılacak HTML. */
export function buildHomeBlocks(data, siteLinks) {
  const settings = data.settings || {};
  const sections = data.sections || {};
  const banner = activeBanner(data.banners);
  const story = sections.story || {};
  const faqs = liveFaqs(data);
  const faq = faqSchema(faqs);
  return {
    collections: linkItems(siteLinks.collections),
    sitelinks: column('Kategoriler', siteLinks.categories) + column('Sayfalar', siteLinks.pages),
    'hero-eyebrow': banner ? esc(banner.eyebrow || '') : '',
    'hero-title': banner ? titleHtml(banner.title) : '',
    'hero-lead': banner ? esc(banner.description || '') : '',
    'story-title': esc(story.title || ''),
    'story-text': nl2br(story.body || ''),
    'howto-steps': cardList(sectionItems(sections, 'process', 'steps'), 'step', 'step-ic'),
    'why-grid': cardList(sectionItems(sections, 'why_us', 'items'), 'why-card', 'why-ic'),
    'faq-list': faqItems(faqs),
    schema: jsonLdScript('organization-schema', organizationSchema(settings))
      + (faq ? jsonLdScript('faq-schema', faq) : '')
  };
}

function injectBlock(html, key, content) {
  const open = '<!--pages:' + key + ':start-->';
  const close = '<!--pages:' + key + ':end-->';
  const from = html.indexOf(open);
  const to = html.indexOf(close);
  if (from < 0 || to < from) {
    console.warn('[pages] index.html içinde "' + key + '" işaretçisi bulunamadı, bu bölge atlandı.');
    return html;
  }
  return html.slice(0, from + open.length) + content + html.slice(to);
}

/* Üretilen sayfa, index.html'in kendisinden türetilir: başlık, footer, sepet,
   arama ve koleksiyon görünümü tek kaynaktan gelir. Yalnızca adres bilgileri,
   şema ve ana sayfaya özel bölümler değişir — böylece ikinci bir kopya oluşmaz
   ve iki taraf birbirinden sapamaz. */
function seoBlock(page) {
  const url = absoluteUrl(page.path);
  const image = page.image ? page.image.src : absoluteUrl('/assets/images/brand/social-card.png');
  return [
    '<meta name="description" content="' + esc(page.description) + '">',
    '<link rel="canonical" href="' + esc(url) + '">',
    '<meta property="og:type" content="' + esc(page.ogType || 'website') + '">',
    '<meta property="og:site_name" content="Davet Sandığı">',
    '<meta property="og:title" content="' + esc(page.title) + '">',
    '<meta property="og:description" content="' + esc(page.description) + '">',
    '<meta property="og:url" content="' + esc(url) + '">',
    '<meta property="og:image" content="' + esc(image) + '">',
    '<meta property="og:image:alt" content="Davet Sandığı">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="' + esc(page.title) + '">',
    '<meta name="twitter:description" content="' + esc(page.description) + '">',
    '<meta name="twitter:image" content="' + esc(image) + '">',
    '<title>' + esc(page.title) + '</title>'
  ].join('\n');
}

/* Ana sayfadaki #bölüm çapaları alt sayfada karşılıksız kalır; ana sayfaya
   yönlendirilir. Boş "#" bırakılanlar JavaScript'in doldurduğu düğmelerdir. */
function rewriteHomeAnchors(html) {
  return html.replace(/href="#([A-Za-z][\w-]*)"/g, 'href="/#$1"');
}

export function derivePage(indexHtml, page, settings) {
  const schemas = [organizationSchema(settings || {})].concat(page.schemas || []);
  let html = injectBlock(indexHtml, 'seo', seoBlock(page));
  html = injectBlock(html, 'schema', schemas.map((schema, index) =>
    '<script type="application/ld+json"' + (index === 0 ? ' id="organization-schema"' : '') + '>' + jsonLd(schema) + '</script>').join(''));
  html = injectBlock(html, 'home-main', '<div class="section pg"><div class="wrap">' + page.body + '</div></div>');
  html = injectBlock(html, 'home-extra', '');
  return rewriteHomeAnchors(html);
}

export function injectHome(html, blocks) {
  return Object.keys(blocks).reduce((acc, key) => injectBlock(acc, key, blocks[key]), html);
}
