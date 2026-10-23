/* Build sırasında üretilen herkese açık sayfaların şablonları.
   Bu sayfalar JavaScript olmadan da tam içerik gösterir: yapay zeka tarayıcıları
   ve arama motorları JS çalıştırmadan okuyabilsin diye. */

import { absoluteUrl, categoryPath, collectionPath, contactPath, homePath, productPath } from './routes.mjs';


export function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* JSON-LD gövdesi script etiketinden kaçamamalı. */
export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return '';
  return '₺' + number.toFixed(2).replace('.', ',');
}

export function mediaUrl(supabaseUrl, asset) {
  if (!asset || !asset.storage_path) return null;
  const path = String(asset.storage_path).split('/').map(encodeURIComponent).join('/');
  return {
    src: supabaseUrl + '/storage/v1/object/public/site-media/' + path,
    alt: String(asset.alt_text || '').trim(),
    width: Number(asset.width) || 0,
    height: Number(asset.height) || 0
  };
}

export function whatsappLink(settings, message) {
  const number = String(settings.whatsapp_number || '').trim();
  if (!/^[1-9][0-9]{9,14}$/.test(number)) return '';
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
}

function image(media, sizes, eager) {
  if (!media) return '<div class="pg-noimg" role="img" aria-label="Görsel yok">Görsel yok</div>';
  return '<img src="' + esc(media.src) + '" alt="' + esc(media.alt || 'Davet Sandığı ürün görseli') + '"'
    + (media.width ? ' width="' + media.width + '"' : '')
    + (media.height ? ' height="' + media.height + '"' : '')
    + ' sizes="' + esc(sizes) + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async">';
}

function breadcrumb(trail) {
  const items = trail.map((item, index) =>
    '<li>' + (item.path && index < trail.length - 1
      ? '<a href="' + esc(item.path) + '">' + esc(item.name) + '</a>'
      : '<span aria-current="page">' + esc(item.name) + '</span>') + '</li>').join('');
  const data = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path)
    }))
  };
  return {
    html: '<nav class="pg-crumb" aria-label="Site yolu"><ol>' + items + '</ol></nav>',
    schema: data
  };
}

/* Sokak adresi hiç saklanmaz; yalnızca ilçe ve il yayımlanır. Rakam içeren
   değer yanlışlıkla girilmiş tam adres sayılıp yayına alınmaz. */
export function publicPlace(settings) {
  const clean = value => {
    const text = String(value == null ? '' : value).trim();
    return text.length >= 2 && text.length <= 60 && !/\d/.test(text) ? text : '';
  };
  const locality = clean(settings.address_locality);
  const region = clean(settings.address_region);
  return locality && region ? { locality, region } : null;
}

/* Ana sayfadaki ürün kartıyla aynı sınıflar; tarayıcı tarafı aynı kabı
   kendi kartlarıyla dolduruyor, bu yüzden görünüm birebir aynı. */
export function productCard(product, supabaseUrl, categoryName) {
  const media = mediaUrl(supabaseUrl, product.primaryImage);
  const price = product.is_quote_only ? 'Özel fiyat teklifi'
    : product.is_price_visible === false ? 'Fiyat için iletişime geçin'
    : money(product.price) || 'Fiyat için iletişime geçin';
  const code = [product.sku, categoryName].filter(Boolean).join(' · ');
  const href = esc(productPath(product.slug));
  return '<article class="prod-card">'
    + '<div class="prod-thumb">' + (product.is_featured ? '<span class="prod-badge">Öne Çıkan</span>' : '')
    + image(media, '(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 25vw', false) + '</div>'
    + '<div class="prod-body">'
    + (code ? '<span class="prod-code">' + esc(code) + '</span>' : '')
    + '<h3><a href="' + href + '">' + esc(product.name) + '</a></h3>'
    + (product.short_description ? '<p class="p-desc">' + esc(product.short_description) + '</p>' : '')
    + '<div class="prod-foot"><span class="prod-price">' + esc(price) + '</span>'
    + '<a class="pg-more" href="' + href + '">İncele</a></div>'
    + '</div></article>';
}

export { breadcrumb, image };
