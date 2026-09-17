#!/usr/bin/env node
import { randomUUID } from 'node:crypto';

const baseUrl = process.env.LAHAB_TEST_URL || 'http://127.0.0.1:5173';
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(baseUrl)) throw new Error('Commerce verification is local-only.');
const cookie = `lahab_device_id=phase7-${randomUUID()}`;
const headers = { Cookie: cookie, 'Content-Type': 'application/json' };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

try {
  const invalidCart = await request('/api/cart', { method: 'POST', body: JSON.stringify({ productId: 'hoodie-01', size: 'INVALID' }) });
  assert(invalidCart.response.status === 400, 'Cart must reject an invalid size.');
  const soldOutCart = await request('/api/cart', { method: 'POST', body: JSON.stringify({ productId: 'hoodie-01', size: 'S' }) });
  assert(soldOutCart.response.status === 400, 'Cart must reject an out-of-stock size.');
  const added = await request('/api/cart', { method: 'POST', body: JSON.stringify({ productId: 'hoodie-01', size: 'M' }) });
  assert(added.response.ok && added.payload.items.length === 1 && added.payload.items[0].quantity === 1, 'Cart add failed.');
  const itemId = added.payload.items[0].id;
  const bumped = await request('/api/cart', { method: 'POST', body: JSON.stringify({ productId: 'hoodie-01', size: 'M' }) });
  assert(bumped.payload.items[0].quantity === 2, 'Duplicate cart add must increment quantity.');
  const invalidDelta = await request(`/api/cart/${encodeURIComponent(itemId)}`, { method: 'PATCH', body: JSON.stringify({ delta: 2 }) });
  assert(invalidDelta.response.status === 400, 'Cart must reject unsafe quantity deltas.');
  const reduced = await request(`/api/cart/${encodeURIComponent(itemId)}`, { method: 'PATCH', body: JSON.stringify({ delta: -1 }) });
  assert(reduced.response.ok && reduced.payload.items[0].quantity === 1, 'Cart quantity update failed.');

  const invalidWishlist = await request('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId: 'hoodie-01', size: 'INVALID' }) });
  assert(invalidWishlist.response.status === 400, 'Wishlist must reject an invalid size.');
  const wished = await request('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId: 'hoodie-01', size: 'M' }) });
  assert(wished.response.ok && wished.payload.items.some((item) => item.productId === 'hoodie-01' && item.size === 'M'), 'Wishlist add failed.');
  const unwished = await request('/api/wishlist/hoodie-01', { method: 'DELETE' });
  assert(unwished.response.ok && !unwished.payload.items.some((item) => item.productId === 'hoodie-01'), 'Wishlist removal failed.');
} finally {
  await request('/api/cart', { method: 'DELETE' });
  await request('/api/wishlist/hoodie-01', { method: 'DELETE' });
}

console.log('PASS: cart add/update/cleanup, size and quantity validation, and wishlist add/remove checks.');
