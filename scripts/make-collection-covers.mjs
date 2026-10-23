/* Koleksiyon kapaklarını üretir: node scripts/make-collection-covers.mjs
   Gerçek ürün fotoğrafları gelene kadar kullanılacak marka renkli madalyonlar.
   Fotoğraf yüklendiğinde panelden kapak değiştirilir, bu dosya kalabilir. */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

/* sharp projede kurulu değil; ortamda nerede bulunursa oradan alınır.
   Hiç bulunamazsa SVG'ler yine yazılır, yalnızca WebP üretilmez. */
function loadSharp() {
  for (const base of [import.meta.url, 'file:///opt/cowork-node-tools/package.json', 'file:///usr/lib/node_modules/package.json']) {
    try { return createRequire(base)('sharp'); } catch { /* sıradakini dene */ }
  }
  return null;
}
const sharp = loadSharp();

const CREAM='#F4EFE5', IVORY='#FAF7F0', GOLD='#80652F', SOFT='#CBB68C', SAGE='#A8B29F';

/* Medalyon: kremden fildişine yumuşak bir daire, ince altın halka, ortada motif.
   Kartın kendi başlığı adı zaten yazdığı için kapakta metin yok — yazı tipi
   gömme derdi olmaz ve kart kalabalıklaşmaz. */
function cover(motif, accent = SOFT) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${IVORY}"/>
      <stop offset="100%" stop-color="${CREAM}"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#g)"/>
  <circle cx="600" cy="600" r="470" fill="none" stroke="${accent}" stroke-width="2" opacity=".55"/>
  <circle cx="600" cy="600" r="452" fill="none" stroke="${accent}" stroke-width="1" opacity=".35"/>
  <g fill="none" stroke="${GOLD}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    ${motif}
  </g>
  <g fill="${accent}" opacity=".7">
    <circle cx="600" cy="108" r="6"/><circle cx="600" cy="1092" r="6"/>
    <circle cx="108" cy="600" r="6"/><circle cx="1092" cy="600" r="6"/>
  </g>
</svg>`;
}

/* İki halka: nişan ve söz. */
const nisan = cover(`
  <circle cx="494" cy="632" r="152"/>
  <circle cx="706" cy="632" r="152"/>
  <path d="M494 448l31 32-31 32-31-32z" fill="${GOLD}" stroke="none"/>
  <path d="M706 448l31 32-31 32-31-32z" fill="${GOLD}" stroke="none"/>`);

/* Kına yaprağı: tek gövde, iki yaprak, damlalar. */
const kina = cover(`
  <path d="M600 806c0-130 0-212 0-266"/>
  <path d="M600 540c-110 0-186-74-186-176 104 0 186 74 186 176z"/>
  <path d="M600 540c110 0 186-74 186-176-104 0-186 74-186 176z"/>
  <path d="M600 690c-74 0-126-50-126-120 70 0 126 50 126 120z" stroke-width="7" opacity=".85"/>
  <path d="M600 690c74 0 126-50 126-120-70 0-126 50-126 120z" stroke-width="7" opacity=".85"/>
`);

/* Bulut ve sallanan yıldızlar. */
const baby = cover(`
  <path d="M414 620a94 94 0 0 1 14-187 132 132 0 0 1 250-40 108 108 0 0 1 108 227z"/>
  <g stroke-width="7" opacity=".8">
    <path d="M470 640v96M600 640v142M730 640v96"/>
  </g>
  <g fill="${GOLD}" stroke="none">
    <path d="M470 736l17 35 38 6-27 27 6 38-34-18-34 18 6-38-27-27 38-6z" opacity=".9"/>
    <path d="M600 782l17 35 38 6-27 27 6 38-34-18-34 18 6-38-27-27 38-6z"/>
    <path d="M730 736l17 35 38 6-27 27 6 38-34-18-34 18 6-38-27-27 38-6z" opacity=".9"/>
  </g>`);

/* Hero görseli 5:4 çerçevede duruyor; kareyi değil o oranı üretiyoruz.
   Üç ayrı simge yan yana dizmek dağınık duruyordu: tek bir madalyon, iki yanında
   aynı ölçekte simetrik dallar. Ürün fotoğrafı gelene kadar geçerli. */
const sprig = `
    <path d="M0 150V-6"/>
    <path d="M0 0c-70 0-118-47-118-112 66 0 118 47 118 112z"/>
    <path d="M0 0c70 0 118-47 118-112-66 0-118 47-118 112z"/>`;

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1280" viewBox="0 0 1600 1280">
  <defs>
    <radialGradient id="hg" cx="50%" cy="46%" r="66%">
      <stop offset="0%" stop-color="${IVORY}"/>
      <stop offset="100%" stop-color="${CREAM}"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1280" fill="url(#hg)"/>
  <g fill="none" stroke="${SOFT}" opacity=".5">
    <circle cx="800" cy="640" r="384" stroke-width="2"/>
    <circle cx="800" cy="640" r="364" stroke-width="1"/>
  </g>
  <g fill="none" stroke="${GOLD}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="722" cy="660" r="124"/>
    <circle cx="878" cy="660" r="124"/>
  </g>
  <path d="M722 512l26 28-26 28-26-28z" fill="${GOLD}"/>
  <path d="M878 512l26 28-26 28-26-28z" fill="${GOLD}"/>
  <g fill="none" stroke="${GOLD}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".55">
    <g transform="translate(336,566) scale(0.52)">${sprig}</g>
    <g transform="translate(1264,566) scale(-0.52,0.52)">${sprig}</g>
  </g>
  <g fill="${SOFT}" opacity=".6">
    <circle cx="800" cy="196" r="7"/><circle cx="800" cy="1084" r="7"/>
  </g>
</svg>`;

const set = { 'nisan-soz': nisan, 'kina-gecesi': kina, 'baby-shower': baby, 'hero-banner': heroSvg };
for (const [name, svg] of Object.entries(set)) {
  const file = 'assets/images/collections/' + name;
  writeFileSync(file + '.svg', svg);
  if (!sharp) { console.warn('sharp bulunamadi, yalnizca SVG yazildi:', file + '.svg'); continue; }
  await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(file + '.webp');
  console.log('yazildi:', file + '.webp');
}
