import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { posts, dateLabel } from '@/lib/blog';
const getPost = cache(async (slug: string) => { await connection(); return (await posts()).findOne({ slug, status: 'published' }); });
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: `${post.title} | Tech Actuation`, description: post.excerpt, openGraph: { type: 'article', title: post.title, description: post.excerpt, publishedTime: post.publishedAt?.toISOString() } } : { title: 'Article not found' };
}
export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) { return <main id="main"><Suspense fallback={<div className="container section"><p role="status">Loading article…</p></div>}><Article params={params} /></Suspense></main>; }
async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <article className="blog-article"><header><Link href="/blog" className="text-link">All articles</Link><span className="blog-category">{post.category}</span><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt}</p><div className="blog-meta"><span>{post.author}</span><time dateTime={post.publishedAt!.toISOString()}>{dateLabel(post.publishedAt!)}</time><span>{Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} min read</span></div></header>{post.hasCover && <div className="article-cover"><Image src={`/api/blog/image/${post._id}`} alt={post.coverAlt || post.title} fill unoptimized /></div>}<div className="article-body">{post.content.split(/\n\s*\n/).map((block, index) => block.startsWith('## ') ? <h2 key={index}>{block.slice(3)}</h2> : block.startsWith('### ') ? <h3 key={index}>{block.slice(4)}</h3> : <p key={index}>{block}</p>)}</div><aside className="article-cta"><h2>Have an application in mind?</h2><p>Discuss your engineering requirements with our team.</p><Link href="/requirement" className="button">Discuss your project</Link></aside></article>;
}
