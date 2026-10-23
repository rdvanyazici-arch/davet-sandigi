/* Sitenin yayın adresi tek yerden yönetilir.
   Önizleme dağıtımlarında SITE_ORIGIN ortam değişkeniyle geçersiz kılınabilir;
   canonical adresi her zaman yayın alan adını göstermelidir. */

export const DEFAULT_SITE_ORIGIN = 'https://www.davetsandigi.com.tr';

export function resolveSiteOrigin(env = process.env) {
  const raw = String((env && env.SITE_ORIGIN) || DEFAULT_SITE_ORIGIN).trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('SITE_ORIGIN geçerli bir adres olmalıdır: ' + raw);
  }
  if (url.protocol !== 'https:') throw new Error('SITE_ORIGIN https olmalıdır: ' + raw);
  if (url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_ORIGIN yalnızca alan adı olmalıdır: ' + raw);
  return url.origin;
}
