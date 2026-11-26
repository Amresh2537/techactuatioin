import { isAdmin } from '@/lib/admin';
import { postId, posts } from '@/lib/blog';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = postId((await params).id);
  if (!id) return new Response(null, { status: 404 });
  try {
    const post = await (await posts()).findOne({ _id: id, ...(!await isAdmin() ? { status: 'published' as const } : {}) });
    if (!post?.cover || !post.hasCover) return new Response(null, { status: 404 });
    return new Response(Buffer.from(post.cover, 'base64'), { headers: { 'Content-Type': post.coverType!, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response(null, { status: 503 }); }
}
