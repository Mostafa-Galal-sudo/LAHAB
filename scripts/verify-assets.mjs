#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl)) throw new Error('Asset verification is local-only.');
const vars = await readFile(new URL('../.dev.vars', import.meta.url), 'utf8');
const slugSource = await readFile(new URL('../shared/adminSlug.ts', import.meta.url), 'utf8');
const secret = vars.match(/^ADMIN_JWT_SECRET=(.+)$/m)?.[1]?.trim();
const slug = slugSource.match(/ADMIN_PATH_SLUG\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!secret || !slug) throw new Error('Local admin configuration is incomplete.');
const token = await new SignJWT({ username: 'asset-verifier' })
  .setProtectedHeader({ alg: 'HS256' }).setSubject('987654').setIssuedAt().setExpirationTime('10m')
  .sign(new TextEncoder().encode(secret));
const cookie = `lahab_admin_token=${token}`;
const assetsUrl = `${baseUrl}/api/${slug}/assets`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function makeGlb() {
  const json = JSON.stringify({
    asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ byteLength: 36 }], bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
  });
  const encoded = new TextEncoder().encode(json);
  const jsonLength = Math.ceil(encoded.length / 4) * 4;
  const binLength = 36;
  const buffer = new ArrayBuffer(12 + 8 + jsonLength + 8 + binLength);
  const view = new DataView(buffer);
  view.setUint32(0, 0x46546c67, true); view.setUint32(4, 2, true); view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, jsonLength, true); view.setUint32(16, 0x4e4f534a, true);
  const bytes = new Uint8Array(buffer);
  bytes.fill(0x20, 20, 20 + jsonLength); bytes.set(encoded, 20);
  const binHeader = 20 + jsonLength;
  view.setUint32(binHeader, binLength, true); view.setUint32(binHeader + 4, 0x004e4942, true);
  new Float32Array(buffer, binHeader + 8, 9).set([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  return new Uint8Array(buffer);
}

async function upload(kind, bytes, name, mime, authenticated = true) {
  const form = new FormData();
  form.set('kind', kind);
  form.set('file', new Blob([bytes], { type: mime }), name);
  const response = await fetch(assetsUrl, { method: 'POST', headers: authenticated ? { Cookie: cookie } : {}, body: form });
  return { response, payload: await response.json().catch(() => ({})) };
}

const created = [];
try {
  const unauthenticated = await upload('image', new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'unauth.png', 'image/png', false);
  assert(unauthenticated.response.status === 401, 'Unauthenticated upload must return 401.');

  const invalidExtension = await upload('image', new TextEncoder().encode('MZ'), 'payload.exe', 'application/octet-stream');
  assert(invalidExtension.response.status === 415, 'Executable extension must be rejected.');
  const spoofed = await upload('image', new TextEncoder().encode('not a png'), 'spoof.png', 'image/png');
  assert(spoofed.response.status === 415, 'Spoofed MIME/extension must fail signature validation.');

  const oversized = new Uint8Array(10 * 1024 * 1024 + 1);
  oversized.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const oversizedResult = await upload('image', oversized, 'oversized.png', 'image/png');
  assert(oversizedResult.response.status === 413, 'Oversized image must return 413.');

  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
  const fixtures = [
    ['image', png, 'phase6-test-image.png', 'image/png'],
    ['model', new TextEncoder().encode('o Triangle\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n'), 'phase6-test-model.obj', 'model/obj'],
    ['model', makeGlb(), 'phase6-test-model.glb', 'model/gltf-binary'],
  ];
  for (const [kind, bytes, name, mime] of fixtures) {
    const result = await upload(kind, bytes, name, mime);
    assert(result.response.status === 201, `${name} upload failed: ${JSON.stringify(result.payload)}`);
    created.push(result.payload.asset.id);
    assert(!('binary' in result.payload.asset) && !JSON.stringify(result.payload.asset).includes('base64'), 'Asset metadata must not contain binary data.');
    const content = await fetch(`${baseUrl}/api/assets/${encodeURIComponent(result.payload.asset.id)}/content`);
    assert(content.ok && (await content.arrayBuffer()).byteLength === bytes.length, `${name} binary was not stored in object storage.`);
  }

  const listing = await fetch(assetsUrl, { headers: { Cookie: cookie } });
  const listPayload = await listing.json();
  assert(created.every((id) => listPayload.assets.some((asset) => asset.id === id)), 'Uploaded assets must appear in the admin library.');
  const missing = await fetch(`${baseUrl}/api/assets/asset-missing/content`);
  assert(missing.status === 404, 'Missing assets must fail gracefully with 404.');
  const bundled = await fetch(`${baseUrl}/api/assets/asset-model-hoodie-obj/content`);
  assert(bundled.ok && (await bundled.text()).length > 100, 'Bundled model compatibility fallback must remain available.');
} finally {
  for (const id of created) {
    const response = await fetch(`${assetsUrl}/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Cookie: cookie } });
    if (!response.ok) console.warn(`Cleanup warning: ${id} returned ${response.status}.`);
  }
}

console.log('PASS: image/OBJ/GLB upload, R2 content, listing, cleanup, auth, size, extension, MIME/signature, missing-asset, and bundled fallback checks.');
