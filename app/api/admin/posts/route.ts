import { MongoServerError, ObjectId } from 'mongodb';
import { isAdmin, sameOrigin } from '@/lib/admin';
import { postId, posts, readCover, validatePost } from '@/lib/blog';

export async function POST(request: Request) {
  if (!sameOrigin(request) || !await isAdmin()) return Response.json({ error: 'Please log in again.' }, { status: 401 });
  try {
    if (Number(request.headers.get('content-length')) > 1500000) return Response.json({ error: 'Upload is too large. Maximum image size is 1 MB.' }, { status: 413 });
    const data = await request.formData();
    const fields = validatePost(data);
    const collection = await posts();
    await collection.createIndex({ slug: 1 }, { unique: true });
    const rawId = data.get('id');
    const id = rawId ? postId(rawId) : null;
    if (rawId && !id) return Response.json({ error: 'Invalid post.' }, { status: 400 });
    const previous = id ? await collection.findOne({ _id: id }) : null;
    if (id && !previous) return Response.json({ error: 'Post not found.' }, { status: 404 });
    const file = data.get('cover');
    const image = file instanceof File && file.size ? await readCover(file) : data.get('removeCover') === 'true' ? { cover: '', coverType: '', hasCover: false } : {};
    const now = new Date();
    const values = { ...fields, ...image, updatedAt: now, publishedAt: fields.status === 'published' ? previous?.publishedAt || now : null };
    if (id) await collection.updateOne({ _id: id }, { $set: values });
    else await collection.insertOne({ _id: new ObjectId(), hasCover: false, ...values, createdAt: now });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return Response.json({ error: 'This URL is already used by another post.' }, { status: 409 });
    if (error instanceof Error && (error.message.startsWith('Enter ') || error.message.startsWith('Choose ') || error.message.startsWith('Use ') || error.message === 'Invalid post status.')) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: 'Could not save. Check the database connection and try again.' }, { status: 503 });
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request) || !await isAdmin()) return Response.json({ error: 'Please log in again.' }, { status: 401 });
  const id = postId(new URL(request.url).searchParams.get('id'));
  if (!id) return Response.json({ error: 'Invalid post.' }, { status: 400 });
  try { await (await posts()).deleteOne({ _id: id }); return Response.json({ success: true }); }
  catch { return Response.json({ error: 'Could not delete. Please try again.' }, { status: 503 }); }
}
