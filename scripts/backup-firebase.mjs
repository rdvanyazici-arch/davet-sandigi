import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  fetchJsonReadOnly,
  getAccessContext,
  getBackupRoot,
  logFailure,
} from './firebase-backup-common.mjs';

const COLLECTIONS = ['site', 'images'];
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';

async function readCollection(projectId, collection, accessToken) {
  const documents = [];
  let pageToken;

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`,
    );
    url.searchParams.set('pageSize', '1000');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const page = await fetchJsonReadOnly(url, accessToken);
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return documents;
}

async function main() {
  const { accessToken, projectId } = await getAccessContext([FIRESTORE_SCOPE]);
  const backupRoot = getBackupRoot();
  await mkdir(backupRoot, { recursive: true });

  const manifest = {
    createdAt: new Date().toISOString(),
    projectId,
    database: '(default)',
    readOnly: true,
    collections: {},
  };

  for (const collection of COLLECTIONS) {
    const documents = await readCollection(projectId, collection, accessToken);
    const output = {
      projectId,
      database: '(default)',
      collection,
      documents,
    };
    await writeFile(
      path.join(backupRoot, `${collection}.json`),
      `${JSON.stringify(output, null, 2)}\n`,
      'utf8',
    );
    manifest.collections[collection] = { documentCount: documents.length };
    console.log(`${collection}: ${documents.length} belge yedeklendi.`);
  }

  await writeFile(
    path.join(backupRoot, 'firestore-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  console.log(`Firestore yedeği hazır: ${backupRoot}`);
}

main().catch(logFailure);
