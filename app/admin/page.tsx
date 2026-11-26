import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { adminConfigured, isAdmin } from '@/lib/admin';
import { posts } from '@/lib/blog';
import { AdminPanel, type EditablePost } from './panel';
export const metadata: Metadata = { title: 'Blog Admin | Tech Actuation', robots: { index: false, follow: false } };
export default function Admin() { return <main id="main" className="admin-main"><div className="container"><Suspense fallback={<p role="status">Loading admin…</p>}><Dashboard /></Suspense></div></main>; }
async function Dashboard() {
  await connection();
  const loggedIn = await isAdmin();
  let articles: EditablePost[] = [], error = '';
  if (loggedIn) {
    try { articles = (await (await posts()).find({}, { projection: { cover: 0, coverType: 0 } }).sort({ updatedAt: -1 }).limit(200).toArray()).map(post => ({ id: post._id.toString(), title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, author: post.author, status: post.status, hasCover: post.hasCover, coverAlt: post.coverAlt })); }
    catch { error = 'Cannot load posts. Check the database connection, then reload this page.'; }
  }
  return <AdminPanel loggedIn={loggedIn} configured={adminConfigured()} articles={articles} loadError={error} />;
}
