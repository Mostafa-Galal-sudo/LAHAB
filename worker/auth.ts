import { SignJWT, jwtVerify } from 'jose';
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env } from './types';
import type { AppEnv } from './hono';

// ---------------------------------------------------------------------------
// Password hashing: PBKDF2-SHA256 via the native Web Crypto API.
//
// Why not bcrypt/argon2? Cloudflare Workers enforce a CPU-time budget per
// request (10ms on the Free plan, much higher - and configurable - on Workers
// Paid). bcrypt/argon2 need native bindings that don't run in the Workers
// runtime at all. PBKDF2 via crypto.subtle is the standard edge-native choice
// (jose, Lucia Auth, etc. all point here for Workers).
//
// Iteration count is a direct CPU-time trade-off: more iterations = stronger
// hash but more CPU per login. 100,000 is OWASP's current baseline for
// PBKDF2-SHA256, but on the Workers FREE plan (10ms CPU limit) this may
// exceed the budget and fail. If admin login fails with a CPU/time-limit
// error, either (a) upgrade to Workers Paid ($5/mo, CPU limit becomes
// effectively a non-issue), or (b) lower PBKDF2_ITERATIONS in wrangler.jsonc.
// Since this only guards a single admin account behind a random username
// and a rate-limited login endpoint, a lower iteration count is an
// acceptable trade-off if you stay on the Free plan.
// ---------------------------------------------------------------------------

const DEFAULT_ITERATIONS = 100_000;

function getIterations(env: Env): number {
  const configured = Number(env.PBKDF2_ITERATIONS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_ITERATIONS;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string, env: Env): Promise<string> {
  const iterations = getIterations(env);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );

  return `pbkdf2$${iterations}$${toHex(salt.buffer as ArrayBuffer)}$${toHex(derivedBits)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromHex(parts[2]);
  const expectedHex = parts[3];

  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const actualHex = toHex(derivedBits);

  // Constant-time comparison
  if (actualHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actualHex.length; i++) {
    diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// JWT session tokens via jose (Web Crypto native - works on Workers, unlike
// the Node-only `jsonwebtoken` package used in the old Express version).
// ---------------------------------------------------------------------------

const TOKEN_COOKIE = 'lahab_admin_token';
const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function getSecretKey(env: Env): Uint8Array {
  if (!env.ADMIN_JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET is not configured. Run: wrangler secret put ADMIN_JWT_SECRET');
  }
  return new TextEncoder().encode(env.ADMIN_JWT_SECRET);
}

export async function issueAdminToken(c: Context<AppEnv>, userId: number, username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecretKey(c.env));

  setCookie(c, TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: true,
    maxAge: TOKEN_TTL_SECONDS,
    path: '/',
  });
}

export function clearAdminToken(c: Context<AppEnv>) {
  deleteCookie(c, TOKEN_COOKIE, { path: '/' });
}

export async function getAdminFromRequest(
  c: Context<AppEnv>
): Promise<{ id: number; username: string } | null> {
  const token = getCookie(c, TOKEN_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(c.env));
    return { id: Number(payload.sub), username: String(payload.username) };
  } catch {
    return null;
  }
}

export async function requireAdmin(c: Context<AppEnv>, next: () => Promise<void>) {
  const admin = await getAdminFromRequest(c);
  if (!admin) {
    return c.json({ success: false, error: 'Authentication required.' }, 401);
  }
  c.set('admin', admin);
  await next();
}
