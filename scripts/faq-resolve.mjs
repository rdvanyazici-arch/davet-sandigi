/* Tarayıcıdaki süzgecin ta kendisi: assets/js/faq-resolve.js dosyasını okuyup
   çalıştırır. Kural iki yerde ayrı ayrı yazılmadığı için statik HTML ile
   çalışma anı birbirinden sapamaz. */
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../assets/js/faq-resolve.js', import.meta.url), 'utf8');
const scope = {};
new Function('window', source)(scope);

if (!scope.DS_FAQ || typeof scope.DS_FAQ.resolveFaq !== 'function') {
  throw new Error('assets/js/faq-resolve.js DS_FAQ.resolveFaq yayımlamıyor.');
}

export const { faqText, resolveFaq } = scope.DS_FAQ;
