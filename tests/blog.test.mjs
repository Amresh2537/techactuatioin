import test from 'node:test';
import assert from 'node:assert/strict';
import { postId, readCover, validatePost } from '../lib/blog.ts';
function form(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: 'Choosing a screw jack', slug: 'choosing-a-screw-jack', excerpt: 'Selection guidance.', content: 'Body paragraph.', category: 'Engineering', author: 'Team', status: 'draft', coverAlt: '', ...overrides })) data.set(key, value);
  return data;
}
test('valid drafts and published posts preserve content and Hindi titles', () => {
  assert.equal(validatePost(form()).status, 'draft');
  assert.equal(validatePost(form({ title: 'स्क्रू जैक का चयन', status: 'published' })).title, 'स्क्रू जैक का चयन');
});
test('rejects missing fields, oversize content, unsafe slugs and invalid status', () => {
  for (const fields of [{ title: ' ' }, { slug: '../admin' }, { slug: 'Mixed Case' }, { content: 'a'.repeat(80001) }, { status: 'scheduled' }, { excerpt: '' }]) assert.throws(() => validatePost(form(fields)));
});
test('post ids require exactly 24 hex characters', () => {
  for (const id of ['foo', '../admin', '', null, { $ne: null }]) assert.equal(postId(id), null);
  assert.equal(postId('507f1f77bcf86cd799439011').toString(), '507f1f77bcf86cd799439011');
});
test('image upload checks bytes rather than supplied MIME type', async () => {
  await assert.rejects(readCover(new File(['<svg onload="alert(1)"/>'], 'cover.png', { type: 'image/png' })));
  await assert.rejects(readCover(new File([new Uint8Array(1024 * 1024 + 1)], 'large.jpg')));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=', 'base64');
  const result = await readCover(new File([png], 'cover.txt', { type: 'text/plain' }));
  assert.equal(result.coverType, 'image/png');
  assert.equal(result.cover, png.toString('base64'));
});
