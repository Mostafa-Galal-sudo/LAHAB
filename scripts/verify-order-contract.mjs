#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl)) {
  throw new Error('This verification script only runs against a local development server.');
}
const vars = await readFile(new URL('../.dev.vars', import.meta.url), 'utf8');
const adminSlugSource = await readFile(new URL('../shared/adminSlug.ts', import.meta.url), 'utf8');
const secret = vars.match(/^ADMIN_JWT_SECRET=(.+)$/m)?.[1]?.trim();
const adminSlug = adminSlugSource.match(/ADMIN_PATH_SLUG\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!secret || !adminSlug) throw new Error('Local admin configuration is incomplete.');
const token = await new SignJWT({ username: 'order-verifier' })
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject('987654')
  .setIssuedAt()
  .setExpirationTime('10m')
  .sign(new TextEncoder().encode(secret));

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const productsResponse = await fetch(`${baseUrl}/api/products`);
const productsPayload = await productsResponse.json();
const product = productsPayload.products?.[0];
assert(product?.id && product.sizes?.[0], 'A seeded product with at least one size is required.');

const payload = {
  fullName: 'Phase Seven Local Test',
  phone: '01000000000',
  email: 'phase7@example.test',
  address: 'Local test address',
  location: 'Cairo',
  regionType: 'egypt',
  paymentMethod: 'cod',
  language: 'en',
  subtotalEGP: -999999,
  totalEGP: -999999,
  items: [{
    productId: product.id,
    size: product.sizes[0],
    quantity: 2,
    name: 'SPOOFED NAME',
    code: 'SPOOFED',
    price: 1,
  }],
};

const checkout = await fetch(`${baseUrl}/api/checkout`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const order = await checkout.json();
assert(checkout.ok && order.success, `Local checkout failed: ${JSON.stringify(order)}`);
assert(order.subtotalEGP === product.priceEGP * 2, 'Server did not reconstruct the authoritative subtotal.');
assert(order.shippingFeeEGP === 0, 'Cairo shipping should be free.');
assert(order.totalEGP === product.priceEGP * 2, 'Server accepted a client-spoofed total.');

for (const [label, item, status] of [
  ['quantity', { productId: product.id, size: product.sizes[0], quantity: 0 }, 400],
  ['product', { productId: 'missing-product', size: product.sizes[0], quantity: 1 }, 422],
  ['size', { productId: product.id, size: 'INVALID', quantity: 1 }, 422],
]) {
  const invalid = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, items: [item] }),
  });
  assert(invalid.status === status, `Invalid ${label} should return ${status}, received ${invalid.status}.`);
}

const inquiriesUnauthenticated = await fetch(`${baseUrl}/api/inquiries`);
assert(inquiriesUnauthenticated.status === 401, 'Inquiries must reject unauthenticated requests.');
const inquiriesResponse = await fetch(`${baseUrl}/api/inquiries`, {
  headers: { Cookie: `lahab_admin_token=${token}` },
});
const inquiriesPayload = await inquiriesResponse.json();
const recorded = inquiriesPayload.inquiries?.find((inquiry) => inquiry.id === order.reservationCode);
assert(
  inquiriesPayload.inquiries?.every((inquiry) => inquiry.totalEGP === null || Number.isFinite(inquiry.totalEGP)),
  'Legacy inquiries must normalize to a finite numeric total or null.'
);
assert(recorded, 'The order must be persisted in the admin inbox.');
assert(recorded.totalEGP === order.totalEGP, 'Persisted order total must be numeric and authoritative.');
assert(recorded.orderData?.items?.[0]?.name === product.name.en, 'Persisted line item must use the database product name.');
assert(recorded.orderData?.items?.[0]?.price === product.priceEGP, 'Persisted line item must use the database product price.');

console.log(`PASS: authoritative order ${order.reservationCode}, validation, persistence, admin normalization, and inquiry auth checks.`);
