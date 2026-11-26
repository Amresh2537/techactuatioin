// Run against a local server: node tests/blog.integration.mjs
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const base = 'http://localhost:18787';
let cookie = '', id;
async function request(path, options = {}) {
  return fetch(base + path, { ...options, headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...options.headers } });
}
const slug = `verification-${randomUUID()}`;
function data(status = 'draft') {
  const form = new FormData();
  for (const [key, value] of Object.entries({ title: 'Temporary verification article', slug, excerpt: 'Temporary integration check.', content: '## Engineering\n\nSafe <script>alert(1)</script> text.', category: 'Verification', author: 'Test', status, coverAlt: 'Test pixel', ...(id ? { id } : {}) })) form.set(key, value);
  form.set('cover', new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=', 'base64')], 'pixel.png'));
  return form;
}
try {
  assert.equal((await request('/api/admin/posts', { method: 'POST', body: data() })).status, 401);
  assert.equal((await request('/api/admin/session', { method: 'POST', headers: { Origin: 'https://example.invalid', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  const login = await request('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: process.env.BLOG_ADMIN_PASSWORD }) });
  assert.equal(login.status, 200, await login.text());
  cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/admin/posts', { method: 'POST', body: data() })).status, 200);
  const { MongoClient } = await import('mongodb');
  const client = await new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).connect();
  try { id = (await client.db(process.env.MONGODB_DB || 'techactuation').collection('blog_posts').findOne({ slug }))._id.toString(); } finally { await client.close(); }
  const draft = await fetch(base + `/blog/${slug}`); const draftHtml = await draft.text();
  assert.ok(draft.status === 404 || draftHtml.includes('NEXT_HTTP_ERROR_FALLBACK;404'));
  assert.equal((await fetch(base + `/api/blog/image/${id}`)).status, 404);
  assert.equal((await request(`/api/blog/image/${id}`)).status, 200);
  assert.equal((await request('/api/admin/posts', { method: 'POST', body: data('published') })).status, 200);
  const publicHtml = await (await fetch(base + `/blog/${slug}`)).text();
  assert.ok(publicHtml.includes('Temporary verification article'));
  assert.ok(publicHtml.includes('&lt;script&gt;'));
  assert.equal((await fetch(base + `/api/blog/image/${id}`)).status, 200);
  assert.ok((await (await fetch(base + '/blog')).text()).includes(slug));
  assert.equal((await request('/api/admin/posts', { method: 'POST', body: data('draft') })).status, 200);
  assert.equal((await fetch(base + `/api/blog/image/${id}`)).status, 404);
  console.log('PASS: authentication, origin protection, draft privacy, image access, publish, escaped body and unpublish.');
} finally {
  if (id) assert.equal((await request(`/api/admin/posts?id=${id}`, { method: 'DELETE' })).status, 200);
  if (cookie) await request('/api/admin/session', { method: 'DELETE' });
}
