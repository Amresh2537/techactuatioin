import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { connection } from 'next/server';
import { posts, dateLabel } from '@/lib/blog';
export const metadata: Metadata = { title: 'Engineering Blog | Tech Actuation Industries', description: 'Product knowledge, engineering perspectives and practical guides from Tech Actuation Industries.' };
export default function Blog() {
  return <main id="main"><section className="blog-hero"><div className="container"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span>Blog</div><div className="eyebrow light">THE ENGINEERING JOURNAL</div><h1>Ideas that move<br />industry forward.</h1><p>Engineering perspectives, product knowledge and practical insights from Tech Actuation.</p></div></section><section className="section"><div className="container"><div className="blog-section-title"><h2>Latest insights</h2><span>FROM THE TECH ACTUATION TEAM</span></div><Suspense fallback={<p role="status">Loading articles…</p>}><Articles /></Suspense></div></section></main>;
}
async function Articles() {
  await connection();
  let articles;
  try { articles = await (await posts()).find({ status: 'published' }, { projection: { cover: 0, content: 0 } }).sort({ publishedAt: -1 }).limit(100).toArray(); }
  catch { return <div className="blog-empty"><h3>Our journal is temporarily unavailable.</h3><p>Please visit again shortly, or contact our team for product guidance.</p><Link href="/contact" className="text-link">Contact our team</Link></div>; }
  if (!articles.length) return <div className="blog-empty"><span className="eyebrow">KNOWLEDGE IN MOTION</span><h3>New perspectives are on the way.</h3><p>Our team will be sharing engineering guides and product insights here. In the meantime, explore solutions for your application.</p><Link href="/worm-gear-screw-jacks" className="button">Explore our products</Link></div>;
  return <div className="blog-grid">{articles.map(post => <Link href={`/blog/${post.slug}`} className="blog-card" key={post._id.toString()}><div className="blog-card-image">{post.hasCover ? <Image src={`/api/blog/image/${post._id}`} alt={post.coverAlt || post.title} fill unoptimized /> : <div className="blog-cover-placeholder"><span>TECH ACTUATION</span><strong>Engineering<br />in motion.</strong></div>}</div><div className="blog-card-copy"><span className="blog-category">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><div className="blog-meta"><span>{dateLabel(post.publishedAt!)}</span><span>Read article</span></div></div></Link>)}</div>;
}
