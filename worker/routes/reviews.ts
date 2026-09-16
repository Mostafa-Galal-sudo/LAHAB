import { Hono } from 'hono';
import type { AppEnv } from '../hono';
import { rateLimit } from '../rateLimit';

export const reviewsRouter = new Hono<AppEnv>();

interface ReviewRow {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  date: string;
  verifiedPurchase: number;
  verifiedWearer: number;
  sizePurchased: string | null;
  city: string | null;
  title: string;
  comment: string;
  likes: number;
  photos: string | null;
  clientStats: string | null;
}

function rowToReview(row: ReviewRow) {
  return {
    id: row.id,
    productId: row.productId,
    authorName: row.authorName,
    rating: row.rating,
    date: row.date,
    verifiedPurchase: !!row.verifiedPurchase,
    verifiedWearer: !!row.verifiedWearer,
    sizePurchased: row.sizePurchased || undefined,
    city: row.city || undefined,
    title: row.title,
    comment: row.comment,
    likes: row.likes,
    photos: row.photos ? JSON.parse(row.photos) : undefined,
    clientStats: row.clientStats ? JSON.parse(row.clientStats) : undefined,
  };
}

const sanitize = (text: string, maxLength: number) => (text || '').replace(/[<>]/g, '').trim().slice(0, maxLength);

// GET /api/reviews?productId=xxx — public
reviewsRouter.get('/', async (c) => {
  const productId = c.req.query('productId');
  const { results } = productId
    ? await c.env.DB.prepare('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC').bind(productId).all<ReviewRow>()
    : await c.env.DB.prepare('SELECT * FROM reviews ORDER BY createdAt DESC').all<ReviewRow>();

  return c.json({ success: true, reviews: results.map(rowToReview) });
});

// POST /api/reviews — public, rate-limited (20 reviews / 15 min / IP)
reviewsRouter.post(
  '/',
  rateLimit({ name: 'review-submit', windowSeconds: 15 * 60, limit: 20, message: 'Too many reviews submitted. Please try again later.' }),
  async (c) => {
    const body = await c.req.json().catch(() => ({}));

    const authorName = sanitize(body.authorName, 60);
    const comment = sanitize(body.comment, 800);
    const city = sanitize(body.city, 60);
    const title = sanitize(body.title, 100);

    if (!authorName || !comment) {
      return c.json({ success: false, error: 'Name and comment are required.' }, 400);
    }

    const productExists = await c.env.DB.prepare('SELECT 1 FROM products WHERE id = ?').bind(body.productId).first();
    if (!productExists) {
      return c.json({ success: false, error: 'Unknown product.' }, 400);
    }

    const rating = Math.max(1, Math.min(5, Math.floor(Number(body.rating) || 5)));
    const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const sizePurchased = validSizes.includes(body.sizePurchased) ? body.sizePurchased : null;

    const height = Number(body.clientStats?.heightCm);
    const weight = Number(body.clientStats?.weightKg);
    const clientStats =
      (height > 100 && height < 230) || (weight > 30 && weight < 200)
        ? JSON.stringify({
            heightCm: height > 100 && height < 230 ? height : undefined,
            weightKg: weight > 30 && weight < 200 ? weight : undefined,
          })
        : null;

    const photos = Array.isArray(body.photos) ? body.photos.slice(0, 3) : null;

    const id = `rev-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Integrity note: verifiedPurchase / verifiedWearer are always stored as false here.
    // There is no order-matching backend, so this endpoint has no way to confirm a real
    // purchase - badges must never be set from client-submitted, self-declared data.
    await c.env.DB.prepare(
      `INSERT INTO reviews (
        id, productId, authorName, rating, date, verifiedPurchase, verifiedWearer,
        sizePurchased, city, title, comment, likes, photos, clientStats, createdAt
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, 1, ?, ?, ?)`
    )
      .bind(
        id,
        body.productId,
        authorName,
        rating,
        now.split('T')[0],
        sizePurchased,
        city || null,
        title || 'Client Feedback',
        comment,
        photos ? JSON.stringify(photos) : null,
        clientStats,
        now
      )
      .run();

    const row = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first<ReviewRow>();
    return c.json({ success: true, review: rowToReview(row!) }, 201);
  }
);

// POST /api/reviews/:id/like — public
reviewsRouter.post('/:id/like', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT likes FROM reviews WHERE id = ?').bind(id).first<{ likes: number }>();
  if (!existing) return c.json({ success: false, error: 'Review not found.' }, 404);

  const newLikes = Math.min((existing.likes || 0) + 1, 9999);
  await c.env.DB.prepare('UPDATE reviews SET likes = ? WHERE id = ?').bind(newLikes, id).run();
  return c.json({ success: true, likes: newLikes });
});

// DELETE /api/reviews/:id — admin management
reviewsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

