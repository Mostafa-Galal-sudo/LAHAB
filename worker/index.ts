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
import { ADMIN_PATH_SLUG } from '../shared/adminSlug';

const app = new Hono<AppEnv>();

// SECURITY: baseline security headers (replaces the old Express `helmet()` middleware)
app.use('*', secureHeaders());

// Assigns/reads an anonymous per-device cookie used to key cart & wishlist rows
// (replaces the old browser localStorage cart/wishlist persistence).
app.use('/api/*', deviceIdMiddleware);

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/products', productsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/cart', cartRouter);
app.route('/api/wishlist', wishlistRouter);
app.route('/api/pages', publicPagesRouter);
app.route('/api', contactRouter); // exposes /api/contact and /api/stock-alert

// Admin auth routes live under a random, non-guessable path instead of
// "/admin" or "/api/admin" - purely to stay off automated bot scanners that
// probe common admin paths. This is obscurity on TOP of real protection
// (JWT session cookie + PBKDF2 password hash + rate-limited login), never a
// substitute for it. See shared/adminSlug.ts to change the path.
app.route(`/api/${ADMIN_PATH_SLUG}`, adminAuthRouter);
app.route(`/api/${ADMIN_PATH_SLUG}/pages`, adminPagesRouter);

// Anything else (the React SPA, including its own /${ADMIN_PATH_SLUG} page
// route) never reaches this Worker at all - wrangler.jsonc's
// `run_worker_first: ["/api/*"]` sends every non-/api/* request straight to
// static assets. This only fires for unmatched /api/* sub-paths.
app.notFound((c) => c.json({ success: false, error: 'Not found.' }, 404));

export default app;
