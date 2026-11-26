import { cookies } from 'next/headers';
import { adminConfigured, createSession, equal, sameOrigin, sessionCookie } from '@/lib/admin';
import { database } from '@/lib/blog';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!adminConfigured()) return Response.json({ error: 'Configure the admin password and session secret on the server first.' }, { status: 503 });
  try {
    if (Number(request.headers.get('content-length')) > 4096) return Response.json({ error: 'Request too large.' }, { status: 413 });
    const { password } = await request.json();
    // Database-backed throttling applies across server instances, without trusting forwarded IP headers.
    const limits = (await database()).collection<{ _id: string; count: number; expiresAt: Date }>('blog_login_limits');
    const bucket = Math.floor(Date.now() / 900000);
    const attempt = await limits.findOneAndUpdate({ _id: `admin:${bucket}` }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * 900000) } }, { upsert: true, returnDocument: 'after' });
    await limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    if ((attempt?.count || 0) > 20) return Response.json({ error: 'Too many login attempts. Try again in 15 minutes.' }, { status: 429 });
    if (typeof password !== 'string' || password.length > 1024 || !equal(password, process.env.BLOG_ADMIN_PASSWORD!)) return Response.json({ error: 'Incorrect password.' }, { status: 401 });
    (await cookies()).set(sessionCookie, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
    return Response.json({ success: true });
  } catch { return Response.json({ error: 'Login unavailable. Check the database connection and try again.' }, { status: 503 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  (await cookies()).delete(sessionCookie);
  return Response.json({ success: true });
}
