#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl)) {
  throw new Error('This verification script only runs against a local development server.');
}

const vars = await readFile(new URL('../.dev.vars', import.meta.url), 'utf8');
const adminSlugSource = await readFile(new URL('../shared/adminSlug.ts', import.meta.url), 'utf8');
const adminSlug = adminSlugSource.match(/ADMIN_PATH_SLUG\s*=\s*['"]([^'"]+)['"]/)?.[1];
const secret = vars.match(/^ADMIN_JWT_SECRET=(.+)$/m)?.[1]?.trim();
if (!secret) throw new Error('ADMIN_JWT_SECRET is missing from .dev.vars.');
if (!adminSlug) throw new Error('Unable to read ADMIN_PATH_SLUG.');
const adminPages = `/api/${adminSlug}/pages`;

const token = await new SignJWT({ username: 'phase-verifier' })
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(process.env.LAHAB_TEST_ADMIN_ID || '987654')
  .setIssuedAt()
  .setExpirationTime('10m')
  .sign(new TextEncoder().encode(secret));
const auth = { Cookie: `lahab_admin_token=${token}` };

async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(authenticated ? auth : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const publicBefore = await request('/api/pages/home', { authenticated: false });
assert(publicBefore.response.ok, 'Published homepage must load.');
const draftBefore = await request(`${adminPages}/home/draft`);
assert(draftBefore.response.ok, 'Admin draft must load.');

const originalPublishedId = publicBefore.payload.revisionId;
const originalDraftId = draftBefore.payload.revisionId;
const originalDraft = draftBefore.payload.page;
let latestDraftId = originalDraftId;

try {
  for (const path of [
    `${adminPages}/home/draft`,
    `${adminPages}/home/revisions`,
    `${adminPages}/home/revisions/${originalDraftId}`,
  ]) {
    const result = await request(path, { authenticated: false });
    assert(result.response.status === 401, `${path} must reject unauthenticated access.`);
  }

  const invalidDocument = structuredClone(originalDraft);
  invalidDocument.schemaVersion = 999;
  const invalid = await request(`${adminPages}/home/draft`, {
    method: 'PUT',
    body: { document: invalidDocument, expectedDraftRevisionId: originalDraftId },
  });
  assert(invalid.response.status === 422, 'Unsupported schema versions must return 422.');

  const clientADocument = structuredClone(originalDraft);
  clientADocument.title.en = `${clientADocument.title.en} [phase3 verification]`;
  const saveA = await request(`${adminPages}/home/draft`, {
    method: 'PUT',
    body: { document: clientADocument, expectedDraftRevisionId: originalDraftId },
  });
  assert(saveA.response.ok, `Fresh draft save must succeed (${saveA.response.status}: ${JSON.stringify(saveA.payload)}).`);
  latestDraftId = saveA.payload.revisionId;
  assert(latestDraftId !== originalDraftId, 'Draft save must create a new revision.');

  const publicAfterSave = await request('/api/pages/home', { authenticated: false });
  assert(publicAfterSave.payload.revisionId === originalPublishedId, 'Saving a draft must not change the public revision.');

  const staleDocument = structuredClone(originalDraft);
  staleDocument.title.en = `${staleDocument.title.en} [stale client]`;
  const stale = await request(`${adminPages}/home/draft`, {
    method: 'PUT',
    body: { document: staleDocument, expectedDraftRevisionId: originalDraftId },
  });
  assert(stale.response.status === 409, 'A stale client must receive HTTP 409.');

  const originalRevision = await request(`${adminPages}/home/revisions/${originalDraftId}`);
  assert(JSON.stringify(originalRevision.payload.revision.page) === JSON.stringify(originalDraft), 'Older revision content must remain immutable.');

  const publishA = await request(`${adminPages}/home/publish`, {
    method: 'POST',
    body: { revisionId: latestDraftId, expectedDraftRevisionId: latestDraftId },
  });
  assert(publishA.response.ok, 'Publishing the saved draft must succeed.');
  const publicAfterPublish = await request('/api/pages/home', { authenticated: false });
  assert(publicAfterPublish.payload.revisionId === latestDraftId, 'Publish must change the public revision.');

  const restore = await request(`${adminPages}/home/revisions/${originalDraftId}/restore`, {
    method: 'POST',
    body: { expectedDraftRevisionId: latestDraftId },
  });
  assert(restore.response.ok, 'Restoring an older revision must succeed.');
  assert(restore.payload.revisionId !== originalDraftId, 'Restore must create a new draft revision.');
  latestDraftId = restore.payload.revisionId;
  const publicAfterRestore = await request('/api/pages/home', { authenticated: false });
  assert(publicAfterRestore.payload.revisionId === publishA.payload.revisionId, 'Restore must not auto-publish.');

  const rollback = await request(`${adminPages}/home/publish`, {
    method: 'POST',
    body: { revisionId: originalPublishedId, expectedDraftRevisionId: latestDraftId },
  });
  assert(rollback.response.ok, 'An older valid revision must be publishable as a rollback.');

  const revisions = await request(`${adminPages}/home/revisions`);
  const ids = new Set(revisions.payload.revisions.map((revision) => revision.id));
  assert(ids.has(originalDraftId) && ids.has(saveA.payload.revisionId) && ids.has(restore.payload.revisionId), 'Revision history must preserve save and restore revisions.');
} finally {
  const current = await request(`${adminPages}/home/draft`);
  if (current.response.ok) {
    const cleanup = await request(`${adminPages}/home/revisions/${originalDraftId}/restore`, {
      method: 'POST',
      body: { expectedDraftRevisionId: current.payload.revisionId },
    });
    if (cleanup.response.ok) {
      latestDraftId = cleanup.payload.revisionId;
      await request(`${adminPages}/home/publish`, {
        method: 'POST',
        body: { revisionId: originalPublishedId, expectedDraftRevisionId: latestDraftId },
      });
    }
  }
}

console.log('PASS: immutable revision, draft isolation, publish, restore, rollback, validation, auth, and 409 conflict checks.');
