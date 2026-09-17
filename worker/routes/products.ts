import { Hono } from 'hono';
import type { AppEnv } from '../hono';
import { requireAdmin } from '../auth';

export const productsRouter = new Hono<AppEnv>();

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

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'piece'
  );
}

const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function validateProductPayload(body: any): string | null {
  if (!body || typeof body !== 'object') return 'Invalid payload.';
  if (!body.code || typeof body.code !== 'string') return 'Product code is required.';
  if (!body.name?.en || !body.name?.ar) return 'Product name (EN & AR) is required.';
  if (typeof body.priceEGP !== 'number' || body.priceEGP <= 0) return 'A valid price (EGP) is required.';
  if (!body.weight || typeof body.weight !== 'string') return 'Weight/fabric grammage is required.';
  if (!Array.isArray(body.sizes) || body.sizes.length === 0) return 'At least one size is required.';
  if (!body.sizes.every((s: string) => VALID_SIZES.includes(s))) {
    return `Sizes must be one of: ${VALID_SIZES.join(', ')}`;
  }
  if (body.editorialImage !== undefined && body.editorialImage !== null && body.editorialImage !== '') {
    if (typeof body.editorialImage !== 'string' || body.editorialImage.length > 500 || !/^(https?:\/\/|\/(?!\/))/i.test(body.editorialImage)) {
      return 'Product images must use a valid asset or HTTPS URL.';
    }
  }
  return null;
}

// GET /api/products — public
productsRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY sortOrder ASC, createdAt ASC').all<ProductRow>();
  return c.json({ success: true, products: results.map(rowToProduct) });
});

// GET /api/products/:id — public
productsRouter.get('/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(c.req.param('id')).first<ProductRow>();
  if (!row) return c.json({ success: false, error: 'Product not found.' }, 404);
  return c.json({ success: true, product: rowToProduct(row) });
});

// POST /api/products — admin only
productsRouter.post('/', requireAdmin, async (c) => {
  const body = await c.req.json();
  const err = validateProductPayload(body);
  if (err) return c.json({ success: false, error: err }, 400);

  const baseSlug = slugify(body.name.en);
  let id = baseSlug;
  let suffix = 1;
  while (await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(id).first()) {
    id = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const now = new Date().toISOString();
  const maxSortRow = await c.env.DB.prepare('SELECT MAX(sortOrder) as m FROM products').first<{ m: number | null }>();
  const sortOrder = (maxSortRow?.m ?? -1) + 1;

  await c.env.DB.prepare(
    `INSERT INTO products (
      id, code, nameEn, nameAr, priceEGP, weight, fitEn, fitAr, materialEn, materialAr,
      descriptionEn, descriptionAr, frontDetailEn, frontDetailAr, backDetailEn, backDetailAr,
      sizes, outOfStockSizes, tagsEn, tagsAr, editorialImage, sortOrder, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.code,
      body.name.en,
      body.name.ar,
      Math.round(body.priceEGP),
      body.weight,
      body.fit?.en || '',
      body.fit?.ar || '',
      body.material?.en || '',
      body.material?.ar || '',
      body.description?.en || '',
      body.description?.ar || '',
      body.frontDetail?.en || '',
      body.frontDetail?.ar || '',
      body.backDetail?.en || '',
      body.backDetail?.ar || '',
      JSON.stringify(body.sizes),
      JSON.stringify(Array.isArray(body.outOfStockSizes) ? body.outOfStockSizes : []),
      JSON.stringify(Array.isArray(body.tags?.en) ? body.tags.en : []),
      JSON.stringify(Array.isArray(body.tags?.ar) ? body.tags.ar : []),
      body.editorialImage || null,
      sortOrder,
      now,
      now
    )
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first<ProductRow>();
  return c.json({ success: true, product: rowToProduct(row!) }, 201);
});

// PUT /api/products/:id — admin only
productsRouter.put('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ success: false, error: 'Product not found.' }, 404);

  const body = await c.req.json();
  const err = validateProductPayload(body);
  if (err) return c.json({ success: false, error: err }, 400);

  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE products SET
      code = ?, nameEn = ?, nameAr = ?, priceEGP = ?, weight = ?,
      fitEn = ?, fitAr = ?, materialEn = ?, materialAr = ?,
      descriptionEn = ?, descriptionAr = ?,
      frontDetailEn = ?, frontDetailAr = ?,
      backDetailEn = ?, backDetailAr = ?,
      sizes = ?, outOfStockSizes = ?, tagsEn = ?, tagsAr = ?,
      editorialImage = ?, updatedAt = ?
    WHERE id = ?`
  )
    .bind(
      body.code,
      body.name.en,
      body.name.ar,
      Math.round(body.priceEGP),
      body.weight,
      body.fit?.en || '',
      body.fit?.ar || '',
      body.material?.en || '',
      body.material?.ar || '',
      body.description?.en || '',
      body.description?.ar || '',
      body.frontDetail?.en || '',
      body.frontDetail?.ar || '',
      body.backDetail?.en || '',
      body.backDetail?.ar || '',
      JSON.stringify(body.sizes),
      JSON.stringify(Array.isArray(body.outOfStockSizes) ? body.outOfStockSizes : []),
      JSON.stringify(Array.isArray(body.tags?.en) ? body.tags.en : []),
      JSON.stringify(Array.isArray(body.tags?.ar) ? body.tags.ar : []),
      body.editorialImage || null,
      now,
      id
    )
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first<ProductRow>();
  return c.json({ success: true, product: rowToProduct(row!) });
});

// DELETE /api/products/:id — admin only
productsRouter.delete('/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ success: false, error: 'Product not found.' }, 404);

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM reviews WHERE productId = ?').bind(id),
    c.env.DB.prepare('DELETE FROM wishlist_items WHERE productId = ?').bind(id),
    c.env.DB.prepare('DELETE FROM cart_items WHERE productId = ?').bind(id),
  ]);

  return c.json({ success: true });
});

// PATCH /api/products/reorder/all — admin only. Body: { orderedIds: string[] }
productsRouter.patch('/reorder/all', requireAdmin, async (c) => {
  const { orderedIds } = await c.req.json();
  if (!Array.isArray(orderedIds)) {
    return c.json({ success: false, error: 'orderedIds must be an array.' }, 400);
  }

  await c.env.DB.batch(
    orderedIds.map((id: string, index: number) =>
      c.env.DB.prepare('UPDATE products SET sortOrder = ? WHERE id = ?').bind(index, id)
    )
  );

  return c.json({ success: true });
});
