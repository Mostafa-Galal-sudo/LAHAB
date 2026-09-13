import { Hono } from 'hono';
import type { AppEnv } from '../hono';
import { verifyPassword, issueAdminToken, clearAdminToken, getAdminStatus } from '../auth';
import { rateLimit } from '../rateLimit';

export const adminAuthRouter = new Hono<AppEnv>();

interface AdminUserRow {
  id: number;
  username: string;
  passwordHash: string;
}

// Strict rate limit on login attempts to slow down brute-force guessing.
adminAuthRouter.post(
  '/login',
  rateLimit({ name: 'admin-login', windowSeconds: 15 * 60, limit: 10, message: 'Too many login attempts. Please try again later.' }),
  async (c) => {
    const { username, password } = await c.req.json().catch(() => ({}) as any);

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return c.json({ success: false, error: 'Username and password are required.' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT id, username, passwordHash FROM admin_users WHERE username = ?')
      .bind(username)
      .first<AdminUserRow>();

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return c.json({ success: false, error: 'Invalid username or password.' }, 401);
    }

    await issueAdminToken(c, user.id, user.username);
    return c.json({ success: true, username: user.username });
  }
);

adminAuthRouter.post('/logout', (c) => {
  clearAdminToken(c);
  return c.json({ success: true });
});

adminAuthRouter.get('/me', async (c) => {
  const result = await getAdminStatus(c);
  if (result.status === 'unauthenticated') {
    return c.json({ success: false, error: 'Not authenticated.' }, 401);
  }
  if (result.status === 'forbidden') {
    return c.json({ success: false, error: 'This session no longer has access.' }, 403);
  }
  return c.json({ success: true, username: result.admin.username });
});
