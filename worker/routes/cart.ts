import { Hono } from 'hono';
import type { Env } from '../types';
import type { AppEnv } from '../hono';

export const cartRouter = new Hono<AppEnv>();

interface CartRow {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  monogramText: string | null;
  monogramPlacement: string | null;
  monogramThread: string | null;
  monogramStyle: string | null;
}

interface ProductRow {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  priceEGP: number;
  weight: string;
  fitEn: string;
  fitAr: string;
  materialEn: string;
  materialAr: string;
  descriptionEn: string;
  descriptionAr: string;
  frontDetailEn: string;
  frontDetailAr: string;
  backDetailEn: string;
  backDetailAr: string;
  sizes: string;
  outOfStockSizes: string;
  tagsEn: string;
  tagsAr: string;
  editorialImage: string | null;
}

function rowToProduct(row: ProductRow) {
  return {
    id: row.id,
    code: row.code,
    name: { en: row.nameEn, ar: row.nameAr },
    priceEGP: row.priceEGP,
    weight: row.weight,
    fit: { en: row.fitEn, ar: row.fitAr },
    material: { en: row.materialEn, ar: row.materialAr },
    description: { en: row.descriptionEn, ar: row.descriptionAr },
    frontDetail: { en: row.frontDetailEn, ar: row.frontDetailAr },
    backDetail: { en: row.backDetailEn, ar: row.backDetailAr },
    sizes: JSON.parse(row.sizes),
    outOfStockSizes: JSON.parse(row.outOfStockSizes),
    tags: { en: JSON.parse(row.tagsEn), ar: JSON.parse(row.tagsAr) },
    editorialImage: row.editorialImage || undefined,
  };
}

async function rowToCartItem(env: Env, row: CartRow) {
  const productRow = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(row.productId).first<ProductRow>();
  if (!productRow) return null;

  return {
    id: row.id,
    product: rowToProduct(productRow),
    size: row.size,
    quantity: row.quantity,
    monogram: row.monogramText
      ? {
          text: row.monogramText,
          placement: row.monogramPlacement,
          thread: row.monogramThread,
          style: row.monogramStyle,
        }
      : undefined,
  };
}

async function getCartItemsForDevice(env: Env, deviceId: string) {
  const { results } = await env.DB.prepare('SELECT * FROM cart_items WHERE deviceId = ? ORDER BY createdAt ASC')
    .bind(deviceId)
    .all<CartRow>();
  const items = await Promise.all(results.map((r: CartRow) => rowToCartItem(env, r)));
  return items.filter(Boolean);
}

// GET /api/cart
cartRouter.get('/', async (c) => {
  const items = await getCartItemsForDevice(c.env, c.get('deviceId'));
  return c.json({ success: true, items });
});

// POST /api/cart — add an item (or bump quantity if the same product+size+monogram exists)
cartRouter.post('/', async (c) => {
  const deviceId = c.get('deviceId');
  const { productId, size, monogram } = await c.req.json().catch(() => ({}) as any);

  const product = await c.env.DB.prepare('SELECT sizes, outOfStockSizes FROM products WHERE id = ?').bind(productId).first<{ sizes: string; outOfStockSizes: string }>();
  const availableSizes = product ? JSON.parse(product.sizes) as string[] : [];
  const outOfStockSizes = product ? JSON.parse(product.outOfStockSizes) as string[] : [];
  if (!product || typeof size !== 'string' || !availableSizes.includes(size) || outOfStockSizes.includes(size)) {
    return c.json({ success: false, error: 'Invalid product or size.' }, 400);
  }

  const monoText = monogram?.text || null;
  const monoPlacement = monogram?.placement || null;
  const monoThread = monogram?.thread || null;
  const monoStyle = monogram?.style || null;

  const existing = await c.env.DB.prepare(
    `SELECT * FROM cart_items WHERE deviceId = ? AND productId = ? AND size = ?
     AND IFNULL(monogramText,'') = IFNULL(?, '') AND IFNULL(monogramPlacement,'') = IFNULL(?, '')`
  )
    .bind(deviceId, productId, size, monoText, monoPlacement)
    .first<CartRow>();

  const now = new Date().toISOString();

  if (existing) {
    if (existing.quantity >= 10) return c.json({ success: false, error: 'Maximum quantity is 10.' }, 400);
    await c.env.DB.prepare('UPDATE cart_items SET quantity = quantity + 1, updatedAt = ? WHERE id = ?')
      .bind(now, existing.id)
      .run();
  } else {
    await c.env.DB.prepare(
      `INSERT INTO cart_items (id, deviceId, productId, size, quantity, monogramText, monogramPlacement, monogramThread, monogramStyle, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`
    )
      .bind(crypto.randomUUID(), deviceId, productId, size, monoText, monoPlacement, monoThread, monoStyle, now, now)
      .run();
  }

  const items = await getCartItemsForDevice(c.env, deviceId);
  return c.json({ success: true, items });
});

// PATCH /api/cart/:id — change quantity by delta; removes the row if it reaches 0
cartRouter.patch('/:id', async (c) => {
  const deviceId = c.get('deviceId');
  const { delta } = await c.req.json().catch(() => ({}) as any);
  if (!Number.isInteger(delta) || ![-1, 1].includes(delta)) {
    return c.json({ success: false, error: 'Quantity delta must be -1 or 1.' }, 400);
  }
  const row = await c.env.DB.prepare('SELECT * FROM cart_items WHERE id = ? AND deviceId = ?')
    .bind(c.req.param('id'), deviceId)
    .first<CartRow>();

  if (!row) return c.json({ success: false, error: 'Cart item not found.' }, 404);

  const newQty = row.quantity + delta;
  if (newQty > 10) return c.json({ success: false, error: 'Maximum quantity is 10.' }, 400);
  if (newQty <= 0) {
    await c.env.DB.prepare('DELETE FROM cart_items WHERE id = ?').bind(row.id).run();
  } else {
    await c.env.DB.prepare('UPDATE cart_items SET quantity = ?, updatedAt = ? WHERE id = ?')
      .bind(newQty, new Date().toISOString(), row.id)
      .run();
  }

  const items = await getCartItemsForDevice(c.env, deviceId);
  return c.json({ success: true, items });
});

// DELETE /api/cart — clear the whole cart (used after checkout)
cartRouter.delete('/', async (c) => {
  await c.env.DB.prepare('DELETE FROM cart_items WHERE deviceId = ?').bind(c.get('deviceId')).run();
  return c.json({ success: true, items: [] });
});
