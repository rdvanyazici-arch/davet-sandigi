import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  fetchJsonReadOnly,
  getAccessContext,
  getBackupRoot,
  logFailure,
} from './firebase-backup-common.mjs';

const STORAGE_SCOPE = 'https://www.googleapis.com/auth/devstorage.read_only';
const DEFAULT_BUCKET = 'davetsandigi-3ae7b.firebasestorage.app';

async function listObjects(bucket, accessToken) {
  const objects = [];
  let pageToken;

  try {
    do {
      const url = new URL(
        `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o`,
      );
      url.searchParams.set('maxResults', '1000');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const page = await fetchJsonReadOnly(url, accessToken);
      objects.push(...(page.items ?? []));
      pageToken = page.nextPageToken;
    } while (pageToken);
  } catch (error) {
    if (error?.status === 404) {
      return { bucketExists: false, objects: [] };
    }
    throw error;
  }

  return { bucketExists: true, objects };
}

function getSafeOutputPath(storageRoot, objectName) {
  const outputPath = path.resolve(storageRoot, ...objectName.split('/'));
  if (!outputPath.startsWith(`${storageRoot}${path.sep}`)) {
    throw new Error(`Güvensiz Storage nesne yolu: ${objectName}`);
  }
  return outputPath;
}

async function downloadObject(bucket, object, storageRoot, accessToken) {
  const outputPath = getSafeOutputPath(storageRoot, object.name);
  const url = new URL(
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(object.name)}`,
  );
  url.searchParams.set('alt', 'media');
  const response = await fetch(url, {
    method: 'GET',
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Storage okuma başarısız: ${object.name} (${response.status}).`);
  }

  const content = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content);

  return {
    name: object.name,
    size: content.length,
    sha256: createHash('sha256').update(content).digest('hex'),
    contentType: object.contentType ?? null,
    generation: object.generation ?? null,
  };
}

async function main() {
  const { accessToken, projectId } = await getAccessContext([STORAGE_SCOPE]);
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_BUCKET;
  const backupRoot = getBackupRoot();
  const storageRoot = path.join(backupRoot, 'storage');
  await mkdir(storageRoot, { recursive: true });

  const { bucketExists, objects } = await listObjects(bucket, accessToken);
  const downloaded = [];
  for (const object of objects) {
    downloaded.push(
      await downloadObject(bucket, object, storageRoot, accessToken),
    );
    console.log(`İndirildi: ${object.name}`);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    projectId,
    bucket,
    bucketExists,
    readOnly: true,
    objectCount: downloaded.length,
    objects: downloaded,
  };
  await writeFile(
    path.join(backupRoot, 'storage-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  if (bucketExists) {
    console.log(`Storage yedeği hazır: ${storageRoot}`);
  } else {
    console.log(`Storage bucket mevcut değil; 0 dosya manifestlendi: ${bucket}`);
  }
}

main().catch(logFailure);
