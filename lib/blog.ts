import { MongoClient, ObjectId } from 'mongodb';

export type Post = {
  _id: ObjectId; title: string; slug: string; excerpt: string; content: string;
  category: string; author: string; status: 'draft' | 'published';
  createdAt: Date; updatedAt: Date; publishedAt: Date | null;
  hasCover: boolean; coverAlt: string; cover?: string; coverType?: string;
};
const globalMongo = globalThis as typeof globalThis & { blogMongo?: Promise<MongoClient> };
export async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Blog database is not configured.');
  globalMongo.blogMongo ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect().catch(error => {
    globalMongo.blogMongo = undefined;
    throw error;
  });
  return (await globalMongo.blogMongo).db(process.env.MONGODB_DB || 'techactuation');
}
export async function posts() { return (await database()).collection<Post>('blog_posts'); }
export function postId(value: unknown) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value) ? new ObjectId(value) : null;
}
export function validatePost(data: FormData) {
  function field(key: string, max: number, required = true) {
    const value = data.get(key);
    if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) throw new Error(`Enter a valid ${key} (maximum ${max} characters).`);
    return value.trim();
  }
  const title = field('title', 160), slug = field('slug', 180);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use lowercase letters, numbers and hyphens in the URL.');
  const status = field('status', 12);
  if (status !== 'draft' && status !== 'published') throw new Error('Invalid post status.');
  return { title, slug, status, excerpt: field('excerpt', 400), content: field('content', 80000), category: field('category', 60), author: field('author', 80), coverAlt: field('coverAlt', 180, false) } as const;
}
export async function readCover(file: File) {
  if (file.size > 1024 * 1024) throw new Error('Choose an image smaller than 1 MB.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  const type = jpeg ? 'image/jpeg' : png ? 'image/png' : webp ? 'image/webp' : null;
  if (!type) throw new Error('Choose a JPG, PNG or WebP image.');
  return { cover: bytes.toString('base64'), coverType: type, hasCover: true };
}
export function dateLabel(date: Date | string) { return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }); }
