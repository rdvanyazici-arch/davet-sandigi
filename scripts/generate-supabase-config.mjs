import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSiteOrigin } from './site-config.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localEnvPath = resolve(rootDir, '.env.local');
const outputPath = resolve(rootDir, 'assets/js/supabase-config.generated.js');

async function readLocalEnv() {
  try {
    const source = await readFile(localEnvPath, 'utf8');
    return Object.fromEntries(
      source
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const separator = line.indexOf('=');
          const key = line.slice(0, separator).trim();
          const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
          return [key, value];
        })
    );
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

const localEnv = await readLocalEnv();
const supabaseUrl = process.env.SUPABASE_URL || localEnv.SUPABASE_URL || '';
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || localEnv.SUPABASE_PUBLISHABLE_KEY || '';

if (!/^https:\/\/[a-z]{20}\.supabase\.co$/.test(supabaseUrl)) {
  throw new Error('SUPABASE_URL geçerli bir Supabase proje adresi olmalıdır.');
}

if (!publishableKey.startsWith('sb_publishable_')) {
  throw new Error('SUPABASE_PUBLISHABLE_KEY yalnızca publishable key olmalıdır.');
}

const browserConfig = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_PUBLISHABLE_KEY: publishableKey,
  SITE_ORIGIN: resolveSiteOrigin()
};
const output = `/* Build sırasında üretilir; Git'e eklenmez. */\nwindow.__DAVET_SANDIGI_ENV__=Object.freeze(${JSON.stringify(browserConfig)});\n`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, { mode: 0o600 });
console.log(`Supabase tarayıcı yapılandırması üretildi: ${outputPath}`);
