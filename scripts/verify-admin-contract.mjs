#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl)) throw new Error('Admin verification is local-only.');
const vars = await readFile(new URL('../.dev.vars', import.meta.url), 'utf8');
const slugSource = await readFile(new URL('../shared/adminSlug.ts', import.meta.url), 'utf8');
const secret = vars.match(/^ADMIN_JWT_SECRET=(.+)$/m)?.[1]?.trim();
const slug = slugSource.match(/ADMIN_PATH_SLUG\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!secret || !slug) throw new Error('Local admin configuration is incomplete.');
const token = await new SignJWT({ username: 'admin-contract-verifier' })
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(process.env.LAHAB_TEST_ADMIN_ID || '987654')
  .setIssuedAt()
  .setExpirationTime('10m')
  .sign(new TextEncoder().encode(secret));
const auth = { Cookie: `lahab_admin_token=${token}`, 'Content-Type': 'application/json' };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

for (const [path, method] of [
  ['/api/inquiries', 'GET'],
  ['/api/reviews/not-a-review', 'DELETE'],
  [`/api/${slug}/assets`, 'GET'],
  [`/api/${slug}/pages/home/draft`, 'GET'],
]) {
  const result = await request(path, { method });
  assert(result.response.status === 401, `${method} ${path} must reject unauthenticated requests.`);
}

const product = {
  code: 'QA-PIECE',
  name: { en: 'Release QA Piece', ar: 'قطعة اختبار الإصدار' },
  priceEGP: 1234,
  weight: '300 GSM',
  fit: { en: 'QA fit', ar: 'قصة اختبار' },
  material: { en: 'Cotton', ar: 'قطن' },
  description: { en: 'Temporary release verification product.', ar: 'منتج مؤقت للتحقق من الإصدار.' },
  frontDetail: { en: 'Front', ar: 'أمام' },
  backDetail: { en: 'Back', ar: 'خلف' },
  sizes: ['M'],
  outOfStockSizes: [],
  tags: { en: ['QA'], ar: ['اختبار'] },
};

const unauthCreate = await request('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
assert(unauthCreate.response.status === 401, 'Product creation must require admin authentication.');
const base64Product = await request('/api/products', { method: 'POST', headers: auth, body: JSON.stringify({ ...product, editorialImage: 'data:image/png;base64,AAAA' }) });
assert(base64Product.response.status === 400, 'Product creation must reject base64 media persistence.');
const bundledModel = {
  assetId: 'asset-model-hoodie-obj', format: 'obj', scale: [1, 1, 1], position: [0, 0, 0],
  rotation: [0, 0, 0], cameraPosition: [0, 0.4, 4.2], autoRotate: true,
  autoRotateSpeed: 1, backgroundColor: '#0A1422', lightingPreset: 'studio',
};
const malformedModel = await request('/api/products', {
  method: 'POST', headers: auth, body: JSON.stringify({ ...product, model3d: { ...bundledModel, scale: [1, 1] } }),
});
assert(malformedModel.response.status === 400, 'Product creation must reject malformed 3D presentation data.');
const missingModelAsset = await request('/api/products', {
  method: 'POST', headers: auth, body: JSON.stringify({ ...product, model3d: { ...bundledModel, assetId: 'missing-model-asset' } }),
});
assert(missingModelAsset.response.status === 422, 'Product creation must reject unknown model asset references.');

let productId;
try {
  const created = await request('/api/products', { method: 'POST', headers: auth, body: JSON.stringify(product) });
  assert(created.response.status === 201, `Admin product creation failed: ${JSON.stringify(created.payload)}`);
  productId = created.payload.product.id;
  const updated = await request(`/api/products/${encodeURIComponent(productId)}`, {
    method: 'PUT', headers: auth, body: JSON.stringify({ ...product, priceEGP: 1337, model3d: bundledModel }),
  });
  assert(updated.response.ok && updated.payload.product.priceEGP === 1337 && updated.payload.product.model3d?.assetId === bundledModel.assetId, 'Admin product update must persist pricing and model configuration to D1.');
  const loaded = await request(`/api/products/${encodeURIComponent(productId)}`);
  assert(loaded.response.ok && loaded.payload.product.priceEGP === 1337 && loaded.payload.product.model3d?.format === 'obj', 'Updated product and model must be publicly readable from D1.');
} finally {
  if (productId) {
    const deleted = await request(`/api/products/${encodeURIComponent(productId)}`, { method: 'DELETE', headers: auth });
    assert(deleted.response.ok, 'Temporary QA product cleanup failed.');
    const missing = await request(`/api/products/${encodeURIComponent(productId)}`);
    assert(missing.response.status === 404, 'Deleted QA product must no longer exist.');
  }
}

console.log('PASS: admin route boundaries and product create/update/delete persistence checks.');
