import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const EXPECTED_PROJECT_ID = 'davetsandigi-3ae7b';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

async function readCredentials() {
  let rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!rawCredentials && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    rawCredentials = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64',
    ).toString('utf8');
  }

  if (!rawCredentials && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    rawCredentials = await readFile(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      'utf8',
    );
  }

  if (!rawCredentials) {
    throw new Error(
      'Firebase kimlik bilgisi eksik. FIREBASE_SERVICE_ACCOUNT_JSON, ' +
        'FIREBASE_SERVICE_ACCOUNT_BASE64 veya GOOGLE_APPLICATION_CREDENTIALS kullanın.',
    );
  }

  const credentials = JSON.parse(rawCredentials);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Service account JSON içinde client_email/private_key eksik.');
  }

  if (credentials.project_id !== EXPECTED_PROJECT_ID) {
    throw new Error(
      `Yanlış Firebase projesi: ${credentials.project_id ?? 'bilinmiyor'}. ` +
        `Beklenen proje: ${EXPECTED_PROJECT_ID}.`,
    );
  }

  return credentials;
}

function createJwt(credentials, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: scopes.join(' '),
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${signer.sign(credentials.private_key, 'base64url')}`;
}

export async function getAccessContext(scopes) {
  const credentials = await readCredentials();
  const assertion = createJwt(credentials, scopes);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`OAuth token alınamadı (${response.status}).`);
  }

  const token = await response.json();
  return {
    accessToken: token.access_token,
    projectId: credentials.project_id,
  };
}

export async function fetchJsonReadOnly(url, accessToken) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(
      `Okuma başarısız (${response.status}): ${detail.slice(0, 300)}`,
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export function getBackupDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}${values.month}${values.day}`;
}

export function getBackupRoot() {
  return path.resolve(process.cwd(), 'backups', `firebase-${getBackupDate()}`);
}

export function logFailure(error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
