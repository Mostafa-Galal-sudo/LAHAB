import { Hono } from 'hono';
import type { AppEnv } from '../hono';

export const wishlistRouter = new Hono<AppEnv>();

// GET /api/wishlist
wishlistRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT productId, size FROM wishlist_items WHERE deviceId = ? ORDER BY createdAt ASC'
  )
    .bind(c.get('deviceId'))
    .all<{ productId: string; size: string }>();
  return c.json({ success: true, items: results });
});

// POST /api/wishlist — { productId, size }
wishlistRouter.post('/', async (c) => {
  const deviceId = c.get('deviceId');
  const { productId, size } = await c.req.json().catch(() => ({}) as any);

  const product = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(productId).first();
  if (!product || !size) {
    return c.json({ success: false, error: 'Invalid product or size.' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO wishlist_items (id, deviceId, productId, size, createdAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(deviceId, productId) DO UPDATE SET size = excluded.size`
  )
    .bind(crypto.randomUUID(), deviceId, productId, size, new Date().toISOString())
    .run();

  const { results } = await c.env.DB.prepare(
    'SELECT productId, size FROM wishlist_items WHERE deviceId = ? ORDER BY createdAt ASC'
  )
    .bind(deviceId)
    .all<{ productId: string; size: string }>();
  return c.json({ success: true, items: results });
});

// DELETE /api/wishlist/:productId
wishlistRouter.delete('/:productId', async (c) => {
  const deviceId = c.get('deviceId');
  await c.env.DB.prepare('DELETE FROM wishlist_items WHERE deviceId = ? AND productId = ?')
    .bind(deviceId, c.req.param('productId'))
    .run();

  const { results } = await c.env.DB.prepare(
    'SELECT productId, size FROM wishlist_items WHERE deviceId = ? ORDER BY createdAt ASC'
  )
    .bind(deviceId)
    .all<{ productId: string; size: string }>();
  return c.json({ success: true, items: results });
});
