import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { AppEnv } from './hono';
import { deviceIdMiddleware } from './deviceId';
import { productsRouter } from './routes/products';
import { reviewsRouter } from './routes/reviews';
import { cartRouter } from './routes/cart';
import { wishlistRouter } from './routes/wishlist';
import { adminAuthRouter } from './routes/admin';
import { contactRouter } from './routes/contact';
import { adminPagesRouter, publicPagesRouter } from './routes/pages';
import { adminAssetsRouter, publicAssetsRouter } from './routes/assets';
import { ADMIN_PATH_SLUG } from '../shared/adminSlug';

const app = new Hono<AppEnv>();

const publicSitePaths = [
  '/',
  '/privacy-policy',
  '/terms',
  '/cookie-policy',
  '/shipping-policy',
  '/returns-refunds',
  '/payment-policy',
  '/contact',
] as const;

// SECURITY: baseline security headers (replaces the old Express `helmet()` middleware)
app.use('*', secureHeaders());

// Assigns/reads an anonymous per-device cookie used to key cart & wishlist rows
// (replaces the old browser localStorage cart/wishlist persistence).
app.use('/api/*', deviceIdMiddleware);

app.get('/robots.txt', (c) => {
  const origin = new URL(c.req.url).origin;
  return c.text(`User-agent: *\nAllow: /\nDisallow: /editor-preview\nSitemap: ${origin}/sitemap.xml\n`, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
});

app.get('/sitemap.xml', (c) => {
  const origin = new URL(c.req.url).origin;
  const urls = publicSitePaths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n');
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/sitemap/0.9">\n${urls}\n</urlset>\n`, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
});

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/products', productsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/cart', cartRouter);
app.route('/api/wishlist', wishlistRouter);
app.route('/api/pages', publicPagesRouter);
app.route('/api/assets', publicAssetsRouter);
app.route('/api', contactRouter); // exposes /api/contact and /api/stock-alert

// Admin auth routes live under a random, non-guessable path instead of
// "/admin" or "/api/admin" - purely to stay off automated bot scanners that
// probe common admin paths. This is obscurity on TOP of real protection
// (JWT session cookie + PBKDF2 password hash + rate-limited login), never a
// substitute for it. See shared/adminSlug.ts to change the path.
app.route(`/api/${ADMIN_PATH_SLUG}`, adminAuthRouter);
app.route(`/api/${ADMIN_PATH_SLUG}/pages`, adminPagesRouter);
app.route(`/api/${ADMIN_PATH_SLUG}/assets`, adminAssetsRouter);

// Anything else (the React SPA, including its own /${ADMIN_PATH_SLUG} page
// route) never reaches this Worker at all - wrangler.jsonc's
// `run_worker_first` sends every other request straight to
// static assets. This only fires for unmatched /api/* sub-paths.
app.notFound((c) => c.json({ success: false, error: 'Not found.' }, 404));

export default app;
