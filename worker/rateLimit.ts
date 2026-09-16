import type { Context } from 'hono';
import type { AppEnv } from './hono';

interface RateLimitOptions {
  name: string; // bucket namespace, e.g. "contact", "admin-login"
  windowSeconds: number;
  limit: number;
  message?: string;
}

// BUG FIX (Cloudflare migration): the old server used `express-rate-limit`,
// which keeps counters in the Node process's memory - not available on
// Workers (no long-lived process). This stores counters in D1 instead.
// It's a best-effort limiter (not perfectly race-free under heavy concurrent
// bursts), which is an acceptable trade-off for a small storefront's contact
// form and admin login - not a high-traffic API needing atomic precision.
export function rateLimit(options: RateLimitOptions) {
  return async (c: Context<AppEnv>, next: () => Promise<void>) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const bucketKey = `${options.name}:${ip}`;
    const now = Date.now();

    const row = await c.env.DB.prepare('SELECT windowStart, count FROM rate_limits WHERE bucketKey = ?')
      .bind(bucketKey)
      .first<{ windowStart: string; count: number }>();

    if (!row || now - new Date(row.windowStart).getTime() > options.windowSeconds * 1000) {
      // New window
      await c.env.DB.prepare(
        `INSERT INTO rate_limits (bucketKey, windowStart, count) VALUES (?, ?, 1)
         ON CONFLICT(bucketKey) DO UPDATE SET windowStart = excluded.windowStart, count = 1`
      )
        .bind(bucketKey, new Date(now).toISOString())
        .run();
      await next();
      return;
    }

    if (row.count >= options.limit) {
      return c.json(
        {
          success: false,
          error: options.message || 'Too many requests. Please try again later.',
        },
        429
      );
    }

    await c.env.DB.prepare('UPDATE rate_limits SET count = count + 1 WHERE bucketKey = ?').bind(bucketKey).run();
    await next();
  };
}
