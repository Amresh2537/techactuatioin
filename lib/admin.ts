import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
export const sessionCookie = 'techactuation_admin';
export function adminConfigured() { return Boolean(process.env.BLOG_ADMIN_PASSWORD && process.env.BLOG_SESSION_SECRET && process.env.BLOG_SESSION_SECRET.length >= 32); }
export function equal(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
function sign(value: string) { return createHmac('sha256', process.env.BLOG_SESSION_SECRET!).update(value + ':' + process.env.BLOG_ADMIN_PASSWORD).digest('hex'); }
export function createSession() { const expires = String(Date.now() + 8 * 3600000); return `${expires}.${sign(expires)}`; }
export async function isAdmin() {
  // Session expiry must be evaluated for the current request, never prerendered.
  await connection();
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(sessionCookie)?.value || '';
  const [expires, signature] = token.split('.');
  return /^\d+$/.test(expires || '') && Number(expires) > Date.now() && equal(signature || '', sign(expires));
}
export function sameOrigin(request: Request) { return request.headers.get('origin') === new URL(request.url).origin; }
