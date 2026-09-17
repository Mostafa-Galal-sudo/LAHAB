#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl)) throw new Error('Integration verification is local-only.');
const vars = await readFile(new URL('../.dev.vars', import.meta.url), 'utf8');
const slugSource = await readFile(new URL('../shared/adminSlug.ts', import.meta.url), 'utf8');
const secret = vars.match(/^ADMIN_JWT_SECRET=(.+)$/m)?.[1]?.trim();
const slug = slugSource.match(/ADMIN_PATH_SLUG\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!secret || !slug) throw new Error('Local admin configuration is incomplete.');
const token = await new SignJWT({ username: 'asset-page-verifier' })
  .setProtectedHeader({ alg: 'HS256' }).setSubject(process.env.LAHAB_TEST_ADMIN_ID || '987654').setIssuedAt().setExpirationTime('10m')
  .sign(new TextEncoder().encode(secret));
const headers = { Cookie: `lahab_admin_token=${token}` };
const pageBase = `/api/${slug}/pages/home`;
const assetBase = `/api/${slug}/assets`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  return { response, payload: await response.json().catch(() => ({})) };
};

const draftBefore = await request(`${pageBase}/draft`);
const publicBefore = await request('/api/pages/home', { headers: {} });
assert(draftBefore.response.ok && publicBefore.response.ok, 'Homepage state must load.');
const originalDraftId = draftBefore.payload.revisionId;
const originalPublishedId = publicBefore.payload.revisionId;

const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
const form = new FormData();
form.set('kind', 'image');
form.set('file', new Blob([png], { type: 'image/png' }), 'phase6-page-integration.png');
const upload = await request(assetBase, { method: 'POST', body: form });
assert(upload.response.status === 201, `Integration image upload failed: ${JSON.stringify(upload.payload)}`);
const assetId = upload.payload.asset.id;

let savedRevisionId;
try {
  const edited = structuredClone(draftBefore.payload.page);
  const hero = edited.sections.find((section) => section.type === 'hero');
  hero.content.backgroundImage.assetId = assetId;
  if (hero.style.background.kind === 'image') hero.style.background.asset.assetId = assetId;
  const save = await request(`${pageBase}/draft`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document: edited, expectedDraftRevisionId: originalDraftId }),
  });
  assert(save.response.ok, 'Asset-backed draft save must succeed.');
  savedRevisionId = save.payload.revisionId;
  const draftAfter = await request(`${pageBase}/draft`);
  assert(draftAfter.payload.page.sections.find((section) => section.type === 'hero').content.backgroundImage.assetId === assetId, 'Asset reference must persist in the draft.');
  const stillPublic = await request('/api/pages/home', { headers: {} });
  assert(stillPublic.payload.revisionId === originalPublishedId, 'Asset draft must not leak publicly.');

  const publish = await request(`${pageBase}/publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revisionId: savedRevisionId, expectedDraftRevisionId: savedRevisionId }),
  });
  assert(publish.response.ok, 'Asset-backed revision must publish.');
  const published = await request('/api/pages/home', { headers: {} });
  assert(published.payload.page.sections.find((section) => section.type === 'hero').content.backgroundImage.assetId === assetId, 'Published page must retain the stable asset ID.');
  const content = await fetch(`${baseUrl}/api/assets/${encodeURIComponent(assetId)}/content`);
  assert(content.ok && (await content.arrayBuffer()).byteLength === png.length, 'Published asset ID must resolve through the public content route.');
} finally {
  const current = await request(`${pageBase}/draft`);
  if (current.response.ok) {
    const restore = await request(`${pageBase}/revisions/${originalDraftId}/restore`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedDraftRevisionId: current.payload.revisionId }),
    });
    if (restore.response.ok) {
      await request(`${pageBase}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId: originalPublishedId, expectedDraftRevisionId: restore.payload.revisionId }),
      });
    }
  }
}

const protectedDelete = await request(`${assetBase}/${encodeURIComponent(assetId)}`, { method: 'DELETE' });
assert(protectedDelete.response.status === 409, 'Asset deletion must be blocked while immutable page history references it.');
console.log(`PASS: asset reference draft/publish/public resolution/restore and safe-delete checks (${assetId}; local cleanup required).`);
