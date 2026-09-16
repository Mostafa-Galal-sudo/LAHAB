import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { AppEnv } from './hono';

const DEVICE_COOKIE = 'lahab_device_id';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export async function deviceIdMiddleware(c: Context<AppEnv>, next: () => Promise<void>) {
  let deviceId = getCookie(c, DEVICE_COOKIE);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    setCookie(c, DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: true,
      maxAge: ONE_YEAR_SECONDS,
      path: '/',
    });
  }

  c.set('deviceId', deviceId);
  await next();
}
